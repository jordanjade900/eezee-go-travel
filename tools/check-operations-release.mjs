import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const base = new URL(process.env.TEST_URL || 'http://127.0.0.1:4191/');
const canonicalBase = new URL(process.env.PUBLIC_SITE_URL || (base.protocol === 'https:' ? base.href : 'https://eezee-go-travel.netlify.app/'));
const routes = ['', 'about/', 'services/', 'travel-services/', 'group-trips/', 'visa-assistance/', 'passport-renewals/', 'contact/', 'privacy/', 'registration/', 'plan-trip/', 'request/', 'manage/'];
const report = { passed: false, base: base.href, checkedAt: new Date().toISOString(), layouts: [], catalogue: [], errors: [] };
const screenshotDir = base.protocol === 'https:' ? 'docs/screenshots/operations-release-live' : 'docs/screenshots/operations-release-local';
await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome' });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const api = await context.request.get(new URL('api/operations/trips', base).href);
  assert.equal(api.status(), 200);
  const { trips } = await api.json();
  assert(Array.isArray(trips));
  assert(!Object.keys(trips[0] || {}).some(key => /password|token|email/i.test(key)), 'Public catalogue excludes private fields');
  assert.equal((await context.request.get(new URL('api/operations/dashboard', base).href)).status(), 401);
  const jamaicaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Jamaica', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const openTrips = [...trips].filter(trip => trip.status === 'enquiries_open' && trip.date >= jamaicaDate).sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of routes) {
      const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      await page.evaluate(async () => {
        for (const img of document.querySelectorAll('img[loading=lazy]')) { img.scrollIntoView(); await img.decode(); }
        await document.fonts.ready;
        scrollTo({ top: 0, behavior: 'instant' });
      });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        h1: document.querySelectorAll('h1').length,
        brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => new URL(image.src).pathname),
        canonical: document.querySelector('link[rel=canonical]')?.href,
        noindex: /noindex/.test(document.querySelector('meta[name=robots]')?.content || '')
      }));
      assert.equal(layout.overflow, false, route + ' overflow ' + width);
      assert.equal(layout.h1, 1, route + ' h1');
      assert.deepEqual(layout.brokenImages, [], route + ' images');
      if (['request/', 'manage/'].includes(route)) assert.equal(layout.noindex, true);
      else assert.equal(layout.canonical, new URL(route, canonicalBase).href);
      report.layouts.push({ route: route || 'home', width, ...layout });

      if (route === '' || route === 'group-trips/') {
        const section = route ? '.local-trips' : '.featured-trips';
        assert.equal(await page.locator(section).getAttribute('data-departure-source'), 'live');
        const ids = await page.locator(section + ' [data-live-departure]').evaluateAll(nodes => nodes.map(node => node.dataset.liveDeparture));
        const expected = route ? [...trips].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)) : openTrips.slice(0, 3);
        assert.deepEqual(ids, expected.map(trip => trip.id));
        for (const trip of expected) {
          const card = page.locator(section + ' [data-live-departure]').filter({ has: page.getByRole('heading', { name: trip.name, exact: true }) });
          assert.equal(await card.locator('time').getAttribute('datetime'), trip.date);
          assert((await card.innerText()).includes(trip.departurePoint || 'Meeting point to be confirmed.'));
          const eligible = trip.status === 'enquiries_open' && trip.date >= jamaicaDate;
          assert.equal(await card.locator('a[href*="registration/"]').count(), eligible ? 1 : 0);
          if (!route) assert.equal(await card.locator('.trip-thumbnail').count(), 0);
        }
        report.catalogue.push({ route: route || 'home', width, count: ids.length, currentDatesAndPickup: true, correctClosedStates: true });
        if (width === 390) await page.locator(section).screenshot({ path: screenshotDir + '/departures-' + (route ? 'group' : 'home') + '-390.png' });
      }
      if (['registration/', 'plan-trip/', 'manage/'].includes(route)) await page.screenshot({ path: screenshotDir + '/' + route.replace('/', '') + '-' + width + '.png', fullPage: true });
    }
  }

  const target = openTrips[0];
  if (target) {
    await page.goto(new URL('contact/?service=Group+trips&trip=' + encodeURIComponent(target.id), base).href, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#c-destination').inputValue(), target.name);
    assert.equal(await page.locator('#c-date').inputValue(), target.date);
    const message = await page.locator('#c-message').inputValue();
    assert(message.includes(target.departurePoint));
    if (target.advertisedPrice) assert(message.includes(target.advertisedPrice));
    await page.locator('#contact-form button[type=submit]').click();
    assert.equal(await page.locator('#enquiry-ready').isVisible(), true);
    const draft = new URL(await page.locator('#ready-whatsapp').getAttribute('href')).searchParams.get('text');
    assert(draft.includes(target.name) && draft.includes(target.departurePoint));
    report.contactLivePrefillAndDraft = true;
  }
  const sitemap = await context.request.get(new URL('sitemap.xml', base).href);
  assert.equal(sitemap.status(), 200);
  const xml = await sitemap.text();
  assert.equal((xml.match(/<loc>/g) || []).length, 11);
  assert(!xml.includes('/manage/') && !xml.includes('/request/'));
  report.sitemapPrivateRoutesExcluded = true;

  if (process.env.OPS_ACCESS_FILE) {
    const access = await readFile(process.env.OPS_ACCESS_FILE, 'utf8');
    const email = access.match(/Email: ([^\r\n]+)/)?.[1]?.trim();
    const password = access.match(/Password: ([^\r\n]+)/)?.[1]?.trim();
    assert(email && password, 'Private access file format');
    await page.goto(new URL('manage/', base).href, { waitUntil: 'networkidle' });
    await page.locator('input[name=email]').fill(email);
    await page.locator('input[name=password]').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('heading', { name: 'Keep every journey moving.' }).waitFor();
    const cookie = (await context.cookies()).find(item => item.name === 'eezee_ops');
    assert(cookie?.httpOnly && cookie.sameSite === 'Strict');
    if (base.protocol === 'https:') assert(cookie.secure);
    const staffResponse = await context.request.get(new URL('api/operations/dashboard', base).href);
    assert.equal(staffResponse.status(), 200);
    assert(Array.isArray((await staffResponse.json()).requests));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    }
    await page.screenshot({ path: screenshotDir + '/staff-final-1440.png', fullPage: true });
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    assert.equal((await context.request.get(new URL('api/operations/dashboard', base).href)).status(), 401);
    report.authenticatedStaffReadAndLogout = true;
    report.secureSessionCookie = true;
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
  const output = base.protocol === 'https:' ? 'docs/operations-release-checks.json' : 'docs/operations-release-local-checks.json';
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log('Release checks passed: 13 routes, current live departures, Contact draft, private-route metadata, optional staff login and responsive layouts. No customer records created.');
} finally { await browser.close(); }
