(function(){
"use strict";
const cfg=window.WINDI_CHRONICLE_CONFIG||{};
const configured=/^https:\/\//.test(cfg.supabaseUrl||"")&&!String(cfg.supabaseAnonKey||"").startsWith("YOUR_");
const db=configured&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
const categories={welterbesteig:"🚶 Welterbesteig",donauradweg:"🚴 Donauradweg",heuriger:"🍷 Heuriger",ausflug:"🌄 Ausflug",windis:"🐾 Windis",marillen:"🍑 Marillen",fruehstueck:"☕ Frühstück",sonstiges:"😊 Sonstiges"};
const statusTexts={de:["Beiträge werden geladen …","Noch keine veröffentlichten Beiträge.","Die Chronik konnte gerade nicht geladen werden."],en:["Loading stories …","No published stories yet.","The chronicle could not be loaded."],cz:["Načítání příspěvků …","Zatím nejsou zveřejněny žádné příspěvky.","Kroniku se nepodařilo načíst."],sk:["Načítavajú sa príspevky …","Zatiaľ nie sú zverejnené žiadne príspevky.","Kroniku sa nepodarilo načítať."],hu:["Bejegyzések betöltése …","Még nincsenek közzétett bejegyzések.","A krónika nem tölthető be."],es:["Cargando historias …","Todavía no hay historias publicadas.","No se pudo cargar la crónica."],fr:["Chargement des histoires …","Aucune histoire publiée pour le moment.","La chronique n’a pas pu être chargée."]};
function statusText(index){let lang=localStorage.getItem("zabLang")||document.documentElement.lang||"de";if(lang==="cs")lang="cz";return (statusTexts[lang]||statusTexts.de)[index]}
const $=id=>document.getElementById(id);
const demo=[{id:"willkommen",title:"Willkommen in der Windi-Chronik",body:"Hier sammeln wir bewusst keine Bewertungen und keine Sterne. Uns sind Ihre persönlichen Geschichten und Erlebnisse viel wichtiger: die Geschichten, die Sie von Ihrem Weg mitbringen, besondere Entdeckungen unterwegs und schöne Momente bei uns mit den Wilden Wachauer Windis. Erzählen Sie uns, was Ihnen besonders gefallen hat – damit Ihre Wachau-Erinnerung lebendig bleibt.",category:"windis",author_name:"Fidel, Gloria und Pia",published_at:new Date().toISOString(),photo_urls:[],likes:0}];
function esc(v){const d=document.createElement("div");d.textContent=v??"";return d.innerHTML}
function date(v){return new Intl.DateTimeFormat(document.documentElement.lang||"de",{day:"numeric",month:"long",year:"numeric"}).format(new Date(v))}
function shareUrl(id){const u=new URL(location.href);u.hash="chronik-"+id;return u.href}
function entryHtml(e){
 const photos=(e.photo_urls||[]).slice(0,10).map((src,i)=>`<img src="${esc(src)}" alt="Foto ${i+1}: ${esc(e.title)}" loading="lazy">`).join("");
 const url=shareUrl(e.id); const qr=`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(url)}`;
 return `<article class="chronicle-entry" id="chronik-${esc(e.id)}"><div class="chronicle-meta">📅 ${date(e.published_at||e.created_at)} · ${categories[e.category]||categories.sonstiges}</div><h3>${esc(e.title)}</h3>${photos?`<div class="chronicle-photos">${photos}</div>`:""}<p>${esc(e.body).replace(/\n/g,"<br>")}</p><div class="chronicle-author">👤 ${esc(e.author_name||"Anonym")}</div><div class="entry-footer"><span>❤️ Gefällt ${Number(e.likes)||0}</span><details><summary>🔗 Teilen & QR-Code</summary><img class="entry-qr" src="${qr}" alt="QR-Code zu diesem Beitrag"><a href="${url}">${esc(url)}</a></details></div></article>`;
}
async function loadPublished(){
 const box=$("chronicleEntries"),status=$("chronicleStatus"); if(!box)return;
 if(!db){status.textContent="Demo-Betrieb – für gemeinsame Beiträge muss Supabase verbunden werden.";status.className="chronicle-status demo";box.innerHTML=demo.map(entryHtml).join("");return}
 status.textContent=statusText(0);
 const {data,error}=await db.from("chronicle_entries").select("id,title,body,category,author_name,published_at,photo_urls,likes").eq("status","published").order("published_at",{ascending:false});
 if(error){status.textContent=statusText(2);box.innerHTML="";return}
 status.textContent=data.length?`${data.length} veröffentlichte Beiträge`:statusText(1);box.innerHTML=data.map(entryHtml).join("");
}
async function uploadPhotos(files,entryId){
 const urls=[];
 for(const file of files){const ext=(file.name.split(".").pop()||"jpg").toLowerCase();const path=`${entryId}/${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from(cfg.photoBucket).upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;const {data}=db.storage.from(cfg.photoBucket).getPublicUrl(path);urls.push(data.publicUrl)}
 return urls;
}
async function submitStory(ev){
 ev.preventDefault(); const files=[...$("storyPhotos").files];
 if(files.length>10){showToast("Bitte höchstens 10 Fotos auswählen.");return}
 if(files.some(f=>f.size>8*1024*1024)){showToast("Ein Foto ist größer als 8 MB.");return}
 const payload={id:crypto.randomUUID(),title:$("storyTitle").value.trim(),body:$("storyText").value.trim(),category:$("storyCategory").value,author_name:$("storyAnonymous").checked?null:($("storyName").value.trim()||null),status:"pending"};
 if(!db){showToast("Demo-Betrieb: Supabase bitte zuerst verbinden.");return}
 const submit=ev.submitter;submit.disabled=true;
 try{payload.photo_urls=await uploadPhotos(files,payload.id);const {error}=await db.from("chronicle_entries").insert(payload);if(error)throw error;ev.target.reset();ev.target.hidden=true;$("storyThanks").hidden=false}
 catch(err){showToast("Senden nicht möglich: "+(err.message||"Unbekannter Fehler"))}finally{submit.disabled=false}
}
async function login(ev){ev.preventDefault();if(!db){showToast("Supabase ist noch nicht verbunden.");return}const email=$("adminEmail").value.trim().toLowerCase();if(email!=="topdiveair@gmail.com"){showToast("Diese E-Mail ist nicht für die Administration freigeschaltet.");return}const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:"https://topdiveair-sketch.github.io/Gaeste/",shouldCreateUser:true}});if(error){showToast("Anmeldelink konnte nicht gesendet werden.");return}showToast("Anmeldelink wurde per E-Mail gesendet.")}
async function showQueue(){const {data:{session}}=await db.auth.getSession();$("adminLogin").hidden=!!session;$("adminQueue").hidden=!session;if(!session)return;const {data,error}=await db.from("chronicle_entries").select("*").eq("status","pending").order("created_at");if(error){showToast("Beiträge konnten nicht geladen werden.");return}$("pendingCount").textContent=`(${data.length})`;$("pendingEntries").innerHTML=data.map(e=>`<article class="pending-entry" data-id="${esc(e.id)}"><strong>${esc(e.author_name||"Anonym")}: ${esc(e.title)}</strong><p>${esc(e.body)}</p><div class="chronicle-actions"><button data-action="publish">✔ Freigeben</button><button data-action="edit">✏ Bearbeiten</button><button data-action="reject">❌ Ablehnen</button></div></article>`).join("")}
async function moderate(ev){const button=ev.target.closest("button[data-action]");if(!button)return;const card=button.closest("[data-id]"),id=card.dataset.id;if(button.dataset.action==="edit"){const oldTitle=card.querySelector("strong").textContent.split(": ").slice(1).join(": "),oldBody=card.querySelector("p").textContent;const title=prompt("Titel bearbeiten",oldTitle),body=title===null?null:prompt("Text bearbeiten",oldBody);if(body===null)return;const {error}=await db.from("chronicle_entries").update({title,body}).eq("id",id);if(error)showToast("Änderung nicht gespeichert.");else await showQueue();return}const status=button.dataset.action==="publish"?"published":"rejected";const values={status};if(status==="published")values.published_at=new Date().toISOString();const {error}=await db.from("chronicle_entries").update(values).eq("id",id);if(error){showToast("Änderung nicht gespeichert.");return}await showQueue();if(status==="published")await loadPublished()}
document.addEventListener("DOMContentLoaded",()=>{
 $("showStoryForm")?.addEventListener("click",()=>{$("storyForm").hidden=false;$("storyThanks").hidden=true;$("storyForm").scrollIntoView({behavior:"smooth"})});
 $("cancelStoryForm")?.addEventListener("click",()=>$("storyForm").hidden=true);$("storyForm")?.addEventListener("submit",submitStory);
 $("showAdminLogin")?.addEventListener("click",async()=>{$("adminPanel").hidden=!$("adminPanel").hidden;if(!$("adminPanel").hidden&&db)await showQueue()});
 $("adminLoginForm")?.addEventListener("submit",login);$("pendingEntries")?.addEventListener("click",moderate);
 $("adminLogout")?.addEventListener("click",async()=>{await db.auth.signOut();await showQueue()});loadPublished();
});
})();
