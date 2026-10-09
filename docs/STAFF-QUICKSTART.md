# EE-Zee Go staff workspace

Practical operating guide · 9 October 2026

## Open your desk

- Live: [Team workspace](https://eezee-go-travel.netlify.app/manage/).
- Local development: run `npm run dev` in the website project, then open [the local workspace](http://127.0.0.1:4191/manage/).
- Initial live access is recorded privately in the ignored `work/operations-live-access.md`; local access is in `work/operations-access.md`. Neither file nor its contents belongs in GitHub, a published document or a customer message.
- Sign in with your own account. The owner creates staff accounts through **Team**. Change your initial password through **Password**; use at least 14 characters. Changing it signs out your other sessions. Use **Sign out** when you finish.

## Review and assign requests

1. Open **Requests**. Search by customer name, reference, email or destination. Filter by registration/planning and progress. The summary figures are shortcuts to filtered views.
2. Open a queue row to read the customer brief, requested departure, preferences, history and replies.
3. In **Next action**, choose the progress stage, responsible team member and next-action date. Then select **Save progress**.
4. Write a **Customer-facing update** when the customer needs a new explanation or next step. It appears on their private status page after saving.
5. Use **Internal team notes** for handovers and working notes, then select **Save internal note**. Customers cannot see these notes.

New submissions receive a saved acknowledgement and reference. They are automatically assigned to the enabled staff account with the fewest open requests; if there are no enabled staff accounts, they go to the owner. This does not check staff schedules or whether someone is online. The initial next-action date is the next calendar day. Adjust it to suit your working days and the customer's needs.

| Stage | Suggested use |
| --- | --- |
| Received | Newly saved, awaiting a first review. |
| In review | A team member is checking the brief and arrangements. |
| Awaiting customer | The customer needs to answer a question or supply more information. |
| Planning | The team is developing the proposed journey. |
| Ready | A proposal or the next arrangements are ready for the customer to review. |
| Closed | The team's work on this request is complete. |
| Cancelled | The request will not proceed. |

These are request-management stages. They do not confirm a booking or reserve a seat. Keep final booking confirmation in the agency's agreed process.

An overdue next action has a date before today, using Jamaica time, and belongs to a request that is neither closed nor cancelled. **Refresh** loads the latest saved records. If someone else changed a request while you were editing, the workspace blocks the conflicting save and offers **Reload latest request**. Review the latest version before trying again; reloading discards unsaved edits.

## Build and share an itinerary

1. Open the request and find **Itinerary workspace**.
2. Add a title, overview and itinerary days. Each day needs a title and arrangement details; its date is optional. Use **Add itinerary day** and **Remove day** to organise the proposal.
3. Select **Save draft**. Drafts stay private to the team. Each saved draft receives a version number.
4. Check that version, then select **Publish draft v…** and confirm. The saved version becomes visible on the customer's private status page. Publishing replaces the previously shared itinerary and moves the request to **Ready**.
5. The customer can review it, reply and accept that exact published version. Acceptance is shown in the workspace. It is an itinerary decision, not a booking confirmation.

If you revise an accepted proposal, save and publish a new version so the customer can review the changed itinerary. A prior acceptance does not approve the new version. Publishing or saving does not send an email or WhatsApp message; contact the customer separately when required.

Implemented limits: 1–30 itinerary days, a title up to 160 characters, overview up to 3,000 characters and day details up to 2,000 characters. Unsaved edits are not automatically saved. Save each section before editing another; the workspace asks before an action would discard other unsaved work.

## Maintain departures — owner only

Open **Departures** to add a departure or select **Edit departure information** on an existing one. Maintain its name, date, advertised price wording, meeting/departure point and confirmed inclusions. Set the enquiry status and optional planning capacity, then save.

- Live departure information is used by the Home, Group Trips and Registration views. Refresh an already-open public page to see updates.
- **Enquiries open** allows new registration requests. **Closed** prevents new registrations for that departure; existing requests remain available to the team.
- A departure with a past date must be closed. The registration system rejects past departures even if an old page still shows them.
- Capacity is an internal planning figure. Requested travellers are counted, but seats are not reserved, remaining seats are not calculated and a waitlist is not created automatically. Confirm actual availability with the agency's arrangements.
- Leave an unconfirmed price or capacity blank. Use only price wording and currency the agency has confirmed.

Implemented limits: departure name 160 characters, advertised price wording 100, departure point 240, and up to 20 inclusions of 160 characters each. Capacity, when entered, must be a whole number from 1 to 10,000.

## Manage the team and records — owner only

**Team** lets the owner create staff accounts with a name, email address and initial password of at least 14 characters. Share that password privately; account invitations are not emailed. Staff can manage requests and itineraries but cannot manage departures, create/disable accounts or export all records.

**Disable access** prevents a staff member from signing in and reassigns their open requests to the owner. Their existing notes and history remain available. This does not delete the account, and there is currently no re-enable control.

**Download records backup** exports a JSON copy of operational records. It contains customer details, conversation history and internal notes: keep it in a secure, access-controlled location. Password hashes and session tokens are excluded. Downloading a backup does not restore one; there is no restore/upload control in this version.

## A light daily routine

**Staff:** review your assigned new requests, answer customer replies, work through due/overdue actions, and leave every active request with an owner, sensible stage and next-action date. Save customer-facing updates when useful and internal notes before a handover.

**Owner:** use the daily summary to review overdue and unassigned work, redistribute requests when needed, and check exceptions with the responsible staff member. Maintain departure details and team access as they change. Download a records backup regularly.

The daily summary and alerts are in the workspace. Automated email/WhatsApp delivery, consultation calendars, supplier booking integrations and payment processing are not implemented. Whop payment integration is deferred; no checkout or deposit collection is part of this system.
