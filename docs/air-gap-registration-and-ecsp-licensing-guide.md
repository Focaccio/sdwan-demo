# Air-Gap Orchestrator Registration and EC-S-P Licensing Guide

Version: 1.0

This runbook covers registering the self-hosted Orchestrator in the HPE Aruba
Networking Air-Gap Portal and licensing the three EdgeConnect EC-S-P appliances
defined for this demo project.

Use this guide with:

- `docs/orchestrator-air-gap-activation.md`
- `docs/demo-topology.md`
- `inventory/demo-network.yaml`

Do not commit registration keys, portal responses, license files, supporting
files, account keys, appliance backups, or transfer manifests to Git.

## 1. Official References

1.1. HPE Aruba Networking Orchestrator Air-Gap tab documentation:
https://arubanetworking.hpe.com/techdocs/sdwan/docs/orch/orchestrator/server/air-gap/

1.2. HPE Aruba Networking Orchestrator Air-Gap User Guide PDF:
https://arubanetworking.hpe.com/techdocs/sdwan-PDFs/deployments/HPE-ANW-Orch-Air-gap-UG.pdf

1.3. HPE Aruba Networking Orchestrator licensing documentation:
https://arubanetworking.hpe.com/techdocs/sdwan/docs/orch/configuration/overlays/licenses/

1.4. HPE Aruba Networking EdgeConnect SD-WAN documentation home:
https://arubanetworking.hpe.com/techdocs/sdwan/

## 2. Scope

2.1. Target topology:

- One self-hosted HPE Aruba Networking EdgeConnect SD-WAN Orchestrator.
- Three physical EdgeConnect EC-S-P appliances.
- No EC-V appliances are in the current demo topology.

2.2. Air-Gap mode changes the licensing workflow. Appliance activation,
license management, and supporting functions are performed through the
Air-Gap Portal by manually moving files between the internet-connected portal
side and the isolated SD-WAN deployment.

2.3. Air-Gap mode is only for self-hosted Orchestrator deployments.

2.4. Air-Gap mode should be treated as a controlled change. HPE documents that
after Air-Gap mode is enabled, it cannot be disabled without Silver Peak
Support.

## 3. Pre-Change Checklist

3.1. Confirm commercial and portal readiness.

1. Confirm that EdgeConnect SD-WAN Air-Gap mode has been purchased.
2. Confirm that HPE Aruba Networking Operations has provisioned the Air-Gap
   Portal account.
3. Confirm that the designated portal contacts received the Air-Gap Portal
   invitation.
4. Confirm that the portal user can sign in from an internet-connected
   workstation.
5. Confirm that the purchased appliance licenses include enough entitlement for
   all three EC-S-P appliances.
6. Confirm whether optional feature licenses are required, such as WAN
   Optimization or Advanced Security / Dynamic Threat Defense.

3.2. Confirm software readiness.

1. Confirm the Orchestrator is self-hosted.
2. Confirm the Orchestrator version is supported for Air-Gap mode. The Air-Gap
   User Guide calls out Orchestrator 9.4.2 or later.
3. Confirm each EC-S-P appliance runs a supported ECOS version. The Air-Gap User
   Guide calls out ECOS 9.4.2.0 or later.
4. Record the actual versions in `inventory/demo-network.yaml`.

3.3. Confirm identity and inventory.

1. Record the Orchestrator management URL or IP address.
2. Record the Air-Gap account name exactly as provided by HPE Aruba Networking.
3. Record the Air-Gap account key in an approved secret store.
4. Record each EC-S-P appliance serial number in the approved operations record.
5. Update `inventory/demo-network.yaml` with non-secret values such as hostnames,
   management URLs, software versions, and serial numbers if policy allows.

3.4. Confirm transfer controls.

1. Identify the internet-connected workstation used to access the Air-Gap Portal.
2. Identify the isolated workstation used to access Orchestrator and the
   appliances.
3. Prepare approved removable media for moving files between environments.
4. Define where temporary transfer files will be stored outside Git.
5. Define the malware scanning and chain-of-custody process for removable media.
6. Confirm that no generated license or support files will be copied into this
   repository.

## 4. Generate or Refresh the Air-Gap Account Key

HPE recommends generating a new account key before enabling and registering
Air-Gap mode. If a new account key is generated later, the Orchestrator
Air-Gap registration process must be repeated.

4.1. On the internet-connected workstation:

1. Open the Air-Gap Portal URL from the HPE Aruba Networking invitation.
2. Sign in with the email address assigned to the Air-Gap account.
3. Select the correct customer account if more than one account is listed.
4. Click `Generate New Key`.
5. Copy the new account key.
6. Store the account key in the approved secret store.

4.2. On the isolated Orchestrator:

1. Sign in to Orchestrator.
2. Navigate to `Orchestrator > Orchestrator Server > Licensing > Cloud Portal`.
3. Paste the account key into the `Account key` field.
4. Click `Close`.
5. Record that the account key was updated, but do not record the key value in
   Git, tickets, or shared documents.

## 5. Enable Air-Gap Mode on Orchestrator

5.1. Final confirmation before enabling:

1. Confirm that this is the intended self-hosted Orchestrator.
2. Confirm that a current Orchestrator backup exists.
3. Confirm that the Air-Gap account key has been entered.
4. Confirm that all required EC-S-P serial numbers are available.
5. Confirm that the operations team accepts that Air-Gap mode cannot be casually
   disabled after it is enabled.

5.2. Enable Air-Gap mode:

1. Sign in to Orchestrator.
2. Navigate to `Orchestrator > Orchestrator Server > Licensing > Air-Gap`.
3. Select `Enable Air-Gap mode`.
4. Review the confirmation dialog.
5. Click `Confirm`.
6. Wait for the Air-Gap tab to refresh.

## 6. Obtain the Orchestrator Registration Key

6.1. In Orchestrator:

1. Stay on `Orchestrator > Orchestrator Server > Licensing > Air-Gap`.
2. Click `Air-Gap Registration`.
3. Click `Show Registration Key`.
4. Click `Copy Registration Key`.
5. Copy the registration key to the approved transfer media or approved
   temporary transfer record.
6. Keep the Air-Gap Registration dialog open if possible. If you must close it,
   reopen it before pasting the portal response in Section 8.

6.2. Protect the registration key.

1. Treat the registration key as sensitive operational data.
2. Do not paste it into this repository.
3. Do not commit screenshots that contain the key.
4. Do not send the key through unapproved messaging tools.

## 7. Register the Orchestrator in the Air-Gap Portal

7.1. Move the registration key to the internet-connected workstation using the
approved transfer process.

7.2. In the Air-Gap Portal:

1. Sign in with the Air-Gap Portal account.
2. Select the correct customer account.
3. Open the `Register Orchestrator` tab.
4. Paste the Orchestrator registration key into the registration text box.
5. Click `Register Orchestrator`.
6. Wait for the portal to generate the Orchestrator response.
7. Click `Copy Orchestrator Response`.
8. Save the response to approved transfer media or an approved temporary
   transfer record.

7.3. Registration rule:

1. Only one Orchestrator can be active in the Air-Gap Portal at a time.
2. If multiple Orchestrators are registered, the most recently registered
   Orchestrator becomes active and earlier Orchestrators show as inactive.

## 8. Submit the Portal Response in Orchestrator

8.1. Move the portal response back to the isolated Orchestrator environment.

8.2. In Orchestrator:

1. Navigate to `Orchestrator > Orchestrator Server > Licensing > Air-Gap`.
2. Click `Air-Gap Registration`.
3. Paste the portal response into the `Portal response` field.
4. Click `Save Portal Response`.
5. Click `Close`.

8.3. Validate registration:

1. Confirm that Orchestrator reports Air-Gap registration as complete.
2. Capture the completion date, operator name, and Orchestrator version in the
   approved operations record.
3. Do not store the portal response in Git.

## 9. Prepare the EC-S-P Appliance License Plan

9.1. Build the license assignment table before changing anything in the portal.

| Appliance | Model | Serial number | EC license size | Boost | Feature licenses |
| --- | --- | --- | --- | --- | --- |
| edgeconnect-1 | EC-S-P | To be filled | To be filled | To be filled | To be filled |
| edgeconnect-2 | EC-S-P | To be filled | To be filled | To be filled | To be filled |
| edgeconnect-3 | EC-S-P | To be filled | To be filled | To be filled | To be filled |

9.2. Confirm the license choice for each appliance.

1. Select the correct EC license size for each EC-S-P.
2. Decide whether Boost is required and record the amount.
3. Decide whether WAN Optimization is required.
4. Decide whether Advanced Security / Dynamic Threat Defense is required.
5. Confirm that every selected feature license has enough available entitlement.
6. Confirm all three appliances are on the same software version if you plan to
   use bulk assignment.

9.3. Existing-appliance warning:

1. For existing physical EC-S-P appliances, ensure their serial numbers are
   included in the license file that will be uploaded to Orchestrator.
2. Orchestrator will only accept appliances that either have no assigned serial
   number or whose serial number is already present in the uploaded license file.

## 10. Assign or Update EC-S-P Licenses in the Air-Gap Portal

10.1. In the Air-Gap Portal:

1. Sign in from the internet-connected workstation.
2. Select the correct customer account.
3. Click `License & Manage Appliances`.
4. Confirm that the three EC-S-P appliances and their serial numbers are listed.
5. Select the appliances to license. If no appliances are selected, the Air-Gap
   Portal may select all appliances by default, so verify the selection before
   applying changes.
6. Click `Assign/Revoke Licenses`.

10.2. In the `Assign/Revoke Licenses` dialog:

1. For the EC license, select `Add/Replace`.
2. Select the correct EC size for the selected EC-S-P appliance or appliances.
3. If Boost is required, select `Add/Replace` for Boost and enter the approved
   amount.
4. If feature licenses are required, select `Add/Replace` for the feature
   license.
5. Select the required feature license option and quantity when prompted.
6. If removing a license, select the appropriate `Revoke` option only after
   confirming the operational impact.
7. Click `Apply`.
8. Verify that the appliance table now lists the expected EC license, Boost, and
   feature licenses for each EC-S-P.

10.3. RMA and revoke rule:

1. Revoke an appliance license before RMA activity.
2. If an EC license is revoked, associated Boost and feature licenses are also
   revoked for that appliance.

## 11. Download Required Air-Gap Files

11.1. In the Air-Gap Portal:

1. Select all three EC-S-P appliances in the appliance table.
2. Click `Download Required Files`.
3. Click `Download Appliance Licenses`.
4. Save the encrypted license file to the approved transfer location.
5. Click `Download Supporting File`.
6. Save the encrypted supporting file package to the approved transfer location.

11.2. File handling rules:

1. Download a new license file every time you add, reassign, or revoke a
   license.
2. Download a new supporting file package when instructed by HPE guidance or
   operational policy.
3. HPE recommends updating the supporting file monthly for optimal system
   performance.
4. Do not store the license file or supporting file package in Git.
5. Do not rename files in a way that hides their source, account, or date from
   the operations record.

## 12. Upload Air-Gap Files to Orchestrator

12.1. Move the license file and supporting file package to the isolated
Orchestrator environment using the approved transfer process.

12.2. In Orchestrator:

1. Navigate to `Orchestrator > Orchestrator Server > Licensing > Air-Gap`.
2. Click `Air-Gap File Upload`.
3. Click `Upload license file`.
4. Select the license file downloaded from the Air-Gap Portal.
5. Click `Open`.
6. Click `Upload supporting file`.
7. Select the supporting file package downloaded from the Air-Gap Portal.
8. Click `Open`.
9. Click `Close`.

12.3. Validate Orchestrator-side license upload:

1. Confirm that Orchestrator accepts the license file.
2. Confirm that Orchestrator accepts the supporting file package.
3. Navigate to `Configuration > Overlays & Security > Licensing > Licenses`.
4. Confirm the three EC-S-P appliances appear with expected license status after
   appliance registration/discovery is complete.

## 13. Enable Air-Gap Mode on Each EC-S-P Appliance

Complete this section for each physical EC-S-P appliance:

- `edgeconnect-1`
- `edgeconnect-2`
- `edgeconnect-3`

13.1. Before starting each appliance:

1. Confirm the appliance serial number is present in the uploaded Orchestrator
   license file.
2. Confirm you have the Orchestrator IP address.
3. Confirm you have the exact Air-Gap account name.
4. Confirm you have the Air-Gap account key from the approved secret store.
5. Confirm the appliance management UI is reachable from the isolated
   operations workstation.

13.2. On the appliance:

1. Sign in to the EC-S-P appliance web UI.
2. Navigate to `Administration > HPE Aruba Networking Cloud Services`.
3. Select `Enable Air-Gap Mode`.
4. In the `Orchestrator` field, enter the Orchestrator IP address.
5. Navigate to `Administration > License & Registration`.
6. In the `Account Name` field, enter the Air-Gap account name exactly.
7. In the `Account Key` field, enter the Air-Gap account key exactly.
8. Click `Apply`.
9. Sign out of the appliance web UI.

13.3. Repeat Section 13.2 for all three EC-S-P appliances.

## 14. Discover and Validate Appliances in Orchestrator

14.1. In Orchestrator:

1. Sign in to Orchestrator.
2. Review discovered appliance notifications.
3. Approve the discovered EC-S-P appliances if approval is required.
4. Confirm each appliance has the expected hostname, model, serial number, site,
   and software version.
5. Navigate to `Configuration > Overlays & Security > Licensing > Licenses`.
6. Confirm each EC-S-P shows the expected EC license.
7. Confirm Boost and feature licenses show as expected.

14.2. Validate the demo inventory:

1. Compare Orchestrator inventory against `inventory/demo-network.yaml`.
2. Update the inventory file with non-secret corrections.
3. Keep account keys, registration keys, portal responses, and license files out
   of the inventory file.

## 15. EC-V Serial Number Section Not Used for This Demo

15.1. The current demo topology uses three physical EC-S-P appliances and no
EC-V appliances.

15.2. If EC-V appliances are added later:

1. Add EC-Vs in the Air-Gap Portal only after confirming the required quantity.
2. Do not over-add EC-Vs; the Air-Gap User Guide notes that added EC-Vs cannot
   be deleted.
3. After uploading the updated license file to Orchestrator, navigate to
   `Configuration > Overlays & Security > Discovery > Discovered Appliances`.
4. Click `Air-Gap appliances awaiting discovery`.
5. Assign the correct serial number to each EC-V.
6. Click `Apply`.
7. Treat EC-V serial number assignment as permanent.

## 16. Post-Change Validation

16.1. Confirm Orchestrator state.

1. Air-Gap mode is enabled.
2. Air-Gap registration is complete.
3. Latest license file has been uploaded.
4. Latest supporting file package has been uploaded.
5. No Air-Gap alarms are active unless expected.

16.2. Confirm appliance state.

1. All three EC-S-P appliances are visible in Orchestrator.
2. All three EC-S-P appliances are associated with the expected serial numbers.
3. All three EC-S-P appliances show valid EC licenses.
4. Optional licenses are present where expected.
5. Appliance software versions match the license assignment plan.

16.3. Confirm records and cleanup.

1. Record the change completion date.
2. Record the portal operator and isolated-environment operator.
3. Record the license file download date and supporting file download date.
4. Remove temporary copies of sensitive files from staging locations.
5. Store retained sensitive artifacts only in approved secure storage.
6. Confirm no sensitive artifacts were added to Git with `git status --ignored`.

## 17. Troubleshooting Notes

17.1. Appliance does not register with Orchestrator.

1. Confirm the account name is exact, including case and spacing.
2. Confirm the account key is exact.
3. Confirm the appliance has Air-Gap mode enabled.
4. Confirm the Orchestrator IP address entered on the appliance is correct.
5. Confirm the appliance serial number is included in the uploaded license file.
6. Confirm Orchestrator and appliance versions meet Air-Gap requirements.

17.2. Licenses do not appear as expected.

1. Confirm the correct account was selected in the Air-Gap Portal.
2. Confirm all three EC-S-P appliances were selected before applying licenses.
3. Confirm the correct EC license size was selected.
4. Confirm optional feature licenses were assigned.
5. Download a fresh license file after every license change.
6. Upload the fresh license file to Orchestrator.

17.3. Supporting file is stale.

1. Download a current supporting file package from the Air-Gap Portal.
2. Move it to the isolated Orchestrator environment.
3. Upload it through `Orchestrator > Orchestrator Server > Licensing > Air-Gap`.
4. Track the supporting file date in the operations record.

## 18. Completion Criteria

The Air-Gap registration and EC-S-P licensing workflow is complete when:

1. Orchestrator is enabled for Air-Gap mode.
2. Orchestrator is registered in the Air-Gap Portal.
3. Licenses have been assigned in the Air-Gap Portal for all three EC-S-P
   appliances.
4. The license file and supporting file package have been uploaded to
   Orchestrator.
5. Air-Gap mode has been enabled on all three EC-S-P appliances.
6. All three EC-S-P appliances are visible and licensed in Orchestrator.
7. No sensitive Air-Gap artifacts are present in Git.
