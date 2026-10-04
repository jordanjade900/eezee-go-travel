# EE-Zee Go Travel: website requirements and client research

## Implemented scope — 3 October 2026

The user requested a full visual and copy refinement of interior pages, individual assets instead of repeated photography, reference research and custom GSAP/Three.js animations. These are implemented while retaining the approved home hero and logo. Thirteen new illustrative image families provide individual page atmospheres and five separate international destination postcards. All eight advertised services and three dated Jamaican trips remain visible, with real flyer thumbnails for named local attractions. Instagram remains linked throughout the site.

Enquiries still prepare editable WhatsApp/email drafts; the site does not claim live booking, payment, availability or visa approval. Remaining client content includes original high-resolution venue photographs, real team/office imagery, verified testimonials and confirmed price basis/currency/booking terms. New visual proposals are not client approvals. See PROJECT-HANDOFF.md for current implementation and docs/DESIGN-RESEARCH-OCT3.md for reference decisions. Earlier dated descriptions below are historical.


## Implemented scope update — 2 October 2026

Implemented the user's requested improvements following the self-review. The approved homepage hero composition, copy, original stylesheet and official logo are retained; its service/destination options now match Contact. Local trips appear directly after the hero and lead the Group Trips page, with individual photographs cropped from the supplied agency flyer. Services presents all eight offerings without a second duplicated image-card catalogue. About uses verified founding, address, office hours and contact facts. Interior headings, panels, links and footers share a coherent navy/teal/gold treatment. Repeated process/closing blocks were replaced with concise, service-specific enquiry guidance. Interior header buttons now say Start enquiry; a note below the approved home hero clarifies Search/Book Now. No reservation or payment backend was added. Existing custom glass controls, hero intro, keyboard image previews, reduced-motion behavior and return-to-top remain.

Mobile Services is about 42% shorter and Group Trips about 32% shorter in the 390px capture. Home is about 22% shorter. Final page screenshots were personally inspected, including lazy-loaded images, and contrast/crowded-label issues found during review were corrected.

Remaining client material: original high-resolution trip photographs, real team/office photographs, verified testimonials if available, confirmation of advertised price currency/basis and booking terms. Those gaps are not filled with fabricated evidence.

## Latest update — supplied Instagram flyers, 1 October 2026

The user supplied four agency flyers. All eight advertised services now appear in the services directory, with dedicated travel-services anchors and matching contact options for flight itineraries, corporate travel and consultations. Visa destinations now include Dubai, Japan and China alongside the existing destinations. Three advertised Jamaican day trips appear on group-trips: Jamwest Beach Negril (17 October, $8,500), Benta River Falls (28 November, $10,000) and Mystic Mountain (19 December, $17,500), all in 2026. Departure is Manchester Shopping Centre, Mandeville. Details and source transcription: [Instagram coverage](docs/INSTAGRAM-SERVICE-COVERAGE.md).

This supersedes older statements that no local trip dates/prices are available. Prices are advertised amounts; currency, final inclusions and availability require confirmation. No booking or payment backend was added. Trip links prefill contact using allowlisted IDs and prepare editable WhatsApp/email drafts. Past departures are labelled explicitly and their dates are not prefilled. Instagram is linked in every content-page footer.

Approved hero copy and the official logo are retained, with the user's earlier authorized removal of the separate flight decoration. New layouts are design proposals for review. Preview: http://127.0.0.1:4173/. Run npm run dev if needed. No public deployment occurred.

Maintenance: keep data/local-trips.json, static group-trip markup and contact's inline local-trip-data synchronized. Use npm run build to regenerate metadata; run node tools/check-instagram.mjs plus npm test after content changes. Original flyers: references/instagram; optimized delivery copies: assets. Do not rerun work/instagram-services.cjs: it is a one-time mutation script.


**Current scope update — 1 October 2026:** the full site and premium refinement are implemented. The user subsequently requested removal of the separate hero airplane/trail, enhanced hero motion, intentional button interactions, a back-to-top control, responsive verification and SEO/AIO foundations. These requests supersede the original flight-motif preservation requirement below. Latest implementation and launch requirements are documented in `PROJECT-HANDOFF.md` and `docs/SEO-AIO.md`; original planning notes below are historical.

Prepared 28 September 2026. This is a planning document, not approval of any additional page design.

## 1. Approval and current scope

The user has approved exactly two visual assets: the supplied homepage hero mockup and the supplied EE-Zee Go Travel Limited logo. They are preserved in `references/approved-hero.png` and `assets/logo-original.png`. All previously generated interior-page mockups are unapproved. They must not be used as approved specifications.

The current implementation covers the hero only. It recreates the reference in editable HTML, CSS and JavaScript, including its navigation, logo, headline, copy, flight motif, Book Now action and search bar. The remainder of the website described below is a proposed scope for continuation.

The reference is a flattened image, not a layered design file. Its original font and unobstructed background were not provided. The implementation therefore uses a cleaned, AI-derived background and close font matches. It is a reconstruction, not a mathematically pixel-identical reproduction. The original supplied logo is retained without redrawing. The mobile arrangement is an implementation adaptation, not a separately approved mockup.

## 2. Research basis and limitations

The original research request concerned [the Instagram profile](https://www.instagram.com/eezeegotravelja/). The transcribe skill was consulted first. Instagram's web fetch was throttled, and a bounded metadata-only yt-dlp attempt returned an extraction failure. No reels were watched, no speech was transcribed, and no Instagram engagement or audience figures were verified.

The account's [Linktree](https://linktr.ee/eezeegotravelja/) links to the business website and group-trip registration. This established the public source used for the business review. Findings below reflect the reviewed public pages, not an independent operational audit or current immigration advice. Client confirmation is still needed for launch-sensitive details.

## 3. What the business offers

EE-Zee Go presents itself as a Mandeville-based agency operating since 1996, serving individual, family and business travel. Its emphasis is personal assistance with arranging travel. The approved hero's “30 Years” wording is consistent with that founding year in 2026, but needs an annual maintenance decision. [About source](https://eezeegotravelja.com/about/)

Four primary service families should anchor the site: travel planning, visa assistance, passport renewals and group trips. [Homepage source](https://eezeegotravelja.com/)

Travel planning covers flights, accommodation, airport transfers and excursions. The website also discusses corporate and group coordination. This supports an enquiry-led experience rather than assuming a live airline/hotel booking system exists. [Travel services source](https://eezeegotravelja.com/travel-booking/)

The visa page advertises assistance for destinations including the United States, Canada, United Kingdom, Schengen and Cayman Islands. Present the agency's assistance clearly, without implying it issues visas or controls decisions. Country-specific rules, fees and processing times require fresh official-source checking before publication. [Visa source](https://eezeegotravelja.com/visa-service/)

The passport page explicitly limits its service to adult Jamaican passport renewals and excludes first-time and child applications. That distinction belongs near the top of the future service page and in enquiry choices. [Passport source](https://eezeegotravelja.com/passport-services/)

The group-trip page presents Panama, Colombia, Guatemala, Costa Rica and Peru. Its displayed Panama year conflicts with its departure date, and several other listings show USD $0 placeholders. Treat these as destinations to enquire about, not confirmed bookable offers. [Group trips source](https://eezeegotravelja.com/group-trips/)

Listed contact details are 32 Mandeville Plaza, Mandeville, Jamaica; WhatsApp +1 876 450 3415 and +1 876 208 8408; email eezeegoltd@gmail.com; Monday-Friday, 8 AM-5 PM. The phone range is printed as 876 961 2756-8; confirm each dialable number before creating phone links. The prototype uses the first WhatsApp number only. [Contact source](https://eezeegotravelja.com/elementor-240/)

## 4. Website objective and audience

The proposed primary objective is to turn interest into qualified conversations with the agency. A visitor should quickly understand what EE-Zee Go handles, identify the relevant service, and contact the team with useful trip information.

Audience hypotheses, inferred from the services rather than measured analytics:

- Individuals and families seeking travel planning support.
- Travellers needing visa application or adult passport renewal assistance.
- People interested in organised group departures.
- Businesses or organisers arranging travel for multiple people.

The site should serve Jamaican customers clearly while remaining usable for people enquiring from abroad. Do not invent audience demographics, conversion targets or traffic statistics.

## 5. Approved hero specification

Preserve the rounded sunset-coast image panel, ivory outer margin, centered logo, left navigation, yellow Book Now pill, navy text, white heavy italic headline, coral flight trail and frosted search bar.

Exact headline: **TRAVEL MADE EE-ZEE**.

Exact supporting copy: **Flights, visas, passports and unforgettable group trips, planned for you from Mandeville for 30 years.**

Navigation: Group Trips, Services, About Us, Contact. Search labels: Destination, Service, Travel Date, Search. Brand caption: Trusted for 30 Years.

For this milestone, Book Now and Search open an enquiry summary. Continuing opens a WhatsApp draft; nothing is automatically sent and no booking is made. These are provisional interaction choices because the reference approves appearance, not backend behavior. Before launch, decide whether Search should filter real trips, route to an enquiry, or search a maintained catalogue. Preserve the approved labels until the user changes them.

## 6. Proposed information architecture

| Page | Required content | Intended next action |
|---|---|---|
| Home `/` | Approved hero; later service summaries, verified trip highlights, evidence of experience, contact path | Start an enquiry or explore a service |
| Group Trips `/group-trips/` | Published departures or interest-only destinations, clear availability and price state | Enquire about a trip |
| Trip detail `/group-trips/[slug]/` | Confirmed itinerary, dates, inclusions/exclusions, price basis, policies, enquiry context | Request the trip or register interest |
| Services `/services/` | Overview linking the four core service families | Choose the right service |
| Travel planning `/travel-services/` | Flights, stays, transfers, experiences, corporate/group options and planning process | Request a tailored quote |
| Visa assistance `/visa-assistance/` | Scope of assistance, destinations, process, consultation and relevant FAQs | Request guidance |
| Passport renewals `/passport-renewals/` | Adult Jamaican renewal scope, exclusions, reviewed preparation checklist, office process | Ask about a renewal |
| About `/about/` | Confirmed history, real team/office imagery, service approach, substantiated credentials | Contact the team |
| Contact `/contact/` | Verified phone/email/WhatsApp, hours, address, directions and enquiry form | Send an enquiry |
| Privacy `/privacy/` | Approved policy matching actual data collection, vendors and retention | Understand information handling |

Only create trip detail routes for real approved records. Add booking terms/cancellation content when actual transaction and supplier policies are confirmed; do not fabricate policy pages to fill navigation. Additional blogs, accounts, payment portals and member areas are outside the initial scope.

## 7. Essential journeys and functional requirements

**General travel enquiry:** select a destination or undecided state, select the service, optionally supply a date, then review the context before contacting the team. An undecided visitor must still be able to continue.

**Group-trip enquiry:** show whether the trip is published, sold out, cancelled or interest-only. Carry the chosen trip into the enquiry. Unconfirmed pricing must read “Enquire for pricing,” not zero. Show the currency and whether a confirmed price is per person and based on shared occupancy.

**Service enquiry:** make service scope obvious before collecting details. Visa and passport pages should set expectations without suggesting guaranteed outcomes. Avoid collecting passport scans or sensitive identity documents in a generic public enquiry form.

**Contact:** allow mobile tap-to-call, email and WhatsApp. Directions should use the verified location. Contact forms need meaningful labels, accessible errors, a genuine confirmation only after successful submission, and a retry path if sending fails.

**Enquiry delivery:** the full site needs an agreed inbox or CRM destination, server-side validation, spam controls, duplicate handling and an internal follow-up process. A WhatsApp handoff is useful but does not prove that the agency received a message. Never show “booking confirmed” after opening a chat.

## 8. Content and data needed from the client

| Item | Needed before |
|---|---|
| Confirmation of address, hours, preferred WhatsApp and complete phone numbers | Contact-page launch |
| Current trips, dates, sellable capacity, currency, price basis and payment schedule | Publishing any trip offer |
| Itineraries, inclusions, exclusions, supplier terms and cancellation/refund rules | Trip detail and booking workflows |
| Final list of services, fees where publishable and service boundaries | Service-page launch |
| Permission for real office, staff and client photographs | Using that photography |
| Testimonial wording, attribution and consent | Publishing testimonials |
| Evidence and approved use of accreditation, licensing or success statistics | Displaying those claims |
| Approved privacy wording and actual enquiry-handling process | Collecting form submissions |
| Domain/hosting access, analytics preference and content owner | Production handover |
| Decision on replacing “30 years” with a durable “Since 1996” later | Annual content review |

For trip records, plan fields for slug, title, destination, publication status, dates, duration, availability, currency, price basis, itinerary, inclusions, exclusions, media, policy references and last-reviewed date. This is a proposed content model, not implemented data or a requirement to install a CMS immediately.

## 9. Design, accessibility and responsive behavior

Continue the approved hero's visual language rather than using the earlier generated interior screens. Keep the original logo proportions and colors. New sections and pages still need design review; the written sitemap is not their visual approval.

Desktop should preserve the supplied composition. On mobile, keep the logo and primary action visible, provide a keyboard-operable menu, stack the search fields and prevent cropped text or horizontal scrolling. Native controls and clear focus indicators are preferable to visually elaborate but inaccessible replacements.

Use semantic headings, labelled controls, sufficient text contrast, comfortable touch targets and dialog focus handling. Preserve the chosen light brand appearance for this approved milestone. Respect reduced-motion and reduced-transparency preferences. Validate screen-reader labels, keyboard journeys, 200% text zoom and real touch behavior before full-site launch.

## 10. Performance, discoverability and migration

Use a responsive, compressed hero asset with reserved dimensions; preload only essential above-the-fold resources. Self-host the approved font choices and keep third-party scripts out until needed. The current clean background is an AI-derived asset, so confirm its suitability before publication; a supplied original clean photograph would improve fidelity.

Give every final route its own meaningful title, description and single primary heading. Include a sitemap and canonical URLs after the production domain is known. Use only verified local-business structured data. Do not publish fabricated reviews or offer schema for enquiry-only trips.

If replacing the existing site, map and redirect `/travel-booking/`, `/visa-service/`, `/passport-services/` and `/elementor-240/` to their final replacements. Preserve valuable indexed URLs where sensible. Confirm access to the current domain and platform before migration.

Track useful events only after the analytics approach is agreed: enquiry starts, completed server submissions, WhatsApp clicks and trip-detail views. A WhatsApp click is a handoff event, not a completed sale. Do not place personal enquiry information in analytics payloads or page URLs.

## 11. Priorities for continuation

1. Review the coded hero against the two approved assets. Resolve fidelity changes without adding unrelated sections.
2. Confirm the intended Search and Book Now behavior and destination catalogue.
3. Finalise the sitemap and content inventory with the client.
4. Design and implement the remaining home sections and service pages in the approved visual language.
5. Add approved trip records and a real enquiry delivery workflow.
6. Add approved privacy/policy content, migration redirects and production metadata.
7. Complete device, keyboard, form-delivery, performance and content checks before publication.

The current handoff contains no live booking integration, payment system, enquiry database, email service or deployed website. These are deliberate scope boundaries for a hero-first milestone.

## 12. Launch acceptance criteria

- The user has accepted the coded hero and any new page designs.
- Every published claim, trip, price, date and contact detail has a named client reviewer.
- All navigation resolves to the intended new-site routes; temporary existing-site links have been replaced.
- Enquiries reach the agreed destination, with tested success and failure states.
- WhatsApp drafts preserve context without claiming a message was sent.
- Forms work with keyboard and touch; labels, contrast, focus and zoom are checked.
- Mobile layouts have no horizontal overflow or obscured controls.
- No draft privacy copy, zero-price placeholders, invented statistics or old mockup copy reaches production.
- Required redirects, domain configuration, HTTPS, backups/content export and maintenance ownership are agreed.
