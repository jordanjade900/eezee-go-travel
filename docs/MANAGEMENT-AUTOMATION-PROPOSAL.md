# Custom management and automation — EE-Zee Go

Updated: 9 October 2026. The user requested systems built from scratch without a paid CRM. The earlier Zoho/Netlify Forms proposal is superseded. Registration, planning and staff management now use repository-owned frontend/API code and the existing hosting infrastructure.

## What reduces the owner's workload now

1. Saved intake: customers complete separate registration and planning forms. Server validation and repeat-submission protection prevent accidental duplicate requests. Customers receive a reference and private link on screen.
2. Automatic routing: new requests go to the active staff member with the fewest open requests, or the owner when no staff are available. Each has an internal next-action date for the following calendar day in Jamaica; this is not a promised response time.
3. Shared work queue: staff search by reference, name, email or destination, filter request type/status, assign responsibility and record next actions. Internal notes remain separate from customer-visible updates.
4. Owner exception view: overdue, unassigned and due-today counts surface unfinished work. This is a live dashboard summary, not a scheduled email digest.
5. Planning workspace: staff save versioned itinerary drafts, explicitly publish proposals and see the customer's approval of the exact version. Revised publication requires fresh approval.
6. Customer self-service: the private portal shows progress, published itinerary and saved messages, and accepts questions and proposal approval. It reduces repeated status calls without claiming automatic email delivery.
7. Departure management: the owner creates/edits dates, price text, pickup, inclusions and registration status. Live Home, Group Trips and Registration listings follow these edits. Capacity remains informational; requests do not allocate seats.
8. Team management: the owner creates or disables staff accounts. Disabling staff revokes access and returns open work to the owner. Staff can change their passwords. The owner can export a private backup.

## Recommended operating routine

Staff start with due/overdue work, review new requests, ask for missing information through the portal and set the next action before leaving a record. The owner checks the exception summary and handles decisions staff cannot resolve. Automation routes and records the work; staff still provide the travel service.

See [staff quickstart](STAFF-QUICKSTART.md) for the actual dashboard steps.

## Next additions after written client clarification

- A configured outbound channel and delivery-failure queue, then event-based acknowledgements, missing-information notices, departure reminders and an owner digest. No messages are currently sent automatically.
- Agency-defined capacity/waitlist rules and a passenger manifest after the client specifies what reserves or confirms a place.
- Reusable itinerary templates, quote versions and a supplier confirmation checklist if required.
- Consultation calendar and reminder rules if appointments form part of the workflow.
- A production transactional database migration before a large staff team, high submission volume or long record history outgrows the initial encrypted snapshot store.

## Explicitly deferred

Whop integration and every payment workflow are deferred. No checkout, payment reminders, reconciliation, receipts, deposit-driven seat allocation or payment status is implemented. Supplier booking, sensitive identity-document uploads and agency policy decisions are also outside this first version.

No paid CRM/SaaS product is required by this implementation. Netlify Functions/Blobs use the site's existing hosting account and remain subject to its usage limits; this is not a promise of unlimited free infrastructure. Architecture, deployment and verification details are in [custom systems delivery](CUSTOM-SYSTEMS-OCT9.md).
