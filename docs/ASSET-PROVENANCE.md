# Asset provenance

## New generated imagery — 3 October 2026

Thirteen illustrative image families created with the built-in imagegen tool. All originals were visually inspected. These are atmosphere and destination illustrations, not verified agency offices, employees, named resorts or advertised Jamaican attraction photographs. No reference-site photography is shipped. The supplied logo remains unchanged. Repeated logo identity is intentional; main photographic assets are assigned to a single page. The real local-trip images are separate crops of supplied Instagram flyers, used at their limited native resolution on Group Trips.

| Asset family | Exclusive use |
| --- | --- |
| coast-aerial | Home coastal section |
| jamaican-highlands | About |
| planning-flatlay | Services |
| city-night | Travel services |
| visa-japan | Visa assistance |
| passport-stilllife | Passport renewals |
| contact-palm | Contact |
| river-canopy | Group Trips river opening |
| panama-canalside | Group Trips: Panama postcard |
| colombia-balcony | Group Trips: Colombia postcard |
| costa-rica-forest | Group Trips: Costa Rica postcard |
| guatemala-lake | Group Trips: Guatemala postcard |
| peru-terraces | Group Trips: Peru postcard |

Originals: references/generated/oct3/name.png. Delivery: assets/name.webp and assets/name-768.webp. Exact original prompts and file map: [ASSET-PROMPTS-OCT3.json](ASSET-PROMPTS-OCT3.json). Older four service-preview image families are used only on Home. Libraries: Three.js, world-atlas and topojson-client notices in assets/licenses/; GSAP's license notice is retained in the local vendor headers. The globe land boundaries are redistributed Natural Earth geography, not fabricated land shapes.


## Delivery refinement — 2 October 2026

Three authentic photograph crops from references/instagram/local-trips-flyer.png (681×846px): trip-jamwest-negril.webp crop x72/y213, trip-benta-river-falls.webp x80/y393, trip-mystic-mountain.webp x82/y576; each 137×137px, WebP quality86, no enlargement or generative edit. Displayed at 60–100px; these are supplied flyer crops, not original destination photographs.

Six illustrative asset families were re-encoded from their unchanged original PNGs with tools/refine-assets.mjs: full images quality80, 768px images quality76, saving roughly 400KB combined. The hero background and logo were not re-encoded in this refinement. Earlier unused illustrative assets remain available; About and the Group Trips opening no longer use generic landscape/street imagery.

- `references/approved-hero.png`: the user's approved flattened hero reference, copied from the attachment without modification.
- `assets/logo-original.png`: the user's approved transparent logo, preserved without modification.
- `assets/logo-web.webp`: a 512px web-delivery copy of the supplied logo; no redraw or color replacement. Generated deterministically by `tools/prepare-assets.mjs`.
- `assets/favicon.png`: a 64px web-delivery derivative of the same supplied logo.
- `assets/hero-background.png`: background cleanup generated from the approved hero using the built-in image editing tool. It reconstructs pixels hidden by the reference's text and controls and is therefore not the original source photograph. It is not a separately approved design. Do not describe it as a photo of a verified destination.
- `assets/hero-background.webp`: WebP delivery encoding of the cleaned PNG at quality 90. The source PNG remains unchanged.
- Montserrat 900 italic: self-hosted approximate display-font match, not a confirmed original brand font. Lato 400 and 700 are approximate body/navigation matches. Font licenses accompany the files.
- Interface icons: Phosphor Icons, recolored navy. Their license is included. The simple coral route is an SVG line; the plane glyph is Phosphor, not a hand-drawn replacement logo.

## Exact background-cleanup prompt

Edit this supplied approved website hero reference into a CLEAN BACKGROUND PHOTO ASSET for rebuilding the website in HTML. Preserve the photographic scene and original composition as closely as possible: same sunset horizon height, same palm leaves on upper left, left beach and rocks, same turquoise sea and boats right, same golden sky. Remove ALL website foreground UI: remove every word, headline, navigation label, central company logo, trust tagline, yellow Book Now button, search bar including its glass panel/icons/labels/button. Seamlessly restore the photograph behind these removed elements. Also remove the small blue illustrated plane and its coral dotted route; the developer will overlay it in code. Preserve existing photographic pixels outside removed UI regions. No new objects, no altered colors, no redesign, no text or logos. Output the scene filling the entire rectangular canvas edge to edge, WITHOUT the off-white outer frame or rounded corners. Crop only the existing frame (roughly 30px each side), maintaining the remaining photograph's approximately 1612:879 aspect ratio. This is precise background cleanup, not a new beach concept.
# Update — 29 September 2026

Six original illustrative travel assets now supplement the approved hero: `about-hills`, `travel-window`, `journey-street`, `services-retreat`, `visa-city`, `passport-desk`. Generated with the built-in image-generation tool (no selectable model version); originals are preserved in `references/generated/`. WebP files at 1536px and 768px in `assets/` are resized/encoded with Sharp. No third-party design-reference imagery is used in the website.

See [the exact prompts](GENERATED-ASSET-PROMPTS.md) and [design research](DESIGN-DIRECTION.md). These scenes are illustrative, not verified photographs of destinations, hotels, agency staff or the Mandeville office. New assets remain subject to client review. Earlier entries below describe the original hero milestone.


## User-supplied Instagram flyers — 1 October 2026

Four promotional screenshots supplied by the user were copied unchanged to references/instagram: services-flyer.png, visa-flyer.png, local-trips-flyer.png, benta-flyer.png. WebP delivery variants in assets use lossless geometry and quality-90 compression, without AI editing or new content. Benta's flyer is displayed on group-trips and the local-trips flyer is linked for inspection. See INSTAGRAM-SERVICE-COVERAGE.md for exact facts and scope.
