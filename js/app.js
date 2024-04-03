//PARA INSTALAR SERVICE WORKER 
    if(navigator.serviceWorker){
        navigator.serviceWorker.register(`/service-worker.js`)
        .then(reg=>{
           /* setTimeout(()=>{
                 reg.sync.register('post-new-user');
                 console.log('se envio la informacion al servidor');
            },3000)*/
        })
    }
