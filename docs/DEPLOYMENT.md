# GitHub and Netlify deployment

## Current production — 9 October 2026: custom operations

Production deploy: **6ac9797dbcb18e7865c6211b**. [Deploy log](https://app.netlify.com/projects/eezee-go-travel/deploys/6ac9797dbcb18e7865c6211b). The existing site now includes registration, planning, private customer tracking and the staff workspace, plus live departure data on Home/Group Trips and Contact. Source and operating details: [custom systems delivery](CUSTOM-SYSTEMS-OCT9.md), [staff quickstart](STAFF-QUICKSTART.md), [backend configuration](../backend/README.md).

This section supersedes the static-only/no-backend deployment descriptions below. The build still publishes a multipage static frontend in `dist`; a Netlify Function serves `/api/operations/*`. Both must be deployed together. Durable encrypted records live in a site-wide Netlify Blobs store and survive deployments; they are not files in `dist`.

Runtime production configuration is already set: `OPS_STORE=netlify`, the HTTPS `OPS_ORIGIN`, independent encryption/session secrets and bootstrap owner details. Private local copies are in ignored `work/operations-production.env` and `work/operations-live-access.md`. Never include them in the static build/GitHub or replace them with local keys. The stored owner account controls its password after initialization. Keep these secrets privately for continuity; no automatic password recovery or restore UI is installed.

Future updates, from the repository root with authenticated CLI:

```powershell
$env:PUBLIC_SITE_URL='https://eezee-go-travel.netlify.app/'
npm run build
netlify deploy --site c2f75e7f-c3c4-4b75-8755-6e60b1f902ae --dir dist --functions netlify/functions --no-build --prod
```

The local Windows CLI is installed in ignored `work/netlify-cli`; its executable is `node work/netlify-cli/node_modules/netlify-cli/bin/run.js`. The previously documented EXDEV workaround affects that tooling copy only. Automatic Git deployment remains unconfigured, and no agency domain/DNS was changed. Preview URLs do not gain permission to mutate records: the API accepts the configured canonical origin.

Verification includes 14 backend tests; actual customer submission → staff draft/publish → customer approval locally and on live production; all four new routes at 320/390/768/1440 px; original website regression checks; and the final 13-route release checks. Reports: `operations-ui-checks.json`, `operations-live-checks.json`, `operations-release-checks.json`. Two labelled synthetic production requests were cancelled after verification, not deleted or presented as bookings. Latest UI/catalogue deployment was checked without adding more customer records.

Read-only release check: set `$env:TEST_URL='https://eezee-go-travel.netlify.app/'`, then `node tools/check-operations-release.mjs`. Optional staff sign-in/logout verification reads the private file only when `$env:OPS_ACCESS_FILE='work/operations-live-access.md'` is explicitly set. Credentials/tokens are excluded from reports. Do not run the synthetic `test:operations:ui` workflow against production.

## Latest production update — 4 October 2026

Current deploy: 6ac3268b9ba8e6493c8b4e40. The user requested audience-neutral hero copy and removal of the decorative globe. These are published; the renderer/build step/unused geographic dependencies are removed. Services now has a full-width opening. Current details and verification: AUDIENCE-AND-GLOBE-UPDATE.md and globe-removal-checks.json. Older globe-render measurements below are historical.

Repository: https://github.com/jordanjade900/eezee-go-travel

The website source is at the repository root. Node 24 was used locally. Install with `npm ci`, then build with `npm run build`. The publish directory is `dist`. `netlify.toml` supplies the build command, publish directory, Node version and static response headers. This is a static multipage website: do not add an SPA redirect that turns missing routes into the homepage. The existing `404.html` handles unknown paths.

Metadata uses `PUBLIC_SITE_URL` when explicitly set, then Netlify's `URL` environment value, then the existing agency domain for ordinary local development. Set `PUBLIC_SITE_URL` to the confirmed HTTPS production origin when deploying manually or using a custom domain. The build regenerates canonicals, social-image URLs, sitemap and structured data.

The build safety check identifies the package rather than requiring a local folder name. A fresh Git clone in a differently named folder was built successfully before deployment. The source and all delivery assets are committed. Environment files, Netlify state, dependencies, build output, scratch scripts and screenshot/Lighthouse artifacts are excluded.

Netlify CLI browser authentication stores credentials in its standard user configuration, outside the repository. Do not commit tokens or `.netlify/state.json`. Git credentials are handled by Git Credential Manager. The GitHub plugin could read this new repository but its write request returned 403; the actual upload succeeded through authenticated local Git.

Current GitHub branch: `main`. The remote upload was verified using `git ls-remote` and the connected GitHub file/commit tools.

## Published — 4 October 2026

- Live site: https://eezee-go-travel.netlify.app/
- Netlify project: https://app.netlify.com/projects/eezee-go-travel
- Team: jordanjade900 (display name Neon Lights).
- Project ID: c2f75e7f-c3c4-4b75-8755-6e60b1f902ae.
- Verified production deploy: 6ac2dafacc0fa79ed2fd2a3f.
- Deploy log: https://app.netlify.com/projects/eezee-go-travel/deploys/6ac2dafacc0fa79ed2fd2a3f.

Published through authenticated Netlify CLI using the built dist directory. This is a manual deployment; automatic Git-triggered deployment has not been configured. Future source pushes update GitHub but require a new Netlify deploy until repository integration is enabled in Netlify.

Passed live checks: all nine content routes return 200; image decoding succeeds; canonicals match the live origin; no mobile horizontal overflow; Home's service picker and enquiry summary work; Contact trip/service prefill works; sitemap/robots return 200; nested missing pages return a styled 404. Live desktop/mobile hero screenshots were personally inspected. Check command: `node tools/check-deployment.mjs`. Results: docs/deployment-checks.json; captures: docs/screenshots/deployment/.

The live Three.js globe was additionally verified with actual successful draw calls. Netlify's optional project badge was disabled through the built_with_badge_enabled project setting, and fresh desktop/mobile requests confirmed no injected badge frame. This leaves the agency hero unobstructed; no plan change or CSS workaround was used. Reference: [Netlify badge setting](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/).

The local Windows runtime returned EXDEV during atomic CLI configuration writes. Only the ignored work/netlify-cli tooling copy was patched to fall back to a direct 0600 config write for that error. Website code, authentication checks and normal atomic writes were unaffected. This workaround is local and is not required for the Netlify build server. Login credentials remain in Netlify's normal user configuration, never in this repository.

To publish an update, build with PUBLIC_SITE_URL=https://eezee-go-travel.netlify.app/, then use an authenticated Netlify CLI: `netlify deploy --site c2f75e7f-c3c4-4b75-8755-6e60b1f902ae --dir dist --no-build --prod`. For future custom-domain launches, update PUBLIC_SITE_URL and rebuild. Do not assume the agency's existing domain has been changed; no custom domain or DNS was modified.

References: [Netlify CLI guide](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/), [Build configuration](https://docs.netlify.com/build/configure-builds/overview/), [Production deployments](https://docs.netlify.com/deploy/deploy-types/production-deploy/).
