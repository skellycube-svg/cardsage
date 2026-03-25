// sw-register.js — Service worker registration, version checking, and safe updates
// Registers sw.js, detects when a new version is waiting, and handles the
// transition safely so Firestore data is never lost during updates.
//
// Update flow:
//   1. New SW installs in background (does NOT skipWaiting on its own)
//   2. This script detects the waiting worker
//   3. Waits for auth to finish (window._csAuthDone), then tells SW to activate
//   4. On controllerchange, reloads the page — auth is already done, so no data loss
//
// Uses CS_CONFIG.LS_KEYS.appVersion (from config.js) for version tracking.
// Loaded via <script src="sw-register.js"> in index.html.

// Only run if the browser supports service workers (all modern browsers do)
if('serviceWorker' in navigator){

  // When a new service worker takes control, reload to get fresh files.
  // At this point auth has already completed (we ensured that before
  // sending SKIP_WAITING), so the reload is safe.
  var _reloadPending=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(!_reloadPending){
      _reloadPending=true;
      window.location.reload();
    }
  });

  // Safely activate a waiting service worker:
  // Wait for auth to finish, then tell the SW to skip waiting.
  function _activateWaiting(worker){
    function go(){
      worker.postMessage({type:'SKIP_WAITING'});
    }
    // If auth is already done, activate immediately
    if(window._csAuthDone){
      go();
    }else{
      // Poll until auth finishes (max 8 seconds, then activate anyway)
      var waited=0;
      function poll(){
        if(window._csAuthDone||waited>=8000){
          go();
        }else{
          waited+=250;
          setTimeout(poll,250);
        }
      }
      poll();
    }
  }

  window.addEventListener('load',function(){

    // 1. Register the service worker
    navigator.serviceWorker.register('./sw.js')
      .then(function(reg){
        // If there's already a waiting worker (installed before this page load), activate it
        if(reg.waiting){
          _activateWaiting(reg.waiting);
        }
        // Listen for new workers that finish installing
        reg.addEventListener('updatefound',function(){
          var newWorker=reg.installing;
          if(!newWorker) return;
          newWorker.addEventListener('statechange',function(){
            if(newWorker.state==='installed'&&navigator.serviceWorker.controller){
              // New version installed and waiting — activate it safely
              _activateWaiting(newWorker);
            }
          });
        });
      })
      .catch(function(err){console.warn('SW registration failed:',err);});

    // 2. Version check — fetch version.json (bypassing cache) to detect new deploys.
    //    Just stores the version — the actual reload is handled by controllerchange above.
    //    No separate reload here to avoid competing reloads.
    fetch('./version.json',{cache:'no-store'})
      .then(function(r){return r.json();})
      .then(function(data){
        localStorage.setItem(CS_CONFIG.LS_KEYS.appVersion,data.version);
      })
      .catch(function(){});
  });
}
