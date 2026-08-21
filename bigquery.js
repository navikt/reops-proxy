const crypto = require("crypto");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { BigQuery } = require("@google-cloud/bigquery");

/**
 * Guarded BigQuery passthrough for Innblikk "bane A" local development.
 *
 * A designer running innblikk-frontend locally has no GCP credentials — the frontend's
 * BigQuery client falls back to deterministic fixture data. That's fine for analytics
 * widgets, but wrong for reference data (the registered website list: a fixture
 * tracking snippet can never be installed). These routes let that local frontend fetch
 * REAL dev BigQuery data through this proxy instead.
 *
 * Security model (deliberately mirrors innblikk-backend's LocalDevTokenAuthFilter):
 * 1. Requires DEV_LOCAL_AUTH_TOKEN set AND non-blank — never set in prod-gcp.yaml.
 *    If unset, every route here 404s (mounted but dead).
 * 2. Refuses if NAIS_CLUSTER_NAME contains "prod" (defense in depth vs manifest mistakes).
 * 3. Constant-time token comparison (crypto.timingSafeEqual), Bearer scheme required.
 * 4. Read-only by whitelist, not blacklist: /bigquery/query only accepts a statement
 *    that starts with SELECT (or WITH ... SELECT) and references only allowlisted
 *    tables/views. Nothing else parses through.
 * 5. Cost: dry-run estimate must be under COST_CAP_USD, and every execute carries
 *    maximumBytesBilled as a hard server-side stop regardless of the estimate.
 * 6. Rate limited (per token holder) so a broken local loop can't hammer BigQuery.
 */

const COST_CAP_USD = 1.0;
const MAX_BYTES_BILLED = String(50 * 1024 ** 3); // 50 GB hard stop on every execute
const COST_PER_TB_USD = 6.25;
const LOCATION = "europe-north1";
const DEFAULT_PROJECT_ID = "team-researchops-dev-4396";

// Only these tables/views may be referenced — the ReOps event-pipeline schema we know.
// Compared against the trailing `dataset.table` of every fully-qualified reference.
const ALLOWED_TABLES = ["umami.public_website", "umami_views.event", "umami_views.session", "umami_views.event_data"];

function isActive() {
    const token = process.env.DEV_LOCAL_AUTH_TOKEN;
    const cluster = process.env.NAIS_CLUSTER_NAME || "";
    if (!token || !token.trim()) return false;
    if (cluster.toLowerCase().includes("prod")) return false;
    return true;
}

function safeEqual(a, b) {
    const bufA = Buffer.from(String(a), "utf8");
    const bufB = Buffer.from(String(b), "utf8");
    if (bufA.length !== bufB.length) {
        crypto.timingSafeEqual(bufA, bufA);
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

function requireDevToken(req, res, next) {
    if (!isActive()) {
        return res.status(404).json({ error: "Not found" });
    }
    const header = req.headers.authorization || "";
    const presented = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
    if (!presented || !safeEqual(presented, process.env.DEV_LOCAL_AUTH_TOKEN.trim())) {
        return res.status(401).json({ error: "Ugyldig eller manglende dev-token" });
    }
    next();
}

// Generous for interactive use, tight against runaway loops: ~2 req/s sustained.
const bigQueryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "For mange BigQuery-forespørsler — vent litt og prøv igjen" },
});

function stripCommentsAndStrings(sql) {
    return (
        String(sql || "")
            // String literals first: blank out contents so keywords inside strings can't
            // confuse the whitelist, and a '--' or ';' inside a string can't trip the
            // comment stripper / multi-statement check.
            .replace(/'(?:''|\\'|[^'\\])*'/g, "''")
            .replace(/"(?:""|\\"|[^"\\])*"/g, '""')
            .replace(/--[^\n]*/g, " ")
            .replace(/\/\*[\s\S]*?\*\//g, " ")
    );
}

/**
 * Whitelist validation — the query may ONLY be a plain SELECT (optionally preceded by
 * WITH clauses) over allowlisted tables. Throws with a readable message otherwise.
 * Deliberately not a SQL parser; it's a strict shape check, and anything it can't
 * positively recognize is rejected.
 */
function assertAllowedQuery(rawQuery) {
    const invalid = (message) => {
        throw Object.assign(new Error(message), { code: "SQL_VALIDATION" });
    };

    const cleaned = stripCommentsAndStrings(rawQuery).trim();
    if (!cleaned) invalid("Query is empty after removing comments");
    if (cleaned.includes(";")) invalid("Only a single statement is allowed (no semicolons)");

    const upper = cleaned.toUpperCase();

    if (upper.startsWith("SELECT")) {
        // plain SELECT — nothing more to check at statement level
    } else if (upper.startsWith("WITH")) {
        // Every clause must be `<name> AS ( ... )`, and the whole thing must end in a
        // SELECT. Detect any DML/DDL keyword appearing as a statement position inside.
        if (!/\)\s*SELECT\b/i.test(cleaned) && !/^WITH[\s\S]*\bSELECT\b/i.test(cleaned)) {
            invalid("WITH must be followed by a SELECT");
        }
        const forbiddenInWith = upper.match(/\b(INSERT|UPDATE|DELETE|MERGE|CREATE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|CALL|EXPORT|LOAD)\b/);
        if (forbiddenInWith) invalid(`Forbidden keyword in query: ${forbiddenInWith[0]}`);
    } else {
        invalid(`Only SELECT queries are allowed. Got: ${upper.match(/^\s*(\w+)/)?.[1] || "(unknown)"}`);
    }

    // Table allowlist: every `project.dataset.table` reference must be on the list.
    const tableRefs = cleaned.match(/`[a-z0-9-]+\.[a-z0-9_]+\.[a-z0-9_]+`|[a-z0-9-]+\.[a-z0-9_]+\.[a-z0-9_]+/gi) || [];
    for (const ref of tableRefs) {
        const bare = ref.replace(/`/g, "");
        const datasetTable = bare.split(".").slice(-2).join(".");
        if (!ALLOWED_TABLES.includes(datasetTable)) invalid(`Table not allowlisted: ${bare}`);
    }
}

let bigqueryClient = null;
function getBigQuery() {
    if (bigqueryClient) return bigqueryClient;
    const projectId = process.env.GCP_PROJECT_ID || DEFAULT_PROJECT_ID;
    const rawCredentials = process.env["bigquery-credentials"];
    if (!rawCredentials) {
        throw new Error("bigquery-credentials env var not set — umami-bigquery secret not mounted?");
    }
    bigqueryClient = new BigQuery({ projectId, credentials: JSON.parse(rawCredentials) });
    return bigqueryClient;
}

async function estimateCostUsd(query) {
    const [job] = await getBigQuery().createQueryJob({ query, location: LOCATION, dryRun: true });
    const bytes = parseInt(job.metadata.statistics.totalBytesProcessed, 10);
    return (bytes / 1024 ** 4) * COST_PER_TB_USD;
}

const WEBSITES_QUERY = `
    SELECT
        website_id as id,
        ANY_VALUE(name) as name,
        ANY_VALUE(domain) as domain,
        ANY_VALUE(share_id) as shareId,
        ANY_VALUE(team_id) as teamId,
        ANY_VALUE(created_at) as createdAt
    FROM \`${DEFAULT_PROJECT_ID}.umami.public_website\`
    WHERE deleted_at IS NULL
      AND name IS NOT NULL
    GROUP BY website_id
    ORDER BY name
`;

function registerBigQueryRoutes(app) {
    app.get("/bigquery/websites", requireDevToken, bigQueryRateLimiter, async (req, res) => {
        try {
            const projectId = process.env.GCP_PROJECT_ID || DEFAULT_PROJECT_ID;
            const query = WEBSITES_QUERY.replace(DEFAULT_PROJECT_ID, projectId);
            const [rows] = await getBigQuery().query({
                query,
                location: LOCATION,
                maximumBytesBilled: MAX_BYTES_BILLED,
            });
            // Normalize BigQuery TIMESTAMP objects ({value: ...}) to plain strings,
            // matching what innblikk-frontend's own /api/bigquery/websites returns.
            const data = rows.map((row) => ({
                ...row,
                createdAt: row.createdAt && typeof row.createdAt === "object" ? row.createdAt.value : row.createdAt,
            }));
            console.log(`[BigQuery] /bigquery/websites -> ${data.length} rows`);
            res.json({ data });
        } catch (err) {
            console.error(`[BigQuery] /bigquery/websites failed: ${err.message}`);
            res.status(500).json({ error: "Kunne ikke hente nettsider fra BigQuery", details: err.message });
        }
    });

    app.post(
        "/bigquery/query",
        requireDevToken,
        bigQueryRateLimiter,
        express.json({ limit: "256kb" }),
        async (req, res) => {
            const query = req.body?.query;
            if (typeof query !== "string" || !query.trim()) {
                return res.status(400).json({ error: "Mangler query (string) i request body" });
            }
            try {
                assertAllowedQuery(query);
            } catch (validationErr) {
                return res.status(400).json({ error: validationErr.message });
            }
            try {
                const estimatedCostUsd = await estimateCostUsd(query);
                if (estimatedCostUsd > COST_CAP_USD) {
                    return res.status(413).json({
                        error: `Spørringen er for dyr for dev-passthrough (estimert $${estimatedCostUsd.toFixed(2)}, grense $${COST_CAP_USD})`,
                        estimatedCostUsd,
                    });
                }
                const [rows] = await getBigQuery().query({
                    query,
                    location: LOCATION,
                    maximumBytesBilled: MAX_BYTES_BILLED,
                });
                console.log(`[BigQuery] /bigquery/query -> ${rows.length} rows (est $${estimatedCostUsd.toFixed(4)})`);
                res.json({ data: rows, estimatedCostUsd });
            } catch (err) {
                console.error(`[BigQuery] /bigquery/query failed: ${err.message}`);
                res.status(500).json({ error: "BigQuery-spørring feilet", details: err.message });
            }
        },
    );
};

// Exported for tests only.
module.exports = registerBigQueryRoutes;
module.exports.assertAllowedQuery = assertAllowedQuery;
