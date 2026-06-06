# powerbi-board-metric-certifier

Board-readable certification engine for Power BI metrics, lineage completeness, refresh health, reconciliation, owner signoff, source variance, and executive dashboard trust.

[![ci](https://github.com/mizcausevic-dev/powerbi-board-metric-certifier/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/powerbi-board-metric-certifier/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/powerbi-board-metric-certifier/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/powerbi-board-metric-certifier/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

Board dashboards are only useful when the metrics can survive scrutiny:

- Is the metric definition clear?
- Is lineage complete enough to defend?
- Did the dataset refresh successfully?
- Is the metric reconciled to source systems?
- Is owner signoff current?

This repo converts synthetic Power BI metric metadata into a certification register for board use.

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx powerbi-board-metric-certifier fixtures/powerbi-metric-sample.json --format markdown
npx powerbi-board-metric-certifier fixtures/powerbi-metric-sample.json --format json
```

## Kinetic Gain fit

This adds a Power BI analytics-governance lane to the Kinetic Gain portfolio: board metric confidence, executive reporting trust, and dashboard certification posture.
