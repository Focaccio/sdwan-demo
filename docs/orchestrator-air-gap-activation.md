# HPE Aruba Orchestrator Air-Gap Activation

Use this document as the project-local source map for Air-Gap activation,
licensing, and isolated EdgeConnect deployment workflows.

## Primary Sources

- Air-Gap tab documentation:
  https://arubanetworking.hpe.com/techdocs/sdwan/docs/orch/orchestrator/server/air-gap/
- User guide index:
  https://arubanetworking.hpe.com/techdocs/sdwan/user-guides/
- Air-Gap User Guide PDF:
  https://www.arubanetworks.com/techdocs/sdwan-PDFs/deployments/HPE-ANW-Orch-Air-gap-UG.pdf

The PDF could not be downloaded automatically from this environment because the
site returned HTTP 403 to `curl`. Keep the official URL pinned here and download
it manually from a browser or vendor support portal when a local binary copy is
needed.

## Scope

HPE describes the Orchestrator Air-Gap solution as a way to deploy HPE Aruba
Networking EdgeConnect SD-WAN in an isolated network with no internet
connectivity. Appliance activation, license management, and related support
functions are handled through the Air-Gap Portal by manually exchanging files
between HPE Aruba Networking Cloud Portal and the isolated deployment.

Air-Gap mode is available only for self-hosted Orchestrator deployments.

Important: HPE documents that once Air-Gap mode is enabled, it cannot be
disabled without Silver Peak Support.

## Prerequisites To Confirm

- Air-Gap mode has been purchased and licensed.
- HPE Aruba Networking Operations has provisioned Air-Gap Portal access.
- The deployment uses self-hosted Orchestrator.
- The operator has Air-Gap Portal credentials and initial Orchestrator access.
- The team is ready to enable Air-Gap for Orchestrator and all appliances.
- A removable-media transfer process is approved for moving files between the
  internet-connected environment and the isolated SD-WAN environment.

## High-Level Activation Flow

1. Access the Air-Gap Portal using the HPE-provided invitation.
2. In Orchestrator, go to `Orchestrator > Orchestrator Server > Licensing > Air-Gap`.
3. Enable Air-Gap mode.
4. Start Air-Gap Registration.
5. Show and copy the Orchestrator registration key.
6. Move the registration key to the Air-Gap Portal using the approved transfer
   process.
7. Generate or obtain the portal response in the Air-Gap Portal.
8. Move the portal response back to the isolated Orchestrator.
9. Paste the portal response into Orchestrator and save it.
10. Assign licenses in the Air-Gap Portal.
11. Download the license file and supporting file from the Air-Gap Portal.
12. Upload the license file and supporting file in Orchestrator with
    `Air-Gap File Upload`.
13. Enable/register Air-Gap on each appliance or EC-V as required by the user
    guide.
14. For EC-Vs added in the Air-Gap Portal, assign serial numbers in
    `Configuration > Overlays & Security > Discovery > Discovered Appliances`.

## Automation Rules

- Treat Air-Gap activation as a controlled operational workflow, not a background
  bootstrap task.
- Require explicit operator confirmation before enabling Air-Gap mode.
- Do not store registration keys, portal responses, license files, supporting
  files, account keys, or serial-number assignment records in Git.
- Keep any generated transfer manifests under an ignored runtime/output
  directory.
- Separate read-only discovery/reporting scripts from scripts that enable
  Air-Gap mode, upload files, assign licenses, or bind EC-V serial numbers.
- Prefer dry-run and checklist output for Air-Gap workflows unless a script is
  explicitly invoked with a write/apply flag.
