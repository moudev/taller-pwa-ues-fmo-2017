
'use strict';

let appShellCache = `cache-prueba-v1`;
let dataAppCache = `data-cache-v1`;
let files = [
        '/',
        '/jquery.js',
        '/js.js',
        '/index.html',
        '/css.css',
        '/images/ic_add_white_24px.svg',
        '/images/ic_refresh_white_24px.svg',
        '/images/clear.png',
        '/images/cloudy-scattered-showers.png',
        '/images/cloudy.png',
        '/images/fog.png',
        '/images/partly-cloudy.png',
        '/images/rain.png',
        '/images/scattered-showers.png',
        '/images/sleet.png',
        '/images/snow.png',
        '/images/thunderstorm.png',
        '/images/wind.png'
      ]

this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(appShellCache).then(function(cache) {
      console.log("[ServiceWorker] Files to Load in Cache "+ files);
      return cache.addAll(files);
    })
  );
});


this.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate  Service');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        // Cuando la cache sea igual
        console.log("Nombre de cache: "+key);
        if (key === appShellCache && key !== dataAppCache) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});



this.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Service xFetch', e.request.url);
  let dataURL = 'http://api.openweathermap.org/data/2.5/';
  if(e.request.url.indexOf(dataURL) > -1){
   
    e.respondWith(
      caches.open(dataAppCache).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
