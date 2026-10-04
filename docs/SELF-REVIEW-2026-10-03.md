# Self-review — 3 October 2026

The previous site was functional but relied on repeated photography, similar panels and small variations of the same page structure. The user's request required a visible design change, individual assets and more considered motion.

| Finding | Implemented response | Verification |
| --- | --- | --- |
| Repeated image families across interior pages | Thirteen new illustrative families, assigned to one page each; separate international postcards | Originals inspected; cross-page asset check and fresh page captures |
| Generic interior copy and matching page structures | Editorial About, globe-led Services, Travel ledger, Group destination reel, arched Visa composition, overlapping Passport note and individual Contact image | Each content page inspected on desktop and mobile |
| Motion added too narrowly | GSAP word/image/card choreography and magnetic CTAs; custom Three.js geographic illustration | Normal-motion browser captures and actual render draw-call check |
| Blue underline underneath the red navigation indicator | Suppressed interior link text decoration; preserved coral active/hover/focus indicator | Computed styles and screenshot review |
| Services overflow at 820px | Constrained tablet grid/illustration dimensions | Six-width new-design check plus twelve-width shared polish check |
| Globe appeared empty despite a mounted canvas | Corrected FeatureCollection geographic-data handling; removed partial canvas and restored static fallback on failure | Personally spotted blank result, corrected it, then inspected rendered globe; test now requires successful draw calls and no fallback flag |
| Long headlines crowded narrow openings | Tightened Services, Travel and Visa wording and responsive scales | 320/390px layout checks and mobile visual review |
| Parallax could expose edges of photographs | Retained a small desktop image overscale around the movement | Desktop motion capture inspection |
| Added animation library transfer increased loading cost | Minified build CSS and negotiated Brotli/gzip text delivery | Production/source style and enquiry parity; compressed payload decoded and checked; fresh Lighthouse reports |

The approved home hero, official logo and original hero stylesheet remain preserved. Contact fields, custom glass listboxes/calendar, trip prefill and editable WhatsApp/email drafts still work. Content remains visible without JavaScript; reduced-motion and transparency fallbacks are retained. The local departure cards use real supplied flyer crops rather than invented photographs of the named attractions.

## Practical limits

The new photography is illustrative, not evidence of actual agency offices, staff or attraction conditions. The supplied trip photos are small; original client photography would improve their detail. There is no live booking/payment system, confirmed inventory or price-currency assumption. Automated accessibility results do not replace a manual screen-reader review or real-device Safari testing. Local SEO checks do not establish public indexing or AI-answer inclusion. New interior designs remain reviewable proposals; only the user's supplied hero and logo are approved.

Latest visual evidence: screenshots/atelier/. Test reports: atelier-checks.json, polish-checks.json, control-checks.json, instagram-checks.json, premium-checks.json, refinement-checks.json and verification.json. Latest audited production homepage: lighthouse-production-oct3.json. Historical reports retain their dates and should not be presented as current performance results.
