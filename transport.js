/* Wachau journey planner: live results are supplied by VOR, not stored here. */
(function (root) {
  'use strict';
  function viennaTime(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(now);
    const value = type => parts.find(part => part.type === type).value;
    return { date: `${value('year')}-${value('month')}-${value('day')}`, time: `${value('hour')}:${value('minute')}` };
  }
  function journeyUrl({ origin, destination, originCoords, destinationCoords, date, time, language = 'de' }) {
    if (!origin?.trim() || !destination?.trim()) throw new Error('Missing route');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Invalid departure');
    const url = new URL('https://anachb.vor.at/');
    function place(name, coords, textKey, coordKey) {
      if (coords) {
        if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude) || Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) throw new Error('Invalid location');
        url.searchParams.set(coordKey, `A=2@O=${name.replace(/[@$]/g, '')}@X=${Math.round(coords.longitude * 1e6)}@Y=${Math.round(coords.latitude * 1e6)}@`);
      } else url.searchParams.set(textKey, name.trim());
    }
    place(origin, originCoords, 'S', 'SID');
    place(destination, destinationCoords, 'Z', 'ZID');
    const languages = { de: 'de_DE', en: 'en_GB', es: 'es_ES', fr: 'fr_FR' };
    url.searchParams.set('language', languages[language] || 'en_GB');
    url.searchParams.set('date', date.split('-').reverse().join('.'));
    url.searchParams.set('time', time);
    url.searchParams.set('timeSel', 'depart');
    url.searchParams.set('start', 'yes');
    return url.href;
  }
  const api = { viennaTime, journeyUrl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document) return;
  root.WachauTransport = api;
  const form = document.getElementById('transport-form');
  if (!form) return;
  const origin = document.getElementById('transport-origin');
  const destination = document.getElementById('transport-destination');
  const mode = document.getElementById('transport-when');
  const date = document.getElementById('transport-date');
  const time = document.getElementById('transport-time');
  const status = document.getElementById('transport-status');
  const locate = document.getElementById('transport-locate');
  let originCoords = null, destinationCoords = null, locationRequest = 0;
  const english = () => document.documentElement.lang !== 'de';
  const message = (de, en) => { status.textContent = english() ? en : de; };
  function mapUrl(text, coords) {
    const url = new URL('https://www.google.com/maps/search/');
    url.searchParams.set('api', '1');
    url.searchParams.set('query', coords ? `${coords.latitude},${coords.longitude}` : text.trim());
    return url.href;
  }
  function updateMaps() {
    for (const [id, input, coords] of [['transport-origin-map', origin, originCoords], ['transport-destination-map', destination, destinationCoords]]) {
      const link = document.getElementById(id);
      link.hidden = !input.value.trim();
      link.href = mapUrl(input.value, coords);
    }
  }
  function cancelLocation() {
    locationRequest++;
    locate.disabled = false;
    locate.removeAttribute('aria-busy');
  }
  function setNow() {
    const now = viennaTime(); date.value = now.date; time.value = now.time;
  }
  setNow();
  mode.addEventListener('change', () => {
    const later = mode.value === 'later';
    document.getElementById('transport-departure-fields').hidden = !later;
    date.disabled = time.disabled = !later;
    if (!later) setNow();
  });
  origin.addEventListener('input', () => { cancelLocation(); originCoords = null; status.textContent = ''; updateMaps(); });
  destination.addEventListener('input', () => { destinationCoords = null; updateMaps(); });
  document.getElementById('transport-swap').addEventListener('click', () => {
    cancelLocation();
    [origin.value, destination.value] = [destination.value, origin.value];
    [originCoords, destinationCoords] = [destinationCoords, originCoords];
    message('Start und Ziel getauscht. Bitte gewünschte Rückfahrtzeit wählen.', 'Start and destination swapped. Please choose your return departure time.');
    updateMaps();
  });
  document.querySelectorAll('[data-transport-destination]').forEach(button => button.addEventListener('click', () => {
    destination.value = button.dataset.transportDestination;
    destinationCoords = null; updateMaps(); destination.focus();
  }));
  locate.addEventListener('click', () => {
    if (!navigator.geolocation) {
      message('Standort nicht verfügbar. Bitte Startort eingeben.', 'Location is unavailable. Please enter your starting point.'); return;
    }
    const request = ++locationRequest;
    locate.disabled = true; locate.setAttribute('aria-busy', 'true');
    message('Standort wird ermittelt …', 'Finding your location …');
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== locationRequest) return;
      locate.disabled = false; locate.removeAttribute('aria-busy');
      originCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      origin.value = english() ? 'My location' : 'Mein Standort';
      message('Standort übernommen. Er wird erst beim Öffnen der Auskunft an VOR übermittelt.', 'Location selected. It is shared with VOR only when you open the journey planner.');
      updateMaps();
    }, error => {
      if (request !== locationRequest) return;
      locate.disabled = false; locate.removeAttribute('aria-busy');
      message(error.code === 1 ? 'Standortzugriff abgelehnt. Bitte Startort eingeben.' : 'Standort konnte nicht ermittelt werden. Bitte Startort eingeben.',
        error.code === 1 ? 'Location access denied. Please enter your starting point.' : 'Could not find your location. Please enter your starting point.');
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!originCoords && !destinationCoords && origin.value.trim().toLocaleLowerCase() === destination.value.trim().toLocaleLowerCase()) {
      message('Bitte unterschiedliche Start- und Zielorte wählen.', 'Please choose different start and destination points.'); return;
    }
    if (mode.value === 'now') setNow();
    const url = journeyUrl({ origin: origin.value, destination: destination.value, originCoords, destinationCoords,
      date: date.value, time: time.value, language: document.documentElement.lang });
    // Navigation is synchronous with the click so mobile popup blockers do not intervene.
    const link = document.createElement('a');
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    document.body.appendChild(link); link.click(); link.remove();
    message('VOR-Auskunft geöffnet. Dort finden Sie Abfahrten, Umstiege und Haltestellen.', 'VOR journey planner opened. Find departures, transfers and stops there.');
  });
  updateMaps();
})(typeof window === 'undefined' ? globalThis : window);
