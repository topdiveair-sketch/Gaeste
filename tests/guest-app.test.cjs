const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');

function app(options = {}) {
  const elements = new Map();
  const stored = new Map();
  const context = vm.createContext({
    URL, Intl, Date, Map, console, AbortController,
    setTimeout: () => 0, clearTimeout() {},
    localStorage: {
      getItem(key) { if (options.blockStorage) throw Error('Storage unavailable'); return stored.get(key) ?? null; },
      setItem(key, value) { if (options.blockStorage) throw Error('Storage unavailable'); stored.set(key, value); },
      removeItem(key) { if (options.blockStorage) throw Error('Storage unavailable'); stored.delete(key); }
    },
    window: { addEventListener() {} }, navigator: { onLine: true },
    location: { href: 'https://topdiveair-sketch.github.io/Gaeste/', hash: '' },
    document: {
      documentElement: { lang: 'de' }, addEventListener() {},
      getElementById: id => elements.get(id) ?? null,
      querySelectorAll: () => []
    },
    fetch: options.fetch
  });
  vm.runInContext(source('app.js'), context);
  return { context, stored, element(id, value = '') {
    const el = { value, textContent: '', innerHTML: '', href: '', hidden: false,
      classList: { add() {}, remove() {} }, setAttribute() {}, removeAttribute() {} };
    elements.set(id, el); return el;
  } };
}

test('all shipped JavaScript and inline handlers compile', () => {
  for (const file of fs.readdirSync(root).filter(file => file.endsWith('.js'))) new vm.Script(source(file), { filename: file });
  const { context } = app();
  for (const text of [source('index.html'), source('app.js')]) {
    for (const match of text.matchAll(/onclick=["']([\w.]+)\(/g)) {
      const name = match[1];
      if (name === 'window.print' || name === 'setLang') continue;
      assert.equal(typeof context[name], 'function', `missing click handler ${name}`);
    }
  }
  for (const file of ['windis_geheimtipps.html', 'windis_ausflugstipps.html']) {
    for (const match of source(file).matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1], { filename: file });
  }
});

test('certificate accepts a name as text and retains the rank', () => {
  const a = app(); const box = a.element('challengeGrid');
  a.context.showWachauCertificate();
  assert.match(box.innerHTML, /Neues Rudelmitglied/);
  a.element('certName', ' <img src=x onerror=alert(1)> ');
  const preview = a.element('certPreview');
  a.context.updateCert();
  assert.equal(preview.textContent, '<img src=x onerror=alert(1)>');
  assert.equal(preview.innerHTML, '');
});

test('referrals retain the tracked direct booking destination', () => {
  const a = app(); const url = 'https://www.zuhauseambach-wachau.at/?utm_source=guest_referral';
  a.element('directRecommend').href = url;
  const wa = a.element('whatsappRecommend'), mail = a.element('mailRecommend');
  a.context.setupRecommendLinks();
  assert.ok(new URL(wa.href).searchParams.get('text').includes(url));
  assert.ok(decodeURIComponent(mail.href).includes(url));
});

test('arrival details and snack price agree with the visible offer', () => {
  const a = app(); a.element('arrivalTime', '16:30'); a.element('specialRequests', 'Glutenfrei & vegetarisch');
  a.element('snackBoard', 'Ja – für 2 Personen, Gesamtpreis 29,90 €');
  const wa = a.element('arrivalWhatsApp'); a.element('arrivalSms');
  a.context.updateArrivalLinks(); const text = new URL(wa.href).searchParams.get('text');
  assert.match(text, /16:30/); assert.match(text, /Glutenfrei & vegetarisch/); assert.match(text, /29,90 €/);
  a.element('foodDayNotice'); const snack = a.element('snackWhatsApp'); a.context.setupFoodNotice();
  assert.match(new URL(snack.href).searchParams.get('text'), /29,90 €/);
  assert.match(source('index.html'), /Gesamtpreis: 29,90 €/);
});

test('Wachau dates use Austria across midnight, year changes and DST', () => {
  const { context } = app();
  assert.equal(context.wachauDate(0, new Date('2026-10-02T22:30:00Z')), '2026-10-03');
  assert.equal(context.wachauDate(1, new Date('2026-12-31T23:30:00Z')), '2027-01-02');
  assert.equal(context.wachauDate(1, new Date('2026-10-24T22:30:00Z')), '2026-10-26');
});

test('blocked or malformed local storage does not break preferences or challenge', () => {
  const blocked = app({ blockStorage: true });
  blocked.context.saveGuestPreference('zabLang', 'en');
  assert.equal(blocked.context.readGuestPreference('zabLang'), 'en');
  blocked.context.saveChallenge({ home: true });
  assert.equal(blocked.context.challengeScore(blocked.context.getChallenge()), 10);
  blocked.context.removeGuestPreference('zabLang');
  assert.equal(blocked.context.readGuestPreference('zabLang'), null);
  for (const value of ['null', '[]', 'invalid', '42']) {
    const a = app(); a.stored.set('zab_wachau_challenge_v46', value);
    assert.equal(a.context.challengeScore(a.context.getChallenge()), 0);
  }
});

test('yesterday weather is not presented as today when the network fails', async () => {
  const a = app({ fetch: async () => { throw Error('offline'); } });
  a.stored.set('zabWeatherCache', JSON.stringify({ saved: Date.now(), data: { daily: { time: ['2000-01-01'] } } }));
  const box = a.element('weatherBox'); a.element('weatherUpdated');
  await a.context.loadWeather();
  assert.match(box.innerHTML, /Wetter vorübergehend nicht verfügbar/);
});

test('chronicle escapes attribute content, rejects unsafe photos and handles failed reads', async () => {
  const a = app(); a.context.crypto = { randomUUID: () => 'test' };
  let code = source('chronicle.js').replace(/\}\)\(\);\s*$/, 'globalThis.chronicleTest = { entryHtml, loadPublished, openLinkedEntry };})();');
  const builder = { select() { return this; }, eq() { return this; }, async order() { throw Error('offline'); } };
  a.context.window.WINDI_CHRONICLE_CONFIG = { supabaseUrl: 'https://example.test', supabaseAnonKey: 'test-key' };
  a.context.window.supabase = { createClient: () => ({ from: () => builder }) };
  vm.runInContext(code, a.context);
  const html = a.context.chronicleTest.entryHtml({ id: 'test', title: '\" onerror=\"alert(1)', body: '<script>test</script>', category: 'windis', published_at: '2026-10-03', photo_urls: ['javascript:alert(1)', 'https://example.test/photo.jpg'] });
  assert.ok(html.includes('&quot; onerror=&quot;alert(1)')); assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('src="javascript:')); assert.ok(html.includes('https://example.test/photo.jpg'));
  const status = a.element('chronicleStatus'); a.element('chronicleEntries');
  await a.context.chronicleTest.loadPublished(); assert.equal(status.textContent, 'Die Chronik konnte gerade nicht geladen werden.');
  a.context.location.hash = '#chronik-%invalid'; assert.doesNotThrow(() => a.context.chronicleTest.openLinkedEntry());
});

test('station navigation and VOR preserve route, language and coordinates', () => {
  const { navigationUrl, journeyUrl, viennaTime } = require('../transport.js');
  const coords = { latitude: 48.297161, longitude: 15.404391 };
  for (const mode of ['walking', 'bicycling']) {
    const u = new URL(navigationUrl({ station: 'Aggsbach Markt Erholungszentrum', coords, mode }));
    assert.equal(u.searchParams.get('travelmode'), mode); assert.equal(u.searchParams.get('origin'), '48.297161,15.404391');
  }
  assert.equal(new URL(navigationUrl({ station: 'Spitz Bahnhof', mode: 'walking' })).searchParams.has('origin'), false);
  const u = new URL(journeyUrl({ origin: 'My location', originCoords: coords, destination: 'Spitz an der Donau', date: '2026-10-03', time: '14:00', language: 'en' }));
  assert.equal(u.searchParams.get('language'), 'en_GB'); assert.equal(u.searchParams.get('Z'), 'Spitz an der Donau');
  assert.match(u.searchParams.get('SID'), /X=15404391@Y=48297161/);
  assert.equal(viennaTime(new Date('2026-10-02T22:30:00Z')).date, '2026-10-03');
  assert.throws(() => navigationUrl({ station: '', mode: 'walking' }));
});
