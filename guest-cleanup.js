/* Kompakte Tageszeitung und Sprach-Auswahl fuer Gaeste. Keine Daten werden geloescht. */
(function(){
  'use strict';
  function showAnchor(id){
    const element=document.getElementById(id);if(!element)return;
    let parent=element.parentElement;
    while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
    element.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function updateLanguagePicker(){
    const picker=document.getElementById('guest-language');
    if(!picker)return;
    try{
      const lang=readGuestPreference('zabLang')||'de';
      picker.value=lang==='cs'?'cz':lang;
    }catch(_){picker.value='de';}
  }
  function compactGuestNewspaper(root){
    if(!root || !root.querySelector('.newspaper-section') || root.dataset.guestCompact==='yes')return;
    const sections=Array.from(root.children).filter(el=>el.classList.contains('newspaper-section'));
    if(!sections.length)return;
    const priority=sections[0];
    if(priority){
      const items=Array.from(priority.querySelectorAll(':scope > .news-item'));
      const important=/sperr|umleit|niedrigwasser|gefahr|warnung|baustell|kanalreinigung/i;
      items.sort((a,b)=>Number(important.test(b.textContent))-Number(important.test(a.textContent)));
      for(const item of items)priority.appendChild(item);
      if(items.length>4){
        const more=document.createElement('details');
        more.className='guest-news-fold';
        const summary=document.createElement('summary');
        summary.textContent='Weitere wichtige Meldungen ('+(items.length-4)+')';
        more.appendChild(summary);
        items.slice(4).forEach(item=>more.appendChild(item));
        priority.appendChild(more);
      }
    }
    for(let i=1;i<sections.length;i++){
      const section=sections[i];
      const label=section.querySelector('h3')?.textContent?.trim()||'Weitere Informationen';
      if(section.classList.contains('pia-tip')||label.includes('Gut zu wissen')){
        section.remove();continue;
      }
      const wrapper=document.createElement('details');
      wrapper.className='guest-news-fold';
      const summary=document.createElement('summary');
      summary.textContent=label;
      const originalHeading=section.querySelector('h3');
      if(originalHeading)originalHeading.remove();
      wrapper.appendChild(summary);
      section.before(wrapper);
      wrapper.appendChild(section);
    }
    root.dataset.guestCompact='yes';
  }
  window.compactGuestNewspaper=compactGuestNewspaper;
  document.addEventListener('DOMContentLoaded',()=>{
    updateLanguagePicker();
    document.querySelectorAll('.quick-nav button[data-target]').forEach(button=>{
      button.addEventListener('click',()=>showAnchor(button.dataset.target));
    });
    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
      anchor.addEventListener('click',()=>{
        const id=decodeURIComponent(anchor.getAttribute('href').slice(1));
        const dest=document.getElementById(id);
        if(!dest)return;
        let parent=dest.parentElement;
        while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
      });
    });
    if(location.hash){
      const hash=decodeURIComponent(location.hash.slice(1));
      let parent=document.getElementById(hash)?.parentElement;
      while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
    }
  });
})();
