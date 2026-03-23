// sw-register.js — Service worker registration, version checking, and auto-reload
// Registers sw.js, listens for controller changes (triggers reload on update),
// and fetches version.json on load to detect new deployments.
// Uses CS_CONFIG.LS_KEYS.appVersion (from config.js) for version tracking.
// Loaded via <script src="sw-register.js"> in index.html.

// Debug: track SW events in sessionStorage (survives same-tab reloads)
function _swDbg(m){try{var l=JSON.parse(sessionStorage.getItem('_sw_log')||'[]');l.push(Date.now()+': '+m);sessionStorage.setItem('_sw_log',JSON.stringify(l));}catch{}}

// Deferred reload: waits for the auth flow in components.js to finish loading
// cloud data before reloading the page. This prevents the reload from
// interrupting the Firestore getDoc call and losing user data.
// Safety timeout of 6 seconds ensures the page still reloads even if auth stalls.
function _safeReload(reason){
  _swDbg(reason+' — waiting for auth before reload');
  var waited=0;
  function check(){
    if(window._csAuthDone){
      _swDbg(reason+' — auth done, RELOADING');
      window.location.reload();
    }else if(waited>=6000){
      _swDbg(reason+' — safety timeout, RELOADING');
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

  _swDbg('sw-register.js loaded');

  // If a new service worker takes over, defer the reload until auth data
  // has finished loading from Firestore so we don't lose card data.
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    _swDbg('controllerchange fired');
    _safeReload('controllerchange');
  });

  // After the page finishes loading:
  window.addEventListener('load',()=>{

    _swDbg('load event fired');

    // 1. Register the service worker (sw.js) so it can cache files and work offline
    navigator.serviceWorker.register('./sw.js')
      .then(reg=>{_swDbg('SW registered, active='+!!reg.active+' waiting='+!!reg.waiting+' installing='+!!reg.installing);})
      .catch(err=>{_swDbg('SW register FAILED: '+err);console.warn('SW registration failed:',err);});

    // 2. Version check — fetch version.json (bypassing cache) to see if a new
    //    version was deployed. If the version changed since the last visit,
    //    defer the reload until auth data has loaded.
    fetch('./version.json',{cache:'no-store'})
      .then(r=>r.json())
      .then(({version})=>{
        const stored=localStorage.getItem(CS_CONFIG.LS_KEYS.appVersion);
        localStorage.setItem(CS_CONFIG.LS_KEYS.appVersion,version);
        _swDbg('version check: stored='+stored+' server='+version);
        if(stored&&stored!==version){
          _swDbg('version mismatch detected');
          _safeReload('version mismatch');
        }
      })
      .catch(()=>{});
  });
}
