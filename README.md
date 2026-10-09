# EE-Zee Go Travel

A premium multipage travel website with custom registration, travel planning, customer tracking and a private staff workspace. Built with HTML/CSS/JavaScript, a repository-owned API, encrypted local SQLite and durable production Netlify Blobs. No paid CRM is required. Whop payments are deferred.

Live: https://eezee-go-travel.netlify.app/

Repository: https://github.com/jordanjade900/eezee-go-travel

## Run locally

Use Node 24:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:4191/. The server bootstraps private local credentials in ignored `work/operations-access.md` and secrets in ignored `.env.local` on first run. Customer records are saved in ignored `work/operations.sqlite`. Local and production stores/accounts are independent.

## Customer and staff flows

- /registration/: saved group-trip interest with reference and private link.
- /plan-trip/: saved travel brief for local and international clients.
- /request/: private progress, messages, published itinerary and proposal approval.
- /manage/: staff queue, assignments, follow-ups, internal notes and itinerary drafts. Owner controls departures, team access and backups.

Home and Group Trips display live staff-managed departures, with the original crawlable flyer catalogue as a clearly labelled failure fallback. Contact trip enquiries use current departure details. General Contact and hero enquiries prepare editable WhatsApp/email drafts; customers send those themselves. Registration and proposal approval do not confirm travel or reserve seats. Automatic email/WhatsApp sending is not configured.

## Checks and build

Keep the local server running for browser checks:

```powershell
npm run test:operations
npm run test:operations:ui
$env:TEST_URL='http://127.0.0.1:4191'
npm test
$env:PUBLIC_SITE_URL='https://eezee-go-travel.netlify.app/'
npm run build
```

The UI workflow check creates synthetic local requests; do not run it against production. The build regenerates static catalogue/metadata and emits minified styles into `dist/`. It does not include backend code, credentials, customer records or environment files. Netlify Functions deploy separately with `--functions netlify/functions`; see [deployment](docs/DEPLOYMENT.md).

## Continue the project

Start with [PROJECT-HANDOFF.md](PROJECT-HANDOFF.md), [custom systems delivery](docs/CUSTOM-SYSTEMS-OCT9.md), [staff quickstart](docs/STAFF-QUICKSTART.md) and [backend setup](backend/README.md).

The approved hero/logo remain preserved. Illustrative generated photography is page-specific; authentic named trip photographs come from agency flyers. Do not invent reviews, staff, bookings, seat availability, visa guarantees or price currency/basis. Agency policies and written workflow clarification are pending.
