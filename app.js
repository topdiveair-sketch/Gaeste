
const HOME = "Aggsbach Markt 82, 3641 Aggsbach Markt, Österreich";
function enc(x){return encodeURIComponent(x)}
function go(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"})}
function route(dest,mode="walking"){return `https://www.google.com/maps/dir/?api=1&origin=${enc(HOME)}&destination=${enc(dest)}&travelmode=${enc(mode)}`}
function komoot(q){return "https://www.google.com/search?q="+enc("site:komoot.com "+q+" Wachau Tour")}
function google(q){return "https://www.google.com/search?q="+enc(q)}
function outdooractive(q){return "https://www.google.com/search?q="+enc("site:outdooractive.com "+q+" Wachau Tour")}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]))}
function safeUrl(value){try{const url=new URL(value,location.href);return ["http:","https:"].includes(url.protocol)?url.href:"#"}catch(_e){return"#"}}
function newspaperLink(url,label){return `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`}
function newspaperList(items,renderer,emptyText){return items?.length?items.map(renderer).join(""):`<p class="newspaper-empty">${escapeHtml(emptyText)}</p>`}

async function loadDailyNewspaper(force=false){
 const status=document.getElementById("newspaperStatus"),content=document.getElementById("newspaperContent");
 if(!status||!content)return;
 status.textContent="Pia sammelt die aktuelle Ausgabe …";
 try{
  const response=await fetch(`tratsch-und-glatsch.json${force?`?t=${Date.now()}`:""}`,{cache:"no-store"});
  if(!response.ok)throw new Error("Ausgabe nicht erreichbar");
  const edition=await response.json();
  document.getElementById("newspaperStand").textContent=`Ausgabe: ${edition.editionLabel||edition.editionDate||"Stand nicht angegeben"}`;
  document.getElementById("newspaperIntro").textContent=edition.intro||"Pias Tagesüberblick für das Wachauer Nordufer.";
  const viennaToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vienna", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const editionFresh = edition.editionDate === viennaToday;
  status.textContent = editionFresh
    ? "Heutige redaktionelle Ausgabe geladen · Wetter wird live aktualisiert"
    : `⚠️ Ausgabe nicht aktuell (${edition.editionLabel||edition.editionDate||"ohne Datum"}). Wetter ist live, redaktionelle Inhalte bitte nicht als heutigen Stand verwenden.`;
  content.innerHTML=`
   <article class="newspaper-section"><h3>📌 Heute wichtig</h3>${newspaperList(edition.important,item=>`<div class="news-item"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p>${item.source?newspaperLink(item.source,item.sourceLabel||"Quelle"):""}</div>`,"Keine neue wichtige Meldung.")}</article>
   <article class="newspaper-section"><h3>🚴 Rad & Welterbesteig</h3>${newspaperList(edition.outdoor,item=>`<div class="news-item"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p><div class="news-links">${newspaperList(item.links,link=>newspaperLink(link.url,link.label),"")}</div></div>`,"Derzeit kein zusätzlicher Streckenhinweis.")}</article>
   <article class="newspaper-section newspaper-wide"><h3>🎉 Was ist los?</h3><div class="newspaper-table-wrap"><table class="newspaper-table"><thead><tr><th>Termin</th><th>Ort</th><th>Veranstaltung</th></tr></thead><tbody>${newspaperList(edition.events,item=>`<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.place)}</td><td>${newspaperLink(item.url,item.title)}<small>${escapeHtml(item.note||"")}</small></td></tr>`,`<tr><td colspan="3">Keine bevorstehende Veranstaltung gemeldet.</td></tr>`)}</tbody></table></div></article>
   <article class="newspaper-section newspaper-wide"><h3>🍷 Ausg’steckt is’</h3><div class="heurigen-news-grid">${newspaperList(edition.heurigen,item=>`<div class="heurigen-news"><h4>${newspaperLink(item.url,item.name)}</h4><p><strong>${escapeHtml(item.place)}</strong> · ${escapeHtml(item.period)}</p><p>${escapeHtml(item.hours)}</p>${item.phone?`<a href="tel:${escapeHtml(item.phone.replace(/\s/g,""))}">☎ ${escapeHtml(item.phone)}</a>`:""}</div>`,"Heute ist kein geöffneter Heuriger bestätigt.")}</div><h4 class="opening-soon-title">Öffnet in den nächsten Tagen</h4><ul class="nice-list">${newspaperList(edition.openingSoon,item=>`<li><strong>${escapeHtml(item.date)}:</strong> ${newspaperLink(item.url,item.name)}, ${escapeHtml(item.place)} – ${escapeHtml(item.hours)}</li>`,"<li>Keine weitere bestätigte Öffnung.</li>")}</ul></article>
   <article class="newspaper-section pia-tip"><h3>🐾 Pias Tipp des Tages</h3><p>${escapeHtml(edition.piaTip||"Schaut vor dem Aufbruch noch einmal auf Wetter und Wegzustand.")}</p></article>
   <article class="newspaper-section"><h3>💡 Gut zu wissen</h3><ul class="nice-list">${newspaperList(edition.goodToKnow,item=>`<li>${escapeHtml(item)}</li>`,`<li>Keine zusätzliche Information.</li>`)}</ul></article>`;
  secureExternalLinks(content);
  await loadNewspaperWeather();
 }catch(error){
  status.textContent="Die aktuelle Ausgabe konnte nicht geladen werden.";
  content.innerHTML=`<div class="newspaper-error">Bitte Internetverbindung prüfen und später erneut aktualisieren.</div>`;
 }
}

async function loadNewspaperWeather(){
 const box=document.getElementById("newspaperWeather");if(!box)return;
 try{
  const response=await fetch("https://api.open-meteo.com/v1/forecast?latitude=48.2949&longitude=15.4032&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=Europe%2FVienna&forecast_days=2",{cache:"no-store"});
  if(!response.ok)throw new Error("Wetter nicht erreichbar");
  const data=await response.json(),current=data.current,daily=data.daily;
  const codes={0:"Sonnig",1:"Überwiegend klar",2:"Teilweise bewölkt",3:"Bewölkt",45:"Nebel",48:"Nebel",51:"Nieselregen",53:"Nieselregen",55:"Starker Nieselregen",61:"Leichter Regen",63:"Regen",65:"Starker Regen",71:"Schnee",80:"Regenschauer",81:"Regenschauer",82:"Starke Schauer",95:"Gewitter",96:"Gewitter",99:"Starkes Gewitter"};
  const rain=daily.precipitation_probability_max?.[0]??0,wind=current.wind_speed_10m??0,gust=current.wind_gusts_10m??0;
  const advice=rain>=60?"Regenausrüstung mitnehmen und rutschige Wege einplanen.":gust>=45?"Auf exponierten Wegen und beim Radfahren auf starke Böen achten.":"Gute Voraussetzungen für eine Tour – Wasser und Sonnenschutz nicht vergessen.";
  box.innerHTML=`<div><span>🌦 Wetter am Nordufer</span><strong>${escapeHtml(codes[current.weather_code]||"Aktuelles Wetter")} · ${Math.round(current.temperature_2m)} °C</strong></div><div><span>Heute</span><strong>${Math.round(daily.temperature_2m_min[0])}–${Math.round(daily.temperature_2m_max[0])} °C · Regen ${rain}%</strong></div><div><span>Wind</span><strong>${Math.round(wind)} km/h · Böen ${Math.round(gust)} km/h</strong></div><p>${escapeHtml(advice)}</p>`;
 }catch(_error){box.innerHTML=`<p>Live-Wetter derzeit nicht verfügbar. <a href="#wetter">Zur ausführlichen Wetteransicht</a></p>`}
}
function setLang(lang){
 const names={de:"Deutsch",en:"English",cz:"Čeština",hu:"Magyar",es:"Español",fr:"Français"};
 const msg="Sprache gewählt: "+(names[lang]||lang)+". Die vollständige Übersetzung wird in einer späteren Version ergänzt.";
 let box=document.getElementById("langNotice");
 if(!box){
   box=document.createElement("div");
   box.id="langNotice";
   box.className="card";
   box.style.position="fixed";
   box.style.right="14px";
   box.style.top="90px";
   box.style.zIndex="9999";
   box.style.maxWidth="360px";
   document.body.appendChild(box);
 }
 box.innerHTML="<strong>🌍 "+(names[lang]||lang)+"</strong><br>"+msg;
 setTimeout(()=>{ if(box) box.remove(); },3500);
}
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
 if(!box)return;
 try{
  box.setAttribute("aria-busy","true");
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude=48.2949&longitude=15.4032&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FVienna&forecast_days=14",{cache:"no-store",signal:controller.signal});
  clearTimeout(timeout);
  if(!r.ok)throw new Error("Wetterdienst HTTP "+r.status);
  const d=await r.json();
  if(!d.daily||!Array.isArray(d.daily.time)||d.daily.time.length<2)throw new Error("Unvollständige Wetterdaten");
  try{localStorage.setItem("zabWeatherCache",JSON.stringify({saved:Date.now(),data:d}));}catch(_e){}
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
   let cache=null;
   try{cache=JSON.parse(localStorage.getItem("zabWeatherCache")||"null");}catch(_e){}
   if(cache&&cache.data&&Date.now()-cache.saved<21600000){
     const d=cache.data;
     const weatherText=i=>`${Math.round(d.daily.temperature_2m_min[i])}–${Math.round(d.daily.temperature_2m_max[i])} °C · Schauer ${d.daily.precipitation_probability_max[i]??0}%`;
     box.innerHTML=`<article><h3>🌤 Heute</h3><p>${weatherText(0)}</p></article><article><h3>🌦 Morgen</h3><p>${weatherText(1)}</p></article>`;
     if(updated)updated.textContent="Zuletzt geladene Wetterdaten · erneuter Abruf derzeit nicht möglich.";
   }else{
     box.innerHTML="<article><h3>🌤 Wetter vorübergehend nicht verfügbar</h3><p>Bitte später erneut versuchen.</p><button type='button' onclick='loadWeather()'>↻ Wetter erneut laden</button></article>";
     if(updated) updated.textContent="Der Wetterdienst ist derzeit nicht erreichbar.";
   }
 }finally{
   box.removeAttribute("aria-busy");
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
 let r={title:"🥾 Aggsbach Markt – Willendorf",text:"Gemütliche Nordufer-Route mit Donau-Nähe und Venus-Fundstelle.",dest:"Willendorf in der Wachau",km:"ca. 6–8 km",time:"2–3 h"};
 if(dauer==="mittel"||schwer==="mittel")r={title:"🥾 Aggsbach Markt – Schwallenbach – Spitz",text:"Fidels Empfehlung: schöne Nordufer-Tour Richtung Spitz mit Einkehrmöglichkeit.",dest:"Spitz an der Donau",km:"ca. 10–12 km",time:"3–4 h"};
 if(dauer==="lang"||schwer==="sportlich")r={title:"⛰ Aggsbach Markt – Spitz – Rotes Tor",text:"Sportlichere Tour für trittsichere Gäste. Bei Hitze oder Regen nicht ideal.",dest:"Rotes Tor Spitz an der Donau",km:"ca. 13–16 km",time:"4–5 h"};
 if(beg==="hund")r.text+=" Mit Hund: Wasser mitnehmen und Hitze beachten.";
 if(beg==="kind")r.text+=" Mit Kindern: Pausen einplanen und lieber kürzer gehen.";
 document.getElementById("wanderResult").innerHTML=`<div class="result-card"><h3>${r.title}</h3><p>${r.text}</p><div class="facts"><span>⏱ ${r.time}</span><span>📏 ${r.km}</span><span>🥾 Nordufer</span></div><div class="actions"><a href="${route(r.dest,'walking')}" target="_blank">Google Maps</a><a href="${komoot(r.dest)}" target="_blank">Komoot</a><a class="outdoor" href="${outdooractive(r.dest)}" target="_blank">Outdooractive</a></div></div>`;
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
function renderMaps(){
 const items=[["🥾 Welterbesteig Richtung Willendorf","Aggsbach Markt → Willendorf","Nordufer · Venus-Fundstelle · gemütlich","Willendorf in der Wachau","walking"],["🚴 Donauradweg Richtung Spitz","Aggsbach Markt → Spitz","Donauradweg · Schwallenbach · Einkehr","Spitz an der Donau","bicycling"]];
 document.getElementById("mapCards").innerHTML=items.map(x=>`<article><h3>${x[0]}</h3><div class="map-placeholder">📍 ${x[1]}<br><small>${x[2]}</small></div><div class="actions"><a href="${route(x[3],x[4])}" target="_blank">Google Maps</a><a href="${komoot(x[3])}" target="_blank">Komoot öffnen</a><a class="outdoor" href="${outdooractive(x[3])}" target="_blank">Outdooractive</a></div></article>`).join("");
}
function showGloria(mode){
 const b=document.getElementById("gloriaResult");
 if(mode==="rad")b.innerHTML=`<div class="map-grid"><article><h3>🚴 Genussrunde Spitz</h3><p>Aggsbach Markt – Schwallenbach – Spitz.</p><div class="actions"><a href="${route('Spitz an der Donau','bicycling')}" target="_blank">Route</a></div></article><article><h3>🚴 Weißenkirchen</h3><p>Für geübtere Radfahrer am Nordufer.</p><div class="actions"><a href="${route('Weißenkirchen in der Wachau','bicycling')}" target="_blank">Route</a></div></article></div>`;
 if(mode==="genuss")b.innerHTML=`<div class="map-grid"><article><h3>🍷 Donauschlössel / Gritsch</h3><p>Gäste-Tipp in Spitz. Öffnungszeiten prüfen.</p><div class="actions"><a href="${google('Donauschlössel Gritsch Spitz Öffnungszeiten')}" target="_blank">Prüfen</a></div></article><article><h3>🐟 Steckerlfisch Graf</h3><p>Emmersdorf, guter Tipp für Radfahrer und Wanderer.</p><div class="actions"><a href="${google('Steckerlfisch Graf Emmersdorf Öffnungszeiten')}" target="_blank">Prüfen</a></div></article></div>`;
 if(mode==="terrasse")b.innerHTML=`<div class="result-card"><h3>🍽️ Genussterrasse im Ort Aggsbach Markt</h3><p>Die Genussterrasse im Ort Aggsbach Markt hat <strong>Dienstag und Mittwoch Ruhetag.</strong></p><div class="actions"><a href="https://www.google.com/search?q=Genussterrasse+Aggsbach+Markt" target="_blank" rel="noopener">Genussterrasse suchen</a></div></div>`;
 if(mode==="service")b.innerHTML=`<div class="tip-grid"><article><h3>🚲 Fahrradgarage</h3><p>Sicher unterstellen.</p></article><article><h3>🔋 E-Bike laden</h3><p>Ladegerät bitte mitbringen.</p></article><article><h3>🧰 Werkzeug & Pumpe</h3><p>Kleine Hilfe bei Radproblemen.</p></article><article><h3>💧 Wasser</h3><p>Vor der Tour auffüllen.</p></article></div>`;
}
const HEURIGE=[["Genussterrasse","im Ort Aggsbach Markt","Genussterrasse Aggsbach Markt"],["Donauschlössel / Gritsch","Spitz an der Donau","Donauschlössel Gritsch Spitz an der Donau"],["Heurige in Spitz","Spitz an der Donau","Heuriger Spitz an der Donau"],["Heurige in Schwallenbach","Schwallenbach","Heuriger Schwallenbach Wachau"],["Heurige in Willendorf","Willendorf","Heuriger Willendorf Wachau"],["Heurige in Weißenkirchen","Weißenkirchen","Heuriger Weißenkirchen Wachau"]];
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
  ["Startbild",!!document.querySelector(".hero-img"),"Titelbild vorhanden"],
  ["Sprachwahl",document.querySelectorAll(".language-bar button").length===7,"7 Sprachbuttons vorhanden"],
  ["Smart-WLAN",!!document.getElementById("smartwifi") && typeof updateSmartWifi==="function","WLAN-Willkommensbereich vorhanden"],
  ["Wetter",!!document.getElementById("weatherBox") && typeof loadWeather==="function","Open-Meteo-Funktion vorhanden"],
  ["Fidels Wanderwelt",!!document.getElementById("wanderResult") && typeof showFidelRoute==="function","Empfehlungsfunktion vorhanden"],
  ["Alle Wander-Routen",typeof showAllRoutes==="function","Routenliste vorhanden"],
  ["Karten/Komoot",!!document.getElementById("mapCards") && typeof renderMaps==="function","Karten-Fallback vorhanden"],
  ["Glorias Radwelt",!!document.getElementById("gloriaResult") && typeof showGloria==="function","In-App-Auswahl vorhanden"],
  ["Tageszeitung",!!document.getElementById("tratsch-glatsch") && typeof loadDailyNewspaper==="function","Tratsch und Glatsch vorhanden"],
  ["Heurigenfinder",!!document.getElementById("heurigenResult") && typeof renderHeurigen==="function","Google-KI-Modus vorhanden"],
  ["Pias Kinderwelt",!!document.getElementById("piaResult") && typeof showPia==="function","Quiz/Schatzsuche/Geschichten vorhanden"],
  ["Bücherwelt",!!document.getElementById("buecherwelt"),"Bücherwelt vorhanden"],
  ["Service-Links",document.querySelectorAll("#service a").length>=6,"SMS/WhatsApp/Fähren/Wachaubahn vorhanden"],
  ["Interne Sprungziele",[...document.querySelectorAll('a[href^="#"]')].every(a=>document.getElementById(a.getAttribute('href').slice(1))),"Alle internen Links zeigen auf vorhandene Bereiche"],
  ["Externe Links",[...document.querySelectorAll('a[href^="http"]')].length>=8,"Google Maps, WhatsApp und Webseiten-Links vorhanden"],
  ["Copyright",!!document.querySelector(".footer"),"Copyright-Footer vorhanden"]
 ];
 const ok=checks.filter(c=>c[1]).length;
 document.getElementById("appCheckResult").innerHTML=
 `<div class="appcheck-summary">✅ ${ok} von ${checks.length} Kernfunktionen vorhanden.</div>`+
 "<div class='tip-grid'>"+checks.map(c=>`<article class="${c[1]?"check-ok":"check-bad"}"><h3>${c[1]?"✅":"❌"} ${c[0]}</h3><p>${c[2]}</p></article>`).join("")+"</div>";
}
document.addEventListener("DOMContentLoaded",()=>{updateSmartWifi();loadDailyNewspaper();loadWeather();showMorning("wander");showFidelRoute();renderMaps();showGloria("rad");setHeurigenDate("today");showPia("quiz")});

function secureExternalLinks(root=document){
 root.querySelectorAll?.('a[target="_blank"]').forEach(link=>{
   const rel=new Set((link.getAttribute("rel")||"").split(/\s+/).filter(Boolean));
   rel.add("noopener"); rel.add("noreferrer");
   link.setAttribute("rel",[...rel].join(" "));
 });
}
document.addEventListener("DOMContentLoaded",()=>{
 secureExternalLinks();
 new MutationObserver(entries=>entries.forEach(entry=>entry.addedNodes.forEach(node=>{
   if(node.nodeType===1)secureExternalLinks(node);
 }))).observe(document.body,{childList:true,subtree:true});
});
window.addEventListener("online",updateSmartWifi);
window.addEventListener("offline",updateSmartWifi);

// V47 – Willkommen im Rudel: Wachau-Challenge & Freunde-Bonus
const CHALLENGE_KEY = "zab_wachau_challenge_v46";
const CHALLENGE_ITEMS = [
  {id:"home", emoji:"🏡", title:"Zuhause am Bach", text:"Ankommen, durchatmen und willkommen bei uns.", points:10, main:true},
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
function resetChallenge(){if(confirm("Wachau-Challenge wirklich zurücksetzen?")){localStorage.removeItem(CHALLENGE_KEY);renderChallenge()}}
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
     <div class="actions"><button onclick="toggleChallenge('${item.id}')">${done?'Stempel entfernen':'Stempel sammeln'}</button>${routeLink}</div>
   </article>`;
 }).join("");
}
function showWachauCertificate(){
 const d=new Date(),date=String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear();
 const points=challengeScore(getChallenge()), rank=challengeRank(points);
 const box=document.getElementById("challengeGrid"); if(!box)return;
 box.innerHTML=`<div id="certificatePrint" class="certificate wachau-cert"><h3>🏆 Wachau-Challenge</h3><p>Diese Urkunde erhält</p><input id="certName" type="text" placeholder="Name eintragen"><h2 id="certPreview">${rank}</h2><p>für ${points} gesammelte Wachau-Punkte bei Zuhause am Bach.</p><p><strong>Aggsbach Markt, ${date}</strong></p><p>🐾 Fidel · Gloria · Pia</p><p>🏡 Zuhause am Bach – Gästehaus Wachau</p></div><div class="button-row"><button onclick="updateCert()">Name übernehmen</button><button onclick="window.print()">🖨️ Drucken</button><button onclick="renderChallenge()">Zurück zur Challenge</button></div>`;
}
function setupRecommendLinks(){
 const url="https://topdiveair-sketch.github.io/Gaeste/";
 const text="Ich war bei Zuhause am Bach in Aggsbach Markt – perfekt für Welterbesteig-Wanderer und Donauradweg-Radfahrer. Willkommen im Rudel der Wilden Wachauer Windis: "+url;
 const wa=document.getElementById("whatsappRecommend"); if(wa)wa.href="https://wa.me/?text="+enc(text);
 const mail=document.getElementById("mailRecommend"); if(mail)mail.href="mailto:?subject="+enc("Tipp: Zuhause am Bach in der Wachau")+"&body="+enc(text);
}

// V47 – App-Check erweitert
const _oldRunAppCheck = runAppCheck;
runAppCheck = function(){
 _oldRunAppCheck();
 const extra=[
  ["Startbotschaft",!!document.querySelector(".welcome h1"),"Willkommensbereich vorhanden"],
  ["Wachau-Challenge",!!document.getElementById("challenge") && typeof renderChallenge==="function","Punkte, Stempel und Fortschritt vorhanden"],
  ["Freunde-Bonus",!!document.getElementById("rudelbonus"),"Kaffee & Kuchen Bonus vorhanden"],
  ["Rudelstatus",!!document.getElementById("rudelstatus"),"Status-Stufen vorhanden"],
  ["Empfehlungslinks",!!document.getElementById("whatsappRecommend") && !!document.getElementById("mailRecommend"),"WhatsApp und E-Mail vorhanden"],
  ["Links ohne href",Array.from(document.querySelectorAll("a")).every(a=>a.hasAttribute("href")),"Alle Links haben ein Ziel"]
 ];
 const target=document.getElementById("appCheckResult");
 if(target){target.innerHTML += "<h3>V46-Prüfung</h3><div class='tip-grid'>"+extra.map(c=>`<article class="${c[1]?"check-ok":"check-bad"}"><h3>${c[1]?"✅":"❌"} ${c[0]}</h3><p>${c[2]}</p></article>`).join("")+"</div>";}
};

function buildArrivalMessage(){
 const value=id=>document.getElementById(id)?.value||"_____";
 return `Hallo! 😊
Wir möchten unsere Anreiseinformationen mitteilen.

🕒 Ankunft: ${value("arrivalTime")} Uhr
🧭 Anreiseart: ${value("arrivalMode")}
🥐 Frühstückszeit: ${value("breakfastTime")} Uhr
🧳 Gepäcktransport: ${value("luggageTransport")}
🥨 Jausenplatte: ${value("snackBoard")}
👥 Personen: ${value("guestCount")}
📝 Besondere Wünsche: ${value("specialRequests")}

Vielen Dank!`;
}
function updateArrivalLinks(){
 const message=buildArrivalMessage();
 const wa=document.getElementById("arrivalWhatsApp");
 const sms=document.getElementById("arrivalSms");
 if(wa)wa.href="https://wa.me/436646437526?text="+enc(message);
 if(sms)sms.href="sms:+436646437526?body="+enc(message);
}
function setupArrivalForm(){
 document.querySelectorAll("#anreise input,#anreise select,#anreise textarea").forEach(el=>{
   el.addEventListener("input",updateArrivalLinks);
   el.addEventListener("change",updateArrivalLinks);
 });
 updateArrivalLinks();
}
function setupFoodNotice(){
 const box=document.getElementById("foodDayNotice");
 const button=document.getElementById("snackWhatsApp");
 if(!box||!button)return;
 const day=new Date().getDay();
 if(day===2){
   box.className="food-day-notice warning";
   box.innerHTML="<h3>⚠️ Dienstag</h3><p>Heute ist die Genussterrasse geschlossen. In Aggsbach Markt gibt es derzeit keine verlässliche Möglichkeit zum Abendessen.</p>";
   button.hidden=false;
 }else if(day===3){
   box.className="food-day-notice info";
   box.innerHTML="<h3>ℹ️ Mittwoch</h3><p>Die Genussterrasse hat heute geschlossen. Als Alternative hat das Café-Pub Donauwelle geöffnet.</p>";
   button.hidden=false;
 }else{
   box.className="food-day-notice open";
   box.innerHTML="<h3>🍽️ Heute</h3><p>Die Genussterrasse hat geöffnet. Öffnungszeiten bitte prüfen.</p>";
   button.hidden=true;
 }
 const snackMessage=`Hallo! 😊
Wir möchten gerne eine Jausenplatte vorbestellen.

🥨 Jausenplatte für 2 Personen
💶 Gesamtpreis: 29,80 €
🕒 Ankunft: _____ Uhr
👥 Personen: _____
🧀 Wünsche/Unverträglichkeiten: _____

Vielen Dank!`;
 button.href="https://wa.me/436646437526?text="+enc(snackMessage);
}
function buildBookingMessage(){
 const value=id=>document.getElementById(id)?.value||"_____";
 return `Hallo! 😊
Wir möchten gerne direkt bei Zuhause am Bach anfragen.

📅 Anreise: ${value("bookingArrival")}
📅 Abreise: ${value("bookingDeparture")}
👥 Personen: ${value("bookingGuests")}
🛏️ Zimmerwunsch: ${value("bookingRoom")}
🥐 Frühstück: ${value("bookingBreakfast")}
📝 Nachricht: ${value("bookingMessage")}

Vielen Dank!`;
}
function updateBookingLink(){
 const link=document.getElementById("bookingWhatsApp");
 if(link)link.href="https://wa.me/436646437526?text="+enc(buildBookingMessage());
}
function setupQuickBooking(){
 document.querySelectorAll("#schnellanfrage input,#schnellanfrage select,#schnellanfrage textarea").forEach(el=>{
   el.addEventListener("input",updateBookingLink);
   el.addEventListener("change",updateBookingLink);
 });
 updateBookingLink();
}

document.addEventListener("DOMContentLoaded",()=>{
 const arrival=document.getElementById("anreise"),chronicle=document.getElementById("chronik");
 if(arrival&&chronicle)arrival.after(chronicle);
 renderChallenge();
 setupRecommendLinks();
 setupArrivalForm();
 setupFoodNotice();
});
