# Project handoff for Claude: EE-Zee Go Travel

## Current update — 8 October 2026: original client website content

The user supplied the existing website as an authoritative content source and requested missing information be incorporated. Seven interior pages and the shared enquiry catalogue now cover transfers, tours, insurance, booking workflows, visa preparation, adult renewal steps, published customer excerpts and group reservation/payment-plan information. About speaks to international clients. Approved hero/logo remain untouched. See docs/CLIENT-WEBSITE-CONTENT-OCT8.md for sources, exact scope and unresolved source contradictions; do not import placeholder prices, conflicting international trip dates or unverified accreditation/approval statistics. Form behaviour remains draft-only, with no payment/booking backend. Verification: npm test, custom controls, nine pages at six widths (including normal motion/no-JS), and new transfer/tour/insurance prefills and WhatsApp drafts at three widths passed. Desktop/mobile process, review and FAQ captures were personally inspected. Source preview for this turn is http://127.0.0.1:4190/ because 4173 is occupied by another server.


## Current update — 4 October 2026: audience and globe removal

The user clarified that the agency has local and international clients. The hero now says planned with care for 30 years, without from Mandeville. General audience descriptions and metadata reflect both audiences; physical office and advertised departure addresses remain. The user then requested removal of the globe. Services now has a full-width opening and its exclusive planning photo; the globe renderer, bundle, build step and unused Three.js/geographic dependencies are removed. Eight services, GSAP entrances and other page interactions remain. Earlier globe descriptions/checks below are historical. See docs/AUDIENCE-AND-GLOBE-UPDATE.md and docs/globe-removal-checks.json.


## Published — 4 October 2026

Live website: https://eezee-go-travel.netlify.app/
Repository: https://github.com/jordanjade900/eezee-go-travel (main).
Netlify project: https://app.netlify.com/projects/eezee-go-travel, team jordanjade900. The user authorized public Netlify hosting. The GitHub upload succeeded through Git Credential Manager after the plugin returned a write-permission error. The site was deployed manually with Netlify CLI; automatic Git-triggered deployment is not configured.

All nine live routes, images, live-domain metadata, responsive hero, enquiry controls, Contact prefill, robots/sitemap and nested styled 404 checks passed. Live desktop/mobile hero captures were inspected. docs/DEPLOYMENT.md has the project ID, deploy log, update commands and local CLI workaround. tools/check-deployment.mjs performs live verification. The build now works under a different folder name and preserves root stylesheet URLs on nested 404 pages. Earlier local-only and pending-repository statements below are historical and superseded. No agency custom domain or DNS was changed.


## Latest update — 4 October 2026

The user requested a simple, more realistic hero image. assets/hero-realistic-v2.png and desktop/mobile WebP derivatives now replace the visible Home background via atelier.css; original hero assets and styles.css are preserved. Layout, logo, headline and form are unchanged. Preloads and Home social metadata use the new asset. Five viewport checks passed and desktop/mobile crops were personally inspected. Prompt/provenance: docs/HERO-IMAGE-OCT4.md. Earlier Lighthouse scores predate this image replacement.

A local main-branch Git repository was initialized for the website only. node_modules, dist, environment files, scratch scripts, generated-reference originals and screenshot/Lighthouse artifacts are excluded; source, delivery assets, supplied references, lockfile, tests and handoff documents are included. The connected GitHub account is jordanjade900. GitHub repository creation/upload is pending an empty repository URL because the connector does not expose repository creation and no local GitHub CLI authentication is available. Do not claim a remote exists until verified.

## Latest production measurement — 3 October 2026

Services was also audited in isolation: performance 92, automated accessibility/best practices/SEO 100; LCP 2.3s, CLS 0. Report: docs/lighthouse-services-oct3.json. lighthouse.json is the most recently audited page, not necessarily Home.

After CSS minification and Brotli/gzip text delivery, the isolated production homepage measured performance 93, accessibility 100, best-practices 100, seo 100; LCP 3.2 s, CLS 0. Report: docs/lighthouse-production-oct3.json. This supersedes the 2 October score below. Source/built style and enquiry parity passed again after the delivery changes. See docs/QA-SUMMARY.md for current coverage and practical limits.


## Current implementation — 3 October 2026

This section supersedes the earlier design descriptions and performance scores below. The user authorized a substantial redesign of interior pages and requested more original imagery and custom animation. The approved home hero and supplied logo remain preserved. Interior navigation now has only a coral red active/hover underline; the browser's blue text underline is removed. Hero navigation remains as approved.

Thirteen new illustrative image families have been generated with the built-in imagegen tool, inspected, and encoded into local 1536px/768px WebP variants. They are assigned to individual pages rather than reused across the site. Originals: references/generated/oct3/. Exact prompts and delivery paths: docs/ASSET-PROMPTS-OCT3.json. Authentic named Jamaican trip thumbnails still come from the user's agency flyer; generated images are not substituted for venue evidence.

Page compositions and copy now differ intentionally: About has a Jamaican highlands opening and an editorial 1996 story; Services combines a custom geographic globe with a planning still life and eight service links; Travel uses a night waterfront and a sequential service ledger; Group Trips combines a river opening, verified local departure rows and five individual international postcards; Visa uses an arched Japan scene and country board; Passport uses an overlapping renewal note and exclusive still life; Contact has a palm/architecture image and glass enquiry form. Privacy uses a quiet reading layout. Home gains its own aerial coast section below the preserved hero.

atelier.css is the final scoped visual layer. atelier.js adds GSAP word reveals, image mask entrances, restrained desktop photo parallax, finite card entrances, magnetic pointer feedback and an accessible horizontal destination reel. The existing hero load/reload intro, custom glass listboxes/calendar and back-to-top remain. Reduced motion, keyboard focus, no-JavaScript visibility and reduced-transparency fallbacks are retained. There is no loading gate or scroll hijack.

tools/globe-source.js builds a Three.js globe with real Natural Earth land boundaries, Jamaican-origin route arcs and animated beacons. tools/build-motion.mjs bundles it locally into assets/vendor/globe.js. The module loads only near the Services illustration, skips Save Data, pauses offscreen/in hidden tabs and caps frame rate/pixel density. Static CSS artwork remains if JavaScript or WebGL is unavailable. All libraries and fonts are served locally, with license notices in assets/licenses/ and vendor headers.

Source preview: http://127.0.0.1:4173/. Built preview: http://127.0.0.1:4184/. npm run build regenerates shared content, SEO and the Three.js bundle, then creates one content-hashed minified CSS bundle per page. The local server now negotiates Brotli/gzip for text assets, retains no-store for reliable editing and supports uncompressed clients. Public hosting must also enable compression. No public deployment occurred.

Maintenance: edit data/enquiry-catalog.json and data/local-trips.json, then build. Preserve the shared native form fields, allowlisted trip IDs and enquiry-draft behavior. There is no booking/payment backend. Do not invent staff, reviews, seat availability, visa guarantees or price currency/basis. Keep real office details and all eight advertised services. Only the supplied hero/logo are client-approved; new interior work remains a review proposal.

Do not rerun work/redesign-oct3.mjs, work/finalize-oct3.mjs, work/research-oct3.mjs or this documentation migration. They are one-time scripts; the research script would overwrite the before-state snapshot. Develop directly in source files. Use tools/encode-oct3.mjs only when deliberately re-encoding the saved assets.

Research and decisions: docs/DESIGN-RESEARCH-OCT3.md. Self-review: docs/SELF-REVIEW-2026-10-03.md. Verification: docs/QA-SUMMARY.md and docs/atelier-checks.json. Screenshots: docs/screenshots/atelier/.


## Implemented refinement — 2 October 2026

Implemented the user's requested improvements following the self-review. The approved homepage hero composition, copy, original stylesheet and official logo are retained; its service/destination options now match Contact. Local trips appear directly after the hero and lead the Group Trips page, with individual photographs cropped from the supplied agency flyer. Services presents all eight offerings without a second duplicated image-card catalogue. About uses verified founding, address, office hours and contact facts. Interior headings, panels, links and footers share a coherent navy/teal/gold treatment. Repeated process/closing blocks were replaced with concise, service-specific enquiry guidance. Interior header buttons now say Start enquiry; a note below the approved home hero clarifies Search/Book Now. No reservation or payment backend was added. Existing custom glass controls, hero intro, keyboard image previews, reduced-motion behavior and return-to-top remain.

Mobile Services is about 42% shorter and Group Trips about 32% shorter in the 390px capture. Home is about 22% shorter. Final page screenshots were personally inspected, including lazy-loaded images, and contrast/crowded-label issues found during review were corrected.

Edit data/enquiry-catalog.json for shared form choices and data/local-trips.json for advertised trips. npm run build runs tools/catalog.mjs before SEO, synchronizing both forms, Home/Group trip cards and Contact's inline allowlisted trip data. Do not edit generated card blocks or Contact JSON independently. Regeneration preserves advertised dollar strings using callback replacement. Run check-instagram and check-refinement after catalogue changes. Past departures are relabelled on both Home and Group Trips; no past dates are prefilled.

The production build combines each page's stylesheets into one bundle in original cascade order; source files remain separate. Relative CSS asset paths work because bundles are at dist's root. tools/serve.mjs accepts SITE_ROOT for a built preview. Source preview remains http://127.0.0.1:4173/. Optional PowerShell built preview: set $env:PORT='4184', set $env:SITE_ROOT=Join-Path (Get-Location) 'dist', then node tools/serve.mjs. This is loopback only; nothing was published.

Work scripts refine-site.cjs and record-catalog-hero.cjs are one-time migrations: do not rerun them. Hero preservation hashes in docs/hero-preservation.json record only the authorized shared option change. Normal checks verify the preserved hero. New trip thumbnails retain the supplied flyer's limited resolution; obtain original destination photographs and authentic office/team photographs from the client for further refinement. Never substitute generated staff/office photos or invented testimonials. Only the supplied hero and logo are client-approved; new page designs remain reviewable work.

Passed: npm test; check-premium; check-home-redesign; check-polish (nine routes, twelve widths, 320–2560px and landscape); check-controls (six popovers at four viewport sizes); check-instagram; check-refinement; and npm run build. Final review-site capture covers nine routes at 1440/390px with zero overflow, broken images or page errors. Reports and screenshots are in docs/. Production bundle/enquiry checks verify the built site as well as source.

Fresh isolated production homepage Lighthouse at http://127.0.0.1:4184/: performance 91, automated accessibility 100, best practices 100, SEO 100; LCP 3.3s, CLS 0.003. Report: docs/lighthouse-production.json (also current docs/lighthouse.json). These local automated scores do not establish public indexing, AI inclusion, manual screen-reader accessibility, real-device Safari behavior or a guaranteed field-performance score.

The older self-review below is a historical before-change assessment; its recommendations are now implemented as described above. Latest design details: docs/REFINEMENT-2026-10-02.md.

## Latest review — 2 October 2026

The user asked for a self-analysis. Completed a fresh nine-page desktop/mobile capture, inspected page compositions and reran the custom-control checks. No application design or behavior was changed in this review. Findings and prioritised recommendations are in `docs/SELF-REVIEW-2026-10-02.md`; screenshots are in `docs/screenshots/self-review/`. The site remains functional but does not yet consistently meet the requested premium design direction. Main findings: competing visual treatments, incomplete Home option lists relative to Contact, Search/Book Now labels that lead to enquiries, local trips shown too late, insufficient authentic company material, repetitive layouts and long mobile pages. These recommendations are not implemented changes or new client approvals.

Fresh homepage Lighthouse: performance 89, automated accessibility 100, best practices 100, SEO 100, LCP 3.6s, CLS 0.005. Nine routes at 1440/390px had no overflow, broken images or page errors. `tools/check-controls.mjs` passed again at four viewport sizes. Local results do not prove public indexing, AI inclusion, manual accessibility or real-device Safari behavior.

## Latest correction — custom dropdowns and calendars, 1 October 2026

The user's screenshots clarified that their visual complaint concerns the operating-system select menus and date picker on the hero and contact form. The earlier glass section update did not address those controls. `controls.css` and `controls.js` now replace their visible interactions with navy frosted listboxes and a custom month calendar, gold selected states, styled focus/hover feedback and finite popup entrances. Only home and contact load the new files; the static build copies both. The CSS-only hero entrance remains.

Native selects/date inputs remain as the source of values, validation, existing query prefill and enquiry draft data. JavaScript enhances them with accessible labelled triggers; native controls remain usable when JavaScript is disabled. Changes emit input/change events so existing form logic and date labels stay synchronized. Required-service validation focuses the visible trigger. Do not remove the native values or replace the existing form handlers.

Popovers are positioned in the document body outside the hero's clipping boundary, follow their anchors on scrolling, fit the available viewport above or below, and close on Escape/outside click/focus leaving. Select keyboard controls: arrows, Home/End, typeahead, Enter/Space to select and Tab to leave. Calendar: arrow-day/week movement, Home/End, PageUp/PageDown month movement (Shift moves a year), Enter selection, Today and flexible-date actions. Earlier dates are disabled. No third-party picker package or backend was added.

`tools/check-controls.mjs` verifies all six popup controls at 1440x1000, 390x844, 320x568 and 844x390, their viewport containment, keyboard selection, date navigation/clear, validation focus, query prefill, enquiry draft transfer, reduced motion and no-JS fallback. Open-state screenshots in `docs/screenshots/controls/` were inspected directly. `npm test` also passed. This is the actual replacement for the native menus shown in the user's screenshots; reduced-transparency settings retain the custom navy design with an opaque backdrop.

## Latest design update — glass surfaces and homepage intro, 1 October 2026

The user requested glassmorphism for the recently updated sections and an intro on every homepage load/reload. `enhancements.css` now provides coastal blue/gold background layers behind translucent service-directory links and local-trip panels, frosted service-tile captions, white edge highlights and restrained shadows. Mobile panels stack and have smaller padding. Backdrop-filter has solid-surface fallbacks for reduced transparency and unsupported browsers.

The homepage has a finite CSS entrance sequence: hero frame opens, header arrives, headline lines enter with stagger, then supporting copy and search panel. It naturally replays on every document load/reload, uses no session flags or loading overlay, and leaves controls usable. Reduced motion removes the sequence; content works without JavaScript. Approved hero markup, original `styles.css`, copy and logo are unchanged from the previous authorized baseline.

`node tools/check-glass-motion.mjs` checks load/reload restart, settled animation state, reduced motion, no-JS visibility, glass styling and reduced-transparency fallback. Its screenshots are in `docs/screenshots/glass/`. `node tools/check-polish.mjs` passed nine routes at twelve viewport sizes after this update. Build passes. Previous Lighthouse scores are from the preceding build and have not been remeasured for this CSS update.

Windows/browser settings in the current environment report reduced transparency by default. That intentionally selects solid surfaces for accessibility. Glass screenshots explicitly emulate normal transparency; do not mistake the fallback for a failed stylesheet.

## Latest update — supplied Instagram flyers, 1 October 2026

The user supplied four agency flyers. All eight advertised services now appear in the services directory, with dedicated travel-services anchors and matching contact options for flight itineraries, corporate travel and consultations. Visa destinations now include Dubai, Japan and China alongside the existing destinations. Three advertised Jamaican day trips appear on group-trips: Jamwest Beach Negril (17 October, $8,500), Benta River Falls (28 November, $10,000) and Mystic Mountain (19 December, $17,500), all in 2026. Departure is Manchester Shopping Centre, Mandeville. Details and source transcription: [Instagram coverage](docs/INSTAGRAM-SERVICE-COVERAGE.md).

This supersedes older statements that no local trip dates/prices are available. Prices are advertised amounts; currency, final inclusions and availability require confirmation. No booking or payment backend was added. Trip links prefill contact using allowlisted IDs and prepare editable WhatsApp/email drafts. Past departures are labelled explicitly and their dates are not prefilled. Instagram is linked in every content-page footer.

Approved hero copy and the official logo are retained, with the user's earlier authorized removal of the separate flight decoration. New layouts are design proposals for review. Preview: http://127.0.0.1:4173/. Run npm run dev if needed. No public deployment occurred.

Maintenance: keep data/local-trips.json, static group-trip markup and contact's inline local-trip-data synchronized. Use npm run build to regenerate metadata; run node tools/check-instagram.mjs plus npm test after content changes. Original flyers: references/instagram; optimized delivery copies: assets. Do not rerun work/instagram-services.cjs: it is a one-time mutation script.


## Latest request — 1 October 2026: hero motion, interaction polish, search discovery

The user explicitly requested removal of the separate decorative airplane and coral flight trail. That block has been removed from the home hero. The logo’s own plane is part of the approved logo and remains intact. The preservation baseline records this narrow authorized exception; no hero text was changed.

`enhancements.css` adds short staggered hero entrances, dialog entrances, consistent button hover/focus/pressed feedback, readable breadcrumbs and the shared back-to-top control. `enhancements.js` uses IntersectionObserver to show that control after scrolling; it hides while a dialog is open, respects reduced motion and restores focus to the main landmark when returning to the top. All routes, including the 404, load these files. There is no continuous animation loop or scroll hijacking.

`tools/seo.mjs` generates canonicals, social metadata, static business/service/page/breadcrumb/visible-FAQ JSON-LD, robots and a nine-URL sitemap. Its default launch origin is the existing client domain, `https://eezeegotravelja.com/`; set `PUBLIC_SITE_URL` before building if the confirmed launch domain differs. Build regenerates metadata automatically and copies both new interaction files and crawl files. Business facts were rechecked on the public client site. Read `docs/SEO-AIO.md` for sources and launch instructions. This remains a local preview; indexing and public deployment have not occurred.

Additional verification: `node tools/check-polish.mjs` checks every content route across 12 viewport sizes from 320px to 2560px and landscape, native form containment, back-to-top on every route, keyboard activation, reduced motion, unique metadata, static JSON-LD, FAQ agreement and crawl endpoints. Screenshots and results are in `docs/screenshots/polish/` and `docs/polish-checks.json`. Earlier notes asserting the decorative motif is preserved are historical and superseded by this explicit user request.

Final continuation review: **1 October 2026**. The local server was restarted at `http://127.0.0.1:4173` and the final desktop/mobile refinement was verified. Use the premium-redesign implementation described immediately below. `README.md` now lists the additional checks; `docs/QA-SUMMARY.md` records the latest review separately from historical milestones.

## Latest update: 29 September 2026 — premium redesign

**Start here.** The user rejected the generic full-site design and asked for individual care on every page, distinct images and animations, using Land-book/Dribbble for inspiration. All eight interior routes and the 404 have now been redesigned. The approved home hero markup, `styles.css` and official logo remain unchanged. Home's supporting sections now use new imagery and include a company-story composition. The preview remains **http://127.0.0.1:4173**. Nothing has been published.

This is a new design proposal for user review, not a newly approved reference. The old notes below describe prior milestones and are superseded where they conflict with this update.

### Current implementation

- `premium.css` styles interior pages and their shared navigation/footer; `premium.js` handles progressive scroll entrances and respects reduced motion. Every interior page loads both after the existing shared files. The 404 loads only the stylesheet.
- `home.css` / `home.js` govern the homepage below the approved hero, including a hover/focus image preview for service links. No backend or animation-library dependency was added.
- Final delivery optimization: homepage supporting images use native lazy loading and responsive sources. A mobile-only rule in `home.css` serves the existing 960px copy of the same hero background; matching media-specific preloads are in the HTML head. Desktop hero markup, original `styles.css` and its full-size image are preserved. Browser tests scroll deferred images into view before checking that they loaded.
- About uses highlands imagery and the 1996 origin. Services uses a photo collection. Travel Planning uses an aircraft-window opening. Group Trips uses a postcard composition. Visa Assistance uses architecture and FAQs. Passport Renewals uses an eligibility ticket. Contact uses an office panel and the existing functioning enquiry form. Privacy has a contents navigation. The 404 has a typographic recovery layout.
- Six original generated images: `about-hills`, `travel-window`, `journey-street`, `services-retreat`, `visa-city`, `passport-desk`. Each has full-size and 768px WebP delivery files in `assets/`; original PNGs are in `references/generated/` (not copied to the runtime build). They are illustrative scenes, not verified location photographs or actual company properties.
- Asset prompts and generation method: `docs/GENERATED-ASSET-PROMPTS.md`. Reference research and rationale: `docs/DESIGN-DIRECTION.md`. Land-book visual gallery access was challenged; two public Dribbble shots were actually visually inspected. No external reference artwork was copied into runtime assets.
- The existing contact form IDs and draft-only WhatsApp/email behavior are preserved. Links from destinations and services prefill that form. No data is sent until the visitor sends a message in their selected external app.
- `tools/build.mjs` includes the new runtime files and checks its resolved output location before removing the old `dist` folder.

### Current checks and continuation

Run from this project directory after `npm ci`:

```powershell
npm run dev
# In a second terminal:
npm test
node tools/check-premium.mjs
node tools/check-home-redesign.mjs
npm run build
```

The browser checks use installed Chrome through Playwright. `npm test` verifies the home at six widths, all eight interiors at four widths (down to 320px), image loads, navigation, date validation, mobile menus, enquiry preparation and the 404. The premium check scrolls every section before screenshots, verifies motion/reduced-motion/no-JS behavior, FAQ disclosure, service-image keyboard preview, field containment and hashes the preserved home hero against `docs/hero-preservation.json`. Screenshots live in `docs/screenshots/premium/` and `docs/screenshots/home-redesign-*.png`.

Do not rerun historical page-generation scripts in the workspace `work/` directory: they were one-time implementation helpers and can overwrite final edits. The HTML/CSS/JS inside this project are the source of truth. The prior handoff ZIP remains historical; this working directory is current. Public deployment, real itinerary content, pricing, operational service wording, client imagery approval and privacy approval remain outstanding.

## Read this first

The user is building a website for EE-Zee Go Travel Limited, a travel agency in Mandeville, Jamaica. Their first milestone was the hero, built from exactly two approved assets, plus a research-based requirements document and this handoff. They then asked to build out the full website (done 28 September 2026, see the update section below) and to host it locally (done, see “Local hosting”).

**Current status (28 September 2026):** the full static site (home plus 8 interior pages and a 404 page) is running locally at `http://127.0.0.1:4173`. Nothing is deployed publicly. Everything beyond the hero awaits client review.

**Only these two assets are approved:**

1. `references/approved-hero.png`, the supplied desktop hero mockup.
2. `assets/logo-original.png`, the supplied transparent official logo.

Everything previously generated in sibling folders such as `../mockups`, `../mockups-v2`, `../review.html`, and earlier prompt sets is unapproved. Do not treat those page images as a specification, reuse their copy as approved content, or resume that direction. The user explicitly rejected any implication that the rest was approved.

Preserve the approved hero's visual composition and exact text. Do not independently redesign the brand, substitute a wordmark, change the CTA labels or add sections while refining the hero. The written requirements propose future scope; they are not approval of new page visuals.

## Project location and portability

Original Windows location:

```text
C:\Users\jorda\Documents\Codex\2026-09-25\https-www-instagram-com-eezeegotravelja-https\outputs\eezee-go-website
```

All runtime assets and continuation documents are inside this folder. Paths in the website are relative. Extracting the project archive to another location is supported. `node_modules` is excluded from the handoff archive; reinstall with `npm ci` when using development checks. No credentials are required for the current milestone.

## Update 28 September 2026: full site build-out

The user asked to "continue the work and build out the website." The approved hero is unchanged: same markup, copy, CSS and behavior. Only its four nav links changed, from the old live site to the new local routes. Everything below the hero, and every interior page, is **new implementation in the hero's visual language. None of it is client-approved design yet.** Present it for review; don't treat it as a third approved asset.

**Added**

- Home sections below the hero: services (4 cards), group-trips navy panel, how it works, visit/contact, shared footer.
- Interior pages (directory routes): `group-trips/`, `services/`, `travel-services/`, `visa-assistance/`, `passport-renewals/`, `about/`, `contact/`, `privacy/`, plus root `404.html`.
- `site.css`: shared tokens and components, loaded after `styles.css`. Global rules are scoped with `:where()`, and `.hero, dialog` keep `line-height: normal` so the hero is unaffected.
- `site.js`: interior mobile menu and contact form. The form prefills service/destination from `?service=&destination=` (non-personal context only), validates, then builds WhatsApp and mailto drafts. Nothing is sent, stored or tracked.
- Interior "Book Now" links to `contact/`; the home Book Now keeps the enquiry dialog.
- `tools/serve.mjs`: now serves directory indexes, redirects extensionless paths to the slash form and returns `404.html`. `tools/build.mjs` copies all pages. `tools/verify.mjs` now also checks all interior pages at 4 widths, the contact flow, the interior mobile menu and the 404 page.
- New Phosphor icons (recolored navy) in `assets/icons/` and `assets/hero-background-960.webp` (mobile banner). Interior banners reuse the cleaned hero background anchored to the sky. No new photography was generated.

**Content rules followed:** only researched facts are used (since 1996, Mandeville, the 4 services, the passport scope and exclusions, visa destinations, the 5 group-trip destinations, and the contact details). Trips show "Dates to be confirmed / Enquire for pricing"; there are no prices, dates, testimonials, ratings or approval claims. The visa and passport pages state that no outcome is guaranteed and ask visitors not to send ID documents. The passport page names PICA as the issuing authority. The office phone range is shown as text without tel links until the numbers are confirmed. The second WhatsApp number (+1 876 208 8408) is linked on Contact only.

**Needs client review before launch:** all new page layouts and copy; the privacy page (accurate for the current no-collection site, but needs client approval and must be rewritten if real form delivery is added); step/process wording on service pages (a reasonable description of an enquiry-led service, but not confirmed by the client); the group-trip list and statuses; the phone numbers; photography (none is approved, so trip cards use typographic gradient art); LocalBusiness structured data (deliberately omitted until details are verified); a sitemap and canonicals once the domain is known; and redirects from the old site's URLs.

## Local hosting

### Homepage refinement in Codex

The user asked for a more premium design below the approved hero and animations. The home sections have now been rebuilt: an editorial introduction with an arched coastal photograph and service index; a photographic group-travel feature with destination links; an unboxed planning sequence; a large contact invitation; and a compact home footer. Original hero markup and its stylesheet are unchanged. Interior-page designs are unchanged.

`home.css` and `home.js` are loaded only by the homepage. Motion includes IntersectionObserver reveals, CSS view-timeline background movement where supported, and hover feedback. Content remains readable without JS and with reduced motion. Imagery reuses the existing illustrative background, not verified photographs of the listed destinations. No new prices, departure dates or booking claims were added.

Validation: the existing full-site browser suite passed, including all eight interior pages and contact/enquiry flows. `tools/check-home-redesign.mjs` checks scroll reveals, mobile overflow, reduced-motion behavior and no-JS visibility. Review screenshots are in `docs/screenshots/home-redesign-1440.png` and `home-redesign-390.png`. This is a new proposal for the requested refinement, awaiting the user's visual feedback. The old handoff ZIP is a historical snapshot; this working directory is current.

The site is hosted locally by `tools/serve.mjs` (Node, no dependencies) at **http://127.0.0.1:4173**. It is loopback-only, so it is not reachable from other devices or the internet. It is not a production host.

- Start: `npm run dev` from the project folder. Or, in the Claude desktop app, use the `eezee-site` entry in `.claude/launch.json` (port 4173, autoPort off).
- Routes: `/`, `/group-trips/`, `/services/`, `/travel-services/`, `/visa-assistance/`, `/passport-renewals/`, `/about/`, `/contact/`, `/privacy/`. Paths without a trailing slash redirect (301) to the slash form, and unknown paths return `404.html` with status 404. Requests into `node_modules`, `docs`, `references`, `tools`, `dist`, `.git` and `.claude` are refused (403). Responses are `no-store`, so edits show on reload without restarting.
- Verified 28 September 2026: every route above returned 200, the redirect and 404 behaved as described, and `npm test` passed against 4173 with no browser errors.
- Port already in use: an old `node tools/serve.mjs` from an earlier session may still be running. Find it with `Get-NetTCPConnection -LocalPort 4173` (PowerShell) and stop that PID, or run on another port with `$env:PORT = '4174'; npm run dev` and `$env:TEST_URL = 'http://127.0.0.1:4174'` for tests.
- For another device on the same network (phone testing), the server would need to bind to `0.0.0.0` instead of `127.0.0.1`. That is deliberately not done; only change it on a trusted network.
- Pages use relative paths and work from any static host. The 404 page uses root-absolute paths, so it assumes the site is served at a domain root. Opening files directly (`file://`) won't resolve directory links; use the server.

## What has been built (hero milestone)

An editable, responsive hero in plain HTML, CSS and JavaScript. No framework or backend was necessary for this first section, and this portable implementation avoids coupling the next agent to a proprietary hosting environment.

- Rounded sunset image panel and ivory margin.
- Original logo displayed via an SVG viewport around a web-delivery derivative; the original PNG remains unchanged.
- Left navigation, centered branding and yellow Book Now button.
- White Montserrat 900 italic headline, with Lato body/navigation text.
- Coral SVG route and a Phosphor airplane glyph.
- Frosted search bar with native destination/service selections and optional date.
- Responsive stacked form and toggleable mobile navigation.
- Accessible enquiry dialog with selection summary and a WhatsApp draft link.
- Reduced-motion and reduced-transparency support, explicit light theme matching the approved reference.

This is real UI, not the entire screenshot placed in an image tag. The supplied image is retained only as the reference.

## Implementation map

| File | Purpose |
|---|---|
| `index.html` | Semantic hero markup, metadata, navigation, form, dialog |
| `styles.css` | Design tokens, reference-proportional desktop layout, mobile adaptations, focus and accessibility styles |
| `app.js` | Date presentation, local enquiry state, WhatsApp draft, dialog and mobile menu behavior |
| `assets/` | Local background, original/optimized logo, fonts, icons and licenses |
| `references/approved-hero.png` | Authoritative visual reference |
| `WEBSITE-REQUIREMENTS.md` | Research, proposed sitemap, content needs, flows, launch criteria |
| `docs/ASSET-PROVENANCE.md` | Approved assets, generated cleanup, fonts, icons and exact cleanup prompt |
| `docs/screenshots/` | Latest desktop, mobile and enquiry browser captures |
| `docs/verification.json` | Latest browser test results |
| `docs/lighthouse.json` | Latest local Lighthouse report, not a field-performance guarantee |
| `tools/serve.mjs` | Local static server, default loopback port 4173 |
| `tools/prepare-assets.mjs` | Deterministic delivery encoding from retained PNG sources |
| `tools/verify.mjs` | Browser layout/resource checks and key interaction tests |
| `tools/audit.mjs` | Lighthouse using a controlled Chrome instance, default debugging port 9223 |
| `tools/build.mjs` | Creates static `dist/` output |

No production URL, hosting registration, domain change, source-control repository, customer-data store or public deployment exists. The only hosting is the local server described above.

Final checks passed at six viewport sizes from 320px to 1672px, including the enquiry flow and mobile navigation. The static build passed. Final local Lighthouse scores were performance 88, accessibility 100, best practices 100 and SEO 100; simulated mobile LCP was 3.8 seconds and CLS 0.006. Further responsive-image optimization is appropriate before production. See `docs/QA-SUMMARY.md`; do not present these as real-user measurements or a complete accessibility certification.

## Run and verify

From the project directory:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. Leave the server running in one terminal; in another run:

```sh
npm test
npm run audit:site
npm run build
```

Node 24 and installed Google Chrome were used. Set `BROWSER_CHANNEL=msedge` if Edge is available instead. On PowerShell environment variables use `$env:BROWSER_CHANNEL = 'msedge'`. `TEST_URL`, `PORT` and `AUDIT_PORT` are optional overrides. On another OS, install Chrome or adapt the Playwright launch configuration to the available browser.

The application itself is buildless and requires no npm runtime dependency. `npm ci` installs test, font, icon and image-encoding tools from the lockfile. The copied local assets are already present. Do not run `npm audit fix --force` blindly or introduce a framework solely for a single hero.

## What the controls do today

- Header navigation now goes to the local routes `group-trips/`, `services/`, `about/`, `contact/` (updated in the build-out).
- Destination and service are optional. Empty choices become “Open to suggestions” and “Travel enquiry.” No live availability is implied.
- The date is optional; past dates are rejected using the browser's native validation. Date formatting uses local calendar components to avoid UTC date shifts.
- Book Now and Search open an enquiry summary. This provisional behavior must be confirmed before launch because the approved image specifies appearance, not transaction semantics.
- Continue on WhatsApp opens a URL-encoded draft to `18764503415`. The user must still send it in WhatsApp. There is no server request, automatic message sending, saved booking or payment.
- Escape and the close button dismiss the modal; the native dialog manages focus. Escape also dismisses the mobile menu.

## Fidelity constraints and remaining limitations

The user asked for the hero to look exactly like the mockup. A close implementation has been built, but do not claim literal pixel identity. The supplied reference is flattened. Its source photograph, source fonts and original layers are unavailable.

The clean background was generated by removing UI from the approved screenshot. Although the scene and composition follow it, reconstructed photographic pixels differ. The generated asset is an implementation derivative, not a third independently approved visual direction. If the client supplies the original clean background, use it to improve fidelity. The two source approvals remain the sole design authority.

Montserrat and Lato are self-hosted close matches; the original display font is not confirmed. Phosphor replaces the reference's exact UI icon shapes. The supplied logo is used rather than redrawn, which may differ slightly from the stylized logo appearance embedded in the approved mockup. Preserve the source logo's proportions.

Desktop geometry is calibrated to the 1672x941 reference with a 1612x879 image panel. Above 1920px the composition is capped; below 769px it changes to an accessible mobile stack. The mobile layout and enquiry dialog are implementation choices, not separately approved design assets. Windows reduced-transparency preferences deliberately show a solid search panel; visual-reference screenshots emulate normal transparency.

Other open work: real screen-reader/device checks, detailed 200% text-zoom review, real form delivery, production search semantics, route migration, client review of the new pages, client-approved policies, production deployment and client acceptance. Lighthouse is a local synthetic audit; no real-user Core Web Vitals have been measured.

## Research to preserve

The transcribe skill was read and an Instagram profile extraction was attempted, but access failed. No reels were viewed and no transcript exists. Do not say the Instagram content was studied directly. A direct reel URL or uploaded recording is needed for another attempt.

Research instead used the business website linked from `https://linktr.ee/eezeegotravelja/`. See `WEBSITE-REQUIREMENTS.md` for source links and fact boundaries. Core findings:

- The agency describes operation since 1996 from Mandeville.
- Four core families: travel planning, visa assistance, adult Jamaican passport renewals, group trips.
- Passport scope excludes first-time and child applications.
- Group-trip content contains conflicting dates and zero-price placeholders. Never import these as live offers.
- Contact page lists `eezeegoltd@gmail.com`, WhatsApp `+1 876 450 3415`, 32 Mandeville Plaza, and weekday 8 AM-5 PM hours; reconfirm before launch.
- Accreditation and visa-success claims need evidence before display. Do not invent ratings, testimonials, prices, approval guarantees or service timelines.

## Recommended next actions

1. Read this file and `WEBSITE-REQUIREMENTS.md`, start the local server and review the hero against the two approved assets.
2. Walk the user or client through the new pages at `http://127.0.0.1:4173`. Collect layout and copy changes. None of the new pages is approved yet.
3. Get client confirmation of the phone numbers, the preferred WhatsApp number, the group-trip list and statuses, the service process wording and the privacy text.
4. Confirm Search/Book Now semantics and the real enquiry destination (inbox or CRM). Then replace the draft-only contact form with real delivery, including success and failure states, and update the privacy page to match.
5. Add approved trip records (dates, prices, inclusions) and real photography when supplied. Only then add trip detail routes.
6. Before production: choose hosting and a domain, add a sitemap, canonicals, verified LocalBusiness data and redirects from the old URLs (`/travel-booking/`, `/visa-service/`, `/passport-services/`, `/elementor-240/`), re-run Lighthouse on all pages, and do real-device and screen-reader checks.
7. After any change: run `npm test`, update screenshots and this handoff, and publish only within the user's requested scope.

## Ready-to-use continuation prompt

> Read PROJECT-HANDOFF.md and WEBSITE-REQUIREMENTS.md in this project. Only references/approved-hero.png and assets/logo-original.png are approved. The full static site (hero plus interior pages) is built and hosted locally at http://127.0.0.1:4173 via npm run dev; everything beyond the hero awaits client review. Preserve the approved hero and original logo; do not use prior generated page mockups as approved designs. Explain the current status briefly, then carry out my next requested change using the existing code and documented research. Do not claim Instagram transcription, live booking, production deployment or pixel-perfect fidelity where none exists.
