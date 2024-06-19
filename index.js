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

// Amplitude Prosjekt: NAV.no - Produksjon 2.0
app.get('/amplitude/100000009/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100000009/, '')
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

// Amplitude Prosjekt: Aksel - prod
app.get('/amplitude/100002016/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100002016/, '')
    const authToken = process.env.AMPLITUDE_100002016
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Speil - dev
app.get('/amplitude/100003868/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100003868/, '')
    const authToken = process.env.AMPLITUDE_100003868
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Speil - prod
app.get('/amplitude/100003867/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100003867/, '')
    const authToken = process.env.AMPLITUDE_100003867
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Delta - prod
app.get('/amplitude/100005528/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100005528/, '')
    const authToken = process.env.AMPLITUDE_100005528
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Work in norway - prod
app.get('/amplitude/100002233/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100002233/, '')
    const authToken = process.env.AMPLITUDE_100002233
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Kunnskapsbanken - prod
app.get('/amplitude/100001607/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100001607/, '')
    const authToken = process.env.AMPLITUDE_100001607
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Idebanken - prod
app.get('/amplitude/100002226/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100002226/, '')
    const authToken = process.env.AMPLITUDE_100002226
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Arbeid og velferd - prod
app.get('/amplitude/100004122/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100004122/, '')
    const authToken = process.env.AMPLITUDE_100004122
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Teknologiradar - prod
app.get('/amplitude/100005544/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100005544/, '')
    const authToken = process.env.AMPLITUDE_100005544
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Det som betyr noe - prod
app.get('/amplitude/100000251/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100000251/, '')
    const authToken = process.env.AMPLITUDE_100000251
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Hjelpemiddeldatabasen - prod
app.get('/amplitude/100000965/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100000965/, '')
    const authToken = process.env.AMPLITUDE_100000965
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Navet - prod
app.get('/amplitude/100002261/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100002261/, '')
    const authToken = process.env.AMPLITUDE_100002261
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Mangfoldimai- prod
app.get('/amplitude/100002287/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100002287/, '')
    const authToken = process.env.AMPLITUDE_100002287
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: ResearchOps- prod
app.get('/amplitude/100004171/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100004171/, '')
    const authToken = process.env.AMPLITUDE_100004171
    amplitudeProxy(authToken, requestUrl, res)
});

// Amplitude Prosjekt: Innblikk- prod
app.get('/amplitude/100006162/api/*', (req, res) => {
    const requestUrl = req.url.replace(/\/amplitude\/100006162/, '')
    const authToken = process.env.AMPLITUDE_100006162
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

app.get('/url/*', (req, res) => {
    // Decode the URL component
    let urlToFetch = decodeURIComponent(req.params[0]);

    // Check if the URL starts with http:// or https://
    if (!urlToFetch.match(/^https?:\/\//)) {
        urlToFetch = 'http://' + urlToFetch;
    }

    // Perform the GET request to the extracted URL
    axios.get(urlToFetch)
        .then(response => {
            res.send(response.data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send(`Error occurred while fetching data from ${urlToFetch}`);
        });
});

app.get('/reops', (req, res) => {
    res.end("it works")
});

app.use(cors()).get('/config', (req, res) => {
    let authsecret = `Basic ${Buffer.from("123:123", "utf-8").toString("base64")}`
    console.log(authsecret)
    res.sendStatus(200)
});

app.get("/isAlive", (req, res) => res.sendStatus(200));
app.get("/isReady", (req, res) => res.sendStatus(200));
app.get("/", (req, res) => res.sendStatus(200));

app.listen(8081, function () {
    console.log("Express Started");
});
