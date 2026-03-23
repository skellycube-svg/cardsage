// sw-register.js — Service worker registration, version checking, and auto-reload
// Registers sw.js, listens for controller changes (triggers reload on update),
// and fetches version.json on load to detect new deployments.
// Uses CS_CONFIG.LS_KEYS.appVersion (from config.js) for version tracking.
// Loaded via <script src="sw-register.js"> in index.html.

// Deferred reload: waits for the auth flow in components.js to finish loading
// cloud data before reloading the page. This prevents the reload from
// interrupting the Firestore getDoc call and losing user data.
// Safety timeout of 6 seconds ensures the page still reloads even if auth stalls.
function _safeReload(){
  var waited=0;
  function check(){
    if(window._csAuthDone||waited>=6000){
      window.location.reload();
    }else{
      waited+=200;
      setTimeout(check,200);
    }
  }
  check();
}

// Only run if the browser supports service workers (all modern browsers do)
if('serviceWorker' in navigator){

  // If a new service worker takes over, defer the reload until auth data
  // has finished loading from Firestore so we don't lose card data.
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    _safeReload();
  });

  // After the page finishes loading:
  window.addEventListener('load',()=>{

    // 1. Register the service worker (sw.js) so it can cache files and work offline
    navigator.serviceWorker.register('./sw.js')
      .catch(err=>{console.warn('SW registration failed:',err);});

    // 2. Version check — fetch version.json (bypassing cache) to see if a new
    //    version was deployed. If the version changed since the last visit,
    //    defer the reload until auth data has loaded.
    fetch('./version.json',{cache:'no-store'})
      .then(r=>r.json())
      .then(({version})=>{
        const stored=localStorage.getItem(CS_CONFIG.LS_KEYS.appVersion);
        localStorage.setItem(CS_CONFIG.LS_KEYS.appVersion,version);
        if(stored&&stored!==version){
          _safeReload();
        }
      })
      .catch(()=>{});
  });
}
