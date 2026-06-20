'use strict';

const APP_VERSION = '16.1 WACHAU-MEISTER URKUNDE';
const PHONE = '436646437526';
const HOME = 'Aggsbach Markt 82, 3641 Aggsbach Markt, Österreich';
let currentLang = safeGet('zab_lang') || 'de';
let lastRoute = null;

function safeGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
function escapeHTML(value){
 return String(value || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function todayDateDE(){ return new Date().toLocaleDateString('de-AT', {year:'numeric', month:'long', day:'numeric'}); }

const i18n = {
  de:{
    heroTitle:'Willkommen bei Zuhause am Bach – Gästehaus Wachau',heroSub:'Ihre Unterkunft am Welterbesteig Wachau und am Donauradweg in Aggsbach Markt. Willkommen bei den Wilden Wachauer Windis – dort, wo Geschichten entstehen.',navToday:'Heute',navHike:'Wandern',navBike:'Radfahren',navPia:'Kinderwelt',navService:'Service',
    riverRuleTitle:'Wichtige Wachau-Regel',riverRuleText:'Aggsbach Markt liegt am Nordufer. Südufer-Ziele wie Aggstein werden nicht als direkte Wanderroute empfohlen. Fähre, Transfer oder Umweg über Melk/Spitz beachten.',
    todayTitle:'Heute / Morgen in der Wachau',selectDay:'Tag',today:'Heute',tomorrow:'Morgen',guestType:'Gasttyp',hikers:'Wanderer',cyclists:'Radfahrer',families:'Familien',weather:'Wetter',dry:'Trocken',hot:'Heiß',rain:'Regen',showRecommendation:'Empfehlung anzeigen',
    fidelTitle:'🐾 Fidels Wanderwelt',fidelSub:'Geprüfte Nordufer-Routen und Komoot-Touren für Gäste von Zuhause am Bach.',duration:'Dauer',short:'1–2 Stunden',half:'3–4 Stunden',full:'Ganztag',difficulty:'Schwierigkeit',easy:'Leicht',medium:'Mittel',hard:'Anspruchsvoll',withDogKids:'Begleitung',adults:'Erwachsene',kids:'Mit Kindern',dog:'Mit Hund',fidelRecommend:'Fidels Empfehlung anzeigen',allHikes:'Alle Wander-Routen',
    gloriaTitle:'🍷 Glorias Rad- & Genusswelt',gloriaSub:'Donauradweg, Spitz, Gritsch und genussvolle Etappen.',bikeType:'Radtyp',tourBike:'Tourenrad',ebike:'E-Bike',sport:'Sportlich',direction:'Richtung',gloriaRecommend:'Glorias Rad-Empfehlung anzeigen',allBike:'Alle Rad-Routen',bikeServiceTitle:'Radservice im Haus',bikeServiceText:'Fahrradabstellplatz, E-Bike-Lademöglichkeit, Luftpumpe, Werkzeug, Wasser und Etappen-Tipps.',
    piaTitle:'🎀 Pias Kinderwelt',piaSub:'Quiz, Schatzsuche, Geschichten und kleine Wachau-Abenteuer mit Pia.',quizTitle:'🏆 Wachau-Quiz',treasureTitle:'🔍 Schatzsuche',storiesTitle:'📖 Geschichten',certificateTitle:'🏅 Urkunde',piaAdventureTitle:'Pias Ausflüge',
    serviceTitle:'🏡 Zuhause am Bach Service',breakfast:'Frühstück anfragen',snack:'Abendjause anfragen',luggage:'Gepäcktransport anfragen',help:'WhatsApp-Hilfe',review:'Google-Bewertung',
    mapPreviewTitle:'Karten- und Komoot-Vorschau',mapPreviewText:'Wenn die eingebettete Karte am Handy nicht lädt, bitte den Komoot- oder Google-Maps-Link nutzen.',mapPlaceholder:'Noch keine Route gewählt.',testTitle:'App-Test',runTest:'Funktionstest starten',
    openKomoot:'Komoot öffnen',showHere:'In App anzeigen',openMaps:'Google Maps',sendWhatsApp:'WhatsApp senden',recommended:'Empfohlen',feedbackText:'Hat Ihnen der Aufenthalt gefallen? Ihre Google-Bewertung hilft uns sehr. Vielen Dank von Hans, Laura, Fidel, Gloria und Pia!',
    quizIntro:'Beantworte 10 Fragen über die Wachau und die Wilden Wachauer Windis.',startQuiz:'Quiz starten',checkQuiz:'Quiz auswerten',restartQuiz:'Quiz neu starten',quizResult:'Ergebnis',points:'Punkte',certificateName:'Name für die Urkunde',showCertificate:'Urkunde anzeigen',printCertificate:'Urkunde drucken',treasureIntro:'Pia sucht mit euch kleine Wachau-Schätze. Hakt ab, was ihr entdeckt habt.',treasureResult:'Schatzsuche geschafft',storyRead:'Geschichte lesen',
    serviceBreakfast:'Hallo Hans & Laura, wir möchten gerne Frühstück anfragen.',serviceSnack:'Hallo Hans & Laura, wir möchten gerne eine Abendjause anfragen.',serviceLuggage:'Hallo Hans & Laura, wir möchten gerne Gepäcktransport anfragen.',serviceHelp:'Hallo Hans & Laura, wir brauchen bitte Hilfe/Information.'
  },
  en:{navToday:'Today',navHike:'Hiking',navBike:'Cycling',navPia:'Kids',navService:'Service',heroTitle:'Welcome to Zuhause am Bach – Gästehaus Wachau',heroSub:'Your accommodation on the Welterbesteig Wachau and the Danube Cycle Path in Aggsbach Markt. Welcome to the Wild Wachau Windis – where stories begin.',riverRuleTitle:'Important Wachau rule',riverRuleText:'Aggsbach Markt is on the north bank. South-bank destinations such as Aggstein are not direct walking routes.',todayTitle:'Today / tomorrow in the Wachau',selectDay:'Day',today:'Today',tomorrow:'Tomorrow',guestType:'Guest type',hikers:'Hikers',cyclists:'Cyclists',families:'Families',weather:'Weather',dry:'Dry',hot:'Hot',rain:'Rain',showRecommendation:'Show recommendation',fidelTitle:'🐾 Fidel’s hiking world',fidelSub:'Checked north-bank routes and Komoot tours.',duration:'Duration',short:'1–2 hours',half:'3–4 hours',full:'Full day',difficulty:'Difficulty',easy:'Easy',medium:'Medium',hard:'Demanding',withDogKids:'Companion',adults:'Adults',kids:'With children',dog:'With dog',fidelRecommend:'Show Fidel’s recommendation',allHikes:'All hiking routes',gloriaTitle:'🍷 Gloria’s cycling & pleasure world',gloriaSub:'Danube Cycle Path, Spitz, Gritsch and enjoyable stages.',bikeType:'Bike type',tourBike:'Touring bike',ebike:'E-bike',sport:'Sporty',direction:'Direction',gloriaRecommend:'Show Gloria’s cycling tip',allBike:'All cycling routes',bikeServiceTitle:'Bike service at the house',bikeServiceText:'Bike storage, e-bike charging, pump, tools, water and stage tips.',piaTitle:'🎀 Pia’s kids world',piaSub:'Quiz, treasure hunt, stories and small Wachau adventures with Pia.',quizTitle:'🏆 Wachau quiz',treasureTitle:'🔍 Treasure hunt',storiesTitle:'📖 Stories',certificateTitle:'🏅 Certificate',piaAdventureTitle:'Pia’s trips',serviceTitle:'🏡 Zuhause am Bach service',breakfast:'Ask for breakfast',snack:'Ask for evening snack',luggage:'Ask for luggage transfer',help:'WhatsApp help',review:'Google review',mapPreviewTitle:'Map and Komoot preview',mapPreviewText:'If the embedded map does not load, use Komoot or Google Maps.',mapPlaceholder:'No route selected yet.',testTitle:'App test',runTest:'Start function test',openKomoot:'Open Komoot',showHere:'Show in app',openMaps:'Google Maps',sendWhatsApp:'Send WhatsApp',recommended:'Recommended',feedbackText:'Did you enjoy your stay? Your Google review helps us a lot. Thank you from Hans, Laura, Fidel, Gloria and Pia!',quizIntro:'Answer 10 questions about the Wachau and the Wild Wachau Windis.',startQuiz:'Start quiz',checkQuiz:'Check quiz',restartQuiz:'Restart quiz',quizResult:'Result',points:'points',certificateName:'Name for certificate',showCertificate:'Show certificate',printCertificate:'Print certificate',treasureIntro:'Pia invites you to find little Wachau treasures. Tick what you discover.',treasureResult:'Treasure hunt completed',storyRead:'Read story',serviceBreakfast:'Hello Hans & Laura, we would like to ask for breakfast.',serviceSnack:'Hello Hans & Laura, we would like to ask for an evening snack.',serviceLuggage:'Hello Hans & Laura, we would like to ask for luggage transfer.',serviceHelp:'Hello Hans & Laura, we need help/information.'},
  cs:{navToday:'Dnes',navHike:'Pěšky',navBike:'Kolo',navPia:'Děti',navService:'Servis',heroTitle:'Vítejte u Divokých wachauských Windis',heroSub:'Fidel zná túry, Gloria požitek a Pia dobrodružství.',piaTitle:'🎀 Piin dětský svět',piaSub:'Kvíz, hledání pokladu, příběhy a malá dobrodružství ve Wachau.',quizTitle:'🏆 Kvíz Wachau',treasureTitle:'🔍 Hledání pokladu',storiesTitle:'📖 Příběhy',certificateTitle:'🏅 Diplom',piaAdventureTitle:'Piiny výlety',startQuiz:'Spustit kvíz',checkQuiz:'Vyhodnotit kvíz',restartQuiz:'Znovu',points:'bodů',showCertificate:'Zobrazit diplom',printCertificate:'Tisknout diplom'},
  hu:{navToday:'Ma',navHike:'Túra',navBike:'Kerékpár',navPia:'Gyerekek',navService:'Szerviz',piaTitle:'🎀 Pia gyerekvilága',quizTitle:'🏆 Wachau kvíz',treasureTitle:'🔍 Kincskeresés',storiesTitle:'📖 Történetek',certificateTitle:'🏅 Oklevél'},
  es:{navToday:'Hoy',navHike:'Senderismo',navBike:'Bici',navPia:'Niños',navService:'Servicio',piaTitle:'🎀 Mundo infantil de Pia',quizTitle:'🏆 Quiz de Wachau',treasureTitle:'🔍 Búsqueda del tesoro',storiesTitle:'📖 Historias',certificateTitle:'🏅 Diploma'},
  fr:{navToday:'Aujourd’hui',navHike:'Randonnée',navBike:'Vélo',navPia:'Enfants',navService:'Service',piaTitle:'🎀 Le monde des enfants de Pia',quizTitle:'🏆 Quiz Wachau',treasureTitle:'🔍 Chasse au trésor',storiesTitle:'📖 Histoires',certificateTitle:'🏅 Diplôme'}
};

const routeTexts = {
 de:{genuss:'Kurze aussichtsreiche Wanderung mit Wachau-Blick.',melk:'Welterbesteig-Richtung Emmersdorf und Melk. Nordufer-Logik beachten.',jauerling:'Anspruchsvolle Tour über den Jauerling zurück nach Aggsbach Markt.',welterbe:'Komoot-Collection mit Welterbesteig-Etappen.',rotes:'Spitzer Klassiker mit Rotem Tor, Weinbergen und Aussicht.',hinterhaus:'Burgruine bei Spitz mit starkem Donaublick.',venus:'Kulturstopp zur Venus von Willendorf.',donaurad:'Donauradweg Wachau als Komoot-Radtour.',radspitz:'Kurze Genussrunde nach Spitz.',radmelk:'Radtour Richtung Melk.',radkrems:'Längere Radtour Richtung Krems.',bogen:'Bogenschießen in Aggsbach Markt als Erlebnisangebot.',gritsch:'Genussziel in Spitz: Donauschlössel / Familie Gritsch.'},
 en:{genuss:'Short scenic walk with Wachau views.',melk:'Welterbesteig direction Emmersdorf and Melk.',jauerling:'Demanding tour over the Jauerling back to Aggsbach Markt.',welterbe:'Komoot collection with Welterbesteig stages.',rotes:'Spitz classic route with Rotes Tor, vineyards and views.',hinterhaus:'Castle ruin near Spitz with fine Danube views.',venus:'Cultural stop at the Venus of Willendorf.',donaurad:'Danube Cycle Path Wachau as Komoot cycling route.',radspitz:'Short pleasure ride to Spitz.',radmelk:'Bike route towards Melk.',radkrems:'Longer bike route towards Krems.',bogen:'Archery in Aggsbach Markt as an experience.',gritsch:'Pleasure stop in Spitz: Donauschlössel / Gritsch.'}
};
function rt(key){ return (routeTexts[currentLang]&&routeTexts[currentLang][key]) || routeTexts.en[key] || routeTexts.de[key] || key; }

const ROUTES = [
 {id:'genussterrasse',type:'hike',title:'🌄 Genussterrasse Wachau',descKey:'genuss',duration:'short',level:'easy',bank:'Nordufer',mode:'walking',komoot:'https://www.komoot.com/tour/3039220789',embed:'https://www.komoot.com/tour/3039220789/embed?share_token=a08JKlo9qv59A87P0aKzwXDB8i84pNInfUSCYNJZpvx3yGB5qr&hl=de&layout=classic&profile=1',mapsTo:'Aggsbach Markt, Niederösterreich'},
 {id:'melk-emmersdorf',type:'hike',title:'🥾 Aggsbach Markt → Emmersdorf → Melk',descKey:'melk',duration:'full',level:'hard',bank:'Nordufer',mode:'walking',komoot:'https://www.komoot.com/tour/3039245626',embed:'https://www.komoot.com/tour/3039245626/embed?share_token=a87ylE7HGJCvX8V23IBhwkEJ5VFSNu22CJUWyPTJMUVuxnoVAN&hl=de&layout=classic&profile=1',mapsTo:'Melk, Österreich'},
 {id:'muehldorf-jauerling',type:'hike',title:'⛰️ Mühldorf → Jauerling → Aggsbach Markt',descKey:'jauerling',duration:'full',level:'hard',bank:'Nordufer',mode:'walking',komoot:'https://www.komoot.com/tour/3039257390',embed:'https://www.komoot.com/tour/3039257390/embed?share_token=aUR03AZjC2ochXm4Yn5c7Hd7xo1IFu1fE9656SFyIEpQiJrj4E&hl=de&layout=classic&profile=1',mapsTo:'Aggsbach Markt via Jauerling'},
 {id:'welterbesteig',type:'hike',title:'🏆 Welterbesteig Wachau',descKey:'welterbe',duration:'full',level:'medium',bank:'Nordufer',mode:'walking',komoot:'https://www.komoot.com/de-de/collection/1952145/wandern-im-unesco-welterbe-auf-dem-welterbesteig-wachau',mapsTo:'Aggsbach Markt Welterbesteig Wachau'},
 {id:'rotes-tor',type:'hike',title:'🚪 Rotes Tor Rundweg Spitz',descKey:'rotes',duration:'half',level:'medium',bank:'Nordufer',mode:'walking',komoot:'https://www.komoot.com/discover/Spitz/@48.365,15.414/tours',mapsTo:'Rotes Tor Spitz Niederösterreich'},
 {id:'hinterhaus',type:'hike',title:'🏰 Ruine Hinterhaus Spitz',descKey:'hinterhaus',duration:'half',level:'medium',bank:'Nordufer',mode:'walking',komoot:'https://www.komoot.com/discover/Ruine_Hinterhaus',mapsTo:'Ruine Hinterhaus Spitz'},
 {id:'venus',type:'adventure',title:'🗿 Venus von Willendorf',descKey:'venus',duration:'short',level:'easy',bank:'Nordufer',mode:'walking',komoot:'https://www.aggsbach.gv.at/Fundstelle_der_Venus_von_Willendorf',mapsTo:'Venusium Willendorf in der Wachau'},
 {id:'donauradweg-komoot',type:'bike',title:'🚲 Donauradweg Wachau',descKey:'donaurad',duration:'full',level:'medium',bank:'Nordufer',mode:'bicycling',komoot:'https://www.komoot.com/tour/3039269031',embed:'https://www.komoot.com/tour/3039269031/embed?share_token=arp2CE4y17KgQQGc9ncxeLhwl8jfZO5aCfn4uXg8v8oWyrNk13&hl=de&layout=classic&profile=1',mapsTo:'Spitz, Niederösterreich'},
 {id:'rad-spitz',type:'bike',title:'🚲 Aggsbach Markt → Spitz',descKey:'radspitz',duration:'short',level:'easy',bank:'Nordufer',mode:'bicycling',komoot:'https://www.komoot.com/tour/3039269031',embed:'https://www.komoot.com/tour/3039269031/embed?share_token=arp2CE4y17KgQQGc9ncxeLhwl8jfZO5aCfn4uXg8v8oWyrNk13&hl=de&layout=classic&profile=1',mapsTo:'Spitz, Niederösterreich'},
 {id:'rad-melk',type:'bike',title:'🚲 Aggsbach Markt → Melk',descKey:'radmelk',duration:'half',level:'medium',bank:'Nordufer',mode:'bicycling',komoot:'https://www.komoot.com/tour/3039269031',embed:'https://www.komoot.com/tour/3039269031/embed?share_token=arp2CE4y17KgQQGc9ncxeLhwl8jfZO5aCfn4uXg8v8oWyrNk13&hl=de&layout=classic&profile=1',mapsTo:'Melk, Österreich'},
 {id:'rad-krems',type:'bike',title:'🚲 Aggsbach Markt → Krems',descKey:'radkrems',duration:'full',level:'hard',bank:'Nordufer',mode:'bicycling',komoot:'https://www.komoot.com/tour/3039269031',embed:'https://www.komoot.com/tour/3039269031/embed?share_token=arp2CE4y17KgQQGc9ncxeLhwl8jfZO5aCfn4uXg8v8oWyrNk13&hl=de&layout=classic&profile=1',mapsTo:'Krems an der Donau'},
 {id:'bogen',type:'adventure',title:'🏹 Bogenschießen Aggsbach Markt',descKey:'bogen',duration:'short',level:'easy',bank:'Nordufer',mode:'walking',komoot:'https://www.wbu-aggsbach.at/WBU/',mapsTo:'WBU Aggsbach'},
 {id:'gritsch',type:'adventure',title:'🍷 Donauschlössel / Gritsch in Spitz',descKey:'gritsch',duration:'short',level:'easy',bank:'Nordufer',mode:'bicycling',komoot:'https://www.donauschloessel.at/',mapsTo:'Donauschlössel Spitz Donaulände 3'}
];

const QUIZ = [
 {q:'Wie heißt der große graue Galgo?',a:['Gloria','Pia','Fidel'],ok:2},
 {q:'Wie heißt die braun gestromte Galga?',a:['Gloria','Luna','Sissi'],ok:0},
 {q:'Welcher Fluss fließt durch die Wachau?',a:['Inn','Mur','Donau'],ok:2},
 {q:'Wofür ist die Wachau berühmt?',a:['Kartoffeln','Marillen','Bananen'],ok:1},
 {q:'In welchem Ort liegt Zuhause am Bach?',a:['Melk','Aggsbach Markt','Dürnstein'],ok:1},
 {q:'Welche Bahn fährt durch die Wachau?',a:['Wachaubahn','Semmeringbahn','U-Bahn'],ok:0},
 {q:'Wo findet man die Ruine Hinterhaus?',a:['Spitz','Krems','Wien'],ok:0},
 {q:'Welcher Berg ist der höchste der Wachau?',a:['Jauerling','Schneeberg','Ötscher'],ok:0},
 {q:'Was kann man in Aggsbach Markt ausprobieren?',a:['Bogenschießen','Skifliegen','Surfen'],ok:0},
 {q:'Wie heißt das kleine Whippet-Mädchen?',a:['Fidel','Gloria','Pia'],ok:2}
];
const TREASURES = ['Donau','Wachaubahn','Marillenbaum','Weinberg','Aussichtspunkt','Herzförmiger Stein','Schmetterling','Donauschiff','Ruine','Windhund'];
const STORIES = [
 {title:'Pia und die Donau',text:'Pia steht am Ufer, hört das Wasser rauschen und weiß: Jeder Tag in der Wachau beginnt mit einem kleinen Abenteuer.'},
 {title:'Pia auf dem Jauerling',text:'Der Weg ist steil, aber Pia gibt nicht auf. Oben sieht sie die Donau glänzen wie ein silbernes Band.'},
 {title:'Pia entdeckt die Venus',text:'In Willendorf findet Pia eine Geschichte, die viel älter ist als alle Windis zusammen.'},
 {title:'Pia und die Wachaubahn',text:'Wenn die Wachaubahn vorbeifährt, spitzt Pia die Ohren. Fidel nickt: Fahrpläne sind auch Geschichten.'}
];
let lastQuizScore = 0;

function t(key){return (i18n[currentLang]&&i18n[currentLang][key]) || i18n.en[key] || i18n.de[key] || key;}
function el(id){return document.getElementById(id);}
function enc(v){return encodeURIComponent(v);}
function mapsUrl(route){return `https://www.google.com/maps/dir/?api=1&origin=${enc(HOME)}&destination=${enc(route.mapsTo || route.title)}&travelmode=${route.mode||'walking'}`;}
function waUrl(text){return `https://wa.me/${PHONE}?text=${enc(text)}`;}

function applyLanguage(lang){
 currentLang = lang; safeSet('zab_lang', lang); document.documentElement.lang = lang;
 document.querySelectorAll('[data-i18n]').forEach(node=>{ node.textContent = t(node.dataset.i18n); });
 document.querySelectorAll('.language-bar button').forEach(btn=>btn.classList.toggle('active', btn.dataset.lang===lang));
 renderRoutes(); renderKids(); if(lastRoute) showRoute(lastRoute.id, false);
}

function routeCard(route){
 const tags = [`<span class="tag">${route.bank}</span>`, `<span class="tag">${route.mode==='bicycling'?'🚲':'🚶'}</span>`, `<span class="tag">${route.level}</span>`].join('');
 const komootBtn = route.komoot ? `<a class="secondary" target="_blank" rel="noopener" href="${route.komoot}">${t('openKomoot')}</a>` : '';
 const embedBtn = route.embed ? `<button class="secondary" data-show-route="${route.id}">${t('showHere')}</button>` : '';
 return `<article class="route-card"><h4>${route.title}</h4><div class="meta">${rt(route.descKey)}</div>${tags}<div class="route-actions"><a target="_blank" rel="noopener" href="${mapsUrl(route)}">${t('openMaps')}</a>${komootBtn}${embedBtn}</div></article>`;
}
function renderRoutes(){
 el('hikeRoutes').innerHTML = ROUTES.filter(r=>r.type==='hike').map(routeCard).join('');
 el('bikeRoutes').innerHTML = ROUTES.filter(r=>r.type==='bike').map(routeCard).join('');
 el('adventureRoutes').innerHTML = ROUTES.filter(r=>r.type==='adventure').map(routeCard).join('');
 document.querySelectorAll('[data-show-route]').forEach(btn=>btn.addEventListener('click',()=>showRoute(btn.dataset.showRoute,true)));
}
function showRoute(routeId, scroll=true){
 const route = ROUTES.find(r=>r.id===routeId); if(!route) return; lastRoute = route; const preview = el('mapPreview');
 if(route.embed){ preview.innerHTML = `<iframe title="${route.title}" src="${route.embed}" loading="lazy" allowfullscreen></iframe>`; }
 else { preview.innerHTML = `<div><strong>${route.title}</strong><br><a href="${route.komoot || mapsUrl(route)}" target="_blank" rel="noopener">${route.komoot?t('openKomoot'):t('openMaps')}</a></div>`; }
 if(scroll) preview.scrollIntoView({behavior:'smooth',block:'start'});
}
function pickHike(){
 const duration=el('hikeDuration').value, level=el('hikeLevel').value, companion=el('hikeCompanion').value; let list=ROUTES.filter(r=>r.type==='hike');
 if(duration) list=list.filter(r=>r.duration===duration || (duration==='full' && r.duration==='half'));
 if(level==='easy') list=list.filter(r=>r.level==='easy' || r.level==='medium');
 if(level==='hard') list=list.filter(r=>r.level==='hard' || r.duration==='full');
 if(companion==='kids') list=list.filter(r=>r.level!=='hard');
 if(companion==='dog') list=list.filter(r=>r.bank==='Nordufer');
 return list[0] || ROUTES.find(r=>r.id==='genussterrasse');
}
function showHikeRecommendation(){ const route=pickHike(); el('hikeAdvisorResult').innerHTML=recommendationHtml('🐾 Fidel',route); attachResultButtons(); }
function pickBike(){ const dir=el('bikeDirection').value; return ROUTES.find(r=>r.id===`rad-${dir}`) || ROUTES.find(r=>r.id==='donauradweg-komoot'); }
function showBikeRecommendation(){ const route=pickBike(); el('bikeAdvisorResult').innerHTML=recommendationHtml('🍷 Gloria',route); attachResultButtons(); }
function showMorning(){
 const guest=el('guestType').value, weather=el('weatherSelect').value; let route;
 if(weather==='rain') route = guest==='bike' ? ROUTES.find(r=>r.id==='rad-spitz') : ROUTES.find(r=>r.id==='venus');
 else if(weather==='hot') route = guest==='bike' ? ROUTES.find(r=>r.id==='rad-spitz') : ROUTES.find(r=>r.id==='genussterrasse');
 else route = guest==='bike' ? ROUTES.find(r=>r.id==='donauradweg-komoot') : guest==='family' ? ROUTES.find(r=>r.id==='bogen') : ROUTES.find(r=>r.id==='rotes-tor');
 el('morningResult').innerHTML=recommendationHtml(t('recommended'),route); attachResultButtons();
}
function recommendationHtml(who, route){
 return `<strong>${who}: ${route.title}</strong><p>${rt(route.descKey)}</p><div class="route-actions"><a target="_blank" rel="noopener" href="${mapsUrl(route)}">${t('openMaps')}</a>${route.komoot?`<a class="secondary" target="_blank" rel="noopener" href="${route.komoot}">${t('openKomoot')}</a>`:''}${route.embed?`<button class="secondary" data-show-route="${route.id}">${t('showHere')}</button>`:''}</div>`;
}
function attachResultButtons(){document.querySelectorAll('[data-show-route]').forEach(btn=>btn.onclick=()=>showRoute(btn.dataset.showRoute,true));}

function renderKids(){ renderQuiz(); renderTreasure(); renderStories(); renderCertificate(); bindKidsTabs(); }
function bindKidsTabs(){ document.querySelectorAll('[data-kid-tab]').forEach(btn=>btn.onclick=()=>showKidTab(btn.dataset.kidTab)); }
function showKidTab(name){
 document.querySelectorAll('.kid-tab').forEach(b=>b.classList.toggle('active',b.dataset.kidTab===name));
 const map={quiz:'kidsQuiz',treasure:'kidsTreasure',stories:'kidsStories',certificate:'kidsCertificate'};
 Object.values(map).forEach(id=>el(id).classList.add('hidden')); el(map[name]).classList.remove('hidden');
}
function renderQuiz(){
 el('kidsQuiz').innerHTML = `<p>${t('quizIntro')}</p><div id="quizQuestions">${QUIZ.map((q,i)=>`<div class="quiz-question"><b>${i+1}. ${q.q}</b>${q.a.map((ans,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${ans}</label>`).join('')}</div>`).join('')}</div><div class="route-actions"><button id="checkQuizBtn">${t('checkQuiz')}</button><button class="secondary" id="restartQuizBtn">${t('restartQuiz')}</button></div><div id="quizResult" class="result"></div>`;
 el('checkQuizBtn').onclick=checkQuiz; el('restartQuizBtn').onclick=renderQuiz;
}
function checkQuiz(){
 let score=0; QUIZ.forEach((q,i)=>{ const chosen=document.querySelector(`input[name="q${i}"]:checked`); if(chosen && Number(chosen.value)===q.ok) score++; }); lastQuizScore=score;
 let rank = score===10 ? '🏆 Wachau-Meister' : score>=7 ? '🐾 Windis-Profi' : score>=4 ? '🔍 Wachau-Entdecker' : '🌱 Wachau-Anfänger';
 el('quizResult').innerHTML = `<strong>${t('quizResult')}: ${score}/10 ${t('points')}</strong><br>${rank}<div class="route-actions"><button onclick="showKidTab('certificate')">${t('showCertificate')}</button></div>`;
 renderCertificate();
}
function renderTreasure(){
 el('kidsTreasure').innerHTML = `<p>${t('treasureIntro')}</p><div class="treasure-grid">${TREASURES.map((x,i)=>`<label><input type="checkbox" class="treasure-check"> ${x}</label>`).join('')}</div><div id="treasureScore" class="result"></div>`;
 document.querySelectorAll('.treasure-check').forEach(cb=>cb.onchange=updateTreasure);
}
function updateTreasure(){ const count=document.querySelectorAll('.treasure-check:checked').length; el('treasureScore').innerHTML = `<strong>${count}/${TREASURES.length}</strong><br>${count===TREASURES.length?'🏆 '+t('treasureResult'):'🎀 Pia sagt: weiter suchen!'}`; }
function renderStories(){
 el('kidsStories').innerHTML = STORIES.map(s=>`<article class="story-card"><h4>${s.title}</h4><p>${s.text}</p></article>`).join('');
}
function renderCertificate(){
 const title = lastQuizScore===10 ? 'Wachau-Meister' : lastQuizScore>=7 ? 'Windis-Profi' : lastQuizScore>=4 ? 'Wachau-Entdecker' : 'Wachau-Anfänger';
 el('kidsCertificate').innerHTML = `
   <div class="certificate-tools">
     <label class="cert-name"><span>${t('certificateName')}</span><input id="certName" placeholder="Name direkt hier eingeben" autocomplete="name"></label>
     <label class="cert-name"><span>Foto für die Urkunde</span><input id="certPhoto" type="file" accept="image/*" capture="user"></label>
     <p class="cert-note">Am Handy öffnet sich Kamera oder Galerie. Das Foto bleibt nur auf diesem Gerät und wird nicht hochgeladen.</p>
   </div>
   <div class="certificate certificate-landscape" id="certificatePrintArea">
     <div class="certificate-border">
       <div class="cert-top">Zuhause am Bach – Gästehaus Wachau · Welterbesteig Wachau · Donauradweg</div>
       <h3>🏆 ${title.toUpperCase()} 🏆</h3>
       <p class="cert-small">Diese Urkunde erhält</p>
       <strong id="certNameOut" class="cert-person">________________</strong>
       <div id="certPhotoFrame" class="cert-photo-frame"><span>📸 Foto</span></div>
       <p class="cert-text">für hervorragende Kenntnisse über die Wachau, den Welterbesteig Wachau, den Donauradweg und die Wilden Wachauer Windis.</p>
       <p class="cert-checks">✓ Pias Wachau-Quiz · ✓ Schatzsuche · ✓ Wachau-Entdecker-Aufgaben</p>
       <p class="cert-score">${lastQuizScore}/10 ${t('points')} · Aggsbach Markt, ${todayDateDE()}</p>
       <div class="cert-signatures"><span>🐾 Fidel</span><span>🍷 Gloria</span><span>🎀 Pia</span></div>
       <div class="cert-footer">© Johann Prem · Die Wilden Wachauer Windis · Tel. +43 664 6437526</div>
     </div>
   </div>
   <div class="route-actions"><button id="printCertBtn">🖨️ ${t('printCertificate')} – DIN A4 Querformat</button></div>`;
 const input=el('certName');
 input.oninput=()=>{ el('certNameOut').textContent = input.value.trim() || '________________'; };
 const photoInput=el('certPhoto');
 photoInput.onchange=event=>{
   const file=event.target.files && event.target.files[0];
   if(!file) return;
   const reader=new FileReader();
   reader.onload=()=>{ el('certPhotoFrame').innerHTML = `<img src="${escapeHTML(reader.result)}" alt="Foto für Wachau-Meister-Urkunde">`; };
   reader.readAsDataURL(file);
 };
 el('printCertBtn').onclick=()=>window.print();
}

function serviceText(kind){ return {breakfast:t('serviceBreakfast'),snack:t('serviceSnack'),luggage:t('serviceLuggage'),help:t('serviceHelp'),review:t('feedbackText')}[kind]; }
function openWhatsApp(kind){ window.open(waUrl(serviceText(kind)),'_blank','noopener'); el('serviceResult').innerHTML=`<strong>${t('sendWhatsApp')}</strong><br>${serviceText(kind)}`; }
function openReview(){ const reviewSearch='https://www.google.com/search?q='+enc('Zuhause am Bach Wachau Google Bewertung'); window.open(reviewSearch,'_blank','noopener'); el('serviceResult').innerHTML=`<strong>${t('review')}</strong><br>${t('feedbackText')}`; }


const WEATHER_FALLBACK = {
  today: 'Heute: Wetterdaten derzeit nicht verfügbar. Bitte Auswahl unten nutzen.',
  tomorrow: 'Morgen: Wetterdaten derzeit nicht verfügbar. Bitte Auswahl unten nutzen.'
};
function weatherCodeText(code){
  const map = {
    0:'Sonnig',1:'Überwiegend sonnig',2:'Teilweise bewölkt',3:'Bewölkt',45:'Nebel',48:'Nebel/Reif',
    51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',61:'Leichter Regen',63:'Regen',65:'Starker Regen',
    71:'Leichter Schneefall',73:'Schneefall',75:'Starker Schneefall',80:'Regenschauer',81:'Regenschauer',82:'Starke Regenschauer',95:'Gewitter'
  };
  return map[code] || 'Wetterlage';
}
function planningWeatherFromCode(code, maxTemp){
  if([51,53,55,61,63,65,80,81,82,95].includes(Number(code))) return 'rain';
  if(Number(maxTemp) >= 29) return 'hot';
  return 'dry';
}
async function loadWeather(){
  const todayEl=el('weatherToday'), tomorrowEl=el('weatherTomorrow');
  if(!todayEl || !tomorrowEl) return;
  todayEl.textContent='Wetter wird geladen …'; tomorrowEl.textContent='Wetter wird geladen …';
  try{
    const url='https://api.open-meteo.com/v1/forecast?latitude=48.303&longitude=15.414&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FVienna&forecast_days=2';
    const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error('Wetterdienst nicht erreichbar');
    const data=await res.json(); const d=data.daily;
    const fmt=(i)=>`${weatherCodeText(d.weather_code[i])}, ${Math.round(d.temperature_2m_min[i])}–${Math.round(d.temperature_2m_max[i])}°C, Regenrisiko ${d.precipitation_probability_max[i] ?? 0}%`;
    todayEl.textContent=fmt(0); tomorrowEl.textContent=fmt(1);
    const w=planningWeatherFromCode(d.weather_code[1], d.temperature_2m_max[1]);
    const ws=el('weatherSelect'); if(ws) ws.value=w;
  }catch(e){
    todayEl.textContent=WEATHER_FALLBACK.today; tomorrowEl.textContent=WEATHER_FALLBACK.tomorrow;
  }
}

function runSelfTest(){
 const requiredIds=['versionBadge','weatherToday','weatherTomorrow','morningBtn','hikeAdvisorBtn','bikeAdvisorBtn','breakfastBtn','snackBtn','luggageBtn','helpBtn','reviewBtn','hikeRoutes','bikeRoutes','adventureRoutes','kidsQuiz','kidsTreasure','kidsStories','kidsCertificate','mapPreview','testAmpel'];
 const missing=requiredIds.filter(id=>!el(id));
 const pageText=document.body.innerText.toLowerCase();
 const prohibited=pageText.includes('dinosaurierpark') || pageText.includes('freizeitpark');
 const buttons=document.querySelectorAll('button').length;
 const links=document.querySelectorAll('a[href]').length;
 const badRoutes=ROUTES.filter(r=>!r.id||!r.title||!r.mapsTo||!r.mode);
 const duplicateIds=[...document.querySelectorAll('[id]')].map(n=>n.id).filter((id,i,a)=>a.indexOf(id)!==i);
 const brokenWhatsApp=['breakfast','snack','luggage','help'].filter(k=>!serviceText(k));
 const statusOk=!(missing.length||duplicateIds.length||badRoutes.length||prohibited||brokenWhatsApp.length);
 const statusWarn=!statusOk && !(duplicateIds.length||prohibited);
 const ampel=el('testAmpel');
 if(ampel){
   ampel.innerHTML=statusOk?'<span class="ampel green">●</span> Grün: Hauptfunktionen geprüft.':statusWarn?'<span class="ampel yellow">●</span> Gelb: Prüfen, aber kein harter Sperrfehler.':'<span class="ampel red">●</span> Rot: Fehler vor Freigabe beheben.';
 }
 const lines=[`Version: ${APP_VERSION}`,`Ampel: ${statusOk?'GRÜN':statusWarn?'GELB':'ROT'}`,`Buttons: ${buttons}`,`Links: ${links}`,`Routen: ${ROUTES.length}`,`Quiz-Fragen: ${QUIZ.length}`,`Schatzsuche: ${TREASURES.length}`,`Wetterfelder: ${el('weatherToday')&&el('weatherTomorrow')?'vorhanden':'fehlen'}`,`Fehlende IDs: ${missing.length?missing.join(', '):'keine'}`,`Doppelte IDs: ${duplicateIds.length?duplicateIds.join(', '):'keine'}`,`Unvollständige Routen: ${badRoutes.length?badRoutes.map(r=>r.id).join(', '):'keine'}`,`WhatsApp-Texte fehlen: ${brokenWhatsApp.length?brokenWhatsApp.join(', '):'keine'}`,`Nicht gewünschtes Freizeitpark-Thema sichtbar: ${prohibited?'JA - Fehler':'Nein'}`,`Status: ${statusOk?'OK':'PRÜFEN'}`];
 el('testOutput').textContent=lines.join('\n');
}

function bind(){
 document.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>applyLanguage(btn.dataset.lang)));
 document.querySelectorAll('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>el(btn.dataset.scroll).scrollIntoView({behavior:'smooth'})));
 el('morningBtn').addEventListener('click',showMorning); el('hikeAdvisorBtn').addEventListener('click',showHikeRecommendation); el('bikeAdvisorBtn').addEventListener('click',showBikeRecommendation);
 const wr=el('weatherReloadBtn'); if(wr) wr.addEventListener('click',loadWeather);
 el('breakfastBtn').addEventListener('click',()=>openWhatsApp('breakfast')); el('snackBtn').addEventListener('click',()=>openWhatsApp('snack')); el('luggageBtn').addEventListener('click',()=>openWhatsApp('luggage')); el('helpBtn').addEventListener('click',()=>openWhatsApp('help')); el('reviewBtn').addEventListener('click',openReview); el('runTestBtn').addEventListener('click',runSelfTest);
 if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js').catch(()=>{});}
}
document.addEventListener('DOMContentLoaded',()=>{bind();applyLanguage(currentLang);renderRoutes();renderKids();loadWeather();runSelfTest();});
