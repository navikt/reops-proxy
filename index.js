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
    const requestUrl = req.url.replace(/\/amplitude/, '')
    const authToken = process.env.AMPLITUDE_100000009
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: PO Arbeid - prod
app.get('/amplitude/100000264/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100000264/, '')
    const authToken = process.env.AMPLITUDE_100000264
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: PO Arbeidsplassen - dev
app.get('/amplitude/100000243/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100000243/, '')
    const authToken = process.env.AMPLITUDE_100000243
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: PO Arbeidsplassen - prod
app.get('/amplitude/100000244/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100000244/, '')
    const authToken = process.env.AMPLITUDE_100000244
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: MEMU - prod
app.get('/amplitude/100002286/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100002286/, '')
    const authToken = process.env.AMPLITUDE_100002286
    amplitudeProxy(authToken, requestUrl, res)
});




const amplitudeProxy = (authToken, requestUrl, proxyResponse) => {
    let apiUrl = "https://analytics.eu.amplitude.com";
    const options = {headers: {Authorization: "Basic " + authToken}};

    if (proxyRouteIsBlocked(requestUrl)) {
        proxyResponse.end("APIet har blitt blokkert av Team ResearchOps i NAV, ta kontakt med oss for hjelp.")
    } else if (requestUrl.match(/export/)) {
        fetchAmplitudeExportData(apiUrl + requestUrl, options, proxyResponse)
    } else {
        fetchAmplitudeJsonData(apiUrl + requestUrl, options, proxyResponse)
    }
}

const proxyRouteIsBlocked = (requestUrl) => {
    const blockedRoutes = [/deletions/, /taxonomy/, /release/, /scim/, /batch/]
    return blockedRoutes.some((route) => requestUrl.match(route))
}

const fetchAmplitudeExportData = (url, options, proxyResponse) => {
    axios.get(url, {...options, responseType: "stream"})
        .then((resp) => {
            resp.data.on('data', data => proxyResponse.write(data));
            resp.data.on('end', () => proxyResponse.end());
        })
        .catch((error) => {
            console.log(error)
            const statusCode = error.response ? error.response.status : 500
            proxyResponse.status(statusCode)
            proxyResponse.end("Kunne ikke koble til Amplitude APIet: " + error)
        });
}

const fetchAmplitudeJsonData = (url, options, proxyResponse) => {
    axios.get(url, options)
        .then((resp) => proxyResponse.json(resp.data))
        .catch((error) => {
            console.log(error)
            const statusCode = error.response ? error.response.status : 500
            proxyResponse.status(statusCode)
            proxyResponse.end("Kunne ikke koble til Amplitude APIet: " + error)
        });
}

app.get('/reops', (req, res) => {
    res.end("it works")
});

app.get("/isAlive", (req, res) => res.sendStatus(200));
app.get("/isReady", (req, res) => res.sendStatus(200));
app.get("/", (req, res) => res.sendStatus(200));

app.listen(8080, function () {
    console.log("Express Started on Port 8080");
});
