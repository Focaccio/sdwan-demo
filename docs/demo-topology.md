# SD-WAN Demo Topology

This project targets a small HPE Aruba EdgeConnect SD-WAN demo network:

- 1 self-hosted Orchestrator
- 3 EdgeConnect EC-S-P appliances

Use `inventory/demo-network.yaml` as the editable inventory for scripts and
automation. Keep hostnames, management addresses, serial numbers, and appliance
site roles there rather than hard-coding them into scripts.

## Nodes

| Role | Count | Platform |
| --- | ---: | --- |
| Orchestrator | 1 | Self-hosted Orchestrator |
| Branch appliance | 3 | EdgeConnect EC-S-P |

## Automation Assumptions

- Orchestrator is the control point for inventory, activation, licensing,
  backups, and API-driven orchestration.
- Appliance-level API or SSH access may still be needed for schema capture,
  health checks, or backup validation.
- Scripts should default to read-only discovery unless explicitly invoked with a
  write/apply option.
- Air-Gap workflows must follow `docs/orchestrator-air-gap-activation.md`.
- API endpoint work must follow `docs/edgeconnect-api-endpoints.md`.

## Placeholders To Fill In

- Orchestrator hostname and management URL
- Orchestrator software version
- Appliance hostnames
- Appliance management IP addresses or URLs
- EC-S-P serial numbers
- Site names and roles
- Air-Gap/license status
