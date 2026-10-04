# Website verification

## Current verification — 3 October 2026

The Services production page was separately audited: performance 92, automated accessibility 100, best practices 100, SEO 100; LCP 2.3s and CLS 0. Report: lighthouse-services-oct3.json. The homepage's dated report remains lighthouse-production-oct3.json; lighthouse.json contains the most recently audited page.

An additional built-site check forced WebGL context creation to fail: the static globe fallback and all eight service links remained visible, with no erroneous globe-ready state.

Earlier dated results below are historical. Passed for this redesign: npm test; tools/check-premium.mjs; tools/check-polish.mjs; tools/check-controls.mjs; tools/check-instagram.mjs; tools/check-refinement.mjs; tools/check-atelier.mjs; npm run build. The refinement check was rerun after CSS minification and server compression, verifying source/built typography, one bundled stylesheet per route and built enquiry behavior.

The new-design check covers nine content pages at 320, 390, 768, 820, 1024 and 1440px: no horizontal overflow, one H1, all lazy images decoded successfully and no uncaught page errors. It verifies page-exclusive photographic assets, coral-only interior navigation, the destination reel, eight services/schema entries, GSAP sequencing, a successfully rendered geographic globe and no-JavaScript fallback. The shared polish check covers twelve sizes spanning 320–2560px and landscape. Custom controls cover keyboard behavior, calendar navigation, focus and viewport placement; contact drafts, advertised trips and Instagram coverage pass.

Personally inspected all thirteen generated originals, all content-page desktop/mobile compositions and normal-motion About/Services captures. Review caught and corrected tablet overflow, an empty globe caused by geographic-data handling and narrow-screen headline crowding. Fresh captures are in screenshots/atelier/. Exact new-design results: atelier-checks.json.

Compression verified using br, gzip and identity requests: the homepage decoded identically, with 4,056-byte Brotli and 4,992-byte gzip responses versus 18,856 uncompressed bytes. This is a local payload measurement, not a public hosting guarantee.

Fresh isolated production homepage Lighthouse after delivery optimization: performance 93, accessibility 100, best-practices 100, seo 100; LCP 3.2 s, CLS 0. Report: lighthouse-production-oct3.json. The first unoptimized redesign measured performance 83; its report is retained as lighthouse-oct3-before-delivery-optimization.json. All automated accessibility, best-practices and SEO categories scored 100 in both runs. Local scores vary and do not establish field performance, manual accessibility, public indexing or AI inclusion. Real-device Safari/manual screen-reader testing remains outside this local verification.


## Completed refinement verification — 2 October 2026

Passed: npm test; check-premium; check-home-redesign; check-polish (nine routes, twelve widths, 320–2560px and landscape); check-controls (six popovers at four viewport sizes); check-instagram; check-refinement; and npm run build. Final review-site capture covers nine routes at 1440/390px with zero overflow, broken images or page errors. Reports and screenshots are in docs/. Production bundle/enquiry checks verify the built site as well as source.

Fresh isolated production homepage Lighthouse at http://127.0.0.1:4184/: performance 91, automated accessibility 100, best practices 100, SEO 100; LCP 3.3s, CLS 0.003. Report: docs/lighthouse-production.json (also current docs/lighthouse.json). These local automated scores do not establish public indexing, AI inclusion, manual screen-reader accessibility, real-device Safari behavior or a guaranteed field-performance score.

Final screenshots: screenshots/self-review/. Final mobile heights at 390px: Home 5093, About 2439, Services 3113, Travel planning 3253, Group trips 4111, Visa 2814, Passport 2876, Contact 3072, Privacy 2357px. These are content-length measurements, not device guarantees.

## Native popup replacement — 1 October 2026

Custom controls now replace the hero/contact destination/service menus and both date calendars. Their open states were directly inspected on desktop and mobile (not merely screenshots of closed fields). `tools/check-controls.mjs` passed six popovers at four viewport sizes, including 320px mobile and short landscape. It also passed keyboard/typeahead, calendar navigation/selection/clear, required-service error focus, query prefill and transfer to enquiry drafts. Reduced motion and no-JS native fallback passed. Reports and screenshots: `control-checks.json`, `screenshots/controls/`. `npm test` passed for the rest of the site, native data/validation compatibility and enquiry flows. No messages were sent.

## Glass and hero intro update — 1 October 2026

Service-directory links, service-tile captions and advertised local-trip panels now use frosted surfaces. Desktop/mobile screenshots in `screenshots/glass/` were visually inspected. `tools/check-glass-motion.mjs` passed load/reload replay, animation settled state, reduced motion, no-JS content, backdrop blur and solid reduced-transparency fallback. `tools/check-polish.mjs` passed all twelve viewport sizes on nine routes after this update; `npm run build` passed. There is no overlay loader or input lock. The current host defaults to reduced transparency, so glass screenshots emulate normal transparency explicitly. Lighthouse scores below predate this styling update.

## Instagram coverage — 1 October 2026

All eight supplied services are displayed with destination links and suitable contact options. Visa assistance includes Dubai, Japan and China. Three local trips have sourced dates, advertised prices, inclusions and enquiry links. Instagram is linked in all nine content-page footers. Source transcription and limits: `INSTAGRAM-SERVICE-COVERAGE.md`.

`npm test`, `node tools/check-instagram.mjs`, `node tools/check-polish.mjs`, `node tools/check-premium.mjs` and `npm run build` passed after this content/layout update. Trip checks verify all three contact presets and WhatsApp/email draft contents, ignore unknown trip IDs, and confirm past advertised dates are not prefilled. No messages were sent. The polish suite covers nine routes at twelve viewport sizes from 320 to 2560px, keyboard return-to-top, modal handling, reduced motion, form containment and search metadata. Desktop/mobile service and group-trip screenshots were visually inspected in `screenshots/instagram/`.

Final isolated homepage Lighthouse audit: performance **88**, accessibility **100**, best practices **100**, SEO **100**, LCP **3.5s**, CLS **0.006**. Report: `lighthouse.json`. These are local automated results, not a guarantee of public indexing, AI placement, real-device behavior or client visual acceptance. Earlier Lighthouse numbers below refer to earlier builds.

## Interaction and discovery refinement — 1 October 2026

The user requested removal of the separate hero airplane/trail. It is removed; the original logo and hero copy remain intact. The preserved-hero baseline now records this explicit exception. Hero entrance motion, dialog motion and consistent hover/focus/pressed states are implemented in `enhancements.css`. A shared back-to-top control is present on all routes, appears after scrolling, supports keyboard use and reduced motion, and hides during a modal or field editing.

`npm test` passed after these changes. `tools/check-polish.mjs` passed all nine content routes at 12 desktop/mobile/tablet/landscape viewports (320 through 2560px), hero/control containment, form-field containment, keyboard return-to-top, reduced motion, metadata uniqueness, structured-data parsing/visible FAQ correspondence, robots and sitemap responses. Review images are in `docs/screenshots/polish/`. The build regenerates search metadata and includes crawler files and both enhancement runtime files.

SEO/AIO details and the configured launch-domain assumption are in `docs/SEO-AIO.md`. Local checks do not establish public indexing or search/AI placement. The preview remains loopback-only.

## Premium redesign — final review, 1 October 2026

The approved hero HTML and `styles.css` match the saved SHA-256 baseline. All eight interiors and the 404 were redesigned, with six new illustrative assets and homepage supporting sections updated. Desktop and mobile screenshots of every interior were visually inspected. A cramped mobile date input was corrected by stacking contact fields below 600px and constraining input widths; privacy heading spacing was also refined.

`npm test` passed after the redesign: six homepage widths and four interior widths down to 320px, image loading, no page overflow, local navigation, mobile menus, enquiry/date validation, query prefill and WhatsApp/mailto drafts. No message was sent during testing.

`tools/check-premium.mjs` verifies scroll entrances on each route, native FAQ behavior, live reduced-motion preference support, no-JS content visibility, keyboard service image previews, contact-control containment and the hero baseline. `tools/check-home-redesign.mjs` verifies homepage reveals and fallbacks. `npm run build` passed, including `premium.css` and `premium.js`. Reports: `docs/premium-checks.json`, `docs/home-redesign-checks.json`, `docs/verification.json`. Review images: `docs/screenshots/premium/`, `docs/screenshots/home-redesign-*.png`.

Testing used installed Chrome on Windows. Real-device Safari/touch, screen-reader review and client visual acceptance remain outstanding. The new views and images are proposals. Contact flows still prepare drafts inside the browser; there is no payment or booking backend.

Latest optimized homepage Lighthouse scores: **89 performance, 100 accessibility, 100 best practices, 100 SEO**. Simulated mobile LCP: **3.4 seconds**; CLS: **0.006**. Supporting images are deferred and responsive; mobile hero delivery uses the existing 109 KB version of the same image instead of the 392 KB desktop asset. The desktop design is preserved. These are synthetic local measurements, not production results; the mobile LCP remains above the 2.5-second target. The report is `docs/lighthouse.json`. Older hero-only figures below are historical.

## Historical hero milestone

Checked 28 September 2026 using Node 24 and Chrome on Windows.

## Browser checks

Passed at 1672x941, 1440x900, 1024x768, 768x1024, 390x844 and 320x740:

- Heading visible, images loaded and no horizontal page overflow.
- No browser runtime errors or HTTP resource failures.
- Search opens the enquiry summary and transfers selected destination/service/date.
- WhatsApp draft uses the listed primary number and preserves enquiry context.
- Book Now opens the same enquiry flow; Escape and close dismiss it.
- Native validation rejects a past travel date.
- Mobile navigation opens and closes with appropriate expanded state.
- The approved light theme remains stable even under an OS dark-mode preference.

Desktop/mobile screenshots were visually reviewed against the supplied reference. The desktop headline, supporting-copy width, navigation, hero framing and search-bar position were adjusted toward it. The cleaned background and approximate fonts/icons prevent an honest pixel-identical claim. The mobile layout is an adaptation.

## Final local Lighthouse audit

| Category | Score |
|---|---|
| Performance | 88 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

Simulated mobile LCP: 3.8 seconds. CLS: 0.006. These are synthetic local measurements, not real-user production results. Further responsive-image/performance work is needed to reach a sub-2.5-second mobile LCP target. The PNG background was reduced from about 2.5 MB to a 392 KB WebP delivery asset; the 720 KB original logo is preserved while the webpage loads an 84 KB derivative.

The Lighthouse CLI initially completed its report but encountered a Windows temporary-directory cleanup error. The final audit used `tools/audit.mjs` with a controlled browser and exited successfully. The final report is `docs/lighthouse.json`.

`npm run build` completed. The dependency installation reported zero known vulnerabilities after updating the audit tooling. This does not constitute a full security audit.

## Remaining verification

Client acceptance, real-device touch and screen-reader testing, detailed text-zoom checks, production hosting behavior and actual enquiry delivery remain outside this hero-only milestone. No real message was sent and no booking was made during testing.

## Full-site build-out checks (28 September 2026)

`npm test` passed with `TEST_URL=http://127.0.0.1:4174`. The original hero checks all pass unchanged. It also checked all 8 interior pages at 1440, 768, 390 and 320px for no horizontal overflow, images loading, a single h1 and local navigation. The contact form was checked for query prefill, required-service validation with aria-invalid, and WhatsApp/mailto drafts carrying the context. The interior mobile menu and the 404 page were also checked, with no browser errors. Screenshots are in `docs/screenshots/`. `npm run build` passed. Lighthouse was not re-run for the new pages. No message was sent.

Re-run after switching local hosting to the default port: `npm test` passed against http://127.0.0.1:4173 with no browser errors. All 9 routes returned 200, the slash redirect returned 301 and an unknown path returned 404.
