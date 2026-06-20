'use strict';
const CACHE_NAME = 'zab-v16-1-wachau-meister-urkunde';
const CORE = ['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icon.svg','./hero-windis.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).catch(()=>null)); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.origin !== location.origin){ return; }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => { const copy = resp.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return resp; }).catch(()=>caches.match('./index.html'))));
});
