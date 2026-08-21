const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");

// Load module fresh per test group with env vars set — bigquery.js reads env at
// request time via isActive(), so mutating process.env per test is sufficient.
const registerBigQueryRoutes = require("../bigquery");

function buildApp() {
    const app = express();
    registerBigQueryRoutes(app);
    return app;
}

async function withServer(app, fn) {
    const server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
    const { port } = server.address();
    try {
        await fn(`http://127.0.0.1:${port}`);
    } finally {
        server.close();
    }
}

const TOKEN = "test-token-abc";

function setEnv(overrides = {}) {
    process.env.DEV_LOCAL_AUTH_TOKEN = TOKEN;
    process.env.NAIS_CLUSTER_NAME = "dev-gcp";
    Object.assign(process.env, overrides);
}

function clearEnv() {
    delete process.env.DEV_LOCAL_AUTH_TOKEN;
    delete process.env.NAIS_CLUSTER_NAME;
}

test("websites route 404s when DEV_LOCAL_AUTH_TOKEN unset", async () => {
    clearEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/websites`, {
            headers: { authorization: `Bearer ${TOKEN}` },
        });
        assert.equal(res.status, 404);
    });
});

test("websites route 404s on prod cluster even with token set", async () => {
    setEnv({ NAIS_CLUSTER_NAME: "prod-gcp" });
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/websites`, {
            headers: { authorization: `Bearer ${TOKEN}` },
        });
        assert.equal(res.status, 404);
    });
    clearEnv();
});

test("websites route 401s without token", async () => {
    setEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/websites`);
        assert.equal(res.status, 401);
    });
    clearEnv();
});

test("websites route 401s with wrong token", async () => {
    setEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/websites`, {
            headers: { authorization: "Bearer nope" },
        });
        assert.equal(res.status, 401);
    });
    clearEnv();
});

test("query route rejects non-SELECT statements before touching BigQuery", async () => {
    setEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/query`, {
            method: "POST",
            headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
            body: JSON.stringify({ query: "DROP TABLE umami.public_website" }),
        });
        assert.equal(res.status, 400);
        const body = await res.json();
        assert.match(body.error, /SELECT/);
    });
    clearEnv();
});

test("query route rejects multi-statement input", async () => {
    setEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/query`, {
            method: "POST",
            headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
            body: JSON.stringify({ query: "SELECT 1; SELECT 2" }),
        });
        assert.equal(res.status, 400);
        assert.match((await res.json()).error, /single statement/);
    });
    clearEnv();
});

test("query route rejects DELETE hidden after a WITH clause", async () => {
    setEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/query`, {
            method: "POST",
            headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
            body: JSON.stringify({ query: "WITH x AS (SELECT 1) DELETE FROM t WHERE true" }),
        });
        assert.equal(res.status, 400);
    });
    clearEnv();
});

test("query route rejects SELECT over non-allowlisted table", async () => {
    setEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/query`, {
            method: "POST",
            headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
            body: JSON.stringify({
                query: "SELECT * FROM `team-researchops-prod-01d6.umami.public_website_event` LIMIT 1",
            }),
        });
        assert.equal(res.status, 400);
        assert.match((await res.json()).error, /not allowlisted/);
    });
    clearEnv();
});

test("query route 400s on missing query body", async () => {
    setEnv();
    await withServer(buildApp(), async (base) => {
        const res = await fetch(`${base}/bigquery/query`, {
            method: "POST",
            headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
            body: JSON.stringify({}),
        });
        assert.equal(res.status, 400);
    });
    clearEnv();
});

// --- whitelist validator unit tests (no HTTP, no BigQuery) ---
const { assertAllowedQuery } = require("../bigquery");

test("whitelist allows plain SELECT over allowlisted views", () => {
    assert.doesNotThrow(() =>
        assertAllowedQuery(
            "SELECT url_path, COUNT(*) FROM `team-researchops-dev-4396.umami_views.event` WHERE created_at >= '2026-01-01' GROUP BY url_path",
        ),
    );
});

test("whitelist allows WITH ... SELECT over allowlisted tables", () => {
    assert.doesNotThrow(() =>
        assertAllowedQuery(
            "WITH recent AS (SELECT * FROM `team-researchops-dev-4396.umami.public_website` WHERE deleted_at IS NULL) SELECT id FROM recent",
        ),
    );
});

test("whitelist tolerates blocked keywords and semicolons inside string literals", () => {
    assert.doesNotThrow(() =>
        assertAllowedQuery(
            "SELECT * FROM `team-researchops-dev-4396.umami.public_website` WHERE name = 'weird; DROP TABLE x--' LIMIT 1",
        ),
    );
});

test("whitelist rejects SELECT with no recognizable table only when a table ref exists and is disallowed", () => {
    // SELECT without any table ref is allowed (e.g. SELECT 1) — harmless.
    assert.doesNotThrow(() => assertAllowedQuery("SELECT 1"));
    assert.throws(() => assertAllowedQuery("SELECT * FROM `other-project.custom_dataset.secret_table`"), /not allowlisted/);
});
