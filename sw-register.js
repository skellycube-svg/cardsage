// sw-register.js — Service worker registration, version checking, and auto-reload
// Registers sw.js, listens for controller changes (triggers reload on update),
// and fetches version.json on load to detect new deployments.
// Uses CS_CONFIG.LS_KEYS.appVersion (from config.js) for version tracking.
// Loaded via <script src="sw-register.js"> in index.html.

// Only run if the browser supports service workers (all modern browsers do)
if('serviceWorker' in navigator){

  // If a new service worker takes over, reload the page so the user
  // gets the latest version of the app immediately.
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    window.location.reload();
  });

  // After the page finishes loading:
  window.addEventListener('load',()=>{

    // 1. Register the service worker (sw.js) so it can cache files and work offline
    navigator.serviceWorker.register('./sw.js')
      .catch(err=>console.warn('SW registration failed:',err));

    // 2. Version check — fetch version.json (bypassing cache) to see if a new
    //    version was deployed. If the version changed since the last visit,
    //    reload the page so the user gets the update.
    fetch('./version.json',{cache:'no-store'})
      .then(r=>r.json())
      .then(({version})=>{
        const stored=localStorage.getItem(CS_CONFIG.LS_KEYS.appVersion);
        localStorage.setItem(CS_CONFIG.LS_KEYS.appVersion,version);
        if(stored&&stored!==version) window.location.reload();
      })
      .catch(()=>{});
  });
}
