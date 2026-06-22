
const HOME = "Aggsbach Markt 82, 3641 Aggsbach Markt, Österreich";
function enc(x){return encodeURIComponent(x)}
function go(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"})}
function route(dest,mode="walking"){return `https://www.google.com/maps/dir/?api=1&origin=${enc(HOME)}&destination=${enc(dest)}&travelmode=${enc(mode)}`}
function komoot(q){return "https://www.google.com/search?q="+encodeURIComponent("Komoot "+q+" Wachau Tour")}
function google(q){return "https://www.google.com/search?q="+enc(q)}
function setLang(lang){
 const names={de:"Deutsch",en:"English",cz:"Čeština",hu:"Magyar",es:"Español",fr:"Français"};
 alert("Sprache gewählt: "+(names[lang]||lang)+". V40 zeigt die Kerninhalte derzeit auf Deutsch; die Sprachwahl ist funktionsbereit.");
}
async function loadWeather(){
 const box=document.getElementById("weatherBox"); if(!box)return;
 try{
  const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude=48.2949&longitude=15.4032&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FVienna&forecast_days=2");
  const d=await r.json(); const codes={0:"☀️ Sonnig",1:"🌤️ Klar",2:"⛅ Teilweise bewölkt",3:"☁️ Bewölkt",45:"🌫️ Nebel",61:"🌧️ Leichter Regen",63:"🌧️ Regen",65:"🌧️ Starker Regen",80:"🌦️ Schauer",95:"⛈️ Gewitter"};
  function card(i,t){const max=Math.round(d.daily.temperature_2m_max[i]),min=Math.round(d.daily.temperature_2m_min[i]),rain=d.daily.precipitation_probability_max[i]??0,txt=codes[d.daily.weather_code[i]]||"🌤️ Wetter";const amp=rain<35?"🟢 Gute Outdoor-Chance":rain<65?"🟡 Regenjacke einplanen":"🔴 Schlechtwetterprogramm";return `<article><h3>${t}</h3><p><strong>${txt}</strong></p><p>${min}–${max} °C · Regen ${rain}%</p><p><strong>${amp}</strong></p></article>`}
  box.innerHTML=card(0,"🌤 Heute")+card(1,"🌦 Morgen");
 }catch(e){box.innerHTML="<article><h3>🌤 Heute</h3><p>Wetter konnte nicht geladen werden.</p></article><article><h3>🌦 Morgen</h3><p>Internetverbindung prüfen.</p></article>"}
}
function showMorning(type){
 const data={wander:["🥾 Heute gemütlich starten","Aggsbach Markt – Willendorf – Venus-Fundstelle. Wasser mitnehmen, Wetter prüfen.","Willendorf in der Wachau","walking"],
 bike:["🚴 Donauradweg-Tag","Aggsbach Markt – Schwallenbach – Spitz. Rückweg je nach Kondition.","Spitz an der Donau","bicycling"],
 rain:["🌧 Regentag","Stift Melk, Wachaumuseum, Kaffeehaus oder kurze Spaziergänge zwischen Schauern.","Stift Melk","driving"],
 family:["🐾 Familie & Hund","Kurze Runde am Wasser, Schatzsuche mit Pia und danach Wachau-Quiz.","Aggsbach Markt","walking"]}[type];
 document.getElementById("morningResult").innerHTML=card(data[0],data[1],data[2],data[3]);
}
function card(title,text,dest,mode){
 return `<div class="result-card"><h3>${title}</h3><p>${text}</p><div class="actions"><a href="${route(dest,mode)}" target="_blank">🗺 Google Maps</a><a href="${komoot(dest)}" target="_blank">🟢 Komoot</a></div></div>`;
}
function showFidelRoute(){
 const dauer=document.getElementById("wanderDauer").value, schwer=document.getElementById("wanderSchwer").value, beg=document.getElementById("wanderBegleitung").value;
 let r={title:"🥾 Aggsbach Markt – Willendorf",text:"Gemütliche Nordufer-Route mit Donau-Nähe und Venus-Fundstelle.",dest:"Willendorf in der Wachau",km:"ca. 6–8 km",time:"2–3 h"};
 if(dauer==="mittel"||schwer==="mittel")r={title:"🥾 Aggsbach Markt – Schwallenbach – Spitz",text:"Fidels Empfehlung: schöne Nordufer-Tour Richtung Spitz mit Einkehrmöglichkeit.",dest:"Spitz an der Donau",km:"ca. 10–12 km",time:"3–4 h"};
 if(dauer==="lang"||schwer==="sportlich")r={title:"⛰ Aggsbach Markt – Spitz – Rotes Tor",text:"Sportlichere Tour für trittsichere Gäste. Bei Hitze oder Regen nicht ideal.",dest:"Rotes Tor Spitz an der Donau",km:"ca. 13–16 km",time:"4–5 h"};
 if(beg==="hund")r.text+=" Mit Hund: Wasser mitnehmen und Hitze beachten.";
 if(beg==="kind")r.text+=" Mit Kindern: Pausen einplanen und lieber kürzer gehen.";
 document.getElementById("wanderResult").innerHTML=`<div class="result-card"><h3>${r.title}</h3><p>${r.text}</p><div class="facts"><span>⏱ ${r.time}</span><span>📏 ${r.km}</span><span>🥾 Nordufer</span></div><div class="actions"><a href="${route(r.dest,'walking')}" target="_blank">Google Maps</a><a href="${komoot(r.dest)}" target="_blank">Komoot</a></div></div>`;
}
function showAllRoutes(){
 const routes=[["🌿 Willendorf & Venus","Willendorf in der Wachau","kurz"],["🥾 Schwallenbach & Spitz","Spitz an der Donau","mittel"],["⛰ Rotes Tor Spitz","Rotes Tor Spitz an der Donau","sportlich"],["🏰 Aggstein Blickroute","Burgruine Aggstein","Ausflug"]];
 document.getElementById("wanderResult").innerHTML="<div class='map-grid'>"+routes.map(x=>`<article><h3>${x[0]}</h3><p>${x[2]}</p><div class="actions"><a href="${route(x[1],'walking')}" target="_blank">Google Maps</a><a href="${komoot(x[1])}" target="_blank">Komoot</a></div></article>`).join("")+"</div>";
}
function renderMaps(){
 const items=[["🥾 Welterbesteig Richtung Willendorf","Aggsbach Markt → Willendorf","Nordufer · Venus-Fundstelle · gemütlich","Willendorf in der Wachau","walking"],["🚴 Donauradweg Richtung Spitz","Aggsbach Markt → Spitz","Donauradweg · Schwallenbach · Einkehr","Spitz an der Donau","bicycling"]];
 document.getElementById("mapCards").innerHTML=items.map(x=>`<article><h3>${x[0]}</h3><div class="map-placeholder">📍 ${x[1]}<br><small>${x[2]}</small></div><div class="actions"><a href="${route(x[3],x[4])}" target="_blank">Google Maps</a><a href="${komoot(x[3])}" target="_blank">Komoot öffnen</a></div></article>`).join("");
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
function showPia(mode){
 const b=document.getElementById("piaResult");
 if(mode==="quiz"){piaScore=0;piaAnswered={};let out=`<h3>🏆 Wachau-Quiz</h3><div id="piaScore" class="pia-score">0 von ${PIA.length} richtig</div>`;PIA.forEach((q,i)=>{out+=`<div class="pia-question"><strong>${i+1}. ${q.q}</strong><br>`+q.a.map((a,j)=>`<button onclick="answerPia(this,${i},${j})">${a}</button>`).join("")+`</div>`});out+=`<button onclick="showCertificate()">🏆 Urkunde anzeigen</button>`;b.innerHTML=out}
 if(mode==="suche")b.innerHTML=`<h3>🔍 Schatzsuche</h3><div class="treasure-list"><label><input type="checkbox"> Donau gesehen</label><label><input type="checkbox"> Marillenbaum entdeckt</label><label><input type="checkbox"> Weinberg gefunden</label><label><input type="checkbox"> Stein in Herzform gesucht</label><label><input type="checkbox"> Pia auf dem Bild entdeckt</label><label><input type="checkbox"> Wachaubahn oder Gleise gesehen</label></div><button onclick="showCertificate()">🏆 Urkunde erstellen</button>`;
 if(mode==="story")b.innerHTML=`<h3>📖 Geschichten</h3><div class="story-card"><strong>Pia und der kleine Bach</strong><p>Pia hörte das Wasser leise plätschern. „Hier beginnt ein Abenteuer“, dachte sie.</p></div><div class="story-card"><strong>Die Marille im Morgenlicht</strong><p>Als die Sonne über Aggsbach Markt aufging, glänzte eine Marille wie ein kleiner Schatz.</p></div><button onclick="showCertificate()">🏆 Urkunde</button>`;
}
function answerPia(btn,i,j){if(piaAnswered[i])return;piaAnswered[i]=true;if(j===PIA[i].ok){btn.classList.add("correct");piaScore++}else btn.classList.add("wrong");document.getElementById("piaScore").textContent=`${piaScore} von ${PIA.length} richtig`}
function showCertificate(){const d=new Date(),date=String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear();document.getElementById("piaResult").innerHTML=`<div id="certificatePrint" class="certificate"><h3>🏆 Wachau-Meister-Urkunde</h3><p>Diese Urkunde erhält</p><input id="certName" type="text" placeholder="Name eintragen"><h2 id="certPreview">Wachau-Meisterin / Wachau-Meister</h2><p>für Quiz, Schatzsuche und kleine Wachau-Abenteuer mit Pia.</p><p><strong>Aggsbach Markt, ${date}</strong></p><p>🐾 Fidel · Gloria · Pia</p></div><div class="button-row"><button onclick="updateCert()">Name übernehmen</button><button onclick="window.print()">🖨️ Drucken</button><button onclick="showPia('quiz')">Zurück zum Quiz</button></div>`}
function updateCert(){document.getElementById("certPreview").textContent=document.getElementById("certName").value||"Wachau-Meisterin / Wachau-Meister"}
function runAppCheck(){
 const checks=[
  ["Wetterblock",!!document.getElementById("weatherBox")],
  ["Fidels Wanderwelt",typeof showFidelRoute==="function"],
  ["Karten/Komoot",!!document.getElementById("mapCards")],
  ["Glorias Genusswelt",typeof showGloria==="function"],
  ["Heurigenfinder",typeof renderHeurigen==="function"],
  ["Pias Kinderwelt",typeof showPia==="function"],
  ["Bücherwelt",!!document.getElementById("buecherwelt")],
  ["Service-Links",document.querySelectorAll("#service a").length>=4]
 ];
 document.getElementById("appCheckResult").innerHTML="<div class='tip-grid'>"+checks.map(c=>`<article><h3>${c[1]?"✅":"❌"} ${c[0]}</h3><p>${c[1]?"funktioniert / vorhanden":"prüfen"}</p></article>`).join("")+"</div>";
}
document.addEventListener("DOMContentLoaded",()=>{loadWeather();showMorning("wander");showFidelRoute();renderMaps();showGloria("rad");setHeurigenDate("today");showPia("quiz")});
