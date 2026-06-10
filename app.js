/* Zuhause am Bach Gäste-App – Version 11.2
   Bereinigt: alte V6–V10-Mehrfachblöcke entfernt.
   V11.2: Versionsanzeige, stabilerer Service Worker, interne Testanzeige, robustere Tourenlogik.
*/
(() => {
  'use strict';

  const APP_VERSION = '11.2';
  const APP_BUILD = '2026-06-10';
  const PHONE = '436646437526';
  const ADDRESS = 'Aggsbach Markt 82, 3641 Aggsbach Markt';
  const WEATHER_URL = days => `https://api.open-meteo.com/v1/forecast?latitude=48.2937&longitude=15.3960&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Europe%2FVienna&forecast_days=${days}`;

  const TEXTS = {
    de: {
      heroTitle: 'Willkommen Zuhause am Bach',
      heroText: 'Eure digitale Gäste-App für Wachau, Welterbesteig, Donauradweg und die Wilden Wachauer Windis.',
      todayTitle: '🏞️ Heute in der Wachau',
      todayText: 'Alles Wichtige auf einen Blick: Wetter, Tour, Rad, Fähren, Wachaubahn und schnelle Hilfe.',
      dailyTourTitle: '🥾 Tour des Tages',
      dailyTourText: 'Bei trockenem Wetter: kurze Runde oder Welterbesteig. Bei Regen: Schlechtwetterprogramm.',
      bikeTipTitle: '🚲 Radtipp',
      bikeTipText: 'Melk, Spitz, Dürnstein oder Krems – bitte Wind, Fähren und Rückfahrt prüfen.',
      openTours: 'Touren öffnen',
      openBike: 'Rad-Assistent öffnen',
      tomorrowTitle: '🌅 Morgen-Assistent',
      tomorrowText: 'Wetter morgen, Frühstück, Tour, Fähren, Gepäck und Buchung vorbereiten.',
      tourTitle: '🥾 Wachau Touren-Assistent',
      tourText: 'Wählt, was zu euren Beinen, Wetter und Zeit passt. Die passende Wanderkarte und Route erscheinen darunter.',
      bikeTitle: '🚲 Donauradweg-Assistent',
      rainTitle: '🌧️ Schlechtwetterprogramm'
    },
    en: {
      heroTitle: 'Welcome to Zuhause am Bach', heroText: 'Your guest app for the Wachau, hiking, cycling and the Wild Wachau Windis.',
      todayTitle: '🏞️ Today in the Wachau', todayText: 'Weather, tours, cycling, ferries, railway and help at a glance.',
      dailyTourTitle: '🥾 Tour of the day', dailyTourText: 'Dry weather: short walk or Welterbesteig. Rain: indoor ideas.',
      bikeTipTitle: '🚲 Cycling tip', bikeTipText: 'Melk, Spitz, Dürnstein or Krems – check wind, ferries and return options.',
      openTours: 'Open tours', openBike: 'Open cycling assistant', tomorrowTitle: '🌅 Tomorrow assistant',
      tomorrowText: 'Prepare weather, breakfast, route, luggage and booking for tomorrow.', tourTitle: '🥾 Wachau hiking assistant',
      tourText: 'Choose what suits your legs, time and weather. Map and route appear below.', bikeTitle: '🚲 Danube cycling assistant', rainTitle: '🌧️ Rainy day ideas'
    },
    cs: { heroTitle:'Vítejte v Zuhause am Bach', heroText:'Digitální aplikace pro hosty ve Wachau.', todayTitle:'🏞️ Dnes ve Wachau', todayText:'Počasí, výlety, kolo, přívozy a pomoc.', dailyTourTitle:'🥾 Tip na výlet', dailyTourText:'Za sucha procházka nebo Welterbesteig. Za deště program pod střechou.', bikeTipTitle:'🚲 Tip na kolo', bikeTipText:'Melk, Spitz, Dürnstein nebo Krems.', openTours:'Otevřít výlety', openBike:'Otevřít cyklo asistenta', tomorrowTitle:'🌅 Asistent na zítra', tomorrowText:'Počasí, snídaně, trasa, zavazadla.', tourTitle:'🥾 Turistický asistent Wachau', tourText:'Vyberte čas, počasí a kondici.', bikeTitle:'🚲 Dunajská cyklostezka', rainTitle:'🌧️ Program za deště' },
    hu: { heroTitle:'Üdvözöljük a Zuhause am Bach-ban', heroText:'Vendégapp Wachauhoz, túrázáshoz és kerékpárhoz.', todayTitle:'🏞️ Ma Wachauban', todayText:'Időjárás, túrák, kerékpár, kompok és segítség.', dailyTourTitle:'🥾 A nap túrája', dailyTourText:'Száraz időben séta vagy Welterbesteig. Esőben beltéri program.', bikeTipTitle:'🚲 Kerékpáros tipp', bikeTipText:'Melk, Spitz, Dürnstein vagy Krems.', openTours:'Túrák megnyitása', openBike:'Kerékpáros asszisztens', tomorrowTitle:'🌅 Holnapi asszisztens', tomorrowText:'Időjárás, reggeli, útvonal, csomag.', tourTitle:'🥾 Wachau túraasszisztens', tourText:'Válasszon idő, időjárás és erőnlét szerint.', bikeTitle:'🚲 Duna kerékpáros asszisztens', rainTitle:'🌧️ Esős program' },
    es: { heroTitle:'Bienvenidos a Zuhause am Bach', heroText:'App para huéspedes en Wachau.', todayTitle:'🏞️ Hoy en Wachau', todayText:'Tiempo, rutas, bici, ferris y ayuda.', dailyTourTitle:'🥾 Ruta del día', dailyTourText:'Con buen tiempo: paseo o Welterbesteig. Con lluvia: planes cubiertos.', bikeTipTitle:'🚲 Consejo para bicicleta', bikeTipText:'Melk, Spitz, Dürnstein o Krems.', openTours:'Abrir rutas', openBike:'Abrir asistente bici', tomorrowTitle:'🌅 Asistente para mañana', tomorrowText:'Tiempo, desayuno, ruta y equipaje.', tourTitle:'🥾 Asistente de rutas Wachau', tourText:'Elija según tiempo, clima y forma física.', bikeTitle:'🚲 Asistente Danubio en bici', rainTitle:'🌧️ Planes con lluvia' },
    fr: { heroTitle:'Bienvenue à Zuhause am Bach', heroText:'Application visiteurs pour la Wachau.', todayTitle:'🏞️ Aujourd’hui dans la Wachau', todayText:'Météo, randonnées, vélo, bacs et aide.', dailyTourTitle:'🥾 Randonnée du jour', dailyTourText:'Temps sec: promenade ou Welterbesteig. Pluie: activités abritées.', bikeTipTitle:'🚲 Conseil vélo', bikeTipText:'Melk, Spitz, Dürnstein ou Krems.', openTours:'Ouvrir randonnées', openBike:'Ouvrir assistant vélo', tomorrowTitle:'🌅 Assistant de demain', tomorrowText:'Météo, petit-déjeuner, itinéraire, bagages.', tourTitle:'🥾 Assistant randonnées Wachau', tourText:'Choisissez selon temps, météo et forme.', bikeTitle:'🚲 Assistant Danube à vélo', rainTitle:'🌧️ Programme pluie' }
  };

  const ROUTES = {
    short: { label:'🌿 Fidel empfiehlt: Donau-Bach-Runde', profile:'leicht · 30–90 Minuten', text:'Kurze, einfache Runde entlang Donau und Bach. Ideal nach der Anreise, mit Kindern, mit Hund oder bei unsicherem Wetter. Wasser mitnehmen, bei Hitze Schatten suchen.', map:`https://www.google.com/maps/search/?api=1&query=Donauufer+Aggsbach+Markt`, official:`https://www.google.com/maps/search/Donauufer+Aggsbach+Markt`, iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018' },
    medium: { label:'🥾 Gloria empfiehlt: Maria Langegg / Jauerling', profile:'mittel · 3–4 Stunden', text:'Wald, Aussicht und echtes Wachau-Gefühl. Gut für Gäste mit normaler Kondition. Rückweg, Wetter und ausreichend Wasser vor dem Start prüfen.', map:`https://www.google.com/maps/dir/${encodeURIComponent(ADDRESS)}/Maria+Langegg`, official:`https://www.google.com/maps/dir/${encodeURIComponent(ADDRESS)}/Maria+Langegg`, iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.34%2C48.27%2C15.43%2C48.33&layer=mapnik&marker=48.29368%2C15.396018' },
    emmersdorf: { label:'⛰️ Pia empfiehlt: Welterbesteig nach Emmersdorf', profile:'mittel bis anspruchsvoll · ca. 5 Stunden', text:'Ganztagesetappe Aggsbach Markt → Emmersdorf. Früh starten, Rückfahrt klären und Gepäcktransport rechtzeitig anfragen.', map:`https://www.google.com/maps/dir/${encodeURIComponent(ADDRESS)}/Emmersdorf+an+der+Donau`, official:'https://www.donau.com/touren/welterbesteig-wachau-07-aggsbach-markt-emmersdorf-naturpark-jauerling-wachau', iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.30%2C48.22%2C15.43%2C48.31&layer=mapnik&marker=48.29368%2C15.396018' },
    maria: { label:'🥾 Welterbesteig Maria Laach → Aggsbach Markt', profile:'mittel · Anreisetappe', text:'Schöne Etappe Richtung Zuhause am Bach. Ideal, wenn Aggsbach Markt das Tagesziel ist. Start und Transfer vorab klären.', map:`https://www.google.com/maps/dir/Maria+Laach+am+Jauerling/${encodeURIComponent(ADDRESS)}`, official:'https://www.donau.com/touren/welterbesteig-wachau-06-maria-laach-aggsbach-markt-naturpark-jauerling-wachau', iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.31%2C48.285%2C15.43%2C48.335&layer=mapnik&marker=48.29368%2C15.396018' },
    kids: { label:'🎒 Pia Kinder-Entdeckerrunde', profile:'leicht · spielerisch', text:'Findet Donau, Zug, Marillenbaum, Blume, Herzstein und die Windis. Ziel: Freude statt Gewaltmarsch. Danach Windis-Quiz starten.', map:`https://www.google.com/maps/search/?api=1&query=Aggsbach+Markt+Donauufer`, official:'#windis', iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018' },
    dog: { label:'🐕 Fidel Hunderunde', profile:'leicht · schattige Pausen', text:'Kurze hundefreundliche Runde mit Wasserpausen. Im Sommer heißen Asphalt vermeiden. Fidel sagt: Lieber klug pausieren als stolz überhitzen.', map:`https://www.google.com/maps/search/?api=1&query=Donauufer+Aggsbach+Markt`, official:`https://www.google.com/maps/search/Donauufer+Aggsbach+Markt`, iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018' },
    rain: { label:'🌧️ Gloria Schlechtwetterplan', profile:'leicht · trocken bleiben', text:'Bei Regen: Stift Melk, Kartause Aggsbach, Donauschlössel Spitz, Heuriger oder gemütlicher Lesetag mit den Wilden Wachauer Windis.', map:'https://www.google.com/maps/search/Stift+Melk+Kartause+Aggsbach+Donauschlössel+Spitz', official:'#schlechtwetter', iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.27%2C48.17%2C15.55%2C48.38&layer=mapnik&marker=48.29368%2C15.396018' }
  };

  const QUIZ = [
    ['Wer ist der große ruhige Galgo?', ['Fidel','Gloria','Pia'], 0],
    ['Wer ist die elegante braun geströmte Galga?', ['Pia','Gloria','Fidel'], 1],
    ['Wer ist das kleine Whippet-Mädchen mit rotem Halstuch?', ['Pia','Gloria','Fidel'], 0],
    ['Wo liegt Zuhause am Bach?', ['Aggsbach Markt','Aggsbach Dorf','Dürnstein'], 0],
    ['Welcher Fluss prägt die Wachau?', ['Donau','Inn','Mur'], 0],
    ['Wofür ist die Wachau besonders bekannt?', ['Marillen und Wein','Kokosnüsse','Nordsee'], 0],
    ['Was sollten Wanderer vor dem Start prüfen?', ['Wetter, Wasser, Rückweg','Nur die Schuhfarbe','Fernsehsender'], 0],
    ['Welche Bahn fährt durch die Wachau?', ['Wachaubahn','U-Bahn Berlin','Matterhornbahn'], 0],
    ['Was ist für Hunde im Sommer wichtig?', ['Wasser und Schatten','Heißer Asphalt','Keine Pausen'], 0],
    ['Was suchen Kinder bei der Windis-Schatzsuche?', ['Donau, Zug, Marillenbaum und Herzstein','Eisbären','Raketen'], 0]
  ];

  let quizIndex = 0, quizScore = 0, quizAnswered = 0;
  const $ = id => document.getElementById(id);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const safeStorage = {
    get(key, fallback = null){ try { return window.localStorage.getItem(key) ?? fallback; } catch(_) { return fallback; } },
    set(key, value){ try { window.localStorage.setItem(key, value); } catch(_) {} }
  };

  function whatsApp(text){ window.location.href = `https://api.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent(text)}`; }

  function updateVersionBadge(statusText = 'bereit') {
    const el = $('appVersion');
    if (el) el.textContent = `Version ${APP_VERSION} · Build ${APP_BUILD} · ${statusText}`;
  }
  function setActive(selector, target){ $$(selector).forEach(el => el.classList.toggle('active', el === target)); }

  function applyLang(lang){
    const data = TEXTS[lang] || TEXTS.de;
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(el => { if(data[el.dataset.i18n]) el.textContent = data[el.dataset.i18n]; });
    $$('.langbtn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    safeStorage.set('zab_lang', lang);
  }

  function showRoute(prefix, key){
    const route = ROUTES[key] || ROUTES.short;
    const result = $(`${prefix}Result`), map = $(`${prefix}MapLink`), official = $(`${prefix}OfficialLink`), frame = $(`${prefix}Map`);
    if(result) result.textContent = `${route.label}\n${route.profile}\n\n${route.text}`;
    if(map) map.href = route.map;
    if(official) official.href = route.official;
    if(frame) frame.src = route.iframe;
  }

  function chooseBestRoute(){
    const time = document.querySelector('.advisor-time.active')?.dataset.value || 'short';
    const group = document.querySelector('.advisor-group.active')?.dataset.value || 'solo';
    const weather = document.querySelector('.advisor-weather.active')?.dataset.value || 'dry';
    let key = 'short';
    if(weather === 'rain') key = 'rain';
    else if(weather === 'hot') key = (group === 'kids' || group === 'dog') ? group : 'short';
    else if(group === 'kids') key = 'kids';
    else if(group === 'dog') key = 'dog';
    else if(time === 'medium') key = 'medium';
    else if(time === 'day') key = 'emmersdorf';
    showRoute('route', key);
    const btn = document.querySelector(`.routebtn[data-route="${key}"]`);
    if(btn) setActive('.routebtn', btn);
    location.hash = 'touren';
  }

  async function loadWeather(statusId, gridId, days, index){
    const status = $(statusId), grid = $(gridId);
    if(!status || !grid) return;
    status.textContent = 'Wetter wird geladen …';
    try{
      const res = await fetch(WEATHER_URL(days), { cache: 'no-store' });
      if(!res.ok) throw new Error('weather response not ok');
      const daily = (await res.json()).daily || {};
      const min = daily.temperature_2m_min?.[index] ?? '–';
      const max = daily.temperature_2m_max?.[index] ?? '–';
      const rain = daily.precipitation_sum?.[index] ?? '–';
      const wind = daily.wind_speed_10m_max?.[index] ?? '–';
      grid.innerHTML = `<div class="weatheritem"><b>Temperatur</b><span>${min} / ${max} °C</span></div><div class="weatheritem"><b>Regen</b><span>${rain} mm</span></div><div class="weatheritem"><b>Wind</b><span>${wind} km/h</span></div><div class="weatheritem"><b>Empfehlung</b><span>${Number(rain) > 2 ? 'Regenprogramm' : 'Tour möglich'}</span></div>`;
      status.textContent = 'Wetter geladen.';
    } catch(err){
      grid.innerHTML = '<div class="weatheritem"><b>Offline-Hinweis</b><span>Wetter extern prüfen</span></div>';
      status.textContent = 'Wetter konnte nicht geladen werden. Bitte Wachaubahn, Fähren und Wetter extern prüfen.';
    }
  }

  function showQuiz(){
    const box = $('quizBox'), answers = $('quizAnswers'), score = $('quizScore');
    if(!box || !answers) return;
    const [question, options, correct] = QUIZ[quizIndex];
    box.textContent = `Frage ${quizIndex + 1} von ${QUIZ.length}:\n${question}`;
    answers.innerHTML = '';
    answers.dataset.done = '0';
    options.forEach((txt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = txt;
      btn.addEventListener('click', () => {
        if(answers.dataset.done === '1') return;
        answers.dataset.done = '1';
        quizAnswered++;
        if(idx === correct){ quizScore++; btn.classList.add('correct'); box.textContent += '\n\n✅ Richtig!'; }
        else { btn.classList.add('wrong'); box.textContent += `\n\n❌ Nicht ganz. Richtig ist: ${options[correct]}`; }
        if(score) score.textContent = `Punkte: ${quizScore} / ${quizAnswered}`;
        if(quizAnswered >= QUIZ.length && quizScore >= 8) createCertificate();
      });
      answers.appendChild(btn);
    });
  }

  function createCertificate(){
    const box = $('quizScore');
    if(!box) return;
    box.textContent = `🏆 Punkte: ${quizScore} / ${quizAnswered}\nUrkunde: Wachau-Entdecker der Wilden Wachauer Windis!`;
  }

  function updateTreasure(){
    const items = $$('.treasureItem');
    const checked = items.filter(i => i.checked).length;
    const result = $('treasureResult');
    if(result) result.textContent = `${checked} / ${items.length} Entdeckungen gefunden.` + (items.length && checked === items.length ? '\n🏅 Gratulation! Ihr seid Wachau-Entdecker!' : '');
  }

  function appTest(){
    const checks = [
      ['Heute-Dashboard', !!$('heute')], ['Morgen-Assistent', !!$('morgen')], ['Touren-Assistent', !!$('touren')], ['Routenkarte', !!$('routeMap')],
      ['Rad-Assistent', !!$('radfahren')], ['Schlechtwetter', !!$('schlechtwetter')], ['Frühstück WhatsApp', !!$('breakfastWhatsApp')],
      ['Gepäck WhatsApp', !!$('luggageWhatsApp')], ['Windis Quiz', !!$('quizStart') && !!$('quizBox')], ['Schatzsuche', $$('.treasureItem').length > 0],
      ['Notfall Standort', !!$('sendLocation')], ['Sprachbuttons', $$('.langbtn').length >= 2], ['Tourbuttons', $$('.routebtn').length >= 6], ['Wetterbereich', !!$('weatherStatus')]
    ];
    const failed = checks.filter(c => !c[1]);
    const box = $('appTestResult');
    if(!box) return;
    updateVersionBadge(failed.length ? 'Test mit Hinweisen' : 'Test bestanden');
    box.textContent = failed.length ? `⚠️ Prüfen:\n${failed.map(f => '• ' + f[0]).join('\n')}` : `✅ Alle wichtigen Funktionen gefunden.\n${checks.map(c => '✓ ' + c[0]).join('\n')}`;
    box.classList.toggle('test-ok', !failed.length);
    box.classList.toggle('test-fail', failed.length > 0);
  }

  async function clearCache(){
    try{
      if('serviceWorker' in navigator){ for(const reg of await navigator.serviceWorker.getRegistrations()) await reg.unregister(); }
      if('caches' in window){ for(const name of await caches.keys()) await caches.delete(name); }
    } catch(_) {}
    location.reload();
  }

  function bind(){
    updateVersionBadge('geladen');
    $$('.langbtn').forEach(btn => btn.addEventListener('click', () => applyLang(btn.dataset.lang)));
    applyLang(safeStorage.get('zab_lang', 'de') || 'de');

    $$('.routebtn').forEach(btn => btn.addEventListener('click', () => { setActive('.routebtn', btn); showRoute('route', btn.dataset.route); }));
    $$('.tomorrow-route').forEach(btn => btn.addEventListener('click', () => { setActive('.tomorrow-route', btn); showRoute('tomorrowRoute', btn.dataset.route); }));
    showRoute('route', 'short');
    showRoute('tomorrowRoute', 'short');

    $$('.choice.breakfast').forEach(btn => btn.addEventListener('click', () => setActive('.breakfast', btn)));
    $$('.choice.breakfast-time').forEach(btn => btn.addEventListener('click', () => setActive('.breakfast-time', btn)));
    $$('.advisor-time').forEach(btn => btn.addEventListener('click', () => setActive('.advisor-time', btn)));
    $$('.advisor-group').forEach(btn => btn.addEventListener('click', () => setActive('.advisor-group', btn)));
    $$('.advisor-weather').forEach(btn => btn.addEventListener('click', () => setActive('.advisor-weather', btn)));

    $('advisorStart')?.addEventListener('click', chooseBestRoute);
    $('reloadWeather')?.addEventListener('click', () => loadWeather('weatherStatus','weatherGrid',1,0));
    $('reloadTomorrowWeather')?.addEventListener('click', () => loadWeather('tomorrowWeatherStatus','tomorrowWeatherGrid',2,1));
    loadWeather('weatherStatus','weatherGrid',1,0);
    loadWeather('tomorrowWeatherStatus','tomorrowWeatherGrid',2,1);

    $('breakfastWhatsApp')?.addEventListener('click', () => {
      const art = document.querySelector('.breakfast.active')?.dataset.value || 'Standard-Frühstück';
      const time = document.querySelector('.breakfast-time.active')?.dataset.value || '08:00 Uhr';
      whatsApp(`Hallo Hans und Laura,\n\nwir möchten für morgen Frühstück bestellen.\n\nArt: ${art}\nZeit: ${time}\nPersonen: ____\nWünsche: ____\n\nLiebe Grüße`);
    });
    $('luggageWhatsApp')?.addEventListener('click', () => whatsApp('Hallo Hans und Laura,\n\nwir möchten Gepäcktransport anfragen.\n\nAbholort:\nZiel:\nZeit:\nGepäckstücke:\n\nLiebe Grüße'));
    $('serviceLuggageWhatsApp')?.addEventListener('click', () => whatsApp('Hallo Hans und Laura,\n\nwir möchten Gepäcktransport anfragen.\n\nAbholort:\nZiel:\nZeit:\nGepäckstücke:\n\nLiebe Grüße'));
    $('routeLuggage')?.addEventListener('click', () => whatsApp('Hallo Hans und Laura,\n\nwir möchten Gepäcktransport zur gewählten Tour anfragen.\n\nTour/Ziel:\nUhrzeit:\nGepäckstücke:\n\nLiebe Grüße'));
    $('snackWhatsApp')?.addEventListener('click', () => whatsApp('Hallo Hans und Laura,\n\nwir möchten eine Abendjause anfragen.\n\nPersonen:\nWurst/Käse/vegetarisch:\nGewünschte Uhrzeit:\n\nLiebe Grüße'));
    $('helpWhatsApp')?.addEventListener('click', () => whatsApp('Hallo Hans und Laura,\n\nwir brauchen kurz Hilfe bzw. eine Auskunft.\n\nThema:\n\nLiebe Grüße'));

    $('quizStart')?.addEventListener('click', () => { quizIndex = 0; quizScore = 0; quizAnswered = 0; if($('quizScore')) $('quizScore').textContent = 'Punkte: 0 / 0'; showQuiz(); });
    $('quizNext')?.addEventListener('click', () => { quizIndex = (quizIndex + 1) % QUIZ.length; showQuiz(); });
    $$('.treasureItem').forEach(i => i.addEventListener('change', updateTreasure));
    $('treasureReset')?.addEventListener('click', () => { $$('.treasureItem').forEach(i => i.checked = false); updateTreasure(); });
    updateTreasure();

    $('sendLocation')?.addEventListener('click', () => {
      if(!navigator.geolocation) return whatsApp('Hallo Hans, bitte um Hilfe. Standort wird manuell gesendet.');
      navigator.geolocation.getCurrentPosition(
        p => whatsApp(`Hallo Hans,\n\nhier ist mein Standort:\nhttps://www.google.com/maps/search/?api=1&query=${p.coords.latitude},${p.coords.longitude}`),
        () => whatsApp('Hallo Hans, bitte um Hilfe. Standort wird manuell gesendet.')
      );
    });
    $('runAppTest')?.addEventListener('click', appTest);
    $('clearAppCache')?.addEventListener('click', clearCache);
  }

  
    try {
      if('serviceWorker' in navigator){
        navigator.serviceWorker.register('./service-worker.js').catch(() => {});
      }
    } catch(_) {}

  document.addEventListener('DOMContentLoaded', bind);
})();
