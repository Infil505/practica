const CACHE_STATIC_NAME="sw-una-task-static-v1";
const CACHE_DINAMIC_NAME="sw-una-task-dinamic-v1";  /** se tienen que definir los objetos que iran en cada uno */
const CACHE_INMUTABLE_NAME="sw-una-task-inmutable-v1";
const CACHE_LIMIT = 200;

self.addEventListener('install', event=>{
     console.log('serviceworker en instalacion');
     const cacheStaticProm = caches.open(CACHE_STATIC_NAME)
        .then(cache=>{
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/img/imagen1.png',
                '/js/app.js',
                'img/no-image.png'
            ]);
        });
        const cacheInmutableProm=caches.open(CACHE_INMUTABLE_NAME)
            .then(cache=>cache.add("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"));
        event.waitUntil(Promise.all([
            cacheStaticProm,
            cacheInmutableProm
        ]));
});

self.addEventListener('activate', event=>{
    console.log('service worker activo 2');
});

self.addEventListener('sync', event=>{
   /* console.log('Tenemos conexion a internet');
    console.log(event);
    console.log(event.tag);*/

});

self.addEventListener('push', event=>{
    console.log('Notificaciòn recibida');
    console.log(event);
});

self.addEventListener('fetch', event=>{
   /* console.log(event.request);
    if(event.request.url.includes('boxicons')){
        const resp = new Response(`
            {ok:false, mensaje:'jajajajajajajajaja'}        
        `);
        event.respondWith(resp);
    }*/
      //ESTRATEGIA 1: CACHE ONLY   no implementar en el proyecto
      // event.respondWith(caches.match(event.request));    
      
      //EATRATEGIA #2: CACHE WITH NETWORK FALLBACK    preferible para usar
       /*   const resp = caches.match(event.request)
          .then(res =>{
                if(res) return res;
                return fetch(event.request)
                    .then(newResp=>{
                        caches.open( CACHE_DINAMIC_NAME)      // trabajando con el cache dinamico
                            .then(cache=>{
                                cache.put(event.request, newResp);   // no puedes devolver directamente la respuesta porque da error, tienes que clonarla 
                                clearCache(CACHE_DINAMIC_NAME, CACHE_LIMIT);
                            });
                        return newResp.clone();    // como en este caso se clono la respuesta para no tener error
                    });
          });



          event.respondWith(resp);*/


      // ESTRATEGIA #3  NETWORK WITH CACHE FALLBACK
      /*const resp = fetch(event.request)
          .then(res=>{
            if(!res){
                return caches.match(event.request);
            }else{
                caches.open(CACHE_DINAMIC_NAME)
                    .then(cache=>{
                        cache.put(event.request, res);
                        clearCache(CACHE_DINAMIC_NAME, CACHE_LIMIT);
                    });
                    return res.clone();

            }
          });
      event.respondWith(resp);*/

      // ESTRATEGIA #4 NETWORK & CACHE RACE 
      const resp = new Promise((resolve, reject)=>{
        let flag = false;
        const fallOnce =()=>{
            if(flag){
                if(/\.(png|jpg)$/i.test(event.request.url)){
                    resolve(caches.match('img/no-image.png'));
                }
            }else {
                flag=true;
            }
        };
        fetch(event.request).then(res=>{
            res.ok?resolve(res):fallOnce();
        }).catch(fallOnce);
        caches.match(event.request).then(res=>{
            res?resolve(res):fallOnce();
        }).catch(fallOnce);
      });
      event.respondWith(resp);
});

function clearCache(cacheName, maxItems){
        caches.open(cacheName)
        .then(cache=>{
           return cache.keys()
            .then(keys=>{
                if(keys.length > maxItems){
                     // recuerda que esto es para verificar que si esta lleno, si es asi el cache va a eliminar el mas viejo para liverar el espacio
                    cache.delete(keys[0])
                        .then(clearCache(cacheName, maxItems));
                 }
            })
        });
}