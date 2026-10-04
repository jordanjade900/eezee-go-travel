# Instagram service coverage — 1 October 2026

Source: four promotional screenshots supplied by the user in this chat. These are visible flyer transcriptions, not a claim that Instagram's live profile or videos were accessible. Originals are preserved in `references/instagram/`; WebP delivery copies are in `assets/`. The profile link is https://www.instagram.com/eezeegotravelja/.

## Services and their website placement

| Advertised service | Website placement |
| --- | --- |
| Visa applications | Services directory and visa-assistance page |
| Flight bookings | Services directory and travel-services flight-bookings section |
| Jamaican passport renewals (adults) | Services directory and dedicated passport-renewals page |
| Hotel bookings | Services directory and travel-services hotel-bookings section |
| Group trips, local and international | Services directory and group-trips page |
| Corporate travel | Services directory, travel-services section and contact selection |
| Flight itinerary | Services directory, travel-services section and contact selection |
| Trip planning and consultation | Services directory, travel-services section and contact selection |

The supplied visa flyer advertises assistance for the United States, Canada, United Kingdom, Europe (Schengen), Dubai, Japan and China. These are displayed on the visa page. Cayman Islands remains from prior client-site research. Assistance does not imply guaranteed approval or government authority.

## Advertised Jamaican day trips

All three depart from Manchester Shopping Centre, Mandeville.

| Trip | Advertised date | Advertised price | Inclusions shown |
| --- | --- | --- | --- |
| Jamwest Beach Negril | 17 October 2026 | $8,500 | Transportation, beach access, professional photos, lounge chairs |
| Benta River Falls | 28 November 2026 | $10,000 | Transportation, all entrance fees, river access, garden access, professional photos |
| Mystic Mountain | 19 December 2026 | $17,500 | Transportation, zip line, rock climbing, infinity pool and waterslide, bobsled and Anansi’s Web |

The currency and price basis are not explicitly stated on these flyers. The site reproduces the advertised dollar amounts and asks visitors to confirm currency, final details and availability. Do not invent seat counts, payment terms or confirmed booking availability. No Event/Offer schema with guessed currency is emitted.

## Enquiries and maintenance

Trip links pass only a published trip ID to contact. The form selects Group trips, the specific destination and a future advertised date, and includes the flyer context in editable enquiry text. WhatsApp and email actions prepare drafts; they do not send or reserve anything. Unknown IDs are ignored. Past advertised departures receive an explicit past label and a future-trip enquiry link; past dates are not inserted into the date input.

`data/local-trips.json` is the source for published trip records. `tools/catalog.mjs` generates Home featured cards, Group Trips cards and Contact’s inline JSON; `npm run build` runs it before SEO. Edit this one file, rebuild, then run `node tools/check-instagram.mjs` and `node tools/check-refinement.mjs`. Shared form choices come from `data/enquiry-catalog.json`. Review expired promotions regularly; date labeling is not a replacement for updating the catalogue.

The footer of every content page links directly to the client's Instagram profile. It opens separately and uses no third-party embed, tracking script or Instagram login requirement on the website.

Local checks: `node tools/check-instagram.mjs` verifies all eight services, added visa destinations, three prices, allowlisted trip context, WhatsApp/email draft content and nine footer Instagram links. Screenshots are in `docs/screenshots/instagram/`.
