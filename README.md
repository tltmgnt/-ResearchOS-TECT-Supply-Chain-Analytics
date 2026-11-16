# ResearchOS TECT — Supply Chain Analytics
Independent research workspace for reproducible inventory modeling, supplier comparisons and disruption scenarios.

## Use the app
Node 22+; no npm dependencies:
```sh
npm test
npm run build
python -m http.server 8000 --directory dist
```
Open http://localhost:8000. Or serve the repository root directly. ES modules require localhost or HTTPS; opening index.html with file:// is not supported.

Edit inputs, evaluate baseline and disruption scenarios, inspect stock trajectories, record review notes, and export study JSON, results CSV or a Markdown report. The advanced JSON editor supports additional suppliers. Apply JSON before evaluating. Save/load uses this browser's storage; export backups regularly. No data is uploaded by the app.

## CLI
```sh
node cli.mjs example.json
node cli.mjs example.json results.json
node cli.mjs example.json results.csv
```
Output files cannot overwrite existing files. Synthetic example data is included. See [model contract](docs/MODEL.md) for exact event order, costs and limits.

## Checks and distribution
GitHub Actions runs tests, syntax checks, CLI execution and static packaging on Node 22 and 24. Download the static app artifact and serve it locally. Hosting is not yet configured. Interactive browser and accessibility verification remain outstanding.

This independent research prototype does not claim DARPA affiliation, operational validation, or research novelty. Model outputs depend on declared assumptions and are not procurement recommendations.
