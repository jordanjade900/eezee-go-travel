# Registration and travel planning — working brief

Updated: 9 October 2026. A custom first version is implemented and published. The user requested repository-owned systems without a paid CRM; this supersedes the initial proposal. The client's written workflow clarification is still pending.

## Implemented journeys

Group registration: choose a staff-managed departure → provide organiser/contact details and traveller count → consent and submit → receive a saved request reference and private tracking link. Requests are automatically assigned to an active staff member with the smallest open workload, with the owner as fallback. Registration does not reserve a seat or confirm travel.

Personalised planning: submit destination, dates/flexibility, party size, optional budget/currency and preferences → receive a reference and private link → staff prepare and publish an itinerary → customer reviews it, sends questions and accepts the exact published version. Acceptance records approval of the proposal; it does not confirm bookings or payments.

Staff: sign in to /manage/ → search/filter requests → assign responsibility and a follow-up date → record progress, private notes and customer-visible updates → save itinerary drafts → explicitly publish a version. The owner also manages departures and staff access, sees overdue/unassigned/due-today work and downloads backups.

Home, Group Trips and Registration read the live departure catalogue. Contact trip enquiries use that same catalogue. General Contact and hero enquiries continue to prepare editable WhatsApp/email drafts; they are not saved requests. The site explains both paths.

## Confirmed scope

Whop is the selected future payment provider. Payment collection, reconciliation, receipts, deposit automation and payment reminders are deferred. The implementation has no CRM subscription, passport/visa uploads, passenger identity records or supplier booking integration. Outbound email/WhatsApp sending is not configured; receipts and customer updates are shown in the private portal.

## Decisions still needed from the client

- What information is required at registration versus later, including minors and individual passenger details?
- What allocates a seat, and what are the capacity, waitlist, cancellation and confirmation rules?
- Which staff members handle routine enquiries, and which actions require the owner's approval?
- Which planning outputs are needed beyond the implemented itinerary: quotes, supplier checklist, document checklist or appointments?
- Which sending account/channel should deliver updates and reminders, and what consent/retention policy applies?
- What are the verified price currency/basis and actual departure capacities?

## Verification and continuation

Fourteen backend tests cover encrypted persistence, restart survival, access restrictions, retries, concurrency, revisions, private drafts, publication/approval, limits and production safeguards. Browser checks passed the full registration/planning-to-staff workflow and the four new pages at 320, 390, 768 and 1440 px. Live production tests saved and retrieved both request types, published an itinerary and recorded customer approval; the two synthetic production requests were then cancelled.

Start with [custom systems delivery](CUSTOM-SYSTEMS-OCT9.md), [staff quickstart](STAFF-QUICKSTART.md) and [backend setup](../backend/README.md). Keep conservative request states until the client provides booking rules. Preserve the approved hero and logo.
