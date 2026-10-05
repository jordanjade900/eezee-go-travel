# EE-Zee Go Travel website

## Current update — 4 October 2026: audience and globe removal

The user clarified that the agency has local and international clients. The hero now says planned with care for 30 years, without from Mandeville. General audience descriptions and metadata reflect both audiences; physical office and advertised departure addresses remain. The user then requested removal of the globe. Services now has a full-width opening and its exclusive planning photo; the globe renderer, bundle, build step and unused Three.js/geographic dependencies are removed. Eight services, GSAP entrances and other page interactions remain. Earlier globe descriptions/checks below are historical. See docs/AUDIENCE-AND-GLOBE-UPDATE.md and docs/globe-removal-checks.json.


## Published — 4 October 2026

Live website: https://eezee-go-travel.netlify.app/
Repository: https://github.com/jordanjade900/eezee-go-travel (main).
Netlify project: https://app.netlify.com/projects/eezee-go-travel, team jordanjade900. The user authorized public Netlify hosting. The GitHub upload succeeded through Git Credential Manager after the plugin returned a write-permission error. The site was deployed manually with Netlify CLI; automatic Git-triggered deployment is not configured.

All nine live routes, images, live-domain metadata, responsive hero, enquiry controls, Contact prefill, robots/sitemap and nested styled 404 checks passed. Live desktop/mobile hero captures were inspected. docs/DEPLOYMENT.md has the project ID, deploy log, update commands and local CLI workaround. tools/check-deployment.mjs performs live verification. The build now works under a different folder name and preserves root stylesheet URLs on nested 404 pages. Earlier local-only and pending-repository statements below are historical and superseded. No agency custom domain or DNS was changed.


## Current design — 3 October 2026

Distinct interior compositions, rewritten service-specific copy, thirteen new page-exclusive illustrative image families and locally served GSAP/Three.js motion are implemented. Interior navigation uses a red underline only. The approved home hero/logo and existing enquiry flows remain. Start with PROJECT-HANDOFF.md; research is in docs/DESIGN-RESEARCH-OCT3.md and exact image prompts in docs/ASSET-PROMPTS-OCT3.json.

npm run build regenerates content/metadata, builds the lazy Services globe and emits minified page CSS bundles. The local server negotiates Brotli/gzip. Source: http://127.0.0.1:4173/; built preview: http://127.0.0.1:4184/. This dated section supersedes earlier design summaries below.


## Latest refinement — 2 October 2026

Real advertised Jamaican trips are prominent on Home and Group Trips. About uses verified agency facts; all eight services are clearly linked. Repeated mobile content is removed and shared typography/buttons are aligned. See docs/REFINEMENT-2026-10-02.md.

Shared content: edit data/enquiry-catalog.json and data/local-trips.json, then npm run build (or npm run content:generate for content only). The build generates the trip cards/form options, SEO and one CSS bundle per page in dist/. Do not hand-edit generated blocks. Additional checks: node tools/check-controls.mjs, node tools/check-instagram.mjs and node tools/check-refinement.mjs. The last checks both source on 4173 and a built preview on 4184. To serve dist in PowerShell set $env:PORT='4184' and $env:SITE_ROOT=Join-Path (Get-Location) 'dist' before node tools/serve.mjs.

The current working site includes the approved hero, redesigned home sections, eight interior pages and a custom 404. The premium refinement adds six illustrative travel assets, page-specific compositions, keyboard-accessible service image previews and reduced-motion-aware entrances. See `docs/DESIGN-DIRECTION.md` for references and visual decisions. The new design is ready for review.

Start with `PROJECT-HANDOFF.md` for Claude continuation and `WEBSITE-REQUIREMENTS.md` for the client research and proposed full-site scope.

Only the user's hero reference and original logo are approved. The hero is implemented to that reference. The home sections below it and the interior pages (`group-trips/`, `services/`, `travel-services/`, `visa-assistance/`, `passport-renewals/`, `about/`, `contact/`, `privacy/`) were built in the same visual language and still need client review. See the update section in `PROJECT-HANDOFF.md`.

## Preview

With Node.js installed, run from this directory:

```sh
npm run dev
```

Open http://127.0.0.1:4173. The site is currently hosted locally there (loopback only, not public). See “Local hosting” in `PROJECT-HANDOFF.md`. Runtime dependencies are not needed for the static preview; all fonts and images are local. `PORT=...` can select another port. In PowerShell use `$env:PORT = '4174'` before the command.

## Development checks

```sh
npm ci
npm test
node tools/check-premium.mjs
node tools/check-home-redesign.mjs
node tools/check-polish.mjs
npm run audit:site
npm run build
```

Keep the preview server running while testing or auditing. Tests default to installed Google Chrome. To use Edge, set `BROWSER_CHANNEL=msedge`; on PowerShell use `$env:BROWSER_CHANNEL = 'msedge'`. The checks save screenshots and reports in `docs/`.

The static build is written to `dist/`. Nothing is deployed automatically. Use a current Node LTS release compatible with the locked development dependencies; Node 24 was used for this milestone.

The user's latest refinement removes the hero flight motif, adds hero/button motion and a shared back-to-top control. Search metadata and crawler files are generated during build for `https://eezeegotravelja.com/` by default. Set `PUBLIC_SITE_URL` if the launch domain changes. See `docs/SEO-AIO.md`.

## Behavior

- Header links go to the local pages. Interior Book Now links to the contact page.
- The contact form prepares WhatsApp or email drafts only. Nothing is sent from the site.
- Book Now and Search open a local enquiry summary.
- Continue on WhatsApp opens a draft for +1 876 450 3415. It does not send a message or book a trip.
- No customer data is stored, no analytics runs and no form submission reaches a server.

The hero background is reconstructed from the flattened reference. Fonts and icon shapes are close matches. New travel scenes are illustrative generated artwork. See `docs/ASSET-PROVENANCE.md` for their provenance and `docs/GENERATED-ASSET-PROMPTS.md` for the prompts. The site is an enquiry-led preview; bookings are confirmed with the agency.

Instagram service and trip coverage: docs/INSTAGRAM-SERVICE-COVERAGE.md. Check with node tools/check-instagram.mjs.
