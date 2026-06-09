# HPE Aruba EdgeConnect API Endpoint Sources

Use this document as the project-local source map for EdgeConnect and
Orchestrator automation.

## Primary Source

- HPE developer docs:
  https://developer.arubanetworks.com/edgeconnect/docs/aruba-orchestrator-and-edgeconnect-api-endpoints

The HPE page says the Swagger/OpenAPI definitions can be obtained from:

- A running Orchestrator 9.3+ instance and an EdgeConnect appliance running
  ECOS 9.3+ through the GUI.
- The silver-peak.com support site.
- The Orchestrator instance and EdgeConnect appliance directly.

The release-specific JSON files are stored on the systems at:

- Orchestrator:
  `/home/gms/gms/webcontent/webclient/html/apiDocs/gmsApiInfo.json`
- EdgeConnect appliance:
  `/opt/tms/lib/web/content/node/apiDocs/vxoaApiInfo.json`

In the GUI, HPE documents the path as:

1. Log in to Orchestrator.
2. Go to `Support`.
3. Select `RestAPIs`.
4. Filter by API tag as needed.

## Python SDK Source

- Official GitHub repository:
  https://github.com/aruba/pyedgeconnect
- Documentation:
  https://pyedgeconnect.readthedocs.io/

The SDK README describes `pyedgeconnect` as a Python wrapper for Aruba
Orchestrator and EdgeConnect SD-WAN APIs. It also notes that API docs are
available from the Orchestrator and EdgeConnect web interfaces under
`Support > Rest API`, and that there is preliminary support for API changes
introduced in Orchestrator 9.3+.

Use `pyedgeconnect` for higher-level Python workflows when it already exposes
the desired operation. Use the OpenAPI JSON directly when an endpoint is missing
from the SDK or when generated clients are preferred.

## Local Workflow

Fetch the live schema from the target system before adding or changing API
automation:

```sh
python3 scripts/fetch_edgeconnect_openapi.py \
  --base-url https://orchestrator.example.com \
  --type orchestrator \
  --output references/edgeconnect/orchestrator-openapi.json

python3 scripts/fetch_edgeconnect_openapi.py \
  --base-url https://edgeconnect.example.com \
  --type appliance \
  --output references/edgeconnect/appliance-openapi.json
```

If the helper cannot locate the JSON automatically, download the API definition
from the `Support > RestAPIs` UI and save it under `references/edgeconnect/`.

## Automation Rules

- Treat OpenAPI definitions as release-specific inputs, not universal truth.
- Keep generated clients or derived endpoint maps under `generated/` or
  `references/edgeconnect/`.
- Do not commit credentials, API keys, session cookies, CSRF tokens, or appliance
  backup payloads.
- Default to read-only API calls until a script explicitly declares its write
  behavior.
- When using Python, prefer environment variables or a local ignored `.env` file
  for secrets.
