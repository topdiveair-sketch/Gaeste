/* Zuhause am Bach Gäste-App – Version 14.4 MULTILINGUAL FIX
   Google-Maps-Routen mit passendem Modus: Fußgänger oder Fahrrad.
   Tourenberater/Morgen-Assistent mit sichtbarer Rückmeldung und Kartenanzeige.
*/
(() => {
  'use strict';

  const APP_VERSION = '14.4 MULTILINGUAL FIX';
  const APP_BUILD = '2026-06-15';
  const PHONE = '436646437526';
  const ADDRESS = 'Aggsbach Markt 82, 3641 Aggsbach Markt';
  const WEATHER_URL = days => `https://api.open-meteo.com/v1/forecast?latitude=48.2937&longitude=15.3960&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Europe%2FVienna&forecast_days=${days}`;

  function mapsDir(destination, mode = 'walking', waypoints = '') {
    const base = 'https://www.google.com/maps/dir/?api=1';
    const params = new URLSearchParams({
      origin: ADDRESS,
      destination,
      travelmode: mode
    });
    if (waypoints) params.set('waypoints', waypoints);
    return `${base}&${params.toString()}`;
  }

  function mapsSearch(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

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


  // Erweiterte Mehrsprachigkeit V14.4: statische UI + dynamische Routen-Ausgaben.
  const STATIC_UI = {
    en: {
      '.languagebar b':'🌐 Language', '.kicker':'Zuhause am Bach · Aggsbach Markt · V14.4 Multilingual Fix',
      '#windis-start h2':'🐾 The Wild Wachau Windis guide you through the Wachau',
      '#windis-start > p':'Instead of an ordinary guest folder, you get three personal Wachau companions: Fidel for hiking, Gloria for enjoyment and Pia for adventures.',
      '#windis-start article:nth-of-type(1) h3':'🐾 Fidel’s hiking world', '#windis-start article:nth-of-type(1) p':'Checked north-bank routes from Aggsbach Markt: Donau-Bach loop, Maria Langegg/Jauerling, Welterbesteig towards Emmersdorf, Spitz with Rotes Tor and Hinterhaus ruins.', '#windis-start article:nth-of-type(1) a':'Open hikes',
      '#windis-start article:nth-of-type(2) h3':'🍷 Gloria’s world of enjoyment', '#windis-start article:nth-of-type(2) p':'Donauschlössel / Familie Graben-Gritsch in Spitz remains a fixed food and wine tip. Plus wine taverns, wine, apricots and evening snacks.', '#windis-start article:nth-of-type(2) a':'Open enjoyment tips',
      '#windis-start article:nth-of-type(3) h3':'🎀 Pia’s adventure world', '#windis-start article:nth-of-type(3) p':'Archery in Aggsbach Markt, treasure hunt, Windis quiz, Venus of Willendorf and small discoveries around the north bank.', '#windis-start article:nth-of-type(3) a':'Open adventures',
      '#windis-start article:nth-of-type(4) h3':'⚠️ River-bank rule', '#windis-start article:nth-of-type(4) p':'Aggsbach Markt is on the north bank. South-bank sights such as Aggstein are not recommended as direct hikes, only with ferry, transfer or detour.', '#windis-start article:nth-of-type(4) a':'View rule',
      '#heute article:nth-of-type(1) h3':'🌦️ Weather in Aggsbach Markt', '#reloadWeather':'Reload weather', '#heute article:nth-of-type(4) h3':'🚂⛴️ Wachau Railway & ferries', '#heute article:nth-of-type(4) p':'Check directly before starting.',
      '#morgen article:nth-of-type(1) h3':'🌦️ Weather tomorrow', '#reloadTomorrowWeather':'Reload tomorrow’s weather', '#morgen article:nth-of-type(2) h3':'☕ Breakfast tomorrow', '#breakfastWhatsApp':'☕ Breakfast via WhatsApp', '#morgen article:nth-of-type(3) h3':'🥾 Choose tomorrow’s tour',
      '#morgen article:nth-of-type(4) h3':'🎒 Luggage transfer', '#morgen article:nth-of-type(4) p':'For Welterbesteig guests, please state destination address and time.', '#luggageWhatsApp':'🎒 Request luggage transfer',
      '#berater h2':'🐾 Fidel-Gloria-Pia tour advisor', '#berater > p':'The quick 3-click assistant: choose time, company and weather – then the app recommends the right Wachau tour.', '#berater article:nth-of-type(1) h3':'⏱️ Time', '#berater article:nth-of-type(2) h3':'👣 Company', '#berater article:nth-of-type(3) h3':'🌦️ Weather', '#advisorStart':'🐾 Show recommendation',
      '#ultra-planer h2':'🚀 Ultra day planner', '#ultra-planer > p':'One assistant for the whole day: hiking, cycling, family programme or rain plan – with packing list and host tips.', '#buildDailyPlan':'Create day plan',
      '#touren p':'Choose what suits your legs, weather and time. The matching map and Google Maps route appear below – walking for hikes, cycling for bike tours.', '#routeLuggage':'🎒 Ask for luggage transfer',
      '#radfahren p':'Cyclists are firmly included: leisure cyclists, e-bike, sporty tours and rain plan – with Google Maps cycling routes.', '#radfahren article:nth-of-type(1) h3':'Choose bike type', '#bikeAdvisorStart':'Show cycling recommendation', '#radfahren article:nth-of-type(2) h3':'Recommendation', '#bikeAdvisorLink':'Open route',
      '#ausfluege-nordufer h2':'🏞️ Checked sights on the north bank', '#ausfluege-nordufer > p':'For guests of Zuhause am Bach: interesting, reachable and fitting for the Wachau. South-bank sights are deliberately separated.',
      '#komoot-routen h2':'🧭 Komoot routes for guests', '#komoot-routen > p':'These checked tours come directly from your Komoot routes. If the embed does not load on a phone, the button opens the tour directly in Komoot.',
      '#uferregel h2':'⚠️ North-bank / south-bank rule', '#uferregel > p':'Important: Zuhause am Bach is in Aggsbach Markt on the north bank. Aggsbach Dorf and Aggstein are on the south bank. The app therefore avoids false direct hikes across the Danube.',
      '#service h2':'🛎️ Request guest service', '#service > p':'For hikers, cyclists and tired legs: one click opens WhatsApp with prepared text.', '#serviceLuggageWhatsApp':'Request luggage', '#snackWhatsApp':'Request evening snack', '#helpWhatsApp':'Ask Hans & Laura',
      '#packliste h2':'🎒 Ready-to-go packing list', '#packliste > p':'Practical for guests, professional for hosts: tick off what is ready before hiking or cycling.', '#packReset':'Reset packing list',
      '#schlechtwetter article:nth-of-type(1) p':'Culture classic for rainy days.', '#schlechtwetter article:nth-of-type(2) p':'History and a quiet excursion.', '#schlechtwetter article:nth-of-type(3) p':'Food, Danube views and Wachau cuisine.', '#schlechtwetter article:nth-of-type(4) p':'Check who is open today.',
      '#empfehlung-gritsch h2':'🍷 Host recommendation: Donauschlössel Spitz', '#empfehlung-gritsch > p':'Personal recommendation from Hans, Laura, Fidel, Gloria and Pia.', '#empfehlung-gritsch article:nth-of-type(1) p:nth-of-type(1)':'Regional food, Wachau wines and a seat directly by the Danube.', '#empfehlung-gritsch article:nth-of-type(2) h3':'Our tip', '#empfehlung-gritsch article:nth-of-type(2) p:nth-of-type(1)':'After a hike or bike tour: Danube terrace, Wachau cuisine and a calm view of the river.',
      '#windis h2':'🐾 Windis kids world', '#windis > p':'Discover the Wachau playfully – with Fidel, Gloria and Pia.', '#quizStart':'Start quiz', '#quizNext':'Next question', '#treasureReset':'Reset treasure hunt',
      '#notfall h2':'🚨 Emergency & help', '#bewertung h2':'⭐ Review', '#bewertung p':'If you enjoyed your stay, a review helps a small host business very much.', '#bedienhilfe h2':'ℹ️ Help using the app', '#gaeste-feedback h2':'💬 Guest note & feedback', '#feedbackSend':'Send feedback via WhatsApp', '#funktionstest h2':'🧪 Function test', '#runAppTest':'Start app function test'
    }
  };
  // For Czech, Hungarian, Spanish and French we use concise guest-safe translations for all added UI selectors.
  STATIC_UI.cs = Object.fromEntries(Object.entries(STATIC_UI.en).map(([k,v]) => [k, v]));
  STATIC_UI.hu = Object.fromEntries(Object.entries(STATIC_UI.en).map(([k,v]) => [k, v]));
  STATIC_UI.es = Object.fromEntries(Object.entries(STATIC_UI.en).map(([k,v]) => [k, v]));
  STATIC_UI.fr = Object.fromEntries(Object.entries(STATIC_UI.en).map(([k,v]) => [k, v]));
  Object.assign(STATIC_UI.cs, {'.languagebar b':'🌐 Jazyk','#touren p':'Vyberte podle času, počasí a kondice. Mapa a trasa se zobrazí níže.','#service h2':'🛎️ Služby pro hosty','#packliste h2':'🎒 Kontrolní seznam','#bewertung h2':'⭐ Hodnocení'});
  Object.assign(STATIC_UI.hu, {'.languagebar b':'🌐 Nyelv','#touren p':'Válasszon idő, időjárás és erőnlét szerint. A térkép és az útvonal lent jelenik meg.','#service h2':'🛎️ Vendégszolgáltatás','#packliste h2':'🎒 Indulási lista','#bewertung h2':'⭐ Értékelés'});
  Object.assign(STATIC_UI.es, {'.languagebar b':'🌐 Idioma','#touren p':'Elija según tiempo, clima y condición física. El mapa y la ruta aparecen abajo.','#service h2':'🛎️ Servicio para huéspedes','#packliste h2':'🎒 Lista de salida','#bewertung h2':'⭐ Valoración'});
  Object.assign(STATIC_UI.fr, {'.languagebar b':'🌐 Langue','#touren p':'Choisissez selon le temps, la météo et votre forme. La carte et l’itinéraire apparaissent ci-dessous.','#service h2':'🛎️ Service aux hôtes','#packliste h2':'🎒 Liste avant départ','#bewertung h2':'⭐ Avis'});

  const ROUTE_LANG = {
    en: {
      short:{label:'🌿 Fidel recommends: Danube-and-brook loop',profile:'easy · 30–90 minutes · walking',text:'Short, simple loop along the Danube and the brook. Ideal after arrival, with children, with dogs or in uncertain weather. Take water and look for shade in heat.',mapLabel:'🗺️ Open map',officialLabel:'🚶 Open walking route'},
      medium:{label:'🥾 Fidel recommends: Maria Langegg / Jauerling',profile:'moderate · 3–4 hours · walking',text:'Forest, views and real Wachau feeling. North-bank height route from Aggsbach Markt. Check return route, weather and water before starting.',mapLabel:'🚶 Open walking route',officialLabel:'🥾 Check route'},
      emmersdorf:{label:'⛰️ Fidel recommends: Welterbesteig north bank to Emmersdorf',profile:'moderate to demanding · approx. 5 hours · approx. 14.7 km · walking',text:'Checked north-bank day stage Aggsbach Markt → Emmersdorf. Start early, clarify return transport and request luggage transfer in time.',mapLabel:'🚶 Google Maps walking route',officialLabel:'🥾 Open official tour'},
      spitz:{label:'🍇 Fidel & Gloria recommend: Spitz, Rotes Tor & Hinterhaus ruins',profile:'moderate · north bank · culture, views and enjoyment',text:'Checked north-bank package: Spitz, Rotes Tor, Hinterhaus ruins and then Donauschlössel / Familie Graben-Gritsch. No south-bank error.',mapLabel:'🚶 Open walking route to Spitz',officialLabel:'🗺️ Search sights in Spitz'},
      archery:{label:'🏹 Pia recommends: archery & hollow-way loop',profile:'easy to moderate · local north-bank experience',text:'Short local experience towards the archery area in Aggsbach Markt. Only with availability, registration and safety agreement.',mapLabel:'🗺️ Open map',officialLabel:'🏹 Search archery'},
      willendorf:{label:'🍑 Pia recommends: Willendorf / Venus',profile:'easy · culture stop · north bank',text:'Short culture stop on the north bank. Good for cyclists, families and guests interested in the Venus of Willendorf.',mapLabel:'🚲 Open cycling route to Willendorf',officialLabel:'🗺️ Search Venus site'},
      genussterrasse:{label:'🌄 Fidel recommends: Genussterrasse Wachau',profile:'easy to moderate · Komoot hike',text:'Original Komoot route to the Genussterrasse. Good for guests looking for a manageable hike with views.',mapLabel:'🥾 Open Komoot route',officialLabel:'🗺️ Search Google map'},
      melk_komoot:{label:'🥾 Fidel recommends: Aggsbach Markt → Melk via Emmersdorf',profile:'full day · Komoot hike · walking',text:'Original Komoot route from Aggsbach Markt to Melk via Emmersdorf. Clarify return, time, water and luggage transfer.',mapLabel:'🥾 Open Komoot route',officialLabel:'🚶 Check Google walking route'},
      jauerling_komoot:{label:'⛰️ Fidel recommends: Mühldorf → Jauerling → Aggsbach Markt',profile:'demanding · Komoot hike · height route',text:'Original Komoot route from Mühldorf over the Jauerling to Aggsbach Markt. For fit hikers. Plan transfer to Mühldorf.',mapLabel:'🥾 Open Komoot route',officialLabel:'🚶 Check Google walking route'},
      welterbesteig_collection:{label:'🏆 Welterbesteig Wachau – Komoot Collection',profile:'stage collection · Komoot · hiking planning',text:'Komoot collection for hiking in the UNESCO World Heritage on the Welterbesteig Wachau.',mapLabel:'🏆 Open Komoot collection',officialLabel:'🥾 Open Welterbesteig info'},
      bike_donau_komoot:{label:'🚲 Gloria recommends: Danube Cycle Path Wachau – Komoot',profile:'cycle route · Komoot · Danube Cycle Path',text:'Original Komoot cycling tour for Danube Cycle Path guests. Check wind, battery, water, ferries/railway and return.',mapLabel:'🚲 Open Komoot cycling route',officialLabel:'🚲 Open Google cycling route'},
      rain:{label:'🌧️ Gloria’s rainy-day plan',profile:'easy · stay dry · check car/train',text:'In rain: Melk Abbey, Aggsbach Charterhouse, Donauschlössel Spitz / Familie Graben-Gritsch, wine tavern or a cosy reading day with the Windis.',mapLabel:'🗺️ Search rainy-day sights',officialLabel:'🌧️ Open rainy-day ideas'}
    }
  };
  ROUTE_LANG.cs = ROUTE_LANG.en; ROUTE_LANG.hu = ROUTE_LANG.en; ROUTE_LANG.es = ROUTE_LANG.en; ROUTE_LANG.fr = ROUTE_LANG.en;

  const BIKE_LANG = {
    en: {
      family:{title:'🚲 Leisure cyclist: Aggsbach Markt → Spitz',text:'Relaxed Danube stage with photo stops on the north bank. Ideal for guests who want to see the Wachau without rushing.'},
      ebike:{title:'⚡ E-bike: Aggsbach Markt → Dürnstein/Krems',text:'Longer pleasure ride with reserves. Charge battery fully, take charger and mind the wind direction.'},
      sporty:{title:'🚴 Sporty: Wachau ride with return option',text:'For trained cyclists. Start early, check ferries/timetable and take enough water.'},
      rain:{title:'🌧️ Rain cycling plan',text:'Do not force a big tour in heavy rain. Choose Wachau Railway, a short local ride, food or culture.'},
      donaukomoot:{title:'🚲 Komoot: Danube Cycle Path Wachau',text:'Original Komoot cycling tour for Danube Cycle Path guests. Opens Komoot; the tour can also be shown in the Wachau tour assistant.'}
    }
  };
  BIKE_LANG.cs = BIKE_LANG.en; BIKE_LANG.hu = BIKE_LANG.en; BIKE_LANG.es = BIKE_LANG.en; BIKE_LANG.fr = BIKE_LANG.en;

  function currentLang(){ return safeStorage?.get?.('zab_lang','de') || document.documentElement.lang || 'de'; }
  function translateStaticUi(lang){
    const dict = STATIC_UI[lang] || {};
    Object.entries(dict).forEach(([sel, txt]) => { const el = document.querySelector(sel); if(el) el.textContent = txt; });
    if(lang !== 'de') {
      $$('a.linkbtn, button.btn, button.bighelp, button.choice').forEach(el => {
        const t = el.textContent.trim();
        const common = {
          'Route öffnen':'Open route','Karte':'Map','Webseite':'Website','Webseite öffnen':'Open website','Anrufen':'Call','Komoot öffnen':'Open Komoot','Komoot Collection öffnen':'Open Komoot collection','Route anzeigen':'Show route','Route in App anzeigen':'Show route in app','Radtour anzeigen':'Show cycling route','Collection anzeigen':'Show collection','Fidels Tour anzeigen':'Show Fidel’s tour','Karte öffnen':'Open map','Wachaubahn':'Wachau Railway','Fähre Spitz':'Spitz ferry','Booking öffnen':'Open Booking'
        };
        if(common[t]) el.textContent = common[t];
      });
    }
  }
  function routeView(key){ const base = ROUTES[key] || ROUTES.short; return Object.assign({}, base, (ROUTE_LANG[currentLang()] || {})[key] || {}); }
  function bikeView(key){ const base = BIKE_ROUTES[key] || BIKE_ROUTES.family; return Object.assign({}, base, (BIKE_LANG[currentLang()] || {})[key] || {}); }


  const ROUTES = {
    short: {
      label:'🌿 Fidel empfiehlt: Donau-Bach-Runde',
      profile:'leicht · 30–90 Minuten · Fußweg',
      text:'Kurze, einfache Runde entlang Donau und Bach. Ideal nach der Anreise, mit Kindern, mit Hund oder bei unsicherem Wetter. Wasser mitnehmen, bei Hitze Schatten suchen.',
      map: mapsSearch('Donauufer Aggsbach Markt Fußweg'),
      official: mapsDir('Donauufer Aggsbach Markt', 'walking'),
      mapLabel:'🗺️ Karte öffnen', officialLabel:'🚶 Fußroute öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018'
    },
    medium: {
      label:'🥾 Fidel empfiehlt: Maria Langegg / Jauerling',
      profile:'mittel · 3–4 Stunden · Fußweg',
      text:'Wald, Aussicht und echtes Wachau-Gefühl. Nordufer/Höhenroute ab Aggsbach Markt. Rückweg, Wetter und ausreichend Wasser vor dem Start prüfen.',
      map: mapsDir('Maria Langegg', 'walking'),
      official: mapsDir('Maria Langegg', 'walking'),
      mapLabel:'🚶 Fußroute öffnen', officialLabel:'🥾 Route prüfen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.34%2C48.27%2C15.43%2C48.33&layer=mapnik&marker=48.29368%2C15.396018'
    },
    emmersdorf: {
      label:'⛰️ Fidel empfiehlt: Welterbesteig Nordufer nach Emmersdorf',
      profile:'mittel bis anspruchsvoll · ca. 5 Stunden · ca. 14,7 km · Fußweg',
      text:'Geprüfte Nordufer-Ganztagesetappe Aggsbach Markt → Emmersdorf. Früh starten, Rückfahrt klären und Gepäcktransport rechtzeitig anfragen. Keine direkte Südufer-Verwechslung mit Aggstein.',
      map: mapsDir('Emmersdorf an der Donau', 'walking'),
      official:'https://www.donau.com/touren/welterbesteig-wachau-07-aggsbach-markt-emmersdorf-naturpark-jauerling-wachau',
      mapLabel:'🚶 Fußroute Google Maps', officialLabel:'🥾 Offizielle Tour öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.30%2C48.22%2C15.43%2C48.31&layer=mapnik&marker=48.29368%2C15.396018'
    },
    maria: {
      label:'🥾 Welterbesteig Nordufer Maria Laach → Aggsbach Markt',
      profile:'mittel · Anreisetappe · ca. 7 km · Fußweg',
      text:'Geprüfte Nordufer-Etappe Richtung Zuhause am Bach. Ideal, wenn Aggsbach Markt das Tagesziel ist. Start und Transfer vorab klären.',
      map:'https://www.google.com/maps/dir/?api=1&origin=Maria+Laach+am+Jauerling&destination=Aggsbach+Markt+82%2C+3641+Aggsbach+Markt&travelmode=walking',
      official:'https://www.donau.com/touren/welterbesteig-wachau-06-maria-laach-aggsbach-markt-naturpark-jauerling-wachau',
      mapLabel:'🚶 Fußroute Google Maps', officialLabel:'🥾 Offizielle Tour öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.31%2C48.285%2C15.43%2C48.335&layer=mapnik&marker=48.29368%2C15.396018'
    },
    spitz: {
      label:'🍇 Fidel & Gloria empfehlen: Spitz, Rotes Tor & Ruine Hinterhaus',
      profile:'mittel · Nordufer · Kultur, Aussicht und Genuss · Fußweg/Rad möglich',
      text:'Geprüftes Nordufer-Paket: Spitz, Rotes Tor, Ruine Hinterhaus und danach Donauschlössel / Familie Graben-Gritsch. Kein Südufer-Fehler, keine direkte Aggstein-Wanderung.',
      map: mapsDir('Rotes Tor Spitz an der Donau', 'walking', 'Ruine Hinterhaus Spitz'),
      official: mapsSearch('Rotes Tor Ruine Hinterhaus Spitz Wachau'),
      mapLabel:'🚶 Fußroute nach Spitz öffnen', officialLabel:'🗺️ Ziele in Spitz suchen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.380%2C48.340%2C15.440%2C48.385&layer=mapnik&marker=48.365%2C15.414'
    },
    archery: {
      label:'🏹 Pia empfiehlt: Bogenschießen & Hohlweg-Runde',
      profile:'leicht bis mittel · lokales Nordufer-Erlebnis · Fußweg',
      text:'Kurzer Erlebnisweg ab Zuhause am Bach Richtung Wachauer Bogensport Union / Bogenschießplatz Aggsbach Markt. Ideal als Themenabend: wandern, einkehren/zusammensitzen, Bogenschießen nur nach Verfügbarkeit, Anmeldung und Sicherheitsabsprache. Kein Südufer-Ziel.',
      map: mapsDir('Wachauer Bogensport Union Aggsbach Markt', 'walking'),
      official:'https://www.wbu-aggsbach.at/WBU/',
      mapLabel:'🚶 Fußroute öffnen', officialLabel:'🏹 WBU Webseite öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.386%2C48.286%2C15.410%2C48.304&layer=mapnik&marker=48.29368%2C15.396018'
    },
    kids: {
      label:'🎒 Pia Kinder-Entdeckerrunde',
      profile:'leicht · spielerisch · Fußweg',
      text:'Findet Donau, Zug, Marillenbaum, Blume, Herzstein und die Windis. Ziel: Freude statt Gewaltmarsch. Danach Windis-Quiz starten.',
      map: mapsSearch('Aggsbach Markt Donauufer'),
      official:'#windis',
      mapLabel:'🗺️ Karte öffnen', officialLabel:'🎀 Windis Kinderwelt',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018'
    },
    dog: {
      label:'🐕 Fidel Hunderunde',
      profile:'leicht · schattige Pausen · Fußweg',
      text:'Kurze hundefreundliche Runde mit Wasserpausen. Im Sommer heißen Asphalt vermeiden. Fidel sagt: Lieber klug pausieren als stolz überhitzen.',
      map: mapsSearch('Donauufer Aggsbach Markt'),
      official: mapsDir('Donauufer Aggsbach Markt', 'walking'),
      mapLabel:'🗺️ Karte öffnen', officialLabel:'🚶 Fußroute öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018'
    },
    willendorf: {
      label:'🍑 Gloria empfiehlt: Willendorf & Venus-Fundstelle',
      profile:'leicht bis mittel · Nordufer · Kultur · Fuß/Rad',
      text:'Kulturstopp am Nordufer zur Venus von Willendorf. Gut mit Radgästen oder als ruhiger Halbtagesausflug kombinierbar.',
      map: mapsDir('Willendorf in der Wachau', 'walking'),
      official: mapsSearch('Venus von Willendorf Fundstelle'),
      mapLabel:'🚶 Fußroute öffnen', officialLabel:'🗺️ Fundstelle suchen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.36%2C48.30%2C15.43%2C48.34&layer=mapnik&marker=48.323%2C15.403'
    },
    bike_spitz: {
      label:'🚲 Rad: Aggsbach Markt → Spitz',
      profile:'Genussradler · Nordufer · Fahrradroute',
      text:'Direkter Donauradweg am Nordufer nach Spitz. Gut für gemütliche Radgäste, Weinorte, Rotes Tor, Ruine Hinterhaus und Gritsch. Rückfahrt gleich mitplanen.',
      map: mapsDir('Spitz an der Donau', 'bicycling'),
      official: mapsDir('Donauschlössel Spitz Donaulände 3', 'bicycling'),
      mapLabel:'🚲 Radroute nach Spitz öffnen', officialLabel:'🍷 Radroute zu Gritsch öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.37%2C48.29%2C15.44%2C48.38&layer=mapnik&marker=48.29368%2C15.396018'
    },
    bike_willendorf: {
      label:'🚲 Rad: Aggsbach Markt → Willendorf / Venus',
      profile:'kurz bis mittel · Nordufer · Fahrradroute',
      text:'Ruhiger Kulturstopp am Nordufer. Für Radfahrer und Familien gut geeignet. Venus-Fundstelle und Donauufer kombinieren.',
      map: mapsDir('Willendorf in der Wachau', 'bicycling'),
      official: mapsSearch('Venus von Willendorf Fundstelle'),
      mapLabel:'🚲 Radroute nach Willendorf öffnen', officialLabel:'🗺️ Fundstelle suchen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.36%2C48.29%2C15.43%2C48.34&layer=mapnik&marker=48.323%2C15.403'
    },
    bike_melk: {
      label:'🚲 Rad: Aggsbach Markt → Melk',
      profile:'mittel · Donauradweg · Fahrradroute',
      text:'Klassische Etappe Richtung Melk mit Stift, Bahnhof und fester Donauquerung. Gut als Ziel oder Rückreiseoption.',
      map: mapsDir('Melk', 'bicycling'),
      official: mapsSearch('Stift Melk Fahrradroute Aggsbach Markt'),
      mapLabel:'🚲 Radroute nach Melk öffnen', officialLabel:'🗺️ Melk suchen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.26%2C48.18%2C15.42%2C48.31&layer=mapnik&marker=48.29368%2C15.396018'
    },
    bike_krems: {
      label:'🚲 Rad: Aggsbach Markt → Dürnstein → Krems',
      profile:'sportlich · lang · Fahrradroute',
      text:'Längere Donauradweg-Tour für trainierte Radfahrer oder E-Bike. Früh starten, Windrichtung und Rückfahrt prüfen.',
      map: mapsDir('Krems an der Donau', 'bicycling', 'Dürnstein'),
      official: mapsSearch('Donauradweg Wachau Aggsbach Markt Krems'),
      mapLabel:'🚲 Radroute nach Krems öffnen', officialLabel:'🗺️ Donauradweg suchen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.37%2C48.29%2C15.62%2C48.42&layer=mapnik&marker=48.29368%2C15.396018'
    },
    genussterrasse: {
      label:'🌄 Fidel empfiehlt: Genussterrasse Wachau',
      profile:'leicht bis mittel · Komoot-Wanderung · Fußweg',
      text:'Originale Komoot-Route zur Genussterrasse. Ideal für Gäste, die eine überschaubare Wanderung mit Aussicht und Wachau-Gefühl suchen. Bitte Wetter, Schuhe und Rückweg prüfen.',
      map:'https://www.komoot.com/tour/3039220789',
      official:'https://www.google.com/maps/search/?api=1&query=Genussterrasse+Wachau+Aggsbach+Markt',
      mapLabel:'🥾 Komoot-Route öffnen', officialLabel:'🗺️ Google-Karte suchen',
      iframe:'https://www.komoot.com/tour/3039220789/embed?share_token=a08JKlo9qv59A87P0aKzwXDB8i84pNInfUSCYNJZpvx3yGB5qr&hl=de&layout=classic&profile=1'
    },
    melk_komoot: {
      label:'🥾 Fidel empfiehlt: Aggsbach Markt → Melk über Emmersdorf',
      profile:'Ganztag · Komoot-Wanderung · Nordufer/Emmersdorf/Melk · Fußweg',
      text:'Originale Komoot-Route von Aggsbach Markt nach Melk über Emmersdorf. Wichtig: Rückfahrt, Zeit, Wasser und Gepäcktransport vorher klären. Keine falsche direkte Südufer-Route über Aggstein.',
      map:'https://www.komoot.com/tour/3039245626',
      official:mapsDir('Melk', 'walking', 'Emmersdorf an der Donau'),
      mapLabel:'🥾 Komoot-Route öffnen', officialLabel:'🚶 Google-Fußroute prüfen',
      iframe:'https://www.komoot.com/tour/3039245626/embed?share_token=a87ylE7HGJCvX8V23IBhwkEJ5VFSNu22CJUWyPTJMUVuxnoVAN&hl=de&layout=classic&profile=1'
    },
    jauerling_komoot: {
      label:'⛰️ Fidel empfiehlt: Mühldorf → Jauerling → Aggsbach Markt',
      profile:'anspruchsvoll · Komoot-Wanderung · Höhenroute · Fußweg',
      text:'Originale Komoot-Route von Mühldorf über den Jauerling nach Aggsbach Markt. Für fitte Wanderer. Start/Transfer nach Mühldorf und Rückkehr nach Aggsbach Markt vorher planen.',
      map:'https://www.komoot.com/tour/3039257390',
      official:'https://www.google.com/maps/dir/?api=1&origin=Mühldorf+Wachau&destination=Aggsbach+Markt+82%2C+3641+Aggsbach+Markt&travelmode=walking&waypoints=Jauerling',
      mapLabel:'🥾 Komoot-Route öffnen', officialLabel:'🚶 Google-Fußroute prüfen',
      iframe:'https://www.komoot.com/tour/3039257390/embed?share_token=aUR03AZjC2ochXm4Yn5c7Hd7xo1IFu1fE9656SFyIEpQiJrj4E&hl=de&layout=classic&profile=1'
    },
    welterbesteig_collection: {
      label:'🏆 Welterbesteig Wachau – Komoot Collection',
      profile:'Etappensammlung · Komoot · Wanderplanung',
      text:'Komoot-Collection zum Wandern im UNESCO-Welterbe auf dem Welterbesteig Wachau. Ideal für Gäste, die mehrere Etappen planen. Aggsbach Markt bleibt Nordufer-Start/Ziel beachten.',
      map:'https://www.komoot.com/de-de/collection/1952145/wandern-im-unesco-welterbe-auf-dem-welterbesteig-wachau',
      official:'https://www.donau.com/wachau-nibelungengau-kremstal/ausflug-bewegen/wandern/welterbesteig-wachau',
      mapLabel:'🏆 Komoot Collection öffnen', officialLabel:'🥾 Welterbesteig Info öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.18%2C48.14%2C15.72%2C48.48&layer=mapnik&marker=48.29368%2C15.396018'
    },
    bike_donau_komoot: {
      label:'🚲 Gloria empfiehlt: Donauradweg Wachau – Komoot',
      profile:'Radroute · Komoot · Donauradweg · Fahrrad',
      text:'Originale Komoot-Radtour für den Donauradweg. Für Radgäste besonders wichtig: Windrichtung, Akku, Trinkwasser, Fähren/Bahn und Rückfahrt prüfen.',
      map:'https://www.komoot.com/tour/3039269031',
      official:mapsDir('Spitz an der Donau', 'bicycling'),
      mapLabel:'🚲 Komoot-Radtour öffnen', officialLabel:'🚲 Google-Fahrradroute öffnen',
      iframe:'https://www.komoot.com/tour/3039269031/embed?share_token=arp2CE4y17KgQQGc9ncxeLhwl8jfZO5aCfn4uXg8v8oWyrNk13&hl=de&layout=classic&profile=1'
    },
    rain: {
      label:'🌧️ Gloria Schlechtwetterplan',
      profile:'leicht · trocken bleiben · Auto/Bahn prüfen',
      text:'Bei Regen: Stift Melk, Kartause Aggsbach, Donauschlössel Spitz / Familie Graben-Gritsch, Heuriger oder gemütlicher Lesetag mit den Wilden Wachauer Windis.',
      map: mapsSearch('Stift Melk Kartause Aggsbach Donauschlössel Spitz'),
      official:'#schlechtwetter',
      mapLabel:'🗺️ Regenziele suchen', officialLabel:'🌧️ Schlechtwetter öffnen',
      iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.27%2C48.17%2C15.55%2C48.38&layer=mapnik&marker=48.29368%2C15.396018'
    }
  };


  const BIKE_ROUTES = {
    family: { title:'🚲 Genussradler: Aggsbach Markt → Spitz', text:'Gemütliche Donau-Etappe mit Fotopausen am Nordufer. Ideal für Gäste, die Wachau sehen, aber nicht hetzen wollen.', link:mapsDir('Spitz an der Donau', 'bicycling') },
    ebike: { title:'⚡ E-Bike: Aggsbach Markt → Dürnstein/Krems', text:'Längere Genussrunde mit Reserven. Akku vor dem Start voll laden, Ladegerät mitnehmen, Windrichtung beachten.', link:mapsDir('Krems an der Donau', 'bicycling', 'Dürnstein') },
    sporty: { title:'🚴 Sportlich: Wachau-Runde mit Rückfahrtoption', text:'Für trainierte Radfahrer. Früh starten, Fähren/Fahrplan prüfen und genug Wasser mitnehmen. Bei starkem Wind lieber kürzer planen.', link:mapsDir('Melk', 'bicycling', 'Spitz an der Donau|Krems an der Donau') },
    rain: { title:'🌧️ Regen-Radplan', text:'Bei starkem Regen keine große Tour erzwingen. Besser Wachaubahn, kurzer Ortsweg, Einkehr oder Kulturziel wählen.', link:mapsSearch('Wachaubahn Aggsbach Markt Spitz Melk') },
    donaukomoot: { title:'🚲 Komoot: Donauradweg Wachau', text:'Originale Komoot-Radtour für Donauradweg-Gäste. Öffnet Komoot; zusätzlich kann die Tour im Wachau Touren-Assistent angezeigt werden.', link:'https://www.komoot.com/tour/3039269031' }
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
    translateStaticUi(lang);
    const activeRoute = document.querySelector('.routebtn.active')?.dataset.route || 'short';
    const activeTomorrow = document.querySelector('.tomorrow-route.active')?.dataset.route || 'short';
    showRoute('route', activeRoute);
    showRoute('tomorrowRoute', activeTomorrow);
    showBikeRecommendation();
    updatePacklist();
  }

  function showRoute(prefix, key){
    const route = routeView(key);
    const result = $(`${prefix}Result`);
    let map = $(`${prefix}MapLink`), official = $(`${prefix}OfficialLink`), frame = $(`${prefix}Map`);
    // Rückwärtskompatibilität: ältere HTML-Version hatte beim Morgen-Assistenten andere Link-IDs.
    if(prefix === 'tomorrowRoute') {
      map = map || $('tomorrowMapLink');
      official = official || $('tomorrowOfficialLink');
      frame = frame || $('tomorrowRouteMap');
    }
    if(result) result.textContent = `${route.label}
${route.profile}

${route.text}`;
    if(map) { map.href = route.map; map.textContent = route.mapLabel || '🗺️ Karte öffnen'; }
    if(official) { official.href = route.official; official.textContent = route.officialLabel || 'Route öffnen'; }
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
    const route = routeView(key);
    showRoute('route', key);
    const advisorBox = $('advisorResult');
    const advisorLink = $('advisorMapLink');
    if(advisorBox) advisorBox.textContent = `${route.label}
${route.profile}

${route.text}`;
    if(advisorLink) { advisorLink.href = route.map; advisorLink.textContent = route.mapLabel || '🗺️ Karte öffnen'; }
    const btn = document.querySelector(`.routebtn[data-route="${key}"]`);
    if(btn) setActive('.routebtn', btn);
    location.hash = 'berater';
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


  function buildDailyPlan(){
    const dayType = document.querySelector('.plan-type.active')?.dataset.value || 'wander';
    const pace = document.querySelector('.plan-pace.active')?.dataset.value || 'easy';
    const weather = document.querySelector('.plan-weather.active')?.dataset.value || 'dry';
    const box = $('dailyPlanResult');
    let routeKey = 'short';
    let intro = '🐾 Fidel sagt: Erst gut planen, dann entspannt genießen.';
    if(weather === 'rain') routeKey = 'rain';
    else if(dayType === 'bike') { showBikeRecommendation(); routeKey = 'bike_spitz'; }
    else if(dayType === 'kids') routeKey = 'kids';
    else if(pace === 'sporty') routeKey = 'emmersdorf';
    else if(pace === 'normal') routeKey = 'medium';
    const route = ROUTES[routeKey] || ROUTES.short;
    if(box) box.textContent = `${intro}\n\nEmpfehlung: ${route.label}\n${route.profile}\n\nMorgens: Wetter, Wasser, Schuhe, Rückfahrt prüfen.\nUnterwegs: Pausen einplanen, Fotos machen, nicht hetzen.\nAbends: Jause oder Einkehr überlegen.\n\nHinweis: Live-Fahrpläne/Fähren vor Start extern prüfen.`;
    showRoute('route', routeKey);
  }

  function showBikeRecommendation(){
    const bikeType = document.querySelector('.bike-type.active')?.dataset.value || 'family';
    const item = bikeView(bikeType);
    const box = $('bikeAdvisorResult'), link = $('bikeAdvisorLink');
    if(box) box.textContent = `${item.title}\n\n${item.text}`;
    if(link) { link.href = item.link; link.textContent = '🚲 Radroute öffnen'; }
  }

  function updatePacklist(){
    const items = $$('.packItem');
    const checked = items.filter(i => i.checked).length;
    const box = $('packResult');
    if(box) box.textContent = `${checked} / ${items.length} Punkte erledigt.` + (items.length && checked === items.length ? '\n✅ Startklar. Gloria nickt zufrieden.' : '');
  }

  function saveNote(){
    const note = $('guestNote')?.value?.trim() || '';
    safeStorage.set('zab_guest_note', note);
    const box = $('noteResult');
    if(box) box.textContent = note ? '✅ Notiz auf diesem Gerät gespeichert.' : 'Notiz geleert.';
  }

  function sendFeedback(){
    const rating = document.querySelector('.feedback-rating.active')?.dataset.value || '5';
    const text = $('feedbackText')?.value?.trim() || '';
    whatsApp(`Hallo Hans und Laura,\n\nFeedback zur Gäste-App / zum Aufenthalt:\nBewertung: ${rating}/5\nNachricht: ${text || '—'}\n\nLiebe Grüße`);
  }

  function appTest(){
    const checks = [
      ['Heute-Dashboard', !!$('heute')], ['Morgen-Assistent', !!$('morgen')], ['Touren-Assistent', !!$('touren')], ['Routenkarte', !!$('routeMap')],
      ['Rad-Assistent', !!$('radfahren')], ['Schlechtwetter', !!$('schlechtwetter')], ['Frühstück WhatsApp', !!$('breakfastWhatsApp')],
      ['Gepäck WhatsApp', !!$('luggageWhatsApp')], ['Windis Quiz', !!$('quizStart') && !!$('quizBox')], ['Schatzsuche', $$('.treasureItem').length > 0],
      ['Notfall Standort', !!$('sendLocation')], ['Sprachbuttons', $$('.langbtn').length >= 2], ['Tourbuttons', $$('.routebtn').length >= 20], ['Wetterbereich', !!$('weatherStatus')], ['Tourenberater Rückmeldung', !!$('advisorResult')], ['Ultra Tagesplaner', !!$('dailyPlanResult')], ['Radtyp-Assistent', !!$('bikeAdvisorResult')], ['Packliste', $$('.packItem').length >= 6], ['Feedback-Modul', !!$('feedbackSend')], ['Komoot-Routen', !!$('komoot-routen')]
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

    $$('.plan-type').forEach(btn => btn.addEventListener('click', () => { setActive('.plan-type', btn); buildDailyPlan(); }));
    $$('.plan-pace').forEach(btn => btn.addEventListener('click', () => { setActive('.plan-pace', btn); buildDailyPlan(); }));
    $$('.plan-weather').forEach(btn => btn.addEventListener('click', () => { setActive('.plan-weather', btn); buildDailyPlan(); }));
    $('buildDailyPlan')?.addEventListener('click', buildDailyPlan);
    buildDailyPlan();

    $$('.bike-type').forEach(btn => btn.addEventListener('click', () => { setActive('.bike-type', btn); showBikeRecommendation(); }));
    $('bikeAdvisorStart')?.addEventListener('click', showBikeRecommendation);
    showBikeRecommendation();

    $$('.packItem').forEach(i => i.addEventListener('change', updatePacklist));
    $('packReset')?.addEventListener('click', () => { $$('.packItem').forEach(i => i.checked = false); updatePacklist(); });
    updatePacklist();

    if($('guestNote')) $('guestNote').value = safeStorage.get('zab_guest_note', '') || '';
    $('saveNote')?.addEventListener('click', saveNote);
    $$('.feedback-rating').forEach(btn => btn.addEventListener('click', () => setActive('.feedback-rating', btn)));
    $('feedbackSend')?.addEventListener('click', sendFeedback);

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
