require("dotenv").config();
const express = require('express');
const axios = require('axios');
const cors = require("cors");
let app = express();

app.use(cors());
app.use('/siteimprove', (req, res) => {
    const apiUrl = "https://api.siteimprove.com/v2";

    if (req.url.includes('users')) {
        return res.end("APIet har blitt blokkert av Team ResearchOps i NAV, ta kontakt med oss for hjelp.");
    }

    const options = {
        headers: {Authorization: "Basic " + process.env.SITEIMPROVE},
    };

    axios.get(apiUrl + req.url, options)
        .then(r => {
            console.log(`[Siteimprove] ${req.originalUrl} -> ${r.status}`);
            res.json(r.data);
        })
        .catch(err => {
            const upstreamStatus = err.response?.status;
            const message = err.response?.statusText || err.message;
            console.error(`[Siteimprove] ${req.originalUrl} -> ${upstreamStatus || "no-status"}: ${message}`);

            if (upstreamStatus) {
                return res.status(upstreamStatus).json({
                    error: "Feil fra Siteimprove API-et", status: upstreamStatus,
                });
            }

            res.status(502).json({
                error: "Kunne ikke koble til Siteimprove API-et",
            });
        });
});

app.get("/", (req, res) => res.sendStatus(200));
app.get("/isReady", (req, res) => res.sendStatus(200));
app.get("/", (req, res) => res.sendStatus(200));

app.listen(8080, function () {
    console.log("Express Started");
});