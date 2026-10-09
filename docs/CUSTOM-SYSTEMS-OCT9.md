# Custom registration, planning and staff management

Delivered: 9 October 2026. Implemented from scratch in this repository, without a paid CRM. The approved hero, logo and existing premium pages are preserved. Whop and all payment features are deferred.

## Live entry points

| Area | URL | Behaviour |
| --- | --- | --- |
| Group registration | https://eezee-go-travel.netlify.app/registration/ | Save an interest request for an open future departure |
| Travel planning | https://eezee-go-travel.netlify.app/plan-trip/ | Save a structured travel brief |
| Customer tracking | https://eezee-go-travel.netlify.app/request/ | Open the private link received after submission |
| Staff workspace | https://eezee-go-travel.netlify.app/manage/ | Authenticated queue, progress, plans and owner controls |

The production owner credentials are in ignored local `work/operations-live-access.md`. Local development credentials are separately in `work/operations-access.md`. Neither file, password nor environment secret is committed or included in the website build. The owner can change their password in the workspace.

## Working systems

Both forms validate on the client and server, save durable records and show a reference/private link. Retry protection prevents an identical submission creating a second record. New work is assigned to the active staff member with the smallest open workload, falling back to the owner. An internal next-action date is set to the next calendar day in Jamaica.

Staff can search/filter, update request status, assign responsibility and follow-up dates, save internal notes and publish customer-facing messages. The owner sees overdue, unassigned and due-today work. This is an on-demand summary; no email digest is sent.

The itinerary editor saves versioned drafts privately. Explicit publication makes the selected version visible in the customer's portal. The customer can ask questions and accept that exact published version. Republish of an unchanged version preserves approval; publication of a revision requires fresh approval. None of these actions confirms travel, allocates a seat or records payment.

The owner manages departure names, dates, price text, inclusions, pickup points, enquiry state and informational capacity. Home, Group Trips, Registration and trip-specific Contact prefill use the public live catalogue. Home shows up to three upcoming open departures; Group Trips labels closed/past departures. New departures receive no invented photographs. The original static agency-flyer catalogue remains crawlable and is labelled as potentially outdated when live loading fails.

Owner team controls create or disable staff accounts. Disabled accounts lose sessions and their open requests return to the owner. Every staff member can change their own password. The owner can download a backup of customer records; that export contains private personal data and excludes credentials, sessions and private access tokens.

## Architecture

- Repository-owned HTML/CSS/JavaScript customer and staff interfaces; no external CRM widgets.
- `backend/api.mjs`: validation, workflow, roles, revisions and public/private response boundaries.
- `backend/security.mjs`: scrypt passwords, AES-256-GCM record encryption, hashed bearer/session tokens and persisted rate limits.
- `backend/store.mjs`: encrypted SQLite snapshot locally, strong-consistency conditional Netlify Blobs writes in production.
- `netlify/functions/operations.mjs`: same-origin API at /api/operations/*, trusted function-context client IP.
- `tools/serve-operations.mjs`: complete local website/API server on 4191.

Production fails closed when required secrets/origin are missing, and never falls back to temporary serverless SQLite. Runtime secrets are independent from local credentials. Netlify Functions/Blobs use the existing hosting account and its usage limits; no CRM subscription is involved.

The initial store is a single encrypted, revision-controlled snapshot capped at 15 MB. It supports this initial low-volume workflow. Migrate to a transactional database before high traffic, a large team or extensive history; it is not a seat-allocation engine or financial ledger.

Staff authentication uses eight-hour HttpOnly, SameSite=Strict cookies, Secure in production. Customer links have random 256-bit tokens, expire after 180 days and remove the fragment from the address bar on load. Token references alone do not authorize access. Customer responses exclude notes, account secrets and unshared drafts. Staff changes enforce role checks and optimistic revisions; stale writes return a conflict.

## Verification

- Fourteen backend tests passed: validation/auth, rate limits, persistence/restart, idempotency, parallel updates, stale revisions, draft privacy, exact-version publication/acceptance, departure controls, disabled accounts, password/session revocation and production storage safeguards.
- Real browser workflow passed: registration → private tracking/reply; planning → staff progress → private draft → publication → customer approval.
- Original website regression check passed across Home's six widths and eight interior pages at four widths.
- Four new pages passed 320, 390, 768 and 1440 px layout/error checks locally and on production.
- Live API saved both request types durably, staff retrieved them, published a plan and recorded customer acceptance. The two synthetic production requests were marked cancelled afterward; they are labelled verification records and are not real bookings.
- The approved hero structure and original stylesheet preservation check passed.
- Final live departure/Contact integration and release checks are recorded separately in operations-release-checks.json.

Reports: `operations-ui-checks.json`, `operations-live-checks.json`, `operations-release-checks.json`. Screenshots remain local in ignored `docs/screenshots/`.

## Use and maintenance

Run `npm ci` and `npm run dev` using Node 24, then open http://127.0.0.1:4191/. Use [staff quickstart](STAFF-QUICKSTART.md) for daily operations and [backend README](../backend/README.md) for configuration/API details.

Do not overwrite production encryption/session secrets when deploying. Encryption-key loss loses record access; session-secret rotation also invalidates customer links. Keep owner backups and secrets privately. An existing owner is not reset by changing bootstrap environment values.

See [deployment instructions](DEPLOYMENT.md) for builds and function deployment. A GitHub push does not automatically deploy this manually linked Netlify project.

## Remaining client decisions and future work

The written requirements are pending. Reservation/waitlist/manifest rules, individual passenger details, verified capacities, price currency/basis and data-retention policy need the client's answer. This version deliberately handles requests rather than confirmed bookings.

Email/SMS/WhatsApp delivery, consultation scheduling, supplier booking, document uploads, MFA and public password recovery are not implemented. The private portal is the current update channel. Add outbound communication with delivery/retry visibility after the agency chooses the sending channel. Whop integration is a separate later phase and no payment work has been started.
