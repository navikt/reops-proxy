ResearchOps Proxy
================

ResearchOps Proxy hjelper team hente ut data fra Siteimprove.

## Running locally
Install dependencies and start the proxy with the default scripts provided in `package.json`:

```bash
yarn install
yarn start
```

Use `yarn run dev` if you prefer to run with `nodemon` for hot reloads.

---

# APIer

- Siteimprove

## Proxy endepunkter

### Prod GCP
- https://reops-proxy.intern.nav.no/<api_navn>/<api_endepunkt>
- https://reops-proxy.ansatt.nav.no/<api_navn>/<api_endepunkt>

### Dev GCP
https://reops-proxy.intern.dev.nav.no/<api_navn>/<api_endepunkt>

## Slik får du tilgang til proxyen

1. Logg inn med naisdevice lokalt på maskinen din
2. Du kan nå gjøre GET forespørsler til proxyens endepunkt

Ønsker du å koble til en app som er på GCP? Ta kontakt med Team ResearchOps på Slack i
kanalen [#researchops](https://nav-it.slack.com/archives/C02UGFS2J4B) så åpner vi opp for appen din.

## Siteimprove

### Proxy endepunkt

https://reops-proxy.intern.nav.no/siteimprove/<siteimprove_api_endepunkt>

### Tilgjengelige Siteimprove API endepunkter

Inkluderer tilgang til samtlige av Siteimprove sine api endepunkt med GET requests, med unntak av /settings/users/.

### Dokumentasjon

[Siteimprove API Dokumentasjon](https://api.siteimprove.com/v2/documentation)

### Data format

Dataene vises i JSON format.

### Eksempel på bruk av API

Følgende henter ut en liste over alle nettsider lagt til i Siteimprove:
https://reops-proxy.intern.nav.no/siteimprove/sites

# Henvendelser og veiledning

Spørsmål knyttet til koden kan stilles
som [issues her på GitHub](https://github.com/navikt/reops-proxy/issues). Henvendelser kan sendes via Slack i
kanalen [#researchops](https://nav-it.slack.com/archives/C02UGFS2J4B).
