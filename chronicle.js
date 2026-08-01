(function(){
"use strict";
const cfg=window.WINDI_CHRONICLE_CONFIG||{};
const configured=/^https:\/\//.test(cfg.supabaseUrl||"")&&!String(cfg.supabaseAnonKey||"").startsWith("YOUR_");
const db=configured&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
const categories={welterbesteig:"🚶 Welterbesteig",donauradweg:"🚴 Donauradweg",heuriger:"🍷 Heuriger",ausflug:"🌄 Ausflug",windis:"🐾 Windis",marillen:"🍑 Marillen",fruehstueck:"☕ Frühstück",sonstiges:"😊 Sonstiges"};
const statusTexts={de:["Beiträge werden geladen …","Noch keine veröffentlichten Beiträge.","Die Chronik konnte gerade nicht geladen werden.","📖 Zum Lesen ausklappen"],en:["Loading stories …","No published stories yet.","The chronicle could not be loaded.","📖 Open to read"],cz:["Načítání příspěvků …","Zatím nejsou zveřejněny žádné příspěvky.","Kroniku se nepodařilo načíst.","📖 Rozbalit a číst"],sk:["Načítavajú sa príspevky …","Zatiaľ nie sú zverejnené žiadne príspevky.","Kroniku sa nepodarilo načítať.","📖 Rozbaliť a čítať"],hu:["Bejegyzések betöltése …","Még nincsenek közzétett bejegyzések.","A krónika nem tölthető be.","📖 Megnyitás olvasáshoz"],es:["Cargando historias …","Todavía no hay historias publicadas.","No se pudo cargar la crónica.","📖 Abrir para leer"],fr:["Chargement des histoires …","Aucune histoire publiée pour le moment.","La chronique n’a pas pu être chargée.","📖 Ouvrir pour lire"]};
function statusText(index){let lang=localStorage.getItem("zabLang")||document.documentElement.lang||"de";if(lang==="cs")lang="cz";return (statusTexts[lang]||statusTexts.de)[index]}
const $=id=>document.getElementById(id);
const demo=[{id:"willkommen",title:"Willkommen in der Windi-Chronik",body:"Hier sammeln wir bewusst keine Bewertungen und keine Sterne. Uns sind Ihre persönlichen Geschichten und Erlebnisse viel wichtiger: die Geschichten, die Sie von Ihrem Weg mitbringen, besondere Entdeckungen unterwegs und schöne Momente bei uns mit den Wilden Wachauer Windis. Erzählen Sie uns, was Ihnen besonders gefallen hat – damit Ihre Wachau-Erinnerung lebendig bleibt.",category:"windis",author_name:"Fidel, Gloria und Pia",published_at:new Date().toISOString(),photo_urls:[]}];
function esc(v){const d=document.createElement("div");d.textContent=v??"";return d.innerHTML}
function date(v){return new Intl.DateTimeFormat(document.documentElement.lang||"de",{day:"numeric",month:"long",year:"numeric"}).format(new Date(v))}
function shareUrl(id){const u=new URL(location.href);u.hash="chronik-"+id;return u.href}
function entryHtml(e){
 const photos=(e.photo_urls||[]).slice(0,10).map((src,i)=>`<img src="${esc(src)}" alt="Foto ${i+1}: ${esc(e.title)}" loading="lazy">`).join("");
 const url=shareUrl(e.id); const qr=`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(url)}`;
 return `<details class="chronicle-entry" id="chronik-${esc(e.id)}"><summary class="chronicle-entry-summary"><span class="chronicle-meta">📅 ${date(e.published_at||e.created_at)} · ${categories[e.category]||categories.sonstiges}</span><strong>${esc(e.title)}</strong><span class="chronicle-read-more">${statusText(3)}</span></summary><div class="chronicle-entry-content">${photos?`<div class="chronicle-photos">${photos}</div>`:""}<p>${esc(e.body).replace(/\n/g,"<br>")}</p><div class="chronicle-author">👤 ${esc(e.author_name||"Anonym")}</div><div class="entry-footer"><details class="share-details"><summary>🔗 Teilen & QR-Code</summary><img class="entry-qr" src="${qr}" alt="QR-Code zu diesem Beitrag"><a href="${url}">${esc(url)}</a></details></div></div></details>`;
}
function openLinkedEntry(){if(!location.hash.startsWith("#chronik-"))return;const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target?.matches?.("details.chronicle-entry")){target.open=true;setTimeout(()=>target.scrollIntoView({behavior:"smooth",block:"start"}),60)}}
async function loadPublished(){
 const box=$("chronicleEntries"),status=$("chronicleStatus"); if(!box)return;
 if(!db){status.textContent="Demo-Betrieb – für gemeinsame Beiträge muss Supabase verbunden werden.";status.className="chronicle-status demo";box.innerHTML=demo.map(entryHtml).join("");return}
 status.textContent=statusText(0);
 const {data,error}=await db.from("chronicle_entries").select("id,title,body,category,author_name,published_at,photo_urls").eq("status","published").order("published_at",{ascending:false});
 if(error){status.textContent=statusText(2);box.innerHTML="";return}
 status.textContent=data.length?`${data.length} veröffentlichte Beiträge`:statusText(1);box.innerHTML=data.map(entryHtml).join("");openLinkedEntry();
}
async function uploadPhotos(files,entryId){
 const urls=[];
 for(const file of files){const ext=(file.name.split(".").pop()||"jpg").toLowerCase();const path=`${entryId}/${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from(cfg.photoBucket).upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;const {data}=db.storage.from(cfg.photoBucket).getPublicUrl(path);urls.push(data.publicUrl)}
 return urls;
}
function storyError(message){const box=$("storyError");if(box){box.textContent=message;box.hidden=!message}if(message)showToast(message)}
function friendlySendError(err,phase){
 const message=String(err?.message||err||"").toLowerCase();
 if(message.includes("failed to fetch")||message.includes("network")||message.includes("load failed"))return "Keine Internetverbindung. Bitte Verbindung prüfen und erneut senden.";
 if(message.includes("payload too large")||message.includes("maximum allowed size")||message.includes("file size"))return "Ein Foto ist zu groß. Bitte höchstens 8 MB pro Foto verwenden.";
 if(message.includes("mime")||message.includes("content type")||message.includes("unsupported"))return "Ein Fotoformat wird nicht unterstützt. Bitte JPG, PNG oder WebP verwenden.";
 if(message.includes("row-level security")||message.includes("permission")||message.includes("not authorized"))return `Supabase hat ${phase} nicht erlaubt. Bitte die Zugriffsregeln prüfen.`;
 if(message.includes("bucket")&&message.includes("not found"))return "Der Speicher für Chronik-Fotos wurde nicht gefunden.";
 const detail=String(err?.message||"").trim().slice(0,180),code=err?.code||err?.statusCode||err?.status;
 return `${phase} fehlgeschlagen.${code?` Fehlercode: ${code}.`:""}${detail?` ${detail}`:" Bitte später erneut versuchen."}`;
}
async function submitStory(ev){
 ev.preventDefault(); storyError(""); const files=[...$("storyPhotos").files];
 if(files.length>10){storyError("Bitte höchstens 10 Fotos auswählen.");return}
 const allowedTypes=new Set(["image/jpeg","image/png","image/webp"]),wrongType=files.find(f=>!allowedTypes.has(f.type));
 if(wrongType){storyError(`Das Foto „${wrongType.name}“ hat ein nicht unterstütztes Format. Bitte JPG, PNG oder WebP verwenden.`);return}
 const tooLarge=files.find(f=>f.size>8*1024*1024);
 if(tooLarge){storyError(`Das Foto „${tooLarge.name}“ ist größer als 8 MB. Bitte verkleinern oder ein anderes Foto wählen.`);return}
 const payload={id:crypto.randomUUID(),title:$("storyTitle").value.trim(),body:$("storyText").value.trim(),category:$("storyCategory").value,author_name:$("storyAnonymous").checked?null:($("storyName").value.trim()||null),status:"pending"};
 if(!db){showToast("Demo-Betrieb: Supabase bitte zuerst verbinden.");return}
 const submit=ev.submitter,oldText=submit.textContent;let phase="Beitrag speichern";submit.disabled=true;submit.textContent=files.length?"⏳ Fotos werden hochgeladen …":"⏳ Beitrag wird gesendet …";
 try{if(files.length)phase="Foto-Upload";payload.photo_urls=await uploadPhotos(files,payload.id);phase="Beitrag speichern";submit.textContent="⏳ Beitrag wird gespeichert …";const {error}=await db.from("chronicle_entries").insert(payload);if(error)throw error;ev.target.reset();ev.target.hidden=true;$("storyThanks").hidden=false}
 catch(err){console.error("Windi-Chronik:",phase,err);storyError(friendlySendError(err,phase))}finally{submit.disabled=false;submit.textContent=oldText}
}
async function login(ev){ev.preventDefault();if(!db){showToast("Supabase ist noch nicht verbunden.");return}const email=$("adminEmail").value.trim().toLowerCase();if(email!=="topdiveair@gmail.com"){showToast("Diese E-Mail ist nicht für die Administration freigeschaltet.");return}const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:"https://topdiveair-sketch.github.io/Gaeste/",shouldCreateUser:true}});if(error){showToast("Anmeldelink konnte nicht gesendet werden.");return}showToast("Anmeldelink wurde per E-Mail gesendet.")}
async function showQueue(){const {data:{session}}=await db.auth.getSession();$("adminLogin").hidden=!!session;$("adminQueue").hidden=!session;if(!session)return;const {data,error}=await db.from("chronicle_entries").select("*").eq("status","pending").order("created_at");if(error){showToast("Beiträge konnten nicht geladen werden.");return}$("pendingCount").textContent=`(${data.length})`;$("pendingEntries").innerHTML=data.map(e=>`<article class="pending-entry" data-id="${esc(e.id)}"><strong>${esc(e.author_name||"Anonym")}: ${esc(e.title)}</strong><p>${esc(e.body)}</p><div class="chronicle-actions"><button data-action="publish">✔ Freigeben</button><button data-action="edit">✏ Bearbeiten</button><button data-action="reject">❌ Ablehnen</button></div></article>`).join("")}
async function moderate(ev){const button=ev.target.closest("button[data-action]");if(!button)return;const card=button.closest("[data-id]"),id=card.dataset.id;if(button.dataset.action==="edit"){const oldTitle=card.querySelector("strong").textContent.split(": ").slice(1).join(": "),oldBody=card.querySelector("p").textContent;const title=prompt("Titel bearbeiten",oldTitle),body=title===null?null:prompt("Text bearbeiten",oldBody);if(body===null)return;const {error}=await db.from("chronicle_entries").update({title,body}).eq("id",id);if(error)showToast("Änderung nicht gespeichert.");else await showQueue();return}const status=button.dataset.action==="publish"?"published":"rejected";const values={status};if(status==="published")values.published_at=new Date().toISOString();const {error}=await db.from("chronicle_entries").update(values).eq("id",id);if(error){showToast("Änderung nicht gespeichert.");return}await showQueue();if(status==="published")await loadPublished()}
document.addEventListener("DOMContentLoaded",()=>{
 $("showStoryForm")?.addEventListener("click",()=>{$("storyForm").hidden=false;$("storyThanks").hidden=true;storyError("");$("storyForm").scrollIntoView({behavior:"smooth"})});
 $("cancelStoryForm")?.addEventListener("click",()=>$("storyForm").hidden=true);$("storyForm")?.addEventListener("submit",submitStory);
 $("showAdminLogin")?.addEventListener("click",async()=>{$("adminPanel").hidden=!$("adminPanel").hidden;if(!$("adminPanel").hidden&&db)await showQueue()});
 $("adminLoginForm")?.addEventListener("submit",login);$("pendingEntries")?.addEventListener("click",moderate);
 $("adminLogout")?.addEventListener("click",async()=>{await db.auth.signOut();await showQueue()});loadPublished();
});
})();
