// landing.js — FeeWorth landing page interactivity (vanilla JS, zero dependencies)
//
// This file runs immediately on the static landing page. It handles:
//   1. "See how it works" smooth scroll
//   2. CTA button clicks → lazy-load the full app bundle (React, Babel, Firebase, etc.)
//   3. Once the app bundle loads, React takes over #root and hides the static landing
//
// No Firebase, no React, no Babel required for this file.

(function() {
  'use strict';

  // ── Smooth scroll for "See how it works" ──
  var howBtn = document.getElementById('lp-how-btn');
  if (howBtn) {
    howBtn.addEventListener('click', function() {
      var el = document.getElementById('lp-how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ── Track whether the app bundle is loading/loaded ──
  var appLoading = false;
  var appLoaded = false;

  // ── Load a script tag and return a promise ──
  function loadScript(src, opts) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      if (opts && opts.type) s.type = opts.type;
      s.onload = resolve;
      s.onerror = function() { reject(new Error('Failed to load: ' + src)); };
      document.body.appendChild(s);
    });
  }

  // ── Fetch a JSX file, transpile with Babel, and execute ──
  // Babel Standalone only auto-processes text/babel scripts on DOMContentLoaded.
  // Since we're loading after that event, we fetch the source, transpile it manually,
  // and inject it as a regular script.
  function loadBabelScript(src) {
    return fetch(src).then(function(r) {
      if (!r.ok) throw new Error('Failed to fetch: ' + src);
      return r.text();
    }).then(function(code) {
      var transpiled = Babel.transform(code, { presets: ['react'] }).code;
      var s = document.createElement('script');
      s.textContent = transpiled;
      document.body.appendChild(s);
    });
  }

  // ── Load the full app bundle (React + Babel + Firebase + components) ──
  function loadAppBundle() {
    if (appLoading || appLoaded) return Promise.resolve();
    appLoading = true;

    // Load React + ReactDOM + Babel + EmailJS in parallel
    return Promise.all([
      loadScript('https://unpkg.com/react@18/umd/react.development.js'),
      loadScript('https://unpkg.com/react-dom@18/umd/react-dom.development.js'),
      loadScript('https://unpkg.com/@babel/standalone/babel.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js')
    ]).then(function() {
      // Load Firebase (module) and card data in parallel — neither depends on the other
      return Promise.all([
        loadScript('firebase-auth.js', { type: 'module' }),
        loadScript('cards-data.js')
      ]);
    }).then(function() {
      // Sequential Babel-transpiled scripts (each depends on the previous)
      return loadBabelScript('auth-sync.js');
    }).then(function() {
      return loadBabelScript('landing-react.js');
    }).then(function() {
      return loadBabelScript('components.js');
    }).then(function() {
      appLoaded = true;
      appLoading = false;
    }).catch(function(err) {
      console.error('App bundle load failed:', err);
      appLoading = false;
    });
  }

  // ── Handle CTA clicks: load the app and show AuthModal ──
  function onGetStarted() {
    // Show a loading state on the clicked button
    var btns = document.querySelectorAll('#landing-static .lp-btn-primary, #landing-static .lp-nav-cta');
    btns.forEach(function(btn) {
      btn.disabled = true;
      if (btn.classList.contains('lp-btn-primary')) {
        btn.setAttribute('data-original-text', btn.innerHTML);
        btn.innerHTML = 'Loading...';
      }
    });

    loadAppBundle().then(function() {
      // Wait for Babel to finish transpiling and React to mount
      function waitForApp() {
        if (window._fwAppMounted) {
          // Hide static landing, show React app
          var staticLanding = document.getElementById('landing-static');
          if (staticLanding) staticLanding.style.display = 'none';
          // Trigger auth modal via custom event
          window.dispatchEvent(new CustomEvent('fw-open-auth'));
          return;
        }
        setTimeout(waitForApp, 50);
      }
      waitForApp();
    }).catch(function() {
      // Restore buttons on failure
      btns.forEach(function(btn) {
        btn.disabled = false;
        var orig = btn.getAttribute('data-original-text');
        if (orig) btn.innerHTML = orig;
      });
    });
  }

  // ── Bind CTA buttons ──
  var navCta = document.getElementById('lp-nav-cta');
  var heroCta = document.getElementById('lp-hero-cta');
  var finalCta = document.getElementById('lp-final-cta');

  if (navCta) navCta.addEventListener('click', onGetStarted);
  if (heroCta) heroCta.addEventListener('click', onGetStarted);
  if (finalCta) finalCta.addEventListener('click', onGetStarted);

  // ── Auto-load app if user has a stored auth session ──
  // If cs_auth_uid exists, the user was previously logged in — load the app
  // bundle immediately so they go straight to the dashboard
  if (localStorage.getItem('cs_auth_uid')) {
    loadAppBundle().then(function() {
      function waitForAuth() {
        if (window._fwAppMounted) {
          var staticLanding = document.getElementById('landing-static');
          if (staticLanding) staticLanding.style.display = 'none';
          return;
        }
        setTimeout(waitForAuth, 50);
      }
      waitForAuth();
    });
  }
})();
