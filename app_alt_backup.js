const phone = '+436646437526';
const waPhone = '436646437526';

function smsHref(text){
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const sep = isIOS ? '&' : '?';
  return `sms:${phone}${sep}body=${encodeURIComponent(text)}`;
}

function whatsappHref(text){
  // api.whatsapp.com works more reliably than wa.me on Android, iPhone and desktop/WhatsApp Web.
  return `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(text)}`;
}

function openWhatsApp(text){
  window.location.href = whatsappHref(text);
}

function buildWhatsappText(kind, mapLink){
  const locationText = mapLink || 'Bitte Standort in WhatsApp manuell teilen oder Ort/Wegweiser hier einfügen.';
  if (kind === 'lost') {
    return `Hallo Hans,

wir haben uns verlaufen und benötigen Hilfe.

Unser aktueller Standort:
${locationText}

Anzahl Personen:
_____

Vielen Dank.`;
  }
  if (kind === 'luggage') {
    return `Hallo Hans,

bitte Gepäck an folgenden Standort liefern:
${locationText}

Name:
_____
Anzahl Gepäckstücke:
_____

Vielen Dank.`;
  }
  return `Hallo Hans,

hier ist mein aktueller Standort:
${locationText}

Viele Grüße`;
}

function sendWhatsAppWithLocation(kind){
  // GPS funktioniert im Browser nur zuverlässig über HTTPS oder localhost. Beim direkten Öffnen der index.html
  // vom Handy/PC kann der Browser den Standort blockieren. Dann wird WhatsApp trotzdem mit Hinweis geöffnet.
  const fallback = buildWhatsappText(kind, null);

  if (!navigator.geolocation) {
    openWhatsApp(fallback);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lon = pos.coords.longitude.toFixed(6);
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      openWhatsApp(buildWhatsappText(kind, mapLink));
    },
    () => {
      openWhatsApp(fallback);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

function bindWhatsAppLocationButtons(){
  const pairs = [
    ['waLocation','location'], ['waLocationCard','location'], ['waLocationContact','location'],
    ['waLost','lost'], ['waLostCard','lost'],
    ['waLuggageHere','luggage'], ['waLuggageHereCard','luggage']
  ];
  pairs.forEach(([id, kind]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => sendWhatsAppWithLocation(kind));
  });
}

const form = document.getElementById('smsForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const personen = document.getElementById('personen').value;
    const checked = [...form.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
    const wunsch = document.getElementById('wunsch').value.trim();
    let text = `Hallo Hans und Laura,\n\nwir möchten Frühstück für ${personen} Person(en) bestellen.\n\nGewünscht: ${checked.join(', ') || 'bitte nach Absprache'}.`;
    if (wunsch) text += `\n\nZusatzwunsch/Uhrzeit: ${wunsch}`;
    text += `\n\nLiebe Grüße`;
    window.location.href = smsHref(text);
  });
}

const dinnerForm = document.getElementById('dinnerForm');
if (dinnerForm) {
  dinnerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const personen = document.getElementById('abendPersonen').value;
    const checked = [...dinnerForm.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
    const wunsch = document.getElementById('abendWunsch').value.trim();
    let text = `Hallo Hans und Laura,\n\nwir möchten ein regionales Abendessen bei Zuhause am Bach für ${personen} Person(en) vorbestellen.\n\nGewünscht: ${checked.join(', ') || 'bitte nach Absprache'}.`;
    if (wunsch) text += `\n\nWunsch/Uhrzeit/Besonderheiten: ${wunsch}`;
    text += `\n\nLiebe Grüße`;
    window.location.href = smsHref(text);
  });
}

const luggageForm = document.getElementById('luggageForm');
if (luggageForm) {
  luggageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const von = document.getElementById('gepaeckVon').value.trim();
    const vonAdresse = document.getElementById('gepaeckVonAdresse').value.trim();
    const nach = document.getElementById('gepaeckNach').value.trim();
    const nachAdresse = document.getElementById('gepaeckNachAdresse').value.trim();
    const zeit = document.getElementById('gepaeckZeit').value.trim();
    const anzahl = document.getElementById('gepaeckAnzahl').value;
    const name = document.getElementById('gepaeckName').value.trim();
    let text = `Hallo Hans und Laura,\n\nich möchte Gepäcktransport buchen.\n\nVon / Abholort: ${von || 'bitte eintragen'}\nAbholadresse: ${vonAdresse || 'bitte eintragen'}\n\nNach / Zielort: ${nach || 'bitte eintragen'}\nZieladresse: ${nachAdresse || 'bitte eintragen'}\n\nGewünschte Zeit: ${zeit || 'bitte eintragen'}\nAnzahl Gepäckstücke: ${anzahl}\nName/Telefon: ${name || 'bitte eintragen'}\n\nPreis laut App: 15 € pro Zimmer und Etappe.\n\nLiebe Grüße`;
    window.location.href = smsHref(text);
  });
}

bindWhatsAppLocationButtons();


// V6.1 Live-Wetter über Open-Meteo, ohne API-Key
function weatherCodeText(code){
  const map = {
    0:'Klar',1:'Überwiegend klar',2:'Teilweise bewölkt',3:'Bewölkt',
    45:'Nebel',48:'Reifnebel',51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',
    61:'Leichter Regen',63:'Regen',65:'Starker Regen',71:'Leichter Schnee',73:'Schnee',75:'Starker Schnee',
    80:'Leichte Schauer',81:'Schauer',82:'Starke Schauer',95:'Gewitter',96:'Gewitter mit Hagel',99:'Starkes Gewitter mit Hagel'
  };
  return map[code] || 'Wetterlage';
}

function renderWeather(data){
  const current = data.current || {};
  const daily = data.daily || {};
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  const rain = current.rain ?? 0;
  const code = current.weather_code;
  const max = daily.temperature_2m_max?.[0];
  const min = daily.temperature_2m_min?.[0];
  const precip = daily.precipitation_sum?.[0];

  const status = document.getElementById('weatherStatus');
  const grid = document.getElementById('weatherGrid');
  if (!status || !grid) return;

  status.textContent = `Aktuell: ${weatherCodeText(code)}. Stand: ${current.time ? current.time.replace('T',' ') : 'jetzt'}`;
  grid.innerHTML = `
    <div class="weatheritem"><b>Temperatur</b><span>${temp ?? '–'} °C</span></div>
    <div class="weatheritem"><b>Wind</b><span>${wind ?? '–'} km/h</span></div>
    <div class="weatheritem"><b>Regen jetzt</b><span>${rain ?? '–'} mm</span></div>
    <div class="weatheritem"><b>Heute</b><span>${min ?? '–'} / ${max ?? '–'} °C</span></div>
    <div class="weatheritem"><b>Regen gesamt</b><span>${precip ?? '–'} mm</span></div>
    <div class="weatheritem"><b>Warnlogik</b><span>${(precip || 0) > 5 ? 'Regenjacke' : 'normal prüfen'}</span></div>
  `;
}

function loadWeather(){
  const status = document.getElementById('weatherStatus');
  if (status) status.textContent = 'Wetter wird geladen …';
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=48.2937&longitude=15.3960&current=temperature_2m,rain,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FVienna&forecast_days=1';
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Wetterdienst nicht erreichbar');
      return r.json();
    })
    .then(renderWeather)
    .catch(() => {
      const status = document.getElementById('weatherStatus');
      if (status) status.textContent = 'Live-Wetter konnte nicht geladen werden. Bitte Wetter-Link öffnen oder später neu laden.';
    });
}

const reloadWeather = document.getElementById('reloadWeather');
if (reloadWeather) reloadWeather.addEventListener('click', loadWeather);
loadWeather();



// V6.2 Browser-Selbsttest
function runSelfTest(){
  const checks = [
    ['Frühstück Express Button', !!document.getElementById('waBreakfastExpress')],
    ['Wetterbereich', !!document.getElementById('weatherLive')],
    ['Wanderassistent', document.querySelectorAll('.tourchoice').length >= 5],
    ['Radassistent', document.querySelectorAll('.bikechoice').length >= 4],
    ['Notfall/Standort Buttons', !!document.getElementById('waLocationCard')],
    ['Gepäckformular', !!document.getElementById('luggageForm')],
    ['Bewertungsbereich', !!document.getElementById('bewertung')],
    ['Windis-Kinderbereich', !!document.getElementById('kinderbereich')],
    ['Service Worker Unterstützung', 'serviceWorker' in navigator],
    ['Fetch Unterstützung für Live-Wetter', 'fetch' in window]
  ];
  const failed = checks.filter(c => !c[1]);
  const box = document.getElementById('selfTestResult');
  if (!box) return;
  box.classList.remove('ok','fail');
  box.classList.add(failed.length ? 'fail' : 'ok');
  box.textContent = failed.length
    ? 'Fehler gefunden:\n' + failed.map(f => '• ' + f[0]).join('\n')
    : 'Alles Wesentliche geladen:\n' + checks.map(c => '✓ ' + c[0]).join('\n');
}

const selfTestBtn = document.getElementById('runSelfTest');
if (selfTestBtn) selfTestBtn.addEventListener('click', runSelfTest);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}


// V6.0 Interaktive Assistenten
const v6State = {
  breakfastType: 'Standard-Frühstück',
  breakfastTime: '08:00 Uhr',
  breakfastPeople: '2 Personen'
};

document.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    v6State[group] = btn.dataset.value;
    document.querySelectorAll(`.choice[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

const breakfastBtn = document.getElementById('waBreakfastExpress');
if (breakfastBtn) {
  breakfastBtn.addEventListener('click', () => {
    const text = `Hallo Hans und Laura,

wir möchten für morgen Frühstück bestellen.

Art: ${v6State.breakfastType}
Zeit: ${v6State.breakfastTime}
Personen: ${v6State.breakfastPeople}

Besondere Wünsche:
_____

Liebe Grüße`;
    openWhatsApp(text);
  });
}

const tourTexts = {
  short: `🌿 Kleine Runde ab Zuhause am Bach

Empfehlung:
• Bach und Ort erkunden
• Donauufer / ruhige Abendrunde
• ideal nach Anreise oder bei wenig Zeit

Dauer: ca. 30–90 Minuten je nach Variante.
Mitnehmen: Handy, Licht bei Dämmerung, etwas Wasser.
Pias Kommentar: Kurz heißt nicht langweilig. Kurz heißt: rechtzeitig wieder da.`,

  medium: `🥾 Halbtageswanderung rund um Aggsbach Markt

Empfehlung:
• Richtung Maria Langegg / Jauerling-Umfeld
• Wald, Aussicht, Wachau-Gefühl
• nur bei passendem Wetter und gutem Schuhwerk

Dauer: grob 3–4 Stunden je nach Route.
Vorher prüfen: Wetter, Rückweg, Wasser.
Wichtig: Nicht blind los. Die Wachau schaut lieb aus, hat aber Höhenmeter.`,

  day: `⛰️ Welterbesteig-Etappe Aggsbach Markt → Emmersdorf

Offizielle Eckdaten:
• ca. 14,74 km
• ca. 5:00 h
• Schwierigkeit: mittel
• ca. 547 hm Aufstieg / 544 hm Abstieg
• Start: Aggsbach Markt, Marktplatz
• Ziel: Emmersdorf, Marktstraße

Vorher prüfen: Wetter, Wasser, Rückweg, Wachaubahn/Bus/Fähren.
Pias Kommentar: Wer groß geht, soll klug starten.`,

  kids: `🎒 Kinderfreundliche Entdeckerrunde

Aufgabe:
• Findet die Donau
• Findet eine Blume
• Findet einen Marillenbaum
• Findet einen schönen Stein
• Macht ein Windis-Foto

Dauer: 30–60 Minuten.
Ziel: Freude statt Gewaltmarsch.`,

  dog: `🐕 Mit Hund unterwegs

Empfehlung:
• kurze kühle Strecken
• Schatten und Wasser planen
• heißen Asphalt vermeiden
• Leine und Rücksicht selbstverständlich

Wichtig: Bei Hitze lieber Abendrunde statt Tagesmarsch.
Pia sagt: Ein Hund braucht keinen Rekord. Er braucht Wasser.`
};

document.querySelectorAll('.tourchoice').forEach(btn => {
  btn.addEventListener('click', () => {
    const box = document.getElementById('tourResult');
    if (box) box.textContent = tourTexts[btn.dataset.tour] || 'Keine Empfehlung gefunden.';
  });
});

const bikeTexts = {
  melk: `🏛️ Richtung Melk

Gut für:
• Stift Melk
• Bahnhof Melk
• feste Donauquerung über die Brücke
• Rückfahrt/Weiterreise

Tipp: Wenn Fähren unsicher sind, ist Melk oft die solidere Planung.`,

  spitz: `🍇 Richtung Spitz

Gut für:
• Weinorte
• Donaupanorama
• Fähre Spitz–Arnsdorf
• Genussradeln

Vorher prüfen: Fährbetrieb und Rückweg.
Tipp: Fotopausen einplanen. Die Wachau drängelt nicht.`,

  duernstein: `🏰 Richtung Dürnstein

Gut für:
• Klassiker der Wachau
• Altstadt und Ruine
• starke Fotos

Vorher prüfen: Hitze, Verkehr, Rückfahrt.
Tipp: Früh losfahren. Dürnstein ist schön, aber selten menschenleer.`,

  krems: `🏙️ Richtung Krems

Gut für:
• längere Radtour
• Bahnhof
• Altstadt
• Rückreise mit Öffis

Vorher prüfen: Kondition, Windrichtung, Bahn/Bus.
Tipp: Bei Gegenwind wird aus Romantik schnell Arbeit.`
};

document.querySelectorAll('.bikechoice').forEach(btn => {
  btn.addEventListener('click', () => {
    const box = document.getElementById('bikeResult');
    if (box) box.textContent = bikeTexts[btn.dataset.bike] || 'Kein Ziel gefunden.';
  });
});

const quiz = [
  'Frage: Wofür ist die Wachau besonders bekannt? Antwort: Marillen, Wein, Donau und schöne Wege.',
  'Frage: Wer trägt bei den Windis ein rotes Halstuch? Antwort: Pia.',
  'Frage: Was sollte man vor einer Wanderung prüfen? Antwort: Wetter, Wasser, Route und Rückweg.',
  'Frage: Welcher Fluss prägt die Wachau? Antwort: Die Donau.'
];
const quizBtn = document.getElementById('quizBtn');
if (quizBtn) {
  quizBtn.addEventListener('click', () => {
    const box = document.getElementById('quizText');
    const item = quiz[Math.floor(Math.random() * quiz.length)];
    if (box) box.textContent = item;
  });
}



// V7.1 robuste Funktions-Fixes
function setBox(id, text){
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
document.querySelectorAll('.js-tour').forEach(btn => {
  btn.addEventListener('click', () => setBox('fixedTourResult', btn.dataset.result || 'Keine Empfehlung hinterlegt.'));
});
document.querySelectorAll('.js-bike').forEach(btn => {
  btn.addEventListener('click', () => setBox('fixedBikeResult', btn.dataset.result || 'Kein Ziel hinterlegt.'));
});
document.querySelectorAll('.js-kid').forEach(btn => {
  btn.addEventListener('click', () => setBox('fixedKidResult', btn.dataset.result || 'Keine Aufgabe hinterlegt.'));
});
const fixedWeatherAdvice = document.getElementById('fixedWeatherAdvice');
if (fixedWeatherAdvice) {
  fixedWeatherAdvice.addEventListener('click', () => {
    setBox('fixedWeatherResult',
      'Wetter-Regel für Gäste:\n\n' +
      '☀️ trocken: Welterbesteig oder Donauradweg möglich.\n' +
      '🌦️ wechselhaft: kleine Runde, Wachaubahn, Spitz oder Melk planen.\n' +
      '🌧️ Regen: Stift Melk, Kartause Aggsbach, Museum, Heuriger oder Donauschlössel Spitz.\n' +
      '⛈️ Gewitter: keine Wald-/Höhenwege, zuerst Sicherheit.'
    );
  });
}



// V7.2 Mehrsprachigkeit und robuste Klickfunktionen
document.addEventListener('DOMContentLoaded', function(){
  const translations = {
    de: {
      quickTitle:'✅ Funktionierende Schnellassistenten',
      quickIntro:'Wählt eine Tour, Radtour, Wetterhilfe oder Kinderaktion. Das Ergebnis erscheint sofort darunter.',
      walkTitle:'🥾 Welche Wanderung passt heute?',
      chooseWalk:'Bitte eine Wanderart auswählen.',
      bikeTitle:'🚲 Donauradweg-Assistent',
      chooseBike:'Bitte ein Radziel auswählen.',
      weatherHelpTitle:'🌦️ Wetterhilfe',
      weatherHelpIntro:'Wenn das Live-Wetter nicht lädt: über GitHub Pages öffnen oder den externen Wetterlink nutzen.',
      weatherAdviceBtn:'🌦️ Wetter-Hinweis anzeigen',
      weatherExternal:'Externes Wetter öffnen',
      weatherNoAdvice:'Noch kein Hinweis angezeigt.',
      kidsTitle:'🐾 Windis-Kinderbereich',
      chooseKid:'Bitte Quiz, Schatzsuche oder Vorlese-Moment auswählen.',
      bookingTitle:'🛏️ Zimmer über Booking.com buchen',
      bookingIntro:'Direkt zum Booking-Angebot von Zuhause am Bach – Wachau Privatzimmer.',
      bookingBtn:'Jetzt über Booking öffnen',
      walkShort:'🌿 Kleine Runde ab Zuhause am Bach\n\nDauer: 30–90 Minuten.\nIdeal: nach Anreise, mit Kindern oder bei unsicherem Wetter.\nRoute: Bach – Ort – Donauufer – zurück.\nPia sagt: Kurz heißt nicht langweilig.',
      walkMedium:'🥾 Halbtagesrunde Richtung Maria Langegg / Jauerling\n\nDauer: ca. 3–4 Stunden je nach Variante.\nIdeal: Wald, Aussicht und Wachau-Gefühl.\nWichtig: Wasser, gutes Schuhwerk, Wetter und Rückweg prüfen.',
      walkDay:'⛰️ Welterbesteig Aggsbach Markt → Emmersdorf\n\nOffizielle Eckdaten: ca. 14,74 km, ca. 5 Stunden, mittel.\nWichtig: früh starten, Wetter prüfen, Rückfahrt klären.\nFür fitte Wanderer.',
      walkKids:'🎒 Mit Kindern\n\nEmpfehlung: kurze Entdeckerrunde.\nAufgabe: Donau, Blume, Marillenbaum, Zug und schönen Stein finden.\nZiel: Spaß statt Gewaltmarsch.',
      walkDog:'🐕 Mit Hund\n\nEmpfehlung: kühl, schattig und nicht zu lang.\nWasser mitnehmen, heißen Asphalt vermeiden, Pausen einplanen.\nPia sagt: Ein Hund braucht keinen Rekord, sondern Wasser.',
      bikeMelk:'🏛️ Richtung Melk\n\nGut für Stift Melk, Bahnhof Melk und feste Donauquerung.\nEmpfehlung bei unsicherem Fährbetrieb.',
      bikeSpitz:'🍇 Richtung Spitz\n\nGut für Weinorte, Donaupanorama und Fähre Spitz–Arnsdorf.\nVorher Fährbetrieb prüfen.',
      bikeDuernstein:'🏰 Richtung Dürnstein\n\nDer Wachau-Klassiker: Altstadt, Ruine, Fotos.\nFrüh starten, weil es dort voll werden kann.',
      bikeKrems:'🏙️ Richtung Krems\n\nLängere Tour mit Altstadt und Bahnhof.\nWindrichtung und Rücktransport prüfen.',
      weatherAdvice:'Wetter-Regel für Gäste:\n\n☀️ trocken: Welterbesteig oder Donauradweg möglich.\n🌦️ wechselhaft: kleine Runde, Wachaubahn, Spitz oder Melk planen.\n🌧️ Regen: Stift Melk, Kartause Aggsbach, Museum, Heuriger oder Donauschlössel Spitz.\n⛈️ Gewitter: keine Wald- oder Höhenwege. Sicherheit zuerst.',
      kidQuiz1:'Quizfrage 1: Was wächst in der Wachau besonders berühmt?\n\nAntwort: Marillen und Wein.',
      kidQuiz2:'Quizfrage 2: Welcher Fluss fließt durch die Wachau?\n\nAntwort: Die Donau.',
      kidTreasure:'Schatzsuche:\nFindet heute fünf Dinge: Donau, Zug, Marillenbaum, Blume und Stein in Herzform.',
      kidStory:'Vorlese-Moment:\nPia will losrennen, Fidel liest zuerst den Fahrplan, Gloria packt Wasser ein. Und genau deshalb kommen am Ende alle gut an.'
    },
    en: {
      quickTitle:'✅ Working quick assistants',
      quickIntro:'Choose a walk, bike trip, weather tip or kids activity. The result appears immediately below.',
      walkTitle:'🥾 Which walk fits today?',
      chooseWalk:'Please choose a walking option.',
      bikeTitle:'🚲 Danube Cycle Path assistant',
      chooseBike:'Please choose a cycling destination.',
      weatherHelpTitle:'🌦️ Weather help',
      weatherHelpIntro:'If live weather does not load, open the app via GitHub Pages or use the external weather link.',
      weatherAdviceBtn:'🌦️ Show weather advice',
      weatherExternal:'Open external weather',
      weatherNoAdvice:'No advice shown yet.',
      kidsTitle:'🐾 Windis kids area',
      chooseKid:'Please choose quiz, treasure hunt or story moment.',
      bookingTitle:'🛏️ Book the room via Booking.com',
      bookingIntro:'Directly open the Booking listing of Zuhause am Bach – Wachau private room.',
      bookingBtn:'Open Booking now',
      walkShort:'🌿 Short walk from Zuhause am Bach\n\nDuration: 30–90 minutes.\nIdeal after arrival, with children or in uncertain weather.\nRoute: stream – village – Danube bank – back.',
      walkMedium:'🥾 Half-day walk towards Maria Langegg / Jauerling\n\nDuration: about 3–4 hours depending on route.\nIdeal for forest, views and Wachau feeling.\nCheck water, shoes, weather and return route.',
      walkDay:'⛰️ World Heritage Trail Aggsbach Markt → Emmersdorf\n\nAbout 14.74 km, around 5 hours, medium difficulty.\nStart early, check weather and return transport.',
      walkKids:'🎒 With children\n\nRecommendation: short discovery walk.\nTask: find the Danube, a flower, an apricot tree, a train and a beautiful stone.',
      walkDog:'🐕 With dog\n\nChoose cool, shady and shorter routes.\nBring water, avoid hot asphalt and plan breaks.',
      bikeMelk:'🏛️ Towards Melk\n\nGood for Melk Abbey, Melk station and a fixed Danube crossing.',
      bikeSpitz:'🍇 Towards Spitz\n\nGood for wine villages, Danube views and the Spitz–Arnsdorf ferry. Check ferry service first.',
      bikeDuernstein:'🏰 Towards Dürnstein\n\nThe Wachau classic: old town, castle ruins, photos. Start early.',
      bikeKrems:'🏙️ Towards Krems\n\nLonger ride with old town and train station. Check wind direction and return transport.',
      weatherAdvice:'Weather rule:\n\n☀️ dry: trail or Danube Cycle Path possible.\n🌦️ changeable: short walk, Wachau railway, Spitz or Melk.\n🌧️ rain: Melk Abbey, Aggsbach Charterhouse, museum, wine tavern or Donauschlössel Spitz.\n⛈️ thunderstorm: no forest or ridge walks. Safety first.',
      kidQuiz1:'Quiz 1: What is the Wachau famous for?\n\nAnswer: apricots and wine.',
      kidQuiz2:'Quiz 2: Which river flows through the Wachau?\n\nAnswer: the Danube.',
      kidTreasure:'Treasure hunt:\nFind five things: Danube, train, apricot tree, flower and a heart-shaped stone.',
      kidStory:'Story moment:\nPia wants to run, Fidel reads the timetable first, Gloria packs water. That is why everyone arrives safely.'
    },
    cs: {
      quickTitle:'✅ Rychlí pomocníci',
      quickIntro:'Vyberte procházku, cyklovýlet, počasí nebo dětskou aktivitu.',
      walkTitle:'🥾 Jaká túra se hodí dnes?',
      chooseWalk:'Vyberte typ procházky.',
      bikeTitle:'🚲 Asistent Dunajské cyklostezky',
      chooseBike:'Vyberte cíl pro kolo.',
      weatherHelpTitle:'🌦️ Pomoc s počasím',
      weatherHelpIntro:'Když se živé počasí nenačte, otevřete aplikaci přes GitHub Pages nebo externí odkaz.',
      weatherAdviceBtn:'🌦️ Zobrazit doporučení',
      weatherExternal:'Otevřít počasí',
      weatherNoAdvice:'Zatím bez doporučení.',
      kidsTitle:'🐾 Dětská zóna Windis',
      chooseKid:'Vyberte kvíz, hledání pokladu nebo příběh.',
      bookingTitle:'🛏️ Rezervovat pokoj přes Booking.com',
      bookingIntro:'Přímý odkaz na nabídku Zuhause am Bach.',
      bookingBtn:'Otevřít Booking',
      walkShort:'🌿 Krátká procházka\n\n30–90 minut. Ideální po příjezdu nebo s dětmi.',
      walkMedium:'🥾 Půldenní túra\n\nAsi 3–4 hodiny. Les, výhledy a Wachau. Zkontrolujte počasí a návrat.',
      walkDay:'⛰️ Welterbesteig Aggsbach Markt → Emmersdorf\n\nAsi 14,74 km, 5 hodin, střední obtížnost. Začněte brzy.',
      walkKids:'🎒 S dětmi\n\nNajděte Dunaj, květinu, meruňkový strom, vlak a hezký kámen.',
      walkDog:'🐕 Se psem\n\nKrátká, chladná a stinná trasa. Vezměte vodu.',
      bikeMelk:'🏛️ Směr Melk\n\nKlášter Melk, nádraží a pevný přechod přes Dunaj.',
      bikeSpitz:'🍇 Směr Spitz\n\nVíno, Dunaj a přívoz Spitz–Arnsdorf. Zkontrolujte provoz.',
      bikeDuernstein:'🏰 Směr Dürnstein\n\nKlasika Wachau: město, zřícenina, fotografie.',
      bikeKrems:'🏙️ Směr Krems\n\nDelší trasa, staré město a nádraží.',
      weatherAdvice:'Počasí:\n\n☀️ sucho: turistika/kolo.\n🌦️ proměnlivo: krátká trasa nebo Wachaubahn.\n🌧️ déšť: Melk, muzeum, heuriger nebo Donauschlössel Spitz.\n⛈️ bouřka: nechoďte do lesa ani na hřeben.',
      kidQuiz1:'Kvíz: Čím je Wachau známá?\n\nOdpověď: meruňky a víno.',
      kidQuiz2:'Kvíz: Která řeka protéká Wachau?\n\nOdpověď: Dunaj.',
      kidTreasure:'Hledání pokladu: Dunaj, vlak, meruňkový strom, květina, kámen ve tvaru srdce.',
      kidStory:'Příběh: Pia chce běžet, Fidel čte jízdní řád, Gloria bere vodu.'
    },
    hu: {
      quickTitle:'✅ Gyors segítők',
      quickIntro:'Válasszon túrát, kerékpártúrát, időjárási tanácsot vagy gyerekprogramot.',
      walkTitle:'🥾 Melyik séta jó ma?',
      chooseWalk:'Válasszon séta típust.',
      bikeTitle:'🚲 Duna-kerékpárút segítő',
      chooseBike:'Válasszon kerékpáros célt.',
      weatherHelpTitle:'🌦️ Időjárási segítség',
      weatherAdviceBtn:'🌦️ Tanács mutatása',
      weatherExternal:'Külső időjárás megnyitása',
      weatherNoAdvice:'Még nincs tanács.',
      kidsTitle:'🐾 Windis gyerekrész',
      chooseKid:'Válasszon kvízt, kincskeresést vagy mesét.',
      bookingTitle:'🛏️ Szoba foglalása Booking.com-on',
      bookingIntro:'Közvetlen link a Zuhause am Bach ajánlatához.',
      bookingBtn:'Booking megnyitása',
      weatherHelpIntro:'Ha az élő időjárás nem tölt be, nyissa meg GitHub Pages-en vagy külső linken.',
      walkShort:'🌿 Rövid séta\n\n30–90 perc. Ideális érkezés után vagy gyerekekkel.',
      walkMedium:'🥾 Félnapos séta\n\nKb. 3–4 óra. Erdő, kilátás, Wachau-hangulat.',
      walkDay:'⛰️ Aggsbach Markt → Emmersdorf\n\nKb. 14,74 km, 5 óra, közepes. Induljon korán.',
      walkKids:'🎒 Gyerekekkel\n\nKeressétek meg: Duna, virág, barackfa, vonat, szép kő.',
      walkDog:'🐕 Kutyával\n\nHűvös, árnyékos, rövidebb út. Vizet vinni.',
      bikeMelk:'🏛️ Melk felé\n\nApátság, vasútállomás, biztos Duna-átkelés.',
      bikeSpitz:'🍇 Spitz felé\n\nBorvidék, Duna, komp. Előtte ellenőrizni.',
      bikeDuernstein:'🏰 Dürnstein felé\n\nWachau klasszikus: óváros, rom, fotók.',
      bikeKrems:'🏙️ Krems felé\n\nHosszabb túra, óváros, vasútállomás.',
      weatherAdvice:'Időjárás:\n\n☀️ száraz: túra vagy bringa.\n🌦️ változékony: rövid séta/Wachaubahn.\n🌧️ eső: Melk, múzeum, Heuriger vagy Donauschlössel Spitz.\n⛈️ zivatar: ne menjen erdőbe vagy magaslatra.',
      kidQuiz1:'Kvíz: Miről híres Wachau?\n\nVálasz: sárgabarack és bor.',
      kidQuiz2:'Kvíz: Melyik folyó folyik Wachau-n át?\n\nVálasz: a Duna.',
      kidTreasure:'Kincskeresés: Duna, vonat, barackfa, virág, szív alakú kő.',
      kidStory:'Mese: Pia futna, Fidel menetrendet olvas, Gloria vizet csomagol.'
    },
    es: {
      quickTitle:'✅ Asistentes rápidos',
      quickIntro:'Elige caminata, ruta en bici, consejo del tiempo o actividad infantil.',
      walkTitle:'🥾 ¿Qué caminata va bien hoy?',
      chooseWalk:'Elige una opción de caminata.',
      bikeTitle:'🚲 Asistente de la ruta ciclista del Danubio',
      chooseBike:'Elige un destino en bici.',
      weatherHelpTitle:'🌦️ Ayuda meteorológica',
      weatherHelpIntro:'Si el tiempo en vivo no carga, abre la app por GitHub Pages o usa el enlace externo.',
      weatherAdviceBtn:'🌦️ Mostrar consejo',
      weatherExternal:'Abrir tiempo externo',
      weatherNoAdvice:'Aún no hay consejo.',
      kidsTitle:'🐾 Zona infantil Windis',
      chooseKid:'Elige quiz, búsqueda del tesoro o cuento.',
      bookingTitle:'🛏️ Reservar habitación en Booking.com',
      bookingIntro:'Enlace directo al alojamiento Zuhause am Bach.',
      bookingBtn:'Abrir Booking',
      walkShort:'🌿 Paseo corto\n\n30–90 minutos. Ideal tras la llegada, con niños o con tiempo incierto.',
      walkMedium:'🥾 Media jornada\n\n3–4 horas aprox. Bosque, vistas y ambiente Wachau.',
      walkDay:'⛰️ Aggsbach Markt → Emmersdorf\n\n14,74 km aprox., 5 horas, dificultad media. Salir temprano.',
      walkKids:'🎒 Con niños\n\nEncontrad: Danubio, flor, albaricoquero, tren y una piedra bonita.',
      walkDog:'🐕 Con perro\n\nRuta fresca, con sombra y no demasiado larga. Llevar agua.',
      bikeMelk:'🏛️ Hacia Melk\n\nAbadía, estación y cruce fijo del Danubio.',
      bikeSpitz:'🍇 Hacia Spitz\n\nVino, Danubio y ferry Spitz–Arnsdorf. Comprobar antes.',
      bikeDuernstein:'🏰 Hacia Dürnstein\n\nClásico de Wachau: casco antiguo, ruina y fotos.',
      bikeKrems:'🏙️ Hacia Krems\n\nRuta más larga, casco antiguo y estación.',
      weatherAdvice:'Regla del tiempo:\n\n☀️ seco: caminar o bici.\n🌦️ variable: paseo corto o Wachaubahn.\n🌧️ lluvia: Melk, museo, heuriger o Donauschlössel Spitz.\n⛈️ tormenta: evitar bosque y alturas.',
      kidQuiz1:'Quiz: ¿Por qué es famosa la Wachau?\n\nRespuesta: albaricoques y vino.',
      kidQuiz2:'Quiz: ¿Qué río pasa por la Wachau?\n\nRespuesta: el Danubio.',
      kidTreasure:'Búsqueda: Danubio, tren, albaricoquero, flor y piedra con forma de corazón.',
      kidStory:'Cuento: Pia quiere correr, Fidel lee el horario y Gloria lleva agua.'
    },
    fr: {
      quickTitle:'✅ Assistants rapides',
      quickIntro:'Choisissez une promenade, une sortie vélo, un conseil météo ou une activité enfants.',
      walkTitle:'🥾 Quelle promenade convient aujourd’hui ?',
      chooseWalk:'Veuillez choisir une option de promenade.',
      bikeTitle:'🚲 Assistant piste cyclable du Danube',
      chooseBike:'Veuillez choisir une destination à vélo.',
      weatherHelpTitle:'🌦️ Aide météo',
      weatherHelpIntro:'Si la météo en direct ne charge pas, ouvrez l’application via GitHub Pages ou le lien externe.',
      weatherAdviceBtn:'🌦️ Afficher le conseil',
      weatherExternal:'Ouvrir la météo externe',
      weatherNoAdvice:'Aucun conseil affiché.',
      kidsTitle:'🐾 Espace enfants Windis',
      chooseKid:'Choisissez quiz, chasse au trésor ou histoire.',
      bookingTitle:'🛏️ Réserver la chambre sur Booking.com',
      bookingIntro:'Lien direct vers Zuhause am Bach.',
      bookingBtn:'Ouvrir Booking',
      walkShort:'🌿 Petite promenade\n\n30–90 minutes. Idéal après l’arrivée, avec enfants ou météo incertaine.',
      walkMedium:'🥾 Demi-journée\n\nEnviron 3–4 heures. Forêt, vues et ambiance Wachau.',
      walkDay:'⛰️ Aggsbach Markt → Emmersdorf\n\nEnviron 14,74 km, 5 heures, difficulté moyenne. Partir tôt.',
      walkKids:'🎒 Avec enfants\n\nTrouvez : Danube, fleur, abricotier, train et jolie pierre.',
      walkDog:'🐕 Avec chien\n\nParcours frais, ombragé, pas trop long. Emporter de l’eau.',
      bikeMelk:'🏛️ Vers Melk\n\nAbbaye, gare et traversée fixe du Danube.',
      bikeSpitz:'🍇 Vers Spitz\n\nVin, Danube et bac Spitz–Arnsdorf. Vérifier avant.',
      bikeDuernstein:'🏰 Vers Dürnstein\n\nClassique de la Wachau : vieille ville, ruine, photos.',
      bikeKrems:'🏙️ Vers Krems\n\nTrajet plus long, vieille ville et gare.',
      weatherAdvice:'Règle météo:\n\n☀️ sec: randonnée ou vélo.\n🌦️ variable: courte promenade ou Wachaubahn.\n🌧️ pluie: Melk, musée, heuriger ou Donauschlössel Spitz.\n⛈️ orage: éviter forêt et hauteurs.',
      kidQuiz1:'Quiz : pourquoi la Wachau est-elle célèbre ?\n\nRéponse : abricots et vin.',
      kidQuiz2:'Quiz : quel fleuve traverse la Wachau ?\n\nRéponse : le Danube.',
      kidTreasure:'Chasse : Danube, train, abricotier, fleur et pierre en forme de cœur.',
      kidStory:'Histoire : Pia veut courir, Fidel lit l’horaire, Gloria prend de l’eau.'
    }
  };

  let currentLang = localStorage.getItem('zab_lang') || 'de';

  function t(key){
    return (translations[currentLang] && translations[currentLang][key]) || translations.de[key] || key;
  }

  function applyLanguage(lang){
    currentLang = lang;
    localStorage.setItem('zab_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('.langbtn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.documentElement.lang = lang === 'cs' ? 'cs' : lang;
  }

  document.querySelectorAll('.langbtn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });

  function setResult(id, text){
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  document.body.addEventListener('click', function(ev){
    const tour = ev.target.closest('.js-tour');
    if (tour) {
      setResult('fixedTourResult', t(tour.dataset.resultKey));
      return;
    }
    const bike = ev.target.closest('.js-bike');
    if (bike) {
      setResult('fixedBikeResult', t(bike.dataset.resultKey));
      return;
    }
    const kid = ev.target.closest('.js-kid');
    if (kid) {
      setResult('fixedKidResult', t(kid.dataset.resultKey));
      return;
    }
    if (ev.target.closest('#fixedWeatherAdvice')) {
      setResult('fixedWeatherResult', t('weatherAdvice'));
      return;
    }
  });

  applyLanguage(currentLang);

  // Funktionstest in der Konsole
  console.log('Zuhause am Bach V7.2 geladen: Sprache + Schnellassistenten aktiv.');
});



// V7.3 Cache-Hilfe
const clearAppCache = document.getElementById('clearAppCache');
if (clearAppCache) {
  clearAppCache.addEventListener('click', async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
      }
      if ('caches' in window) {
        const names = await caches.keys();
        for (const name of names) await caches.delete(name);
      }
    } catch(e) {}
    location.reload(true);
  });
}
