ResearchOps Proxy
================

ResearchOps Proxy hjelper team hente ut data fra Amplitude og Siteimprove.

---

# APIer

- Siteimprove
- Amplitude

## Proxy endepunkt

https://reops-proxy.intern.nav.no/<api_navn>/<api_endepunkt>

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

## Amplitude

### Proxy endepunkt

https://reops-proxy.intern.nav.no/amplitude/<amplitude_api_endepunkt>

### Tilgjengelige Amplitude APIer med GET requests

- [Dashhboard REST API](https://www.docs.developers.amplitude.com/analytics/apis/dashboard-rest-api/)
- [Behavioral Cohorts API](https://www.docs.developers.amplitude.com/analytics/apis/behavioral-cohorts-api/)
- [Chart Annotations API](https://www.docs.developers.amplitude.com/analytics/apis/chart-annotations-api/)
- [Export API](https://www.docs.developers.amplitude.com/analytics/apis/export-api/)

### Amplitude prosjekttilgang

Proxyen gir tilgang til Amplitude prosjektet "Nav.no - Produksjon" som inneholder data fra nav.no-domenet i produksjon.
Ved ønske om tilgang til andre prosjekter, ta kontakt med Team ResearchOps på Slack i
kanalen [#researchops](https://nav-it.slack.com/archives/C02UGFS2J4B).

### Dokumentasjon

[Amplitude API Dokumentasjon](https://developers.amplitude.com/docs/dashboard-rest-api)

### Data format

Dataene vises i JSON format.

### Eksempel på bruk av API

Følgende henter ut data tilknyttet en graf i Amplitude:
https://reops-proxy.intern.nav.no/amplitude/api/3/chart/63ty1xg/query

# Henvendelser og veiledning

Spørsmål knyttet til koden kan stilles
som [issues her på GitHub](https://github.com/navikt/reops-proxy/issues). Henvendelser kan sendes via Slack i
kanalen [#researchops](https://nav-it.slack.com/archives/C02UGFS2J4B).