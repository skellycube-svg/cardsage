// sw-register.js — Service worker registration, version checking, and auto-reload
// Registers sw.js, listens for controller changes (triggers reload on update),
// and fetches version.json on load to detect new deployments.
// Uses CS_CONFIG.LS_KEYS.appVersion (from config.js) for version tracking.
// Loaded via <script src="sw-register.js"> in index.html.

if('serviceWorker' in navigator){
  // Reload whenever a new service worker takes control of this tab
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    window.location.reload();
  });
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js')
      .catch(err=>console.warn('SW registration failed:',err));
    // Version check: if a new version deployed while tab was open, force reload
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
