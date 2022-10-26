require("dotenv").config();
const express = require('express');
const axios = require('axios');
const cors = require("cors");
const {config} = require("./config/config");
let app = express();

app.use(cors())

app.get('/siteimprov*', (req, res) => {
    let apiUrl = "https://api.siteimprove.com/v2";
    req.url = req.url.replace(/\/siteimprove/, '')
    if (req.url.match(/users/)) {
        res.end("APIet har blitt blokkert av Team ResearchOps i NAV, ta kontakt med oss for hjelp.")
    } else {
        const options = {
            headers: {Authorization: "Basic " + process.env.SITEIMPROVE},
        };
        axios.get(apiUrl + req.url, options).then(function (response) {
            res.json(response.data)
        }).catch(function (error) {
            console.log(error)
            res.end("Kunne ikke koble til Siteimprove APIet: " + error)
        });
    }
});

// Amplitude Prosjekt: NAV.no - Produksjon
app.get('/amplitude/api/*', (req, res) => {
    let apiUrl = "https://analytics.eu.amplitude.com";
    req.url = req.url.replace(/\/amplitude/, '')
    if (req.url.match(/deletions/) || req.url.match(/taxonomy/) || req.url.match(/release/) || req.url.match(/scim/) || req.url.match(/batch/)) {
        res.end("APIet har blitt blokkert av Team ResearchOps i NAV, ta kontakt med oss for hjelp.")
    } else {
        const options = {
            headers: {Authorization: "Basic " + process.env.AMPLITUDE_100000009}
        };
        axios.get(apiUrl + req.url, options).then(function (response) {
            console.log(apiUrl + req.url)
            res.json(response.data)
        }).catch(function (error) {
            console.log(error)
            res.end("Kunne ikke koble til Amplitude APIet: " + error)
        });
    }
});

// Amplitude Prosjekt: PO Arbeid - prod
app.get('/amplitude/100000264/api/*', (req, res) => {
    let apiUrl = "https://analytics.eu.amplitude.com";
    req.url = req.url.replace(/\/amplitude\/100000264/, '')
    if (req.url.match(/deletions/) || req.url.match(/taxonomy/) || req.url.match(/release/) || req.url.match(/scim/) || req.url.match(/batch/)) {
        res.end("APIet har blitt blokkert av Team ResearchOps i NAV, ta kontakt med oss for hjelp.")
    } else {
        const options = {
            headers: {Authorization: "Basic " + process.env.AMPLITUDE_100000264}
        };
        axios.get(apiUrl + req.url, options).then(function (response) {
            res.json(response.data)
        }).catch(function (error) {
            console.log(error)
            res.end("Kunne ikke koble til Amplitude APIet: " + error)
        });
    }
});

app.get('/reops', (req, res) => {
    res.end("it works")
});

app.get("/isAlive", (req, res) => res.sendStatus(200));
app.get("/isReady", (req, res) => res.sendStatus(200));
app.get("/", (req, res) => res.sendStatus(200));

app.listen(8080, function () {
    console.log("Express Started on Port 8080");
});