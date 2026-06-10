
(function(){
const WA='436646437526';
const routes={
 short:{text:'🌿 Spaziergang entlang Donau und Bach\n\n30–90 Minuten. Ideal nach der Anreise, mit Kindern oder bei unsicherem Wetter.',map:'https://www.google.com/maps/search/Donauufer+Aggsbach+Markt',official:'https://www.google.com/maps/search/Donauufer+Aggsbach+Markt',iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018'},
 medium:{text:'🥾 Halbtageswanderung Richtung Maria Langegg / Jauerling\n\n3–4 Stunden. Wald, Aussicht, Wachau-Gefühl. Wetter und Rückweg prüfen.',map:'https://www.google.com/maps/dir/Aggsbach+Markt+82+3641+Aggsbach+Markt/Maria+Langegg',official:'https://www.google.com/maps/dir/Aggsbach+Markt+82+3641+Aggsbach+Markt/Maria+Langegg',iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.34%2C48.27%2C15.43%2C48.33&layer=mapnik&marker=48.29368%2C15.396018'},
 maria:{text:'🥾 Welterbesteig Maria Laach → Aggsbach Markt\n\nCa. 7 km. Gute Anreisetappe Richtung Zuhause am Bach.',map:'https://www.google.com/maps/dir/Maria+Laach+am+Jauerling/Aggsbach+Markt+82+3641+Aggsbach+Markt',official:'https://www.donau.com/touren/welterbesteig-wachau-06-maria-laach-aggsbach-markt-naturpark-jauerling-wachau',iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.31%2C48.285%2C15.43%2C48.335&layer=mapnik&marker=48.29368%2C15.396018'},
 emmersdorf:{text:'⛰️ Welterbesteig Aggsbach Markt → Emmersdorf\n\nCa. 14,74 km, ca. 5 Stunden, mittel. Früh starten und Rückfahrt klären.',map:'https://www.google.com/maps/dir/Aggsbach+Markt+82+3641+Aggsbach+Markt/Emmersdorf+an+der+Donau',official:'https://www.donau.com/touren/welterbesteig-wachau-07-aggsbach-markt-emmersdorf-naturpark-jauerling-wachau',iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.30%2C48.22%2C15.43%2C48.31&layer=mapnik&marker=48.29368%2C15.396018'},
 kids:{text:'🎒 Kinder-Entdeckerrunde\n\nFindet Donau, Blume, Marillenbaum, Zug und Stein in Herzform. Ziel: Spaß statt Gewaltmarsch.',map:'https://www.google.com/maps/search/Donauufer+Aggsbach+Markt',official:'https://www.google.com/maps/search/Donauufer+Aggsbach+Markt',iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018'},
 dog:{text:'🐕 Hundefreundliche Runde\n\nKurz, schattig, mit Wasserpausen. Heißen Asphalt vermeiden.',map:'https://www.google.com/maps/search/Donauufer+Aggsbach+Markt',official:'https://www.google.com/maps/search/Donauufer+Aggsbach+Markt',iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018'},
 rain:{text:'🌧️ Schlechtwetterprogramm\n\nStift Melk, Kartause Aggsbach, Museum, Heuriger oder Donauschlössel Spitz.',map:'https://www.google.com/maps/search/Stift+Melk+Kartause+Aggsbach+Donauschlössel+Spitz',official:'https://www.google.com/maps/search/Stift+Melk+Kartause+Aggsbach+Donauschlössel+Spitz',iframe:'https://www.openstreetmap.org/export/embed.html?bbox=15.27%2C48.17%2C15.55%2C48.38&layer=mapnik&marker=48.29368%2C15.396018'}
};
const T={
 de:{heroTitle:'Willkommen Zuhause am Bach',heroText:'Eure digitale Gäste-App für Wachau, Welterbesteig, Donauradweg und die Wilden Wachauer Windis.',todayTitle:'🏞️ Heute in der Wachau',todayText:'Alles Wichtige auf einen Blick: Wetter, Tour, Rad, Fähren, Wachaubahn und schnelle Hilfe.',dailyTourTitle:'🥾 Tour des Tages',dailyTourText:'Bei trockenem Wetter: kurze Runde oder Welterbesteig. Bei Regen: Schlechtwetterprogramm.',openTours:'Touren öffnen',bikeTipTitle:'🚲 Radtipp',bikeTipText:'Melk, Spitz, Dürnstein oder Krems – bitte Wind, Fähren und Rückfahrt prüfen.',openBike:'Rad-Assistent öffnen',tomorrowTitle:'🌅 Morgen-Assistent',tomorrowText:'Wetter morgen, Frühstück, Tour, Fähren, Gepäck und Buchung vorbereiten.',tourTitle:'🥾 Wachau Touren-Assistent',tourText:'Wählt, was zu euren Beinen, Wetter und Zeit passt.',bikeTitle:'🚲 Donauradweg-Assistent',rainTitle:'🌧️ Schlechtwetterprogramm'},
 en:{heroTitle:'Welcome to Zuhause am Bach',heroText:'Your digital guest app for the Wachau, World Heritage Trail, Danube Cycle Path and the Windis.',todayTitle:'🏞️ Today in the Wachau',todayText:'Weather, tours, cycling, ferries, railway and help at a glance.',dailyTourTitle:'🥾 Tour of the day',dailyTourText:'Dry weather: short walk or World Heritage Trail. Rain: rainy day programme.',openTours:'Open tours',bikeTipTitle:'🚲 Cycling tip',bikeTipText:'Melk, Spitz, Dürnstein or Krems – check wind, ferries and return transport.',openBike:'Open bike assistant',tomorrowTitle:'🌅 Tomorrow assistant',tomorrowText:'Prepare tomorrow’s weather, breakfast, tour, ferries, luggage and booking.',tourTitle:'🥾 Wachau tour assistant',tourText:'Choose what fits your legs, weather and time.',bikeTitle:'🚲 Danube Cycle Path assistant',rainTitle:'🌧️ Rainy day programme'},
 cs:{heroTitle:'Vítejte v Zuhause am Bach',heroText:'Digitální aplikace pro hosty ve Wachau.',todayTitle:'🏞️ Dnes ve Wachau',todayText:'Počasí, túry, kolo, přívozy, železnice a pomoc.',dailyTourTitle:'🥾 Túra dne',dailyTourText:'Za sucha procházka nebo Welterbesteig. Déšť: program do deště.',openTours:'Otevřít túry',bikeTipTitle:'🚲 Tip na kolo',bikeTipText:'Melk, Spitz, Dürnstein nebo Krems.',openBike:'Otevřít cyklo asistenta',tomorrowTitle:'🌅 Asistent na zítřek',tomorrowText:'Počasí, snídaně, túra, přívozy, zavazadla a rezervace.',tourTitle:'🥾 Asistent túr Wachau',tourText:'Vyberte podle času, počasí a kondice.',bikeTitle:'🚲 Asistent Dunajské cyklostezky',rainTitle:'🌧️ Program do deště'},
 hu:{heroTitle:'Üdvözöljük a Zuhause am Bachban',heroText:'Digitális vendégapp Wachauhoz.',todayTitle:'🏞️ Ma Wachauban',todayText:'Időjárás, túrák, bringa, kompok, vasút és segítség.',dailyTourTitle:'🥾 A nap túrája',dailyTourText:'Száraz időben séta vagy Welterbesteig. Esőben esős program.',openTours:'Túrák',bikeTipTitle:'🚲 Kerékpár tipp',bikeTipText:'Melk, Spitz, Dürnstein vagy Krems.',openBike:'Bringás asszisztens',tomorrowTitle:'🌅 Holnapi asszisztens',tomorrowText:'Időjárás, reggeli, túra, kompok, csomag és foglalás.',tourTitle:'🥾 Wachau túra asszisztens',tourText:'Válasszon idő, időjárás és erőnlét szerint.',bikeTitle:'🚲 Duna-kerékpárút segítő',rainTitle:'🌧️ Esős program'},
 es:{heroTitle:'Bienvenidos a Zuhause am Bach',heroText:'App digital para huéspedes en Wachau.',todayTitle:'🏞️ Hoy en Wachau',todayText:'Tiempo, rutas, bici, ferris, tren y ayuda.',dailyTourTitle:'🥾 Ruta del día',dailyTourText:'Seco: paseo o Welterbesteig. Lluvia: programa de lluvia.',openTours:'Abrir rutas',bikeTipTitle:'🚲 Consejo bici',bikeTipText:'Melk, Spitz, Dürnstein o Krems.',openBike:'Abrir asistente bici',tomorrowTitle:'🌅 Asistente para mañana',tomorrowText:'Tiempo, desayuno, ruta, ferris, equipaje y reserva.',tourTitle:'🥾 Asistente de rutas Wachau',tourText:'Elige según tiempo, clima y condición.',bikeTitle:'🚲 Asistente Ruta del Danubio',rainTitle:'🌧️ Programa de lluvia'},
 fr:{heroTitle:'Bienvenue à Zuhause am Bach',heroText:'Application invités pour la Wachau.',todayTitle:'🏞️ Aujourd’hui dans la Wachau',todayText:'Météo, randonnées, vélo, bacs, train et aide.',dailyTourTitle:'🥾 Tour du jour',dailyTourText:'Sec: promenade ou Welterbesteig. Pluie: programme pluie.',openTours:'Ouvrir randonnées',bikeTipTitle:'🚲 Conseil vélo',bikeTipText:'Melk, Spitz, Dürnstein ou Krems.',openBike:'Assistant vélo',tomorrowTitle:'🌅 Assistant pour demain',tomorrowText:'Météo, petit déjeuner, randonnée, bacs, bagages et réservation.',tourTitle:'🥾 Assistant randonnées Wachau',tourText:'Choisissez selon temps, météo et condition.',bikeTitle:'🚲 Assistant piste cyclable du Danube',rainTitle:'🌧️ Programme pluie'}
};
function tr(k){let l=localStorage.getItem('zab_lang')||'de';return (T[l]&&T[l][k])||T.de[k]||k}
function applyLang(lang){localStorage.setItem('zab_lang',lang);document.documentElement.lang=lang;document.querySelectorAll('.langbtn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=tr(e.dataset.i18n))}
function routeSet(prefix,key){const r=routes[key]||routes.short;document.getElementById(prefix+'Result').textContent=r.text;document.getElementById(prefix+'MapLink').href=r.map;document.getElementById(prefix+'OfficialLink').href=r.official;document.getElementById(prefix+'Map').src=r.iframe}
function active(sel,btn){document.querySelectorAll(sel).forEach(b=>b.classList.remove('active'));btn.classList.add('active')}
function selected(sel,def){let b=document.querySelector(sel+'.active');return b?b.dataset.value:def}
function wa(text){location.href=`https://api.whatsapp.com/send?phone=${WA}&text=${encodeURIComponent(text)}`}
function weather(idStatus,idGrid,days,index){const s=document.getElementById(idStatus),g=document.getElementById(idGrid); if(!s||!g)return; s.textContent='Wetter wird geladen …'; fetch(`https://api.open-meteo.com/v1/forecast?latitude=48.2937&longitude=15.3960&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Europe%2FVienna&forecast_days=${days}`).then(r=>r.json()).then(d=>{const x=d.daily||{};g.innerHTML=`<div class="weatheritem"><b>Temperatur</b><span>${x.temperature_2m_min?.[index]??'–'} / ${x.temperature_2m_max?.[index]??'–'} °C</span></div><div class="weatheritem"><b>Regen</b><span>${x.precipitation_sum?.[index]??'–'} mm</span></div><div class="weatheritem"><b>Wind</b><span>${x.wind_speed_10m_max?.[index]??'–'} km/h</span></div>`;s.textContent='Wetter geladen.'}).catch(()=>s.textContent='Wetter konnte nicht geladen werden.')}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.langbtn').forEach(b=>b.onclick=()=>applyLang(b.dataset.lang)); applyLang(localStorage.getItem('zab_lang')||'de');
 weather('weatherStatus','weatherGrid',1,0); weather('tomorrowWeatherStatus','tomorrowWeatherGrid',2,1);
 document.getElementById('reloadWeather').onclick=()=>weather('weatherStatus','weatherGrid',1,0); document.getElementById('reloadTomorrowWeather').onclick=()=>weather('tomorrowWeatherStatus','tomorrowWeatherGrid',2,1);
 routeSet('route','short'); routeSet('tomorrowRoute','short');
 document.querySelectorAll('.routebtn').forEach(b=>b.onclick=()=>routeSet('route',b.dataset.route));
 document.querySelectorAll('.tomorrow-route').forEach(b=>b.onclick=()=>{active('.tomorrow-route',b);routeSet('tomorrowRoute',b.dataset.route)});
 document.querySelectorAll('.breakfast').forEach(b=>b.onclick=()=>active('.breakfast',b)); document.querySelectorAll('.breakfast-time').forEach(b=>b.onclick=()=>active('.breakfast-time',b));
 document.getElementById('breakfastWhatsApp').onclick=()=>wa(`Hallo Hans und Laura,\n\nwir möchten für morgen Frühstück bestellen.\n\nArt: ${selected('.breakfast','Standard-Frühstück')}\nZeit: ${selected('.breakfast-time','08:00 Uhr')}\nPersonen: ____\nWünsche: ____`);
 document.getElementById('luggageWhatsApp').onclick=()=>wa('Hallo Hans und Laura,\n\nwir möchten Gepäcktransport anfragen.\n\nAbholort:\nZiel:\nZeit:\nGepäckstücke:\n\nLiebe Grüße');
 document.getElementById('routeLuggage').onclick=()=>wa('Hallo Hans und Laura,\n\nwir möchten Gepäcktransport zur gewählten Tour anfragen.\n\nLiebe Grüße');
 document.getElementById('sendLocation').onclick=()=>{if(!navigator.geolocation)return wa('Hallo Hans, bitte um Hilfe. Standort wird manuell gesendet.');navigator.geolocation.getCurrentPosition(p=>wa(`Hallo Hans,\n\nhier ist mein Standort:\nhttps://www.google.com/maps/search/?api=1&query=${p.coords.latitude},${p.coords.longitude}`),()=>wa('Hallo Hans, bitte um Hilfe. Standort wird manuell gesendet.'))};
});
})();



// V10.1 Touren aktiv + Windis Quiz
(function(){
  const quiz = [
    {q:"Wer ist der große ruhige Galgo der Wilden Wachauer Windis?", a:["Fidel","Gloria","Pia"], correct:0},
    {q:"Wer ist die elegante braun geströmte Galga?", a:["Pia","Gloria","Fidel"], correct:1},
    {q:"Wer ist das kleine Whippet-Mädchen mit rotem Halstuch?", a:["Pia","Gloria","Fidel"], correct:0},
    {q:"Wo liegt Zuhause am Bach?", a:["Aggsbach Markt","Aggsbach Dorf","Dürnstein"], correct:0},
    {q:"Welcher Fluss prägt die Wachau?", a:["Donau","Inn","Mur"], correct:0},
    {q:"Wofür ist die Wachau besonders bekannt?", a:["Marillen und Wein","Kokosnüsse","Nordsee"], correct:0},
    {q:"Was sollten Wanderer vor dem Start prüfen?", a:["Wetter, Wasser, Rückweg","Nur die Schuhfarbe","Fernsehsender"], correct:0},
    {q:"Welche Bahn fährt durch die Wachau?", a:["Wachaubahn","U-Bahn Berlin","Matterhornbahn"], correct:0},
    {q:"Was ist für Hunde im Sommer wichtig?", a:["Wasser und Schatten","Heißer Asphalt","Keine Pausen"], correct:0},
    {q:"Was suchen Kinder bei der Windis-Schatzsuche?", a:["Donau, Zug, Marillenbaum und Herzstein","Eisbären","Raketen"], correct:0}
  ];
  let quizIndex = 0;
  let score = 0;
  let answered = 0;

  function showQuizQuestion(){
    const box = document.getElementById("quizBox");
    const answers = document.getElementById("quizAnswers");
    const scoreBox = document.getElementById("quizScore");
    if(!box || !answers) return;
    const item = quiz[quizIndex];
    box.textContent = "Frage " + (quizIndex + 1) + " von " + quiz.length + ":\n" + item.q;
    answers.innerHTML = "";
    item.a.forEach((txt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = txt;
      btn.addEventListener("click", () => {
        if(btn.parentElement.dataset.done === "1") return;
        btn.parentElement.dataset.done = "1";
        answered++;
        if(i === item.correct){
          score++;
          btn.classList.add("correct");
          box.textContent += "\n\n✅ Richtig!";
        } else {
          btn.classList.add("wrong");
          box.textContent += "\n\n❌ Nicht ganz. Richtige Antwort: " + item.a[item.correct];
        }
        if(scoreBox) scoreBox.textContent = "Punkte: " + score + " / " + answered;
      });
      answers.appendChild(btn);
    });
    answers.dataset.done = "0";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const start = document.getElementById("quizStart");
    const next = document.getElementById("quizNext");
    if(start) start.addEventListener("click", () => {
      quizIndex = 0; score = 0; answered = 0;
      const scoreBox = document.getElementById("quizScore");
      if(scoreBox) scoreBox.textContent = "Punkte: 0 / 0";
      showQuizQuestion();
    });
    if(next) next.addEventListener("click", () => {
      quizIndex = (quizIndex + 1) % quiz.length;
      showQuizQuestion();
    });

    document.querySelectorAll(".routebtn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".routebtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    const items = document.querySelectorAll(".treasureItem");
    const result = document.getElementById("treasureResult");
    function updateTreasure(){
      const checked = [...items].filter(i => i.checked).length;
      if(result) {
        result.textContent = checked + " / " + items.length + " Entdeckungen gefunden." + (checked === items.length ? "\n🏅 Gratulation! Ihr seid Wachau-Entdecker!" : "");
      }
    }
    items.forEach(i => i.addEventListener("change", updateTreasure));
    const reset = document.getElementById("treasureReset");
    if(reset) reset.addEventListener("click", () => { items.forEach(i => i.checked = false); updateTreasure(); });
    updateTreasure();
  });
})();


// V10.2 Button-Fix
document.addEventListener('DOMContentLoaded',()=>{
 function setRoute(route){
   const data=(typeof routes!=='undefined' && routes[route])?routes[route]:null;
   if(!data) return;
   const ids=[
    ['routeResult','routeMapLink','routeOfficialLink','routeMap'],
    ['tomorrowRouteResult','tomorrowMapLink','tomorrowOfficialLink','tomorrowRouteMap']
   ];
   ids.forEach(i=>{
      let r=document.getElementById(i[0]);
      let m=document.getElementById(i[1]);
      let o=document.getElementById(i[2]);
      let f=document.getElementById(i[3]);
      if(r) r.textContent=data.text;
      if(m) m.href=data.map;
      if(o) o.href=data.official;
      if(f) f.src=data.iframe;
   });
 }
 document.querySelectorAll('.routebtn').forEach(b=>{
   b.onclick=()=>setRoute(b.dataset.route);
 });
 document.querySelectorAll('.tomorrow-route').forEach(b=>{
   b.onclick=()=>setRoute(b.dataset.route);
 });
 const luggage=document.getElementById('routeLuggage');
 if(luggage){
   luggage.onclick=()=>{
      window.location.href='https://api.whatsapp.com/send?phone=436646437526&text='+encodeURIComponent('Hallo Hans und Laura, wir möchten Gepäcktransport zur gewählten Tour anfragen.');
   };
 }
 setRoute('short');
});



// V10.3 Bedienungs- und Funktionsprüfung
(function(){
  function byId(id){ return document.getElementById(id); }

  function runAppTest(){
    const checks = [
      ["Heute-Dashboard", !!byId("heute")],
      ["Morgen-Assistent", !!byId("morgen")],
      ["Touren-Assistent", !!byId("touren")],
      ["Routenkarte", !!byId("routeMap")],
      ["Morgen-Routenkarte", !!byId("tomorrowRouteMap")],
      ["Frühstück WhatsApp", !!byId("breakfastWhatsApp")],
      ["Gepäck WhatsApp", !!byId("luggageWhatsApp")],
      ["Gepäck Tour", !!byId("routeLuggage")],
      ["Windis Quiz", !!byId("quizStart") && !!byId("quizBox")],
      ["Schatzsuche", document.querySelectorAll(".treasureItem").length > 0],
      ["Notfall Standort", !!byId("sendLocation")],
      ["Sprachbuttons", document.querySelectorAll(".langbtn").length >= 2],
      ["Tourbuttons", document.querySelectorAll(".routebtn").length >= 6],
      ["Wetterbereich", !!byId("weatherStatus") && !!byId("weatherGrid")]
    ];
    const failed = checks.filter(c => !c[1]);
    const box = byId("appTestResult");
    if (!box) return;
    box.textContent = failed.length
      ? "⚠️ Folgende Funktionen fehlen oder laden nicht:\n" + failed.map(f => "• " + f[0]).join("\n")
      : "✅ Alle wichtigen Bereiche wurden gefunden.\n" + checks.map(c => "✓ " + c[0]).join("\n");
    box.classList.toggle("test-ok", !failed.length);
    box.classList.toggle("test-fail", !!failed.length);
  }

  async function clearAppCache(){
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
      }
      if ("caches" in window) {
        const names = await caches.keys();
        for (const n of names) await caches.delete(n);
      }
    } catch(e) {}
    location.reload();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const test = byId("runAppTest");
    if (test) test.addEventListener("click", runAppTest);

    const clear = byId("clearAppCache");
    if (clear) clear.addEventListener("click", clearAppCache);

    // Sichtbare Bedien-Rückmeldung für Tourbuttons
    document.querySelectorAll(".routebtn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".routebtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    document.querySelectorAll(".tomorrow-route").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tomorrow-route").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  });
})();



// V10.4 finaler Button-Funktionstest und robuste Bedienlogik
(function(){
  const WA_FINAL = "436646437526";

  const ROUTES_FINAL = {
    short: {
      text: "🌿 Spaziergang entlang Donau und Bach\n\n30–90 Minuten. Ideal nach der Anreise, mit Kindern oder bei unsicherem Wetter.",
      map: "https://www.google.com/maps/search/Donauufer+Aggsbach+Markt",
      official: "https://www.google.com/maps/search/Donauufer+Aggsbach+Markt",
      iframe: "https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018"
    },
    medium: {
      text: "🥾 Halbtageswanderung Richtung Maria Langegg / Jauerling\n\n3–4 Stunden. Wald, Aussicht, Wachau-Gefühl. Wetter und Rückweg prüfen.",
      map: "https://www.google.com/maps/dir/Aggsbach+Markt+82+3641+Aggsbach+Markt/Maria+Langegg",
      official: "https://www.google.com/maps/dir/Aggsbach+Markt+82+3641+Aggsbach+Markt/Maria+Langegg",
      iframe: "https://www.openstreetmap.org/export/embed.html?bbox=15.34%2C48.27%2C15.43%2C48.33&layer=mapnik&marker=48.29368%2C15.396018"
    },
    emmersdorf: {
      text: "⛰️ Welterbesteig Aggsbach Markt → Emmersdorf\n\nCa. 14,74 km, ca. 5 Stunden, mittel. Früh starten und Rückfahrt klären.",
      map: "https://www.google.com/maps/dir/Aggsbach+Markt+82+3641+Aggsbach+Markt/Emmersdorf+an+der+Donau",
      official: "https://www.donau.com/touren/welterbesteig-wachau-07-aggsbach-markt-emmersdorf-naturpark-jauerling-wachau",
      iframe: "https://www.openstreetmap.org/export/embed.html?bbox=15.30%2C48.22%2C15.43%2C48.31&layer=mapnik&marker=48.29368%2C15.396018"
    },
    maria: {
      text: "🥾 Welterbesteig Maria Laach → Aggsbach Markt\n\nCa. 7 km. Gute Anreisetappe Richtung Zuhause am Bach.",
      map: "https://www.google.com/maps/dir/Maria+Laach+am+Jauerling/Aggsbach+Markt+82+3641+Aggsbach+Markt",
      official: "https://www.donau.com/touren/welterbesteig-wachau-06-maria-laach-aggsbach-markt-naturpark-jauerling-wachau",
      iframe: "https://www.openstreetmap.org/export/embed.html?bbox=15.31%2C48.285%2C15.43%2C48.335&layer=mapnik&marker=48.29368%2C15.396018"
    },
    kids: {
      text: "🎒 Kinder-Entdeckerrunde\n\nFindet Donau, Blume, Marillenbaum, Zug und Stein in Herzform. Ziel: Spaß statt Gewaltmarsch.",
      map: "https://www.google.com/maps/search/Donauufer+Aggsbach+Markt",
      official: "https://www.google.com/maps/search/Donauufer+Aggsbach+Markt",
      iframe: "https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018"
    },
    dog: {
      text: "🐕 Hundefreundliche Runde\n\nKurz, schattig, mit Wasserpausen. Heißen Asphalt vermeiden.",
      map: "https://www.google.com/maps/search/Donauufer+Aggsbach+Markt",
      official: "https://www.google.com/maps/search/Donauufer+Aggsbach+Markt",
      iframe: "https://www.openstreetmap.org/export/embed.html?bbox=15.3898%2C48.2898%2C15.4022%2C48.2975&layer=mapnik&marker=48.29368%2C15.396018"
    },
    rain: {
      text: "🌧️ Schlechtwetterprogramm\n\nStift Melk, Kartause Aggsbach, Museum, Heuriger oder Donauschlössel Spitz.",
      map: "https://www.google.com/maps/search/Stift+Melk+Kartause+Aggsbach+Donauschlössel+Spitz",
      official: "https://www.google.com/maps/search/Stift+Melk+Kartause+Aggsbach+Donauschlössel+Spitz",
      iframe: "https://www.openstreetmap.org/export/embed.html?bbox=15.27%2C48.17%2C15.55%2C48.38&layer=mapnik&marker=48.29368%2C15.396018"
    }
  };

  const QUIZ_FINAL = [
    {q:"Wer ist der große ruhige Galgo der Wilden Wachauer Windis?", a:["Fidel","Gloria","Pia"], correct:0},
    {q:"Wer ist die elegante braun geströmte Galga?", a:["Pia","Gloria","Fidel"], correct:1},
    {q:"Wer ist das kleine Whippet-Mädchen mit rotem Halstuch?", a:["Pia","Gloria","Fidel"], correct:0},
    {q:"Wo liegt Zuhause am Bach?", a:["Aggsbach Markt","Aggsbach Dorf","Dürnstein"], correct:0},
    {q:"Welcher Fluss prägt die Wachau?", a:["Donau","Inn","Mur"], correct:0},
    {q:"Wofür ist die Wachau besonders bekannt?", a:["Marillen und Wein","Kokosnüsse","Nordsee"], correct:0},
    {q:"Was sollten Wanderer vor dem Start prüfen?", a:["Wetter, Wasser, Rückweg","Nur die Schuhfarbe","Fernsehsender"], correct:0},
    {q:"Welche Bahn fährt durch die Wachau?", a:["Wachaubahn","U-Bahn Berlin","Matterhornbahn"], correct:0},
    {q:"Was ist für Hunde im Sommer wichtig?", a:["Wasser und Schatten","Heißer Asphalt","Keine Pausen"], correct:0},
    {q:"Was suchen Kinder bei der Windis-Schatzsuche?", a:["Donau, Zug, Marillenbaum und Herzstein","Eisbären","Raketen"], correct:0}
  ];

  let quizIndexFinal = 0;
  let quizScoreFinal = 0;
  let quizAnsweredFinal = 0;

  function el(id){ return document.getElementById(id); }
  function waFinal(text){ window.location.href = "https://api.whatsapp.com/send?phone=" + WA_FINAL + "&text=" + encodeURIComponent(text); }
  function activeFinal(selector, btn){ document.querySelectorAll(selector).forEach(b => b.classList.remove("active")); if(btn) btn.classList.add("active"); }

  function routeUpdateFinal(prefix, key){
    const r = ROUTES_FINAL[key] || ROUTES_FINAL.short;
    const result = el(prefix + "Result");
    const map = el(prefix + "MapLink");
    const official = el(prefix + "OfficialLink");
    const frame = el(prefix + "Map");
    if(result) result.textContent = r.text;
    if(map) map.href = r.map;
    if(official) official.href = r.official;
    if(frame) frame.src = r.iframe;
  }

  function weatherFinal(statusId, gridId, days, index){
    const status = el(statusId), grid = el(gridId);
    if(!status || !grid) return;
    status.textContent = "Wetter wird geladen …";
    const url = "https://api.open-meteo.com/v1/forecast?latitude=48.2937&longitude=15.3960&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Europe%2FVienna&forecast_days=" + days;
    fetch(url).then(r => r.json()).then(d => {
      const x = d.daily || {};
      grid.innerHTML =
        '<div class="weatheritem"><b>Temperatur</b><span>' + (x.temperature_2m_min?.[index] ?? "–") + ' / ' + (x.temperature_2m_max?.[index] ?? "–") + ' °C</span></div>' +
        '<div class="weatheritem"><b>Regen</b><span>' + (x.precipitation_sum?.[index] ?? "–") + ' mm</span></div>' +
        '<div class="weatheritem"><b>Wind</b><span>' + (x.wind_speed_10m_max?.[index] ?? "–") + ' km/h</span></div>';
      status.textContent = "Wetter geladen.";
    }).catch(() => { status.textContent = "Wetter konnte nicht geladen werden."; });
  }

  function quizShowFinal(){
    const box = el("quizBox"), answers = el("quizAnswers"), score = el("quizScore");
    if(!box || !answers) return;
    const item = QUIZ_FINAL[quizIndexFinal];
    box.textContent = "Frage " + (quizIndexFinal + 1) + " von " + QUIZ_FINAL.length + ":\n" + item.q;
    answers.innerHTML = "";
    answers.dataset.done = "0";
    item.a.forEach((txt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = txt;
      b.addEventListener("click", () => {
        if(answers.dataset.done === "1") return;
        answers.dataset.done = "1";
        quizAnsweredFinal++;
        if(i === item.correct){
          quizScoreFinal++;
          b.classList.add("correct");
          box.textContent += "\n\n✅ Richtig!";
        } else {
          b.classList.add("wrong");
          box.textContent += "\n\n❌ Nicht ganz. Richtige Antwort: " + item.a[item.correct];
        }
        if(score) score.textContent = "Punkte: " + quizScoreFinal + " / " + quizAnsweredFinal;
      });
      answers.appendChild(b);
    });
  }

  function treasureFinal(){
    const items = document.querySelectorAll(".treasureItem");
    const result = el("treasureResult");
    const checked = Array.from(items).filter(i => i.checked).length;
    if(result) result.textContent = checked + " / " + items.length + " Entdeckungen gefunden." + (checked === items.length && items.length ? "\n🏅 Gratulation! Ihr seid Wachau-Entdecker!" : "");
  }

  function appTestFinal(){
    const checks = [
      ["Heute-Dashboard", !!el("heute")],
      ["Morgen-Assistent", !!el("morgen")],
      ["Touren-Assistent", !!el("touren")],
      ["Route Ergebnis", !!el("routeResult")],
      ["Route Karte", !!el("routeMap")],
      ["Route Kartenlink", !!el("routeMapLink")],
      ["Route Gepäck", !!el("routeLuggage")],
      ["Wetter heute", !!el("weatherStatus")],
      ["Wetter morgen", !!el("tomorrowWeatherStatus")],
      ["Frühstück WhatsApp", !!el("breakfastWhatsApp")],
      ["Gepäck WhatsApp", !!el("luggageWhatsApp")],
      ["Quiz", !!el("quizStart") && !!el("quizBox") && !!el("quizAnswers")],
      ["Schatzsuche", document.querySelectorAll(".treasureItem").length > 0],
      ["Standort senden", !!el("sendLocation")],
      ["Sprache", document.querySelectorAll(".langbtn").length >= 2]
    ];
    const failed = checks.filter(c => !c[1]);
    const box = el("appTestResult");
    if(box) box.textContent = failed.length ? "⚠️ Fehler:\n" + failed.map(f => "• " + f[0]).join("\n") : "✅ Alle wichtigen Funktionen gefunden.\n" + checks.map(c => "✓ " + c[0]).join("\n");
  }

  async function cacheClearFinal(){
    try{
      if("serviceWorker" in navigator){
        const regs = await navigator.serviceWorker.getRegistrations();
        for(const reg of regs) await reg.unregister();
      }
      if("caches" in window){
        const names = await caches.keys();
        for(const name of names) await caches.delete(name);
      }
    }catch(e){}
    location.reload();
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Route buttons
    document.querySelectorAll(".routebtn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFinal(".routebtn", btn);
        routeUpdateFinal("route", btn.dataset.route || "short");
      });
    });
    document.querySelectorAll(".tomorrow-route").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFinal(".tomorrow-route", btn);
        routeUpdateFinal("tomorrowRoute", btn.dataset.route || "short");
      });
    });
    routeUpdateFinal("route", "short");
    routeUpdateFinal("tomorrowRoute", "short");

    // Breakfast choices
    document.querySelectorAll(".breakfast").forEach(btn => btn.addEventListener("click", () => activeFinal(".breakfast", btn)));
    document.querySelectorAll(".breakfast-time").forEach(btn => btn.addEventListener("click", () => activeFinal(".breakfast-time", btn)));

    const breakfast = el("breakfastWhatsApp");
    if(breakfast) breakfast.addEventListener("click", () => {
      const art = document.querySelector(".breakfast.active")?.dataset.value || "Standard-Frühstück";
      const zeit = document.querySelector(".breakfast-time.active")?.dataset.value || "08:00 Uhr";
      waFinal("Hallo Hans und Laura,\n\nwir möchten für morgen Frühstück bestellen.\n\nArt: " + art + "\nZeit: " + zeit + "\nPersonen: ____\nWünsche: ____\n\nLiebe Grüße");
    });

    const luggage = el("luggageWhatsApp");
    if(luggage) luggage.addEventListener("click", () => waFinal("Hallo Hans und Laura,\n\nwir möchten Gepäcktransport anfragen.\n\nAbholort:\nZiel:\nZeit:\nGepäckstücke:\n\nLiebe Grüße"));

    const routeLuggage = el("routeLuggage");
    if(routeLuggage) routeLuggage.addEventListener("click", () => waFinal("Hallo Hans und Laura,\n\nwir möchten Gepäcktransport zur gewählten Tour anfragen.\n\nLiebe Grüße"));

    // Weather
    const rw = el("reloadWeather");
    if(rw) rw.addEventListener("click", () => weatherFinal("weatherStatus","weatherGrid",1,0));
    const rtw = el("reloadTomorrowWeather");
    if(rtw) rtw.addEventListener("click", () => weatherFinal("tomorrowWeatherStatus","tomorrowWeatherGrid",2,1));
    weatherFinal("weatherStatus","weatherGrid",1,0);
    weatherFinal("tomorrowWeatherStatus","tomorrowWeatherGrid",2,1);

    // Quiz
    const qs = el("quizStart");
    if(qs) qs.addEventListener("click", () => { quizIndexFinal=0; quizScoreFinal=0; quizAnsweredFinal=0; const score=el("quizScore"); if(score) score.textContent="Punkte: 0 / 0"; quizShowFinal(); });
    const qn = el("quizNext");
    if(qn) qn.addEventListener("click", () => { quizIndexFinal = (quizIndexFinal + 1) % QUIZ_FINAL.length; quizShowFinal(); });

    // Treasure
    document.querySelectorAll(".treasureItem").forEach(i => i.addEventListener("change", treasureFinal));
    const tresReset = el("treasureReset");
    if(tresReset) tresReset.addEventListener("click", () => { document.querySelectorAll(".treasureItem").forEach(i => i.checked=false); treasureFinal(); });
    treasureFinal();

    // Location
    const sendLoc = el("sendLocation");
    if(sendLoc) sendLoc.addEventListener("click", () => {
      if(!navigator.geolocation) return waFinal("Hallo Hans, bitte um Hilfe. Standort wird manuell gesendet.");
      navigator.geolocation.getCurrentPosition(
        p => waFinal("Hallo Hans,\n\nhier ist mein Standort:\nhttps://www.google.com/maps/search/?api=1&query=" + p.coords.latitude + "," + p.coords.longitude),
        () => waFinal("Hallo Hans, bitte um Hilfe. Standort wird manuell gesendet.")
      );
    });

    // Utility buttons
    const test = el("runAppTest");
    if(test) test.addEventListener("click", appTestFinal);
    const clear = el("clearAppCache");
    if(clear) clear.addEventListener("click", cacheClearFinal);
  });
})();
