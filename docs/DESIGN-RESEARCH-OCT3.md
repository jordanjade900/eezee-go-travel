# Design research and implementation — 3 October 2026

The brief is a Jamaican travel agency with an approved cinematic coastal hero, navy logo, gold action color and coral accent. Research informed individual section composition and motion; no reference website was reproduced and no reference images were copied into the deliverable.

| Reference | What was reviewed | Applied decision |
| --- | --- | --- |
| [Aventiora — Halo Design Studio](https://dribbble.com/shots/26815941-Aventiora-Luxury-Travel-Landing-Page-Experience) | Public page and actual design image, saved browser captures | Cinematic photography with clear type; asymmetrical company story rather than repeated generic cards |
| [Experiences Page — Imran Jakir](https://dribbble.com/shots/27383755-Experiences-Page-Luxury-Travel-Website-Design) | Public page and actual design image, saved browser captures | Separate destination postcards and touch-friendly experience browsing; verified local trips retain their own practical rows |
| [Land-book](https://land-book.com/), [Sections](https://land-book.com/sections), [Motion](https://land-book.com/motion) | Public indexed gallery/section/motion information | Evaluate sections individually and give each page a distinct opening; use photography and typography as the principal visual system |
| [About us — travel agency](https://dribbble.com/shots/19947027-About-us-page-for-Travel-agency-website), [Travel About UI](https://dribbble.com/shots/24874188-About-Us-Page-Design-Travel-Website-UI), [Scapia About/Contact](https://dribbble.com/shots/26502136-Scapia-About-Contact-Us-Page-Travel-Agency-Website-UI-Figma) | Public search/page information, supplementary About research | Local roots, a clear founding-year story and real contact facts are more useful than fabricated team panels |

Inspection limit: Land-book's interactive browser page presented a Cloudflare check. Public gallery information was reviewed through search/browser text results; individual Land-book animation behavior was not visually verified. No login or challenge bypass was attempted. Dribbble's Aventiora and Experiences artwork was visually inspected. Browser captures are in screenshots/research-oct3/.

## Page decisions

- Home: approved hero retained; real local departures remain immediately below; an exclusive aerial coast scene gives the later travel invitation its own atmosphere.
- About: Jamaican highlands, a broad editorial heading, 1996 founding-year typography and real Mandeville details. Generated scenery never represents the agency office.
- Services: a real geographic globe with Jamaican-origin arcs; exclusive planning artwork and an eight-service directory. The globe is decorative, not a real-time route map.
- Travel: night waterfront, a four-part service ledger and a concise corporate travel panel. Links preselect the relevant enquiry service.
- Group Trips: river opening, verified flyer data and small authentic local photographs; five unique international postcards are illustrative enquiry destinations, not confirmed departures.
- Visa: arched Japan image, country board and native FAQ. Clear assistance language; no approval guarantees.
- Passport: overlapping renewal note and separate still life, with adult-renewal scope and document privacy guidance.
- Contact: its own palm/architecture scene and frosted enquiry surface; existing field order/validation retained.
- Privacy: comfortable reading measure and simple navigation; no decorative photograph competing with legal information.

## Motion implementation sources

[GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) informed viewport entrances and scrubbed photo movement. [Three.js documentation](https://threejs.org/docs/) informed rendering, resource cleanup and reduced rendering cost. [world-atlas](https://github.com/topojson/world-atlas) supplies redistributed Natural Earth land boundaries.

Motion grammar: word-mask headings; image crop-to-full reveals; gentle image scale and desktop parallax; short card entrances; restrained magnetic CTAs; touch/keyboard destination reel; pointer-responsive geographic globe with orbiting beacons. No scroll hijacking or blocking intro screen. Reduced motion and no-JS content remain functional.
