# Website self-review — 2 October 2026

## Follow-up implementation

This document records the initial assessment before changes. The user subsequently authorized improvements; the completed work and final verification are in REFINEMENT-2026-10-02.md and QA-SUMMARY.md. The shared screenshots directory and capture report now show the final revised site.

The site is functional, but the design does not yet consistently deliver the premium experience requested. The approved homepage hero is the strongest brand reference. Subsequent work improved individual layouts and controls, but adding glass and animation did not resolve the underlying repetition, content hierarchy and lack of authentic company imagery. This is a candid design assessment, not client approval.

## What I actually checked

Reviewed all nine content routes in installed Chrome, capturing fresh desktop (1440px) and mobile (390px) full-page screenshots. Inspected desktop compositions across every page and mobile Home, Services, Group trips and Contact directly. Ran the custom-control suite again: all six popovers fit at 1440x1000, 390x844, 320x568 and 844x390. Keyboard/typeahead, calendar movement/selection/clear, query prefill, required-service error focus, enquiry draft transfer, reduced motion and no-JS fallback passed. No messages were sent.

Across the nine routes at both capture widths there were no horizontal overflows, broken images or JavaScript page errors. These checks do not establish real-device Safari behavior or manual screen-reader accessibility. The project is still served locally at http://127.0.0.1:4173/.

Evidence: `self-review-checks.json`, `control-checks.json`, `lighthouse.json`, and `screenshots/self-review/`. No application design or behavior was changed during this review.

## Priorities

| Priority | Finding | Why it matters | Recommended change |
| --- | --- | --- | --- |
| 1 | Competing design languages | The bold italic hero, lighter interior typography, pale glass sections and dark control popovers share colours but do not yet feel fully composed as one brand. | Establish one component system for type, spacing, panel treatment, buttons and motion, using the approved hero as the starting reference. Give each page a distinct composition within that system. |
| 1 | Homepage options differ from Contact | Hero has four service categories and ten destination options; Contact contains eleven service choices and nineteen destination choices, including Jamaican trips, Dubai, Japan and China. Visitors can see a promoted offering elsewhere without finding it in the first enquiry control. | Share one explicit service/destination catalogue, with clear grouping where useful. Keep the eight advertised services easy to find. |
| 1 | Action labels overstate the next step | Home's Search produces an enquiry summary, not results. Book Now opens that summary on Home and points to Contact on interiors; neither reserves anything. | Keep the approved labels unless the user approves copy changes. Add concise nearby context or seek a specific copy revision to make the enquiry outcome clear. Do not fabricate a search or booking backend. |
| 1 | Current trips are visually secondary | Group trips opens with a generated Latin American street image. Local dated trips appear later, preceded by a flyer on mobile. Trip cards have no individual destination imagery. | Lead with the advertised local journeys, prioritise date/price/inclusions and use distinct verified or explicitly illustrative imagery for each trip. Keep the original flyer available as source material rather than making it the main experience. |
| 1 | Company trust is mostly asserted | About uses an illustrative landscape, a founding year and general personal-service copy. There are no real team or office photographs, named staff or customer stories. | Request client-provided company photos and approved history. Add authentic evidence when available; never invent testimonials, ratings, certifications or team members. |
| 2 | Mobile pages are overlong for their current information | Home is 6,570px high at 390px wide; Group trips 6,081px; Services 5,391px. Repeated process sections, stacked cards and a large footer extend the journey. Length itself is not a bug, but repeated material weakens the value of the scrolling. | Reduce duplication and excess gaps, simplify the mobile footer, show timely trip/service information earlier, and reserve expansion for useful detail. |
| 2 | Service pages provide mood more readily than answers | Flight itinerary, corporate travel and consultation copy remain brief and general. Visa and passport pages say to discuss requirements rather than explaining the agency's confirmed assistance in detail. | Obtain client-approved scope, what to prepare, consultation steps, inclusions and practical FAQs. Do not guess government requirements, fees or processing times. |
| 2 | Glass can look like an added layer | The Services directory and local-trip section gained gradient backdrops and frosted panels while other surfaces retain plain editorial treatments. The visual effect varies with transparency preferences. | Define where glass is useful and keep edges, tint, depth and contrast consistent. Ensure the opaque accessibility fallback is equally intentional. More blur everywhere would not solve the issue. |
| 2 | Animation is mostly repeated entrance motion | Hero sequencing and popover motion work; many lower-page elements still repeat fade-and-rise entrances. | Build a restrained motion vocabulary around actual actions: opening controls, selecting dates, changing service previews and moving through content. Avoid replacing useful interactions with longer loading sequences. |

## Page-by-page assessment

| Page | What works | What still needs attention |
| --- | --- | --- |
| Home | Strong approved hero, recognisable logo/palette, direct enquiry controls, distinct supporting imagery. | Incomplete option lists; ambiguous Search outcome; supporting sections lose the hero's visual energy; lengthy mobile sequence. |
| About | Founding year and location are clear; wide landscape composition has space to breathe. | It describes a place more than the people/company. Repeated general claims and the same large closing CTA structure used elsewhere. |
| Services | All eight advertised services are linked; imagery makes the four main families scannable. | The four family cards followed by eight service links duplicate discovery work. Mobile visitors scroll through four large images before reaching the complete index. |
| Travel planning | The aircraft-window opening feels more immersive and has a clear CTA. | Four text chapters plus audience types, process steps and a closing CTA become predictable. Concrete service-specific questions remain unanswered. |
| Group trips | Source-backed dates, prices and inclusions; trip enquiry prefill; past-date handling. | Local offers need higher priority and individual imagery. The small embedded flyer is not a substitute for a polished destination presentation. Currency, price basis and availability still require agency confirmation. |
| Visa assistance | Destinations are easy to scan; FAQ opens natively; assistance is not presented as guaranteed approval. | The arched image/heading and numbered process repeat other pages. The service could be more specific once the client confirms details. |
| Passport renewals | Adult-renewal scope and exclusions are clearly stated; the ticket motif provides some variation. | Text remains general and the closing/process sections repeat the common pattern. The generated blank cover should not be mistaken for an actual Jamaican passport photograph. |
| Contact | Primary WhatsApp is prominent, enquiry forms work, custom menus/calendar are visibly different from native popups. | Multiple phone numbers deserve clearer labels. The mobile page is long; extra steps between Prepare my message and sending should remain clearly explained. |
| Privacy | Readable content, section navigation and a clear account of browser-only enquiry drafts. | Large headline and generous footer consume considerable room for a utility page. Review the copy again if hosting, analytics or submission behavior changes. |

## Current automated performance and discovery results

Fresh isolated homepage Lighthouse run, local mobile simulation:

| Metric | Result |
| --- | --- |
| Performance | 89/100 |
| Automated accessibility | 100/100 |
| Best practices | 100/100 |
| SEO checks | 100/100 |
| Largest Contentful Paint | 3.6 seconds |
| Cumulative Layout Shift | 0.005 |

The largest opportunities reported are render-blocking CSS and image compression. The image-delivery insight estimates roughly 212KiB of potential savings across supporting imagery and the mobile hero. The largest individual estimate is the 768px journey-street asset, not the hero alone. The homepage loads five stylesheet files; the audit also reports approximately 17KiB of unused CSS. Validate image quality and consolidate/split styles deliberately rather than pursuing a score at the expense of the approved visuals.

The development server uses no-store caching. Its cache-related findings should not be treated as measured production behavior. The local audit is not evidence of public indexing, AI recommendations or search rankings. Static titles, canonicals, business/service/breadcrumb/FAQ metadata, sitemap and visible content are present; business-specific content depth still needs improvement. Public deployment and external crawler access have not been reviewed here.

## Recommended order of work

1. Unify the visual system and service/destination catalogue while protecting the approved hero.
2. Recompose Home's supporting content and Group trips around the client's actual services and advertised journeys; trim mobile repetition.
3. Make About specific to the company using real client material, then enrich the service pages with approved practical answers.
4. Refine glass and motion across the shared components, then revisit image delivery and stylesheet organization.
5. Repeat open-control screenshots, full-page visual review, keyboard/mobile checks and the isolated audit before presenting the next design revision.
