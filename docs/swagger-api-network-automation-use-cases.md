# Swagger API Use Cases for Aruba SD-WAN Build and Maintenance

This document describes practical ways to use the HPE Aruba Networking
EdgeConnect Orchestrator and EdgeConnect Swagger/OpenAPI definitions when
building and maintaining the demo SD-WAN environment.

Target environment:

- 1 self-hosted EdgeConnect Orchestrator
- 3 EdgeConnect EC-S-P appliances
- Inventory source: `inventory/demo-network.yaml`

Use this document with:

- `docs/edgeconnect-api-endpoints.md`
- `docs/demo-topology.md`
- `docs/baseline-bundle-technical-plan.md`
- `docs/orchestrator-air-gap-activation.md` for isolated or Air-Gap designs

## Why Start With Swagger

EdgeConnect and Orchestrator API behavior can vary by release, especially for
Orchestrator 9.3 and later. The safest automation pattern is to fetch the live
Swagger/OpenAPI JSON from the target system and treat it as the release-specific
contract for that environment.

Use the live schema to answer these questions before writing automation:

- Which endpoints exist on this Orchestrator or appliance version?
- Which operations are read-only and which operations modify state?
- What request body fields, enum values, and path parameters are required?
- Which responses include object IDs that later write operations need?
- Which backup, restore, inventory, health, and appliance-management operations
  are vendor-supported for this release?

For this repository, the local fetch helper is:

```sh
python3 scripts/fetch_edgeconnect_openapi.py \
  --base-url https://orchestrator.example.com \
  --type orchestrator \
  --output references/edgeconnect/orchestrator-openapi.json
```

Fetch appliance schemas when direct EC-S-P API access is available:

```sh
python3 scripts/fetch_edgeconnect_openapi.py \
  --base-url https://edgeconnect-1.example.com \
  --type appliance \
  --output references/edgeconnect/edgeconnect-1-openapi.json
```

## Automation Design Principles

- Use Orchestrator as the primary control point for SD-WAN network state.
- Use appliance APIs for device-local details, schema capture, health checks,
  and backup validation where Orchestrator does not expose enough detail.
- Generate or validate endpoint maps from the live Swagger JSON before using
  write APIs.
- Default scripts to read-only discovery and require explicit `--apply` style
  flags for changes.
- Keep API schemas, generated clients, and endpoint maps under
  `references/edgeconnect/` or `generated/`.
- Never commit credentials, session cookies, tokens, license files, activation
  files, portal responses, or backup bundles.
- Do not automate Air-Gap enablement casually. Treat it as a deployment mode
  decision that requires the vendor procedure and operator approval.

## Use Case 1: Build an Endpoint Map for the Running Release

Goal: convert the live Swagger JSON into an operator-reviewed map of the
endpoints this demo can safely use.

Typical workflow:

1. Fetch Orchestrator and appliance Swagger files.
2. Search the schemas for tags and paths related to inventory, appliances,
   overlays, sites, templates, backups, restore, health, software version, and
   licensing.
3. Classify each operation as read-only, low-risk write, disruptive write, or
   destructive restore.
4. Record required request fields and response IDs.
5. Create a small release-specific endpoint map for scripts to consume.

Good candidates:

- GET operations for inventory, health, versions, and topology.
- Backup trigger and download operations after confirming request/response
  shapes.
- Restore operations only after baseline capture and validation are reliable.

Avoid:

- Guessing path names from memory.
- Reusing endpoint assumptions from another Orchestrator or ECOS release.
- Calling write APIs before the endpoint map has been reviewed.

## Use Case 2: Bootstrap Demo Inventory

Goal: compare the intended topology in `inventory/demo-network.yaml` with what
Orchestrator reports.

Swagger-driven automation can:

- Authenticate to Orchestrator.
- Query the appliance inventory.
- Confirm there are exactly three EC-S-P appliances in scope.
- Match appliance names, sites, serial numbers, and management URLs.
- Report missing, duplicate, or unexpected appliances.
- Write a read-only inventory discovery report.

This should be one of the first API workflows because later automation depends
on stable object identity. For example, site, appliance, tunnel, and template
operations often require IDs returned by earlier inventory calls.

Recommended command shape:

```sh
python3 scripts/sdwan_inventory.py discover \
  --inventory inventory/demo-network.yaml \
  --schema references/edgeconnect/orchestrator-openapi.json
```

## Use Case 3: Preflight Network Build Readiness

Goal: decide whether the demo network is ready for a build, restore, or change
window.

Useful checks:

- Orchestrator API is reachable.
- Orchestrator version is recorded.
- All expected EC-S-P appliances are visible.
- Appliances are online or in an expected staging state.
- ECOS versions are recorded.
- Required licenses or activation state are visible through supported APIs.
- Air-Gap state is recorded before activation, licensing, or export workflows.
- The live Swagger schema matches the schema expected by the automation.

Output should be both human-readable and machine-readable. A JSON report is
useful for CI, while a concise terminal summary is better for operators.

## Use Case 4: Provision or Validate Sites and Appliances

Goal: use Orchestrator APIs to create or validate the structure that supports
the demo topology.

Possible operations:

- Create or validate site records.
- Assign appliances to sites.
- Apply naming standards.
- Confirm appliance model and role.
- Attach appliances to templates or groups if the release exposes supported
  endpoints for those actions.

Recommended guardrails:

- Run a dry-run diff first.
- Require exact inventory matches before applying changes.
- Use IDs discovered from Orchestrator instead of hard-coded values.
- Log every planned write operation before execution.
- Stop if the live schema lacks a required endpoint or field.

## Use Case 5: Configure or Validate Overlays and Tunnels

Goal: use APIs to confirm the SD-WAN control plane matches the demo design.

Swagger can help identify supported operations for:

- Overlay inventory.
- Business intent or policy objects.
- Tunnel state.
- Site-to-site connectivity.
- WAN labels, interfaces, or transport groups if exposed by the deployed
  release.

For maintenance, validation is usually safer than creation. A script can query
the current state and compare it to an expected model without modifying the
network.

Example validation outputs:

- Expected overlays exist.
- Expected appliance pairs have tunnels or are allowed to form tunnels.
- Unexpected tunnels or policy objects are reported.
- Drift from the demo baseline is summarized.

## Use Case 6: Capture Baseline Backups

Goal: use vendor-supported API operations to capture the known-good demo state.

This use case should follow `docs/baseline-bundle-technical-plan.md`.

Swagger-driven automation should identify exact endpoints for:

- Orchestrator backup trigger and download.
- Appliance backup trigger and download.
- Orchestrator version and health metadata.
- Appliance version, health, and inventory metadata.
- API schema download for the running release.

The resulting baseline bundle should include:

- Orchestrator backup in vendor format.
- Three EC-S-P appliance backups in vendor format.
- Orchestrator and appliance schema snapshots.
- Inventory and health metadata.
- Manifest and checksums.

Do not normalize or reinterpret vendor backup files. Store them as exported by
the supported API or UI workflow.

## Use Case 7: Restore Planning and Dry Run

Goal: use APIs to determine whether a baseline restore is safe before applying
it.

Dry-run checks:

- Bundle checksums are valid.
- Bundle topology matches `inventory/demo-network.yaml`.
- Orchestrator version is compatible with the captured baseline.
- Appliance models and serial numbers match expectations.
- Current live schema still exposes the required restore operations.
- A fresh pre-restore safety capture has been completed or explicitly waived.

Apply-mode restore should require:

- `--apply`
- An exact confirmation phrase
- A validated bundle
- A clear restore order
- Post-restore validation

Restore workflows are high-risk. Do not infer restore endpoints from similar
releases; use the live Swagger contract and vendor documentation for the exact
environment.

## Use Case 8: Continuous Maintenance Checks

Goal: run recurring read-only checks that catch drift and operational issues.

Useful checks:

- Orchestrator and appliance reachability.
- Appliance online state.
- Version drift across EC-S-P appliances.
- Inventory drift compared with `inventory/demo-network.yaml`.
- Backup age.
- Schema drift after upgrades.
- Unexpected changes in site, overlay, template, or tunnel inventory.

These checks can be run manually, from CI, or from a scheduled automation host.
They should not require write credentials unless a specific maintenance action
is being performed.

## Use Case 9: Upgrade and Change-Window Support

Goal: use Swagger-backed API discovery before and after upgrades or major
configuration changes.

Before a change:

- Capture the live Swagger schemas.
- Capture a baseline bundle.
- Export the baseline if required by the operational procedure.
- Save inventory, health, version, and topology reports.

After a change:

- Fetch the new live Swagger schemas.
- Compare endpoint availability for automation-critical operations.
- Run inventory and health validation.
- Confirm expected overlays, tunnels, and policy objects still exist.
- Record any API differences that require script updates.

This is especially important after Orchestrator upgrades because endpoint shape
and behavior can change across releases.

## Use Case 10: SDK Selection

Goal: decide when to use the official `pyedgeconnect` SDK and when to call REST
directly from the Swagger contract.

Use `pyedgeconnect` when:

- It already exposes the operation needed.
- The workflow benefits from a maintained Python wrapper.
- The SDK supports the deployed Orchestrator and ECOS versions.

Use direct Swagger-driven REST calls when:

- The SDK does not expose the required endpoint.
- The live schema is the stronger source of truth for the deployed release.
- A generated client is preferred for typed request and response handling.
- The script needs to compare endpoint availability across versions.

Both approaches should still start from the live schema for this project.

## Recommended Script Pattern

Use a predictable command structure:

```text
discover   Read live state and write a report.
plan       Compare desired state to live state and show intended changes.
apply      Execute reviewed write operations.
capture    Create a baseline backup bundle.
inspect    Inspect a baseline bundle without live network access.
restore    Restore a validated baseline with explicit confirmation.
validate   Confirm post-change or post-restore health.
```

For write operations:

- Require `--apply`.
- Print the planned API method, path, target object, and high-level payload
  summary before execution.
- Redact secrets from logs.
- Save a timestamped operation report.
- Stop on schema mismatch.

## Suggested Repository Artifacts

As automation matures, keep these artifacts in predictable locations:

```text
references/edgeconnect/
  orchestrator-openapi.json
  edgeconnect-1-openapi.json
  edgeconnect-2-openapi.json
  edgeconnect-3-openapi.json

generated/
  edgeconnect-endpoint-map.yaml

artifacts/            # ignored
  reports/
  baselines/
```

Potential endpoint map shape:

```yaml
release:
  orchestrator_version: null
  ecos_versions: []

operations:
  inventory_list:
    system: orchestrator
    method: GET
    path: null
    risk: read_only
  orchestrator_backup_download:
    system: orchestrator
    method: null
    path: null
    risk: sensitive_read
  appliance_backup_download:
    system: appliance
    method: null
    path: null
    risk: sensitive_read
  restore_apply:
    system: orchestrator
    method: null
    path: null
    risk: destructive
```

Leave paths as `null` until they are confirmed from the live Swagger JSON.

## Security and Operational Notes

- Store secrets in environment variables or ignored local files.
- Keep backup bundles and exported schemas out of public repositories if they
  include sensitive environment details.
- Redact authorization headers, cookies, tokens, license keys, and portal
  responses from logs.
- Treat generated clients as code but treat captured backups as sensitive
  operational artifacts.
- Review any API workflow that changes licensing, activation, Air-Gap state,
  appliance onboarding, routing, overlays, or restore state.

## First Implementation Candidates

The lowest-risk starting points are:

1. Fetch and archive live Swagger schemas.
2. Generate an endpoint inventory report.
3. Discover Orchestrator inventory and compare it to
   `inventory/demo-network.yaml`.
4. Run read-only health and version checks.
5. Identify backup endpoints for the deployed release.
6. Build the offline baseline bundle inspection workflow.

Once these are reliable, add write-capable workflows with dry-run, explicit
confirmation, and restore-safe guardrails.
