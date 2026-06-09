# Project Automation Notes

When building scripts or automation for this repository, use the HPE Aruba
Networking EdgeConnect SD-WAN API references in `docs/edgeconnect-api-endpoints.md`
as the starting point. For offline or isolated deployments, also consult
`docs/orchestrator-air-gap-activation.md` before designing activation,
licensing, appliance onboarding, or backup workflows.

The demo network topology is defined in `docs/demo-topology.md` and
`inventory/demo-network.yaml`. Current target: one Orchestrator and three
EdgeConnect EC-S-P appliances.

The baseline backup/restore design is defined in
`docs/baseline-bundle-technical-plan.md`. Use that plan before building scripts
that capture, export, validate, or restore demo baselines.

Prefer these sources, in order:

1. The live OpenAPI/Swagger JSON exported from the target Orchestrator or
   EdgeConnect appliance.
2. HPE Aruba Networking EdgeConnect developer documentation.
3. The official `pyedgeconnect` SDK when a Python wrapper is more appropriate
   than direct REST calls.

Avoid hard-coding endpoint shapes from memory. EdgeConnect and Orchestrator API
schemas vary by release, especially around Orchestrator 9.3 and later.

Do not automate Air-Gap enablement casually. HPE documents Air-Gap mode as a
self-hosted Orchestrator deployment option that cannot be disabled without
Silver Peak Support.
