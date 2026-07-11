
const HOME = "Aggsbach Markt 82, 3641 Aggsbach Markt, Österreich";
function enc(x){return encodeURIComponent(x)}
function go(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"})}
function route(dest,mode="walking"){return `https://www.google.com/maps/dir/?api=1&origin=${enc(HOME)}&destination=${enc(dest)}&travelmode=${enc(mode)}`}
function komoot(q){return "https://www.google.com/search?q="+enc("site:komoot.com "+q+" Wachau Tour")}
function google(q){return "https://www.google.com/search?q="+enc(q)}
function outdooractive(q){return "https://www.google.com/search?q="+enc("site:outdooractive.com "+q+" Wachau Tour")}
function showToast(msg){
 let t=document.getElementById("toast");
 if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t);}
 t.textContent=msg;
 clearTimeout(window.zabToastTimer);
 window.zabToastTimer=setTimeout(()=>t.remove(),2800);
}
function updateSmartWifi(){
 const box=document.getElementById("wifiStatusBox"), title=document.getElementById("wifiStatusTitle"), text=document.getElementById("wifiStatusText");
 if(!box||!title||!text)return;
 const confirmed=localStorage.getItem("zabWifiConfirmed")==="yes";
 box.classList.remove("online","offline","confirmed");
 if(confirmed){
   box.classList.add("confirmed");
   title.textContent="Sie sind im Gäste-WLAN eingebucht";
   text.textContent="Willkommen bei Zuhause am Bach. Wetter, Wanderwelt, Radwelt und Service stehen bereit.";
   return;
 }
 if(navigator.onLine){
   box.classList.add("online");
   title.textContent="Internetverbindung aktiv";
   text.textContent="Bitte verbinden Sie sich bei Bedarf mit dem offenen WLAN ‚Zuhause am Bach‘ und tippen Sie anschließend auf „Ich bin im WLAN“.";
 }else{
   box.classList.add("offline");
   title.textContent="Noch keine Internetverbindung";
   text.textContent="Bitte WLAN am Handy öffnen und mit ‚Zuhause am Bach‘ verbinden. Kein Passwort erforderlich.";
 }
}
function confirmWifiGuest(){
 localStorage.setItem("zabWifiConfirmed","yes");
 updateSmartWifi();
 showToast("Willkommen im WLAN Zuhause am Bach 🐾");
}
async function copyWifiName(){
 const name="Zuhause am Bach";
 try{await navigator.clipboard.writeText(name);showToast("WLAN-Name kopiert: "+name);}
 catch(e){showToast("WLAN: "+name);}
}

async function loadWeather(){
 const box=document.getElementById("weatherBox");
 const updated=document.getElementById("weatherUpdated");
 const advice=document.getElementById("weatherAdvice");
 const todaySummary=document.getElementById("todayWeatherSummary");
 const todaySunset=document.getElementById("todaySunset");
 if(!box)return;
 try{
  const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude=48.2949&longitude=15.4032&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=Europe%2FVienna&forecast_days=14");
  const d=await r.json();
  const codes={0:"☀️ Sonnig",1:"🌤️ Klar",2:"⛅ Teilweise bewölkt",3:"☁️ Bewölkt",45:"🌫️ Nebel",48:"🌫️ Nebel",51:"🌦️ Niesel",53:"🌦️ Niesel",55:"🌧️ Niesel",61:"🌧️ Leichter Regen",63:"🌧️ Regen",65:"🌧️ Starker Regen",71:"❄️ Schnee",80:"🌦️ Schauer",81:"🌧️ Schauer",82:"⛈️ Starke Schauer",95:"⛈️ Gewitter",96:"⛈️ Gewitter",99:"⛈️ Gewitter"};
  function dayLabel(iso,weekday=false){
    const date=new Date(iso+"T12:00:00");
    return date.toLocaleDateString("de-AT", weekday ? {weekday:"short",day:"2-digit",month:"2-digit"} : {day:"2-digit",month:"2-digit"});
  }
  function card(i,t){
    const max=Math.round(d.daily.temperature_2m_max[i]);
    const min=Math.round(d.daily.temperature_2m_min[i]);
    const rain=d.daily.precipitation_probability_max[i]??0;
    const txt=codes[d.daily.weather_code[i]]||"🌤️ Wetter";
    const amp=rain<35?"🟢 Gute Outdoor-Chance":rain<65?"🟡 Regenjacke einplanen":"🔴 Schlechtwetterprogramm";
    return `<article><h3>${t}</h3><p><strong>${txt}</strong></p><p>${min}–${max} °C · Schauer ${rain}%</p><p><strong>${amp}</strong></p></article>`;
  }
  box.innerHTML=card(0,"🌤 Heute")+card(1,"🌦 Morgen");
  if(todaySummary){
    const max0=Math.round(d.daily.temperature_2m_max[0]);
    const min0=Math.round(d.daily.temperature_2m_min[0]);
    const rain0=d.daily.precipitation_probability_max[0]??0;
    const txt0=codes[d.daily.weather_code[0]]||"🌤️ Wetter";
    todaySummary.innerHTML=`<strong>${txt0}</strong><br>${min0}–${max0} °C · Schauer ${rain0}%`;
  }
  if(todaySunset && d.daily.sunset?.[0]){
    const sunset=new Date(d.daily.sunset[0]).toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"});
    todaySunset.innerHTML=`Heute gegen <strong>${sunset}</strong>. Gute Fotozeit kurz davor.`;
  }
  if(updated){
    updated.textContent="Aktualisiert am "+new Date().toLocaleDateString("de-AT",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"})+" · 14-Tage-Prognose";
  }
  const labels=d.daily.time.map(x=>dayLabel(x));
  const ctx=document.getElementById("weatherChart");
  if(ctx && window.Chart){
    if(window.zabWeatherChart){window.zabWeatherChart.destroy();}
    window.zabWeatherChart=new Chart(ctx,{
      type:"line",
      data:{labels,datasets:[
        {label:"Tageshöchsttemperatur °C",data:d.daily.temperature_2m_max,tension:.35,yAxisID:"y"},
        {label:"Tiefsttemperatur °C",data:d.daily.temperature_2m_min,tension:.35,yAxisID:"y"},
        {label:"Schauerwahrscheinlichkeit %",data:d.daily.precipitation_probability_max,type:"bar",yAxisID:"y1"}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{
        y:{title:{display:true,text:"Temperatur °C"}},
        y1:{position:"right",min:0,max:100,grid:{drawOnChartArea:false},title:{display:true,text:"Schauer %"}}
      }}
    });
  }
  if(advice){
    const max0=Math.round(d.daily.temperature_2m_max[0]);
    const rain0=d.daily.precipitation_probability_max[0]??0;
    let text="🥾 Wanderer & 🚴 Radfahrer: ";
    if(max0>=32) text+="heute möglichst früh starten, viel Wasser mitnehmen und Mittagshitze meiden.";
    else if(rain0>=60) text+="Regenjacke einpacken und Tour flexibel planen.";
    else text+="gute Bedingungen – Wetter am Morgen nochmals prüfen.";
    advice.innerHTML=`<div class="result-card"><h3>🐾 Empfehlung der Wilden Wachauer Windis</h3><p>${text}</p></div>`;
  }
 }catch(e){
   box.innerHTML="<article><h3>🌤 Heute</h3><p>Wetter konnte nicht geladen werden.</p></article><article><h3>🌦 Morgen</h3><p>Internetverbindung prüfen.</p></article>";
   if(updated) updated.textContent="Wetter konnte nicht geladen werden.";
   if(todaySummary) todaySummary.textContent="Wetter konnte nicht geladen werden. Bitte Internetverbindung prüfen.";
   if(todaySunset) todaySunset.textContent="Sonnenuntergang konnte nicht geladen werden.";
 }
}
function showMorning(type){
 const data={wander:["🥾 Heute gemütlich starten","Aggsbach Markt – Willendorf – Venus-Fundstelle. Wasser mitnehmen, Wetter prüfen.","Willendorf in der Wachau","walking"],
 bike:["🚴 Donauradweg-Tag","Aggsbach Markt – Schwallenbach – Spitz. Rückweg je nach Kondition.","Spitz an der Donau","bicycling"],
 rain:["🌧 Regentag","Stift Melk, Wachaumuseum, Kaffeehaus oder kurze Spaziergänge zwischen Schauern.","Stift Melk","driving"],
 family:["🐾 Familie & Hund","Kurze Runde am Wasser, Schatzsuche mit Pia und danach Wachau-Quiz.","Aggsbach Markt","walking"]}[type];
 document.getElementById("morningResult").innerHTML=card(data[0],data[1],data[2],data[3]);
}
function card(title,text,dest,mode){
 return `<div class="result-card"><h3>${title}</h3><p>${text}</p><div class="actions"><a href="${route(dest,mode)}" target="_blank">🗺 Google Maps</a><a href="${komoot(dest)}" target="_blank">🟢 Komoot</a><a class="outdoor" href="${outdooractive(dest)}" target="_blank">🔵 Outdooractive</a></div></div>`;
}
function showFidelRoute(){
 const dauer=document.getElementById("wanderDauer").value, schwer=document.getElementById("wanderSchwer").value, beg=document.getElementById("wanderBegleitung").value;
 let r={title:"🥾 Aggsbach Markt – Willendorf",text:"Gemütliche Nordufer-Route mit Donau-Nähe und Venus-Fundstelle.",dest:"Willendorf in der Wachau",km:"ca. 6–8 km",time:"2–3 h",hm:"wenig",eat:"Jause mitnehmen, Einkehr vorher prüfen",water:"Wasserflasche im Haus auffüllen",view:"Donau und Venus-Fundstelle"};
 if(dauer==="mittel"||schwer==="mittel")r={title:"🥾 Aggsbach Markt – Schwallenbach – Spitz",text:"Fidels Empfehlung: schöne Nordufer-Tour Richtung Spitz mit Einkehrmöglichkeit.",dest:"Spitz an der Donau",km:"ca. 10–12 km",time:"3–4 h",hm:"mittel",eat:"Spitz / Schwallenbach tagesaktuell prüfen",water:"mindestens 1 Liter pro Person",view:"Donauufer, Weinberge, Spitz"};
 if(dauer==="lang"||schwer==="sportlich")r={title:"⛰ Aggsbach Markt – Spitz – Rotes Tor",text:"Sportlichere Tour für trittsichere Gäste. Bei Hitze oder Regen nicht ideal.",dest:"Rotes Tor Spitz an der Donau",km:"ca. 13–16 km",time:"4–5 h",hm:"spürbar",eat:"Einkehr in Spitz einplanen",water:"viel Wasser, besonders bei Hitze",view:"Rotes Tor und Wachau-Blick"};
 if(beg==="hund")r.text+=" Mit Hund: Wasser mitnehmen und Hitze beachten.";
 if(beg==="kind")r.text+=" Mit Kindern: Pausen einplanen und lieber kürzer gehen.";
 document.getElementById("wanderResult").innerHTML=`<div class="result-card"><h3>${r.title}</h3><p>${r.text}</p><div class="facts"><span>⏱ ${r.time}</span><span>📏 ${r.km}</span><span>⛰ Höhenmeter: ${r.hm}</span><span>💧 ${r.water}</span></div><ul class="nice-list"><li>🍽 Einkehr: ${r.eat}</li><li>👀 Aussicht: ${r.view}</li><li>🥾 Welterbesteig/Donau-Nähe: bitte Wetter und Tagesform prüfen.</li></ul><div class="actions"><a href="${route(r.dest,'walking')}" target="_blank">Google Maps</a><a href="${komoot(r.dest)}" target="_blank">Komoot</a><a class="outdoor" href="${outdooractive(r.dest)}" target="_blank">Outdooractive</a></div></div>`;
}
function showAllRoutes(){
 const routes=[
  ["🌿 Willendorf & Venus","Willendorf in der Wachau","kurz · Nordufer","walking"],
  ["🥾 Schwallenbach & Spitz","Spitz an der Donau","mittel · Nordufer","walking"],
  ["⛰ Rotes Tor Spitz","Rotes Tor Spitz an der Donau","sportlich · Nordufer","walking"],
  ["🏰 Bonus: Aggstein Südufer","Burgruine Aggstein","Ausflug · Südufer · am besten mit Auto/Fähre prüfen","driving"]
 ];
 document.getElementById("wanderResult").innerHTML="<div class='map-grid'>"+routes.map(x=>`<article><h3>${x[0]}</h3><p>${x[2]}</p><div class="actions"><a href="${route(x[1],x[3])}" target="_blank">Google Maps</a><a href="${komoot(x[1])}" target="_blank">Komoot</a><a class="outdoor" href="${outdooractive(x[1])}" target="_blank">Outdooractive</a></div></article>`).join("")+"</div>";
}
function showGloria(mode){
 const b=document.getElementById("gloriaResult");
 if(mode==="rad")b.innerHTML=`<div class="map-grid"><article><h3>🚴 Genussrunde Spitz</h3><p>Aggsbach Markt – Schwallenbach – Spitz.</p><div class="actions"><a href="${route('Spitz an der Donau','bicycling')}" target="_blank">Route</a></div></article><article><h3>🚴 Weißenkirchen</h3><p>Für geübtere Radfahrer am Nordufer.</p><div class="actions"><a href="${route('Weißenkirchen in der Wachau','bicycling')}" target="_blank">Route</a></div></article></div>`;
 if(mode==="genuss")b.innerHTML=`<div class="map-grid"><article><h3>🍷 Donauschlössel / Gritsch</h3><p>Gäste-Tipp in Spitz. Öffnungszeiten prüfen.</p><div class="actions"><a href="${google('Donauschlössel Gritsch Spitz Öffnungszeiten')}" target="_blank">Prüfen</a></div></article><article><h3>🐟 Steckerlfisch Graf</h3><p>Emmersdorf, guter Tipp für Radfahrer und Wanderer.</p><div class="actions"><a href="${google('Steckerlfisch Graf Emmersdorf Öffnungszeiten')}" target="_blank">Prüfen</a></div></article></div>`;
 if(mode==="terrasse")b.innerHTML=`<div class="result-card"><h3>🌿 Glorias Genuss-Terrasse</h3><p>Donnerstag bis Montag nach Verfügbarkeit für Gäste. Bitte anfragen.</p><div class="actions"><a href="sms:+436646437526?body=Hallo%20Zuhause%20am%20Bach,%20wir%20interessieren%20uns%20für%20Glorias%20Genuss-Terrasse.">Anfragen</a></div></div>`;
 if(mode==="service")b.innerHTML=`<div class="tip-grid"><article><h3>🚲 Fahrradgarage</h3><p>Sicher unterstellen.</p></article><article><h3>🔋 E-Bike laden</h3><p>Ladegerät bitte mitbringen.</p></article><article><h3>🧰 Werkzeug & Pumpe</h3><p>Kleine Hilfe bei Radproblemen.</p></article><article><h3>💧 Wasser</h3><p>Vor der Tour auffüllen.</p></article></div>`;
}
const HEURIGE=[["Glorias Genuss-Terrasse","Zuhause am Bach, Aggsbach Markt","Zuhause am Bach Wachau Aggsbach Markt 82"],["Donauschlössel / Gritsch","Spitz an der Donau","Donauschlössel Gritsch Spitz an der Donau"],["Heurige in Spitz","Spitz an der Donau","Heuriger Spitz an der Donau"],["Heurige in Schwallenbach","Schwallenbach","Heuriger Schwallenbach Wachau"],["Heurige in Willendorf","Willendorf","Heuriger Willendorf Wachau"],["Heurige in Weißenkirchen","Weißenkirchen","Heuriger Weißenkirchen Wachau"]];
function setHeurigenDate(mode){const d=new Date();if(mode==="tomorrow")d.setDate(d.getDate()+1);document.getElementById("heurigenDate").value=d.toISOString().slice(0,10);renderHeurigen()}
function dateLabel(){const v=document.getElementById("heurigenDate").value;if(!v)return"heute";const d=new Date(v+"T12:00:00");return["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"][d.getDay()]+", "+String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear()}
function aiUrl(){return "https://www.google.com/search?udm=50&q="+enc("Welche Heurigen haben am "+dateLabel()+" am Nordufer der Wachau im Umkreis von 15 km von Aggsbach Markt geöffnet? Bitte nur tatsächlich geöffnete Betriebe anzeigen, keine geschlossenen. Mit Öffnungszeiten und Quelle.")}
function renderHeurigen(){
 document.getElementById("heurigenResult").innerHTML=`<div class="result-card"><h3>🍷 Google-KI-Modus für ${dateLabel()}</h3><p>1. Google-KI-Modus starten. 2. Nur bestätigte offene Heurige auswählen. 3. Route öffnen.</p><div class="actions"><a href="${aiUrl()}" target="_blank">🤖 Google-KI-Modus starten</a></div></div><div class="map-grid">`+HEURIGE.map((h,i)=>`<article><h3>${h[0]}</h3><p>${h[1]}</p><div class="actions"><a href="${route(h[2],'driving')}" target="_blank">Route anzeigen</a></div></article>`).join("")+"</div>";
}
const PIA=[{q:"An welchem Wanderweg liegt Zuhause am Bach?",a:["Welterbesteig Wachau","Jakobsweg Spanien","Großglocknerweg"],ok:0},{q:"Welcher Radweg führt durch die Wachau?",a:["Donauradweg","Tauernradweg","Innradweg"],ok:0},{q:"Wofür ist die Wachau bekannt?",a:["Marillen und Wein","Kokosnüsse","Eisbären"],ok:0},{q:"Wo steht Zuhause am Bach?",a:["Aggsbach Markt","Aggsbach Dorf","Wien"],ok:0},{q:"Wie heißt das Whippet-Mädchen?",a:["Pia","Luna","Sissi"],ok:0},{q:"Was findet man in Willendorf?",a:["Venus von Willendorf","Eiffelturm","Meereshafen"],ok:0},{q:"Welche Burg ist bekannt?",a:["Burgruine Aggstein","Burg London","Schloss Versailles"],ok:0},{q:"Wie heißt die Bahn in der Wachau?",a:["Wachaubahn","U-Bahn","Bergmetro"],ok:0},{q:"Was brauchen Radfahrer oft?",a:["Fahrradgarage und E-Bike-Laden","Skilift","Flughafen"],ok:0},{q:"Was macht Pia gerne?",a:["Entdecken und Abenteuer erleben","Winterschlaf halten","Rechnungen sortieren"],ok:0}];
let piaScore=0,piaAnswered={};
function setPiaActive(mode){document.querySelectorAll(".pia-submenu button").forEach(btn=>btn.classList.toggle("active",btn.dataset.piaMode===mode))}
function showPia(mode){
 const b=document.getElementById("piaResult");
 if(!b)return;
 setPiaActive(mode);
 if(mode==="quiz"){piaScore=0;piaAnswered={};let out=`<h3>🏆 Wachau-Quiz</h3><div id="piaScore" class="pia-score">0 von ${PIA.length} richtig</div>`;PIA.forEach((q,i)=>{out+=`<div class="pia-question"><strong>${i+1}. ${q.q}</strong><br>`+q.a.map((a,j)=>`<button onclick="answerPia(this,${i},${j})">${a}</button>`).join("")+`</div>`});out+=`<button onclick="showCertificate()">🏆 Urkunde anzeigen</button>`;b.innerHTML=out}
 if(mode==="suche")b.innerHTML=`<h3>🔍 Schatzsuche</h3><div class="treasure-list"><label><input type="checkbox"> Donau gesehen</label><label><input type="checkbox"> Marillenbaum entdeckt</label><label><input type="checkbox"> Weinberg gefunden</label><label><input type="checkbox"> Stein in Herzform gesucht</label><label><input type="checkbox"> Pia auf dem Bild entdeckt</label><label><input type="checkbox"> Wachaubahn oder Gleise gesehen</label></div><button onclick="showCertificate()">🏆 Urkunde erstellen</button>`;
 if(mode==="story")b.innerHTML=`<h3>📖 Geschichten</h3><div class="story-card"><strong>Pia und der kleine Bach</strong><p>Pia hörte das Wasser leise plätschern. „Hier beginnt ein Abenteuer“, dachte sie.</p></div><div class="story-card"><strong>Die Marille im Morgenlicht</strong><p>Als die Sonne über Aggsbach Markt aufging, glänzte eine Marille wie ein kleiner Schatz.</p></div><button onclick="showCertificate()">🏆 Urkunde</button>`;
 if(mode==="abenteuer")b.innerHTML=`<h3>🌿 Kleine Wachau-Abenteuer mit Pia</h3><div class="adventure-grid"><article><h4>Bach-Detektiv</h4><p>Hört 30 Sekunden ganz still zu: Was klingt nach Wasser, Wind oder Vogelstimme?</p></article><article><h4>Donau-Farben</h4><p>Sucht drei Farben an der Donau oder im Garten und gebt ihnen Wachau-Namen.</p></article><article><h4>Marillen-Spur</h4><p>Findet etwas, das rund, gelb oder orange ist. Pia nennt es den kleinen Marillenschatz.</p></article><article><h4>Windis-Fotoauftrag</h4><p>Macht ein Erinnerungsfoto mit eurem liebsten Wachau-Moment.</p></article></div><div class="treasure-list"><label><input type="checkbox"> Ein Naturgeräusch entdeckt</label><label><input type="checkbox"> Drei Wachau-Farben gefunden</label><label><input type="checkbox"> Marillenschatz entdeckt</label><label><input type="checkbox"> Erinnerungsfoto gemacht</label></div><button onclick="showCertificate()">🏆 Abenteuer-Urkunde</button>`;
}
function answerPia(btn,i,j){if(piaAnswered[i])return;piaAnswered[i]=true;if(j===PIA[i].ok){btn.classList.add("correct");piaScore++}else btn.classList.add("wrong");document.getElementById("piaScore").textContent=`${piaScore} von ${PIA.length} richtig`}
function showCertificate(){const d=new Date(),date=String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear();document.getElementById("piaResult").innerHTML=`<div id="certificatePrint" class="certificate"><h3>🏆 Wachau-Meister-Urkunde</h3><p>Diese Urkunde erhält</p><input id="certName" type="text" placeholder="Name eintragen"><h2 id="certPreview">Wachau-Meisterin / Wachau-Meister</h2><p>für Quiz, Schatzsuche und kleine Wachau-Abenteuer mit Pia.</p><p><strong>Aggsbach Markt, ${date}</strong></p><p>🐾 Fidel · Gloria · Pia</p></div><div class="button-row"><button onclick="updateCert()">Name übernehmen</button><button onclick="window.print()">🖨️ Drucken</button><button onclick="showPia('quiz')">Zurück zum Quiz</button></div>`}
function updateCert(){document.getElementById("certPreview").textContent=document.getElementById("certName").value||"Wachau-Meisterin / Wachau-Meister"}
const GUESTBOOK_KEY="zab_guest_stories_v1";
function getGuestStories(){try{return JSON.parse(localStorage.getItem(GUESTBOOK_KEY)||"[]")}catch(e){return []}}
function saveGuestStories(stories){localStorage.setItem(GUESTBOOK_KEY,JSON.stringify(stories.slice(0,20)))}
function renderGuestbook(){
 const list=document.getElementById("guestbookList"); if(!list)return;
 const stories=getGuestStories();
 list.innerHTML=stories.length?stories.map(s=>`<article><p>${s.text}</p><small>${s.date}</small></article>`).join(""):"<p class='small'>Noch keine Geschichte gespeichert.</p>";
}
function addGuestStory(){
 const input=document.getElementById("guestStory"); if(!input)return;
 const text=input.value.trim();
 if(!text){showToast("Bitte zuerst eine Geschichte eintragen.");return;}
 const stories=getGuestStories();
 stories.unshift({text:text.replace(/[<>]/g,""),date:new Date().toLocaleDateString("de-AT",{day:"2-digit",month:"2-digit",year:"numeric"})});
 saveGuestStories(stories);
 input.value="";
 renderGuestbook();
 showToast("Geschichte gemerkt.");
}
function shareGuestStory(){
 const input=document.getElementById("guestStory");
 const text=(input?.value.trim() || getGuestStories()[0]?.text || "").trim();
 if(!text){showToast("Bitte zuerst eine Geschichte eintragen.");return;}
 const msg="Gästebuch Zuhause am Bach: "+text;
 window.open("https://wa.me/436646437526?text="+enc(msg),"_blank","noopener");
}
document.addEventListener("DOMContentLoaded",()=>{updateSmartWifi();loadWeather();showMorning("wander");showFidelRoute();showGloria("rad");setHeurigenDate("today");showPia("quiz");renderGuestbook()});
window.addEventListener("online",updateSmartWifi);
window.addEventListener("offline",updateSmartWifi);

// Windis-Stempel
const CHALLENGE_KEY = "zab_wachau_challenge_v46";
const CHALLENGE_ITEMS = [
  {id:"home", emoji:"🏡", title:"Zuhause am Bach", text:"Ankommen, durchatmen und Willkommen im Rudel.", points:10, main:true},
  {id:"donau", emoji:"🍷", title:"Donauschlössl Spitz", text:"Glorias Genuss-Tipp in Spitz an der Donau.", points:10, main:true, dest:"Donauschlössel Gritsch Spitz an der Donau", mode:"bicycling"},
  {id:"venus", emoji:"🏺", title:"Venus von Willendorf", text:"Kulturstopp am Nordufer der Wachau.", points:10, main:true, dest:"Willendorf in der Wachau", mode:"walking"},
  {id:"melk", emoji:"⛪", title:"Stift Melk", text:"Klassiker für Kultur- und Regentage.", points:10, main:true, dest:"Stift Melk", mode:"driving"},
  {id:"weissenkirchen", emoji:"🍇", title:"Weißenkirchen", text:"Weinort am Nordufer für Radfahrer und Genießer.", points:10, main:true, dest:"Weißenkirchen in der Wachau", mode:"bicycling"},
  {id:"spitz", emoji:"🌊", title:"Spitz an der Donau", text:"Donauradweg, Heurige und schöne Rastplätze.", points:10, main:true, dest:"Spitz an der Donau", mode:"bicycling"},
  {id:"heuriger", emoji:"🍷", title:"Heurigenbesuch", text:"Ein echter Wachau-Moment mit Wein oder Traubensaft.", points:10, main:true},
  {id:"marille", emoji:"🍑", title:"Marillenprodukt probiert", text:"Marillenkuchen, Marmelade, Saft oder Knödel.", points:10, main:true},
  {id:"sunset", emoji:"🌅", title:"Sonnenuntergang an der Donau", text:"Ein Foto, ein Moment, ein Stück Wachau.", points:10, main:true},
  {id:"windis", emoji:"🐾", title:"Foto mit Fidel, Gloria oder Pia", text:"Das Erinnerungsfoto aus dem Rudel.", points:10, main:true},
  {id:"windibook", emoji:"📚", title:"Windis-Bücher entdeckt", text:"QR-Code scannen oder in die Bücherwelt schauen.", points:10, main:false},
  {id:"aggs", emoji:"🏰", title:"Bonus: Burgruine Aggstein", text:"Südufer-Ziel – stark, aber nicht Pflicht.", points:15, main:false, dest:"Burgruine Aggstein", mode:"driving"},
  {id:"duernstein", emoji:"🏰", title:"Bonus: Dürnstein", text:"Blauer Turm, Ruine und Wachau-Postkarte pur.", points:15, main:false, dest:"Dürnstein", mode:"driving"},
  {id:"ship", emoji:"🚢", title:"Bonus: Donauschifffahrt", text:"Die Wachau vom Wasser aus erleben.", points:10, main:false},
  {id:"trail", emoji:"🥾", title:"Bonus: Welterbesteig-Etappe", text:"Für alle, die ein Stück Welterbesteig gegangen sind.", points:10, main:false},
  {id:"bike", emoji:"🚴", title:"Bonus: Donauradweg-Etappe", text:"Für alle, die ein Stück Donauradweg gefahren sind.", points:10, main:false}
];
function getChallenge(){try{return JSON.parse(localStorage.getItem(CHALLENGE_KEY)||"{}")}catch(e){return {}}}
function saveChallenge(state){localStorage.setItem(CHALLENGE_KEY,JSON.stringify(state))}
function challengeScore(state){return CHALLENGE_ITEMS.filter(x=>state[x.id]).reduce((sum,x)=>sum+x.points,0)}
function challengeRank(points){if(points>=100)return "🥇 Wachau-Meister"; if(points>=60)return "🥈 Wachau-Kenner"; if(points>=30)return "🥉 Wachau-Freund"; return "🐾 Neues Rudelmitglied"}
function toggleChallenge(id){const state=getChallenge();state[id]=!state[id];saveChallenge(state);renderChallenge()}
function resetChallenge(){if(confirm("Windis-Stempel wirklich zurücksetzen?")){localStorage.removeItem(CHALLENGE_KEY);renderChallenge()}}
function renderChallenge(){
 const grid=document.getElementById("challengeGrid"); if(!grid)return;
 const state=getChallenge(), points=challengeScore(state), capped=Math.min(points,100), rank=challengeRank(points);
 document.getElementById("challengePoints").textContent=points+" / 100 Punkte";
 document.getElementById("challengeStatus").textContent=rank;
 document.getElementById("challengeBar").style.width=capped+"%";
 grid.innerHTML=CHALLENGE_ITEMS.map(item=>{
   const done=!!state[item.id];
   const routeLink=item.dest?`<a href="${route(item.dest,item.mode||'walking')}" target="_blank" rel="noopener">🗺 Route</a>`:"";
   return `<article class="challenge-item ${done?'done':''}">
     <div class="stamp">${done?'✅':item.emoji}</div>
     <h3>${item.title}</h3>
     <p>${item.text}</p>
     <div class="facts"><span>${item.points} Punkte</span><span>${item.main?'Hauptstation':'Bonus'}</span></div>
     <div class="actions"><button onclick="toggleChallenge('${item.id}')">${done?'Stempel entfernen':'🐾 Stempel sammeln'}</button>${routeLink}</div>
   </article>`;
 }).join("");
}
function showWachauCertificate(){
 const d=new Date(),date=String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear();
 const points=challengeScore(getChallenge()), rank=challengeRank(points);
 const box=document.getElementById("challengeGrid"); if(!box)return;
 box.innerHTML=`<div id="certificatePrint" class="certificate wachau-cert"><h3>🏆 Windis-Stempel</h3><p>Diese Urkunde erhält</p><input id="certName" type="text" placeholder="Name eintragen"><h2 id="certPreview">${rank}</h2><p>für ${points} gesammelte Wachau-Punkte bei Zuhause am Bach.</p><p><strong>Aggsbach Markt, ${date}</strong></p><p>🐾 Fidel · Gloria · Pia</p><p>🏡 Zuhause am Bach – Gästehaus Wachau</p></div><div class="button-row"><button onclick="updateCert()">Name übernehmen</button><button onclick="window.print()">🖨️ Drucken</button><button onclick="renderChallenge()">Zurück zu den Stempeln</button></div>`;
}
document.addEventListener("DOMContentLoaded",()=>{renderChallenge();});
