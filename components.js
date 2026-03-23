// components.js — All React components for FeeWorth
//
// This file contains every React component, hook, and helper used by FeeWorth.
// It is loaded via <script type="text/babel" src="components.js"> so that
// Babel Standalone can transpile the JSX at runtime (no build step required).
//
// Dependencies (must be loaded before this file):
//   - React 18 + ReactDOM 18 (CDN)
//   - Babel Standalone (CDN)
//   - config.js (CS_CONFIG global)
//   - cards-data.js (CARDS, STRATS, TIPS_DB, APPLY_URLS, etc.)
//   - firebase-auth.js (window.CS_FB — Firebase auth/Firestore utilities)
//
// Component tree:
//   App (root) → TopNav, HomeTab, RenewalAdvisorTab, HouseholdTab,
//                 BenefitsTab, TipsTab, UsecardTab, OffersTab, QuizTab,
//                 WalletTab, StratModal, NewsletterSubscribe, AuthModal
//
// Hooks: useLS (localStorage-backed state)
// Helpers: Icon, CardArt, CreditCardDisplay, ValueMeter, CatChip, etc.

// Pull out the React hooks we need so we can use them directly throughout the file.
const {useState,useEffect,useCallback,useMemo,useRef}=React;

// This self-running function creates the animated particle background you see behind the app.
// It draws soft, glowing orbs on an HTML canvas element and slowly moves them around forever.
// The orbs wrap around the edges of the screen so they never disappear.
/* PARTICLE BG */
(function(){
  const c=document.getElementById('bg'),ctx=c.getContext('2d');
  let W,H,orbs=[];
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;
    orbs=Array.from({length:14},()=>({x:Math.random()*W,y:Math.random()*H,r:30+Math.random()*110,vx:(Math.random()-.5)*.09,vy:(Math.random()-.5)*.09,hue:30+Math.random()*30,a:.025+Math.random()*.04}));}
  function draw(){ctx.clearRect(0,0,W,H);
    orbs.forEach(o=>{const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);g.addColorStop(0,`hsla(${o.hue},75%,65%,${o.a})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fill();o.x+=o.vx;o.y+=o.vy;if(o.x<-o.r)o.x=W+o.r;if(o.x>W+o.r)o.x=-o.r;if(o.y<-o.r)o.y=H+o.r;if(o.y>H+o.r)o.y=-o.r;});
    requestAnimationFrame(draw);}
  window.addEventListener('resize',resize);resize();draw();
})();

// useLS ("use localStorage") is a custom React hook that works like useState but also
// saves the value to the browser's localStorage. This means data survives page refreshes.
// Parameters: k = the storage key name, d = the default value if nothing is saved yet.
// Returns: [currentValue, setterFunction] just like useState.
/* LS hook */
// This hook saves and loads data to your browser's local storage so your settings persist between visits.
function useLS(k,d){
  const[v,sv]=useState(()=>{try{const s=localStorage.getItem(k);return s?JSON.parse(s):d}catch{return d}});
  const vRef=useRef(v);
  vRef.current=v;
  const set=useCallback(x=>{
    const next=typeof x==='function'?x(vRef.current):x;
    sv(next);
    try{localStorage.setItem(k,JSON.stringify(next))}catch{};
  },[k]);
  return[v,set];
}

/* ── Renewal date helpers ──────────────────────────────────────────────── */
const MONTH_NAMES=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function getRenewalDays(cardId,anniversaryDates){
  const month=anniversaryDates&&anniversaryDates[cardId];
  if(!month)return null; // 1-12
  const now=new Date();
  // Anniversary = 1st of that month
  let rd=new Date(now.getFullYear(),month-1,1);
  if(rd<=now) rd=new Date(now.getFullYear()+1,month-1,1);
  return Math.ceil((rd-now)/(1000*60*60*24));
}

/* ── Data loaded from cards-data.js ─────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════════════════
   ICON SYSTEM — SVG stroke icons (24×24 viewBox, 1.5 stroke-width)
   ═══════════════════════════════════════════════════════════════════════════ */
// ICON_PATHS stores the SVG drawing instructions for every icon used in the app.
// Each key is a human-readable name (like "shield-check" or "plane") and each value
// is the SVG path data that draws that icon. Icons are 24x24 with a 1.5px stroke.
const ICON_PATHS={
"shield-check":<><path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z"/><path d="M9 12l2 2 4-4"/></>,
"zap":<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
"trophy":<><path d="M6 9H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3M18 9h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3"/><path d="M6 4h12v6a6 6 0 0 1-12 0V4z"/><path d="M9 20h6M12 16v4"/></>,
"target":<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
"plane":<><path d="M17.8 19.2L16 11l3.5-3.5C20.3 6.7 21 5.1 21 4c-1.1 0-2.7.7-3.5 1.5L14 9l-8.2-1.8a.5.5 0 0 0-.5.2l-1 1.6 6.5 3.5-2.3 2.3-2.2-.6-.8 1 2.8 1.5 1.5 2.8 1-.8-.6-2.2 2.3-2.3 3.5 6.5 1.6-1a.5.5 0 0 0 .2-.5z"/></>,
"utensils":<><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M6 2v20"/><path d="M16 2c-2.2 0-4 2.5-4 5.5 0 2 1 3.5 2 4.5v10h4V12c1-1 2-2.5 2-4.5C20 4.5 18.2 2 16 2z"/></>,
"credit-card":<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
"gift":<><rect x="3" y="8" width="18" height="4" rx="1"/><rect x="5" y="12" width="14" height="8" rx="1"/><line x1="12" y1="8" x2="12" y2="20"/><path d="M12 8c-1.5-2-4-2-4 0s4 2 4 0M12 8c1.5-2 4-2 4 0s-4 2-4 0"/></>,
"star":<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
"lightbulb":<><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></>,
"bell":<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
"check-circle":<><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>,
"check":<><polyline points="5 12 10 17 20 7"/></>,
"x":<><path d="M18 6L6 18M6 6l12 12"/></>,
"chevron-right":<><polyline points="9 18 15 12 9 6"/></>,
"chevron-down":<><polyline points="6 9 12 15 18 9"/></>,
"chevron-up":<><polyline points="6 15 12 9 18 15"/></>,
"arrow-right":<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
"arrow-up":<><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
"search":<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
"plus":<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
"settings":<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
"trending-up":<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
"dollar":<><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9.5a2.5 2 0 0 1 3-2c1.7 0 3 .8 3 2s-1.3 2-3 2-3 .8-3 2a2.5 2 0 0 0 3 2"/></>,
"shield":<><path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z"/></>,
"rocket":<><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>,
"award":<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89l1.414 7.071L12 17.5l-4.89 2.461 1.414-7.071"/></>,
"calendar":<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
"clipboard":<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>,
"bolt":<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
"trident":<><path d="M12 2v20M12 2l-5 6v3l5-4 5 4V8l-5-6z"/><line x1="7" y1="11" x2="7" y2="14"/><line x1="17" y1="11" x2="17" y2="14"/></>,
"globe":<><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
"heart":<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
"shopping-cart":<><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
"shopping-bag":<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
"store":<><path d="M3 9l1-5h16l1 5"/><path d="M3 9c0 1.66 1.34 3 3 3s3-1.34 3-3c0 1.66 1.34 3 3 3s3-1.34 3-3c0 1.66 1.34 3 3 3s3-1.34 3-3"/><path d="M5 12v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></>,
"tv":<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
"car":<><path d="M5 17h14M7 10l2-5h6l2 5"/><rect x="3" y="10" width="18" height="7" rx="2"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></>,
"coffee":<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
"pill":<><path d="M10.5 1.5l-8 8a4.95 4.95 0 1 0 7 7l8-8a4.95 4.95 0 0 0-7-7z"/><line x1="6.5" y1="10.5" x2="13.5" y2="3.5"/></>,
"dumbbell":<><path d="M6.5 6.5h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2M17.5 6.5h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2"/><rect x="6.5" y="4" width="3" height="16" rx="1"/><rect x="14.5" y="4" width="3" height="16" rx="1"/><line x1="9.5" y1="12" x2="14.5" y2="12"/></>,
"home":<><path d="M3 12l2-2m0 0l7-7 7 7m-14 0v8a1 1 0 0 0 1 1h3m10-9l2 2m-2-2v8a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1m-4 0h4"/></>,
"couch":<><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M2 11a2 2 0 0 1 2 2v2h16v-2a2 2 0 0 1 4 0v4a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2z"/></>,
"shirt":<><path d="M14.5 2L18 5l3 1.5-2 4-3-1v12.5H8V9.5l-3 1-2-4L6 5l3.5-3"/><path d="M9.5 2a3.5 2 0 0 0 5 0"/></>,
"desktop":<><rect x="2" y="3" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="16" x2="12" y2="21"/></>,
"film":<><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></>,
"music":<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
"shoe":<><path d="M3 18h18v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1z"/><path d="M3 18c0-3 1-6 3-8l2-3c1-1 2-1 3 0l1 2c.5 1 1.5 1 2 0l2-2c1-1.5 2.5-1 3 0l2 5"/></>,
"apple":<><path d="M12 3c-1-2-4-2-5-1s-1 3 0 5c-2 0-4 3-4 7 0 5 3 8 6 8 1 0 2-.5 3-1 1 .5 2 1 3 1 3 0 6-3 6-8 0-4-2-7-4-7 1-2 1-4 0-5s-4-1-5 1z"/><path d="M12 3c0-1 1-2 2-2"/></>,
"bar-chart":<><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>,
"diamond":<><path d="M12 2l10 10-10 10L2 12 12 2z"/></>,
"warning":<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
"refresh":<><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></>,
"package":<><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
"smartphone":<><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
"laptop":<><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></>,
"building":<><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V18h6v4M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2"/></>,
"scooter":<><circle cx="6" cy="19" r="3"/><circle cx="18" cy="19" r="3"/><path d="M6 16l5-10h2l1 4h4"/><line x1="18" y1="16" x2="18" y2="10"/></>,
"flower":<><circle cx="12" cy="12" r="3"/><path d="M12 2a3 3 0 0 0 0 6 3 3 0 0 0 0 0M18.36 5.64a3 3 0 0 0-4.24 4.24M22 12a3 3 0 0 0-6 0M18.36 18.36a3 3 0 0 0-4.24-4.24M12 22a3 3 0 0 0 0-6M5.64 18.36a3 3 0 0 0 4.24-4.24M2 12a3 3 0 0 0 6 0M5.64 5.64a3 3 0 0 0 4.24 4.24"/></>,
"hammer":<><path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0s-.83-2.17 0-3L12 9"/><path d="M17.64 6.36l2.12 2.12-5.66 5.66-2.12-2.12zM21.15 3.85l-1.41-1.41c-.78-.78-2.05-.78-2.83 0L14.5 4.85l4.24 4.24 2.41-2.41a2 2 0 0 0 0-2.83z"/></>,
"wrench":<><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
"wave":<><path d="M2 12c2-2 4-4 6-2s4 2 6 0 4-4 6-2"/><path d="M2 17c2-2 4-4 6-2s4 2 6 0 4-4 6-2"/></>,
"share":<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
"download":<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
"phone":<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
"alert-triangle":<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
"users":<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
"arrow-down":<><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>,
"key":<><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
};

// Draws an SVG icon by name. Used throughout the app for buttons, navigation, and labels.
// Icon is a small helper component that renders an SVG icon by name.
// Props: name (which icon to draw), size (pixel dimensions), color, className.
// If the icon name is not found in ICON_PATHS, it renders nothing.
function Icon({name,size=18,color="currentColor",className=""}){
  const paths=ICON_PATHS[name];
  if(!paths)return null;
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>{paths}</svg>);
}

// STRAT_ICON_MAP maps each card strategy ID to the icon name that represents it visually.
// For example, the Chase Trifecta strategy uses a trident icon.
/* ── ID-based icon maps (no emoji literals) ──────────────────────────────── */
const STRAT_ICON_MAP={"chase-trifecta":"trident","amex-trifecta":"bolt","c1-duo":"diamond","citi-duo":"globe","ink-trio":"diamond","atmos-strategy":"wave"};
// BCAT_ICON_MAP maps benefit categories (like travel, dining, entertainment) to icon names.
const BCAT_ICON_MAP={travel:"plane",dining:"utensils",entertainment:"film",status:"star",statement:"credit-card",awards:"gift",protection:"shield"};
// SPEND_CAT_ICON maps spending category short codes (d=dining, g=grocery, etc.) to icon names.
const SPEND_CAT_ICON={d:"utensils",g:"shopping-cart",gas:"car",t:"plane",s:"tv",a:"package",tr:"car",p:"pill",o:"credit-card"};
// SPECIAL_CAT_ICON maps brand-specific categories (Hyatt, Delta, etc.) to icon names.
const SPECIAL_CAT_ICON={hyatt:"building",delta:"plane",sw:"plane",united:"plane",hilton:"building",marriott:"building",alaska:"wave",aa:"plane",amazon:"package",rent:"home",ihg:"building"};

// CATEGORY_COLORS defines the color scheme for each spending category.
// Each category has a background color (bg), text color (text), and border color (border).
// These are used to create the colored chips/badges throughout the app.
/* ── Category color system ────────────────────────────────────────────────── */
const CATEGORY_COLORS={
  dining:       {bg:"#fdf4ec",text:"#065f46",border:"#f59e0b"},
  travel:       {bg:"#eff6ff",text:"#1e40af",border:"#3b82f6"},
  shopping:     {bg:"#f5f3ff",text:"#5b21b6",border:"#8b5cf6"},
  grocery:      {bg:"#f0fdf4",text:"#166534",border:"#22c55e"},
  gas:          {bg:"#fff7ed",text:"#9a3412",border:"#f97316"},
  streaming:    {bg:"#fdf2f8",text:"#86198f",border:"#d946ef"},
  health:       {bg:"#f0f9ff",text:"#0c4a6e",border:"#0ea5e9"},
  transit:      {bg:"#f8fafc",text:"#334155",border:"#64748b"},
  other:        {bg:"#f9fafb",text:"#374151",border:"#9ca3af"},
  entertainment:{bg:"#f0f9ff",text:"#0c4a6e",border:"#0ea5e9"},
};
// SPEND_CAT_COLOR maps the short spending category codes to their color theme names.
// For example, 'd' (dining) maps to the 'dining' color scheme in CATEGORY_COLORS.
const SPEND_CAT_COLOR={d:"dining",g:"grocery",gas:"gas",t:"travel",s:"streaming",a:"shopping",tr:"transit",p:"health",o:"other"};
// CatChip renders a small colored pill/badge for a spending category.
// It looks up the category's color scheme and displays the label inside a styled span.
// Props: cat (category key), label (display text, defaults to the cat key).
// A small colored pill/badge that shows a spending category name (like 'Dining' or 'Travel').
function CatChip({cat,label}){
  const cc=CATEGORY_COLORS[cat]||CATEGORY_COLORS.other;
  return <span className="cat-chip" style={{background:cc.bg,color:cc.text,borderColor:cc.border}}>{label||cat}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CreditCardDisplay — unified card component
   Usage: <CreditCardDisplay card={card} size="md"/> or size="sm"
   ═══════════════════════════════════════════════════════════════════════════ */
// CreditCardDisplay renders a realistic-looking credit card with the card's gradient colors,
// issuer name, card name, a gold chip, card number dots, and network logo (Visa, Mastercard, etc.).
// Props: card (a card object from CARDS), size ("sm" for small thumbnail or "md" for medium).
function CreditCardDisplay({card,size="md"}){
  const isSm=size==="sm";
  const w=isSm?160:280;
  const h=isSm?100:176;
  const ig=getIssuerGradient(card);
  return(
    <div style={{width:w,height:h,borderRadius:isSm?10:16,background:ig,padding:isSm?"10px 12px":
      "18px 20px",display:"flex",flexDirection:"column",justifyContent:"space-between",
      position:"relative",overflow:"hidden",color:"#fff",flexShrink:0,
      boxShadow:"0 8px 24px rgba(0,0,0,.18)"}}>
      {/* Shimmer overlay */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(135deg,transparent,transparent 2px,rgba(255,255,255,.02) 2px,rgba(255,255,255,.02) 4px)",pointerEvents:"none"}}/>
      {/* Top row: issuer + NFC */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <span style={{fontSize:isSm?8:10,fontWeight:700,letterSpacing:isSm?1:2,opacity:.8,textTransform:"uppercase"}}>{card.issuer}</span>
        {!isSm&&<NfcIcon/>}
      </div>
      {/* Card name */}
      <div style={{fontSize:isSm?9:11,fontWeight:600,opacity:.9,lineHeight:1.2}}>{card.short||card.name}</div>
      {/* Bottom row: chip + dots + network */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div style={{display:"flex",alignItems:"center",gap:isSm?6:10}}>
          <div style={{width:isSm?24:36,height:isSm?16:26,borderRadius:isSm?2:4,background:"linear-gradient(135deg,#14b8b8,#0d7377)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(255,255,255,.15) 4px,rgba(255,255,255,.15) 5px),repeating-linear-gradient(90deg,transparent,transparent 6px,rgba(255,255,255,.15) 6px,rgba(255,255,255,.15) 7px)"}}/>
          </div>
          {!isSm&&<div style={{display:"flex",gap:4}}>{[0,1,2,3].map(i=><div key={i} style={{display:"flex",gap:2}}>{[0,1,2,3].map(j=><div key={j} style={{width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,.35)"}}/>)}</div>)}</div>}
        </div>
        <span style={{fontFamily:"'Inter',sans-serif",fontStyle:"italic",fontSize:isSm?11:16,opacity:.8}}>{card.network}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARDSAGE v3 — PART 2: REACT COMPONENTS
   Combines with cs_v3_part1.html (data layer + CSS)
═══════════════════════════════════════════════════════════════════════════ */

/* ── STITCH DESIGN HELPERS ────────────────────────────────────────────────── */
// Looks up the issuer color palette from config.js (ISSUER_COLORS).
// Returns {grad, tint, text} for any issuer, falling back to 'default' for unknown issuers.
function getIssuerPalette(issuer){
  const ic=CS_CONFIG.ISSUER_COLORS;
  return ic[issuer]||ic['default'];
}
// Returns the primary brand color (gradient start) for a given card issuer.
// Used for progress bars, accent borders, card tags, and text highlights.
function getIssuerColor(issuer){
  return getIssuerPalette(issuer).text;
}
// Returns a CSS gradient string for a card's background.
// Special cases like Amex Platinum get a signature silver gradient.
// All other cards use their issuer's gradient pair from ISSUER_COLORS.
function getIssuerGradient(card){
  if(card.id==='amex-plat'||card.id==='amex-biz-plat')return'linear-gradient(135deg,#a8a8a8,#d4d4d4)';
  const p=getIssuerPalette(card.issuer);
  return `linear-gradient(135deg,${p.grad[0]},${p.grad[1]})`;
}
// Returns the light tint background color for a given issuer.
// Used for card header backgrounds, hover states, and badge fills.
function getIssuerTint(issuer){
  return getIssuerPalette(issuer).tint;
}
// getTopEarnCats looks at a card's earning rates and returns the top 2 categories
// where it earns more than 1x points (e.g., ["Dining", "Travel"]).
// Used to show tag badges on wallet cards so users can see at a glance what each card is best for.
// Finds the top 2 spending categories where a card earns the most points.
function getTopEarnCats(card){
  const labels={d:'Dining',g:'Grocery',gas:'Gas',t:'Travel',s:'Streaming',
    a:'Amazon',tr:'Rideshare',p:'Pharmacy'};
  return Object.entries(card.earn||{})
    .filter(([k,v])=>k!=='o'&&parseFloat(String(v).replace(/[^0-9.]/g,''))>1)
    .sort((a,b)=>parseFloat(String(b[1]).replace(/[^0-9.]/g,''))-parseFloat(String(a[1]).replace(/[^0-9.]/g,'')))
    .slice(0,2).map(([k])=>labels[k]||k);
}
// NfcIcon renders a small contactless payment (tap-to-pay) icon shown on the credit card display.
// Draws the contactless payment (tap-to-pay) icon shown on card art.
function NfcIcon(){
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 18.5a8 8 0 019-12.5"/><path d="M8 15.5a4.5 4.5 0 015.5-7"/><circle cx="10" cy="14" r="1" fill="rgba(255,255,255,.6)"/></svg>;
}

/* ── VALUE METER ──────────────────────────────────────────────────────────── */
// ValueMeter renders a row of small dots to visually show a 1-to-3 value rating.
// Lit dots are gold, unlit dots are dark. Used on tips and strategies.
// Props: v (current value), max (maximum possible value, defaults to 3).
// Shows a 1-to-3 dot rating to indicate how valuable a tip or strategy is.
function ValueMeter({v=1,max=3}){
  return <span className="value-badge" title={`Value: ${v}/${max}`}>
    {Array.from({length:max},(_,i)=>(
      <span key={i} className={i<v?"lit":""} style={{background:i<v?"#f59e0b":"#334155"}}/>
    ))}
  </span>;
}

/* ── CARD ART ─────────────────────────────────────────────────────────────── */
// CardArt renders a simpler, smaller version of a credit card visual.
// Shows the issuer, card name, and network on a gradient background.
// Props: card (a card object), large (boolean for a wider layout).
// Renders a visual credit card with the card's gradient colors, issuer logo, network badge, and NFC icon.
function CardArt({card,large}){
  const s=large?{width:"100%",height:110,borderRadius:18,padding:"18px 20px"}:{};
  return (
    <div className="card-art" style={{background:`linear-gradient(135deg,${card.c1},${card.c2})`,...s}}>
      <div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.55)",letterSpacing:1.2,textTransform:"uppercase"}}>{card.issuer}</div>
      <div>
        <div style={{fontSize:large?15:11,fontWeight:700,color:"#fff",lineHeight:1.2,marginBottom:2}}>{card.short||card.name}</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,.45)"}}>{card.network}</div>
      </div>
    </div>
  );
}

/* ── STRATEGY MODAL ───────────────────────────────────────────────────────── */
// StratModal is a bottom-sheet popup that shows full details about a card strategy.
// It appears when a user taps on a strategy card anywhere in the app.
// Shows: required cards, strategy description, beginner explanation, analogy, how to start,
// proven plays, common mistakes, and Apply Now buttons for missing cards.
// Props: stratId (which strategy to show), myCards (user's wallet), onClose (dismiss handler).
// A slide-up panel that shows the details of a card strategy (which cards are needed, how they work together, and step-by-step playbook).
function StratModal({stratId,myCards,onClose}){
  if(!stratId)return null;
  const s=STRATS[stratId];
  if(!s)return null;
  const hasAll=s.req.every(id=>myCards.includes(id));
  const hasAlt=s.alt&&s.alt.some(arr=>arr.every(id=>myCards.includes(id)));
  const canUse=hasAll||hasAlt;
  const reqCards=s.req.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean);

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div style={{padding:"0 20px"}}>
          {/* Handle bar */}
          <div style={{width:36,height:4,background:"rgba(255,255,255,.15)",borderRadius:99,margin:"12px auto 0"}}/>

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"18px 0 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Icon name={STRAT_ICON_MAP[s.id]||"diamond"} size={28} color="var(--acc)"/>
              <div>
                <div style={{fontSize:19,fontWeight:900,color:"var(--tx)",letterSpacing:-.3}}>{s.name}</div>
                <div style={{fontSize:12,color:"var(--grn2)",fontWeight:700,marginTop:2}}>{s.value} estimated value</div>
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",color:"var(--tx2)",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="x" size={16} color="var(--tx2)"/></button>
          </div>

          {/* Status banner */}
          {canUse?(
            <div style={{background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.25)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>✅</span>
              <span style={{fontSize:13,color:"var(--grn2)",fontWeight:600}}>You have the cards for this strategy!</span>
            </div>
          ):(
            <div style={{background:"rgba(13,115,119,.08)",border:"1px solid rgba(13,115,119,.2)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <Icon name="lightbulb" size={16} color="var(--gld2)"/>
              <span style={{fontSize:13,color:"var(--gld2)",fontWeight:600}}>Add the required cards to unlock this strategy</span>
            </div>
          )}

          {/* Required cards */}
          <div style={{marginBottom:16}}>
            <div className="section-title" style={{marginBottom:8}}>REQUIRED CARDS</div>
            <div className="hscroll" style={{paddingBottom:6}}>
              {reqCards.map(c=>(
                <div key={c.id} style={{flexShrink:0,textAlign:"center"}}>
                  <CreditCardDisplay card={c} size="sm"/>
                  <div style={{fontSize:10,fontWeight:700,color:myCards.includes(c.id)?"var(--grn2)":"var(--tx4)",marginTop:4}}>
                    {myCards.includes(c.id)?<><Icon name="check" size={10} color="var(--grn2)"/> In wallet</>:<><Icon name="plus" size={10}/> Needed</>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy overview */}
          {s.desc&&(
            <div style={{marginBottom:16,padding:"2px 0 4px"}}>
              <div style={{fontSize:15,color:"var(--tx2)",lineHeight:1.75,fontWeight:400}}>{s.desc}</div>
            </div>
          )}

          {/* What this actually means */}
          <div style={{background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.2)",borderRadius:14,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:"var(--acc2)",textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:4}}><Icon name="award" size={11} color="var(--acc2)"/> What This Actually Means</div>
            <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.7}}>{s.forBeginners}</div>
          </div>

          {/* Analogy */}
          <div style={{background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.2)",borderRadius:14,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:"var(--pur2)",textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:4}}><Icon name="lightbulb" size={11} color="var(--pur2)"/> Think of It Like This</div>
            <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.7}}>{s.analogy}</div>
          </div>

          {/* How to start */}
          <div style={{background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.2)",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:800,color:"var(--grn2)",textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:4}}><Icon name="rocket" size={11} color="var(--grn2)"/> How to Start</div>
            <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.8,whiteSpace:"pre-line"}}>{s.firstStep}</div>
          </div>

          {/* Plays */}
          <div style={{marginBottom:14}}>
            <div className="section-title" style={{marginBottom:10}}><Icon name="bolt" size={12} color="var(--acc)"/> PROVEN PLAYS</div>
            {s.play.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid var(--br)"}}>
                <div style={{marginTop:1,flexShrink:0}}><Icon name="chevron-right" size={13} color="var(--acc2)"/></div>
                <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.55}}>{p}</div>
              </div>
            ))}
          </div>

          {/* Common mistake */}
          {s.learn&&(
            <div style={{background:"rgba(244,63,94,.06)",border:"1px solid rgba(244,63,94,.2)",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,color:"var(--red2)",textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:4}}><Icon name="warning" size={11} color="var(--red2)"/> COMMON MISTAKE</div>
              <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.6}}>{s.learn}</div>
            </div>
          )}

          {/* Apply Now section */}
          {s.req.some(id=>!myCards.includes(id))&&(
            <div style={{marginBottom:24}}>
              <div className="section-title" style={{marginBottom:10}}>APPLY FOR THESE CARDS</div>
              {s.req.map((cardId,i)=>{
                if(myCards.includes(cardId))return null;
                const card=CARDS.find(c=>c.id===cardId);
                if(!card)return null;
                return (
                  <div key={cardId} style={{padding:"10px 0",borderBottom:"1px solid var(--br)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{s.req_names[i]}</div>
                        <div style={{fontSize:11,color:"var(--tx3)"}}>Annual fee: {card.fee===0?"Free":"$"+card.fee}</div>
                      </div>
                      <div>
                        <a className="apply-btn" href={APPLY_URLS[cardId]||"#apply-"+cardId} target="_blank" rel="noopener noreferrer">Apply Now →</a>
                        <div className="apply-disclose">Affiliate link — we may earn a commission at no cost to you.</div>
                      </div>
                    </div>
                    {card.signup&&card.signup!=="No signup bonus"&&card.signup!=="No sign-up bonus"&&(
                      <div style={{marginTop:6,fontSize:11,fontWeight:600,color:"var(--acc)",background:"rgba(13,115,119,.07)",
                        border:"1px solid rgba(13,115,119,.15)",borderRadius:6,padding:"4px 10px",lineHeight:1.35,display:"inline-block"}}>
                        {card.signup}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── NEWSLETTER SUBSCRIBE (standalone, Firestore-backed) ─────────────────── */
// NewsletterSubscribe renders an email signup form for monthly benefit reminders.
// It saves the email to Firestore (the cloud database) and shows success/error messages.
// Checks for duplicate emails before subscribing. Shown at the bottom of the app.
// A form that lets users enter their email to subscribe to the FeeWorth newsletter. Saves to Firebase and prevents duplicate signups.
function NewsletterSubscribe(){
  const [email,setEmail]=useState('');
  const [status,setStatus]=useState('');// 'success'|'exists'|'error'|''
  const [loading,setLoading]=useState(false);

  const submit=async(e)=>{
    e.preventDefault();
    const v=email.trim();
    if(!v||!v.includes('@')) return;
    const fb=window.CS_FB;
    if(!fb){setStatus('error');return;}
    setLoading(true);
    try{
      const q=fb.query(fb.collection(fb.db,'newsletter_subscribers'),fb.where('email','==',v));
      const snap=await fb.getDocs(q);
      if(!snap.empty){
        setStatus('exists');
      }else{
        await fb.setDoc(fb.doc(fb.collection(fb.db,'newsletter_subscribers')),{
          email:v,uid:null,subscribedAt:fb.serverTimestamp(),source:'standalone'
        });
        setStatus('success');
        setEmail('');
      }
    }catch(err){
      console.warn('Newsletter subscribe failed:',err.message);
      setStatus('error');
    }
    setLoading(false);
  };

  return(
    <div className="nl-standalone">
      <div className="nl-standalone-title">Get monthly benefit reminders by email</div>
      {status==='success'?(
        <div className="nl-standalone-msg" style={{color:"var(--grn2)"}}>You're on the list! Expect your first email next month.</div>
      ):status==='exists'?(
        <div className="nl-standalone-msg" style={{color:"var(--gold)"}}>You're already subscribed!</div>
      ):status==='error'?(
        <div className="nl-standalone-msg" style={{color:"var(--red2)"}}>Something went wrong. Please try again.</div>
      ):(
        <form className="nl-standalone-form" onSubmit={submit}>
          <input className="nl-standalone-input" type="email" placeholder="you@email.com"
            value={email} onChange={e=>setEmail(e.target.value)} required/>
          <button className="nl-standalone-btn" type="submit" disabled={loading}>
            {loading?'…':'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}

/* ── NEWSLETTER POPUP (one-time modal for new visitors) ───────────────────── */
// Shows a newsletter signup modal 30 seconds after first visit.
// Checks cs_popup_dismissed in localStorage so it only appears once.
// On desktop: centered overlay modal. On mobile: bottom sheet.
// Reuses the Firestore subscription logic from NewsletterSubscribe.
function NewsletterPopup({user}){
  const [show,setShow]=useState(false);
  const [email,setEmail]=useState('');
  const [status,setStatus]=useState('');// 'success'|'exists'|'error'|''
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!user) return;
    if(localStorage.getItem('cs_popup_dismissed')) return;
    const t=setTimeout(()=>setShow(true),30000);
    return ()=>clearTimeout(t);
  },[user]);

  const dismiss=()=>{
    setShow(false);
    localStorage.setItem('cs_popup_dismissed','1');
  };

  const submit=async(e)=>{
    e.preventDefault();
    const v=email.trim();
    if(!v||!v.includes('@')) return;
    const fb=window.CS_FB;
    if(!fb){setStatus('error');return;}
    setLoading(true);
    try{
      const q=fb.query(fb.collection(fb.db,'newsletter_subscribers'),fb.where('email','==',v));
      const snap=await fb.getDocs(q);
      if(!snap.empty){
        setStatus('exists');
      }else{
        await fb.setDoc(fb.doc(fb.collection(fb.db,'newsletter_subscribers')),{
          email:v,uid:null,subscribedAt:fb.serverTimestamp(),source:'popup'
        });
        setStatus('success');
        setEmail('');
        localStorage.setItem('cs_popup_dismissed','1');
      }
    }catch(err){
      console.warn('Newsletter popup subscribe failed:',err.message);
      setStatus('error');
    }
    setLoading(false);
  };

  if(!show) return null;

  return(
    <div className="nl-popup-overlay" onClick={dismiss}>
      <div className="nl-popup" onClick={e=>e.stopPropagation()}>
        <button className="nl-popup-close" onClick={dismiss} aria-label="Close">×</button>
        <div className="nl-popup-icon">✉</div>
        <h3 className="nl-popup-title">Get Monthly Points Strategies</h3>
        <p className="nl-popup-sub">Join travelers who maximize every dollar. One email per month — no spam.</p>
        {status==='success'?(
          <div className="nl-popup-msg" style={{color:"var(--grn2)"}}>You're on the list! 🎉</div>
        ):status==='exists'?(
          <div className="nl-popup-msg" style={{color:"var(--gold)"}}>You're already subscribed!</div>
        ):status==='error'?(
          <div className="nl-popup-msg" style={{color:"var(--red2)"}}>Something went wrong. Please try again.</div>
        ):(
          <form className="nl-popup-form" onSubmit={submit}>
            <input className="nl-popup-input" type="email" placeholder="you@email.com"
              value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/>
            <button className="nl-popup-btn" type="submit" disabled={loading}>
              {loading?'Subscribing…':'Subscribe'}
            </button>
          </form>
        )}
        {status!=='success'&&(
          <button className="nl-popup-dismiss" onClick={dismiss}>No thanks</button>
        )}
        {status==='success'&&(
          <button className="nl-popup-dismiss" onClick={dismiss} style={{marginTop:12}}>Close</button>
        )}
      </div>
    </div>
  );
}


/* ── HOME TAB (FeeWorth Dashboard) ────────────────────────────────────────── */
// The FeeWorth dashboard — focused on annual fee ROI and renewal decisions.
// Shows: top stats (total fees, credits used, net ROI), a card renewal timeline
// sorted by nearest renewal date with ROI progress bars and verdict badges,
// and a collapsed section for no-annual-fee cards.
// Props: myCards, setMyCards, checkedSet, setTab, setStratModal.
function HomeTab({myCards,setMyCards,checkedSet,setTab,setStratModal,anniversaryDates,user,onAuthClick,p2Cards=[],p2Name="",householdSetup=false,firstYearCards=[]}){
  const [showFreeCards,setShowFreeCards]=useState(false);
  const [showP2Free,setShowP2Free]=useState(false);
  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);
  const p2Resolved=useMemo(()=>householdSetup?p2Cards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean):[],[p2Cards,householdSetup]);

  // Helper to compute annual credit value for a card
  const cardCreditVal=c=>{
    const isFirst=firstYearCards.includes(c.id);
    const ann=c.annual.reduce((a,b)=>{if(!b.v)return a;if(b.requiresRenewal&&isFirst)return a;if(b.reset==="quarterly")return a+b.v*4;if(b.reset==="semi-annual")return a+b.v*2;return a+b.v;},0);
    return ann+c.monthly.reduce((a,b)=>{if(b.requiresRenewal&&isFirst)return a;return a+((b.v||0)*12);},0);
  };

  const allHouseCards=useMemo(()=>[...cards,...p2Resolved],[cards,p2Resolved]);
  const p2Set=useMemo(()=>new Set(p2Cards),[p2Cards]);

  // Compute used value for a card based on checked-off benefits
  function cardUsedValue(card){
    let total=0;
    const isFirst=firstYearCards.includes(card.id);
    const allBens=[...card.annual.map(b=>({...b,isMonthly:false})),...card.monthly.map(b=>({...b,isMonthly:true}))];
    allBens.forEach(b=>{
      if(!b.v)return;
      if(b.requiresRenewal&&isFirst)return;
      const pk=periodKeys(card.id,b,b.isMonthly);
      if(pk) pk.forEach(p=>{if(checkedSet.has(p.key))total+=b.v;});
      else if(checkedSet.has(benKey(card.id,b,b.isMonthly))) total+=annualBenValue(b);
    });
    return total;
  }

  const totalFees=useMemo(()=>allHouseCards.reduce((s,c)=>s+c.fee,0),[allHouseCards]);
  const totalCredits=useMemo(()=>allHouseCards.reduce((s,c)=>s+cardUsedValue(c),0),[allHouseCards,checkedSet,firstYearCards]);
  const netROI=totalCredits-totalFees;

  // Detect strategic value for a card (transfer partner access, ecosystem unlocking, synergies)
  function getStrategicValue(card){
    const hv=HIDDEN_VALUES[card.name];
    const hasTransferEco=!!(hv&&hv.transferEcosystem);
    // Check if this card is an unlocker in any ecosystem
    let isUnlocker=false;let ecoName=null;let valueUplift=null;
    for(const[eco,data] of Object.entries(ECOSYSTEM_MAP)){
      if(data.unlockers.includes(card.name)){isUnlocker=true;ecoName=eco;valueUplift=data.valueUplift;break;}
    }
    // Check if this card is an earner that flows to an unlocker the user owns
    let isEarnerInEco=false;let earnerEcoName=null;
    for(const[eco,data] of Object.entries(ECOSYSTEM_MAP)){
      if(data.earners.includes(card.name)&&!data.unlockers.includes(card.name)){
        // Check if user or household has an unlocker for this ecosystem
        const allIds=[...myCards,...(householdSetup?p2Cards:[])];
        const hasUnlocker=data.unlockers.some(uName=>CARDS.some(c=>allIds.includes(c.id)&&c.name===uName));
        if(hasUnlocker){isEarnerInEco=true;earnerEcoName=eco;break;}
      }
    }
    // Check if this is the ONLY unlocker in household for its ecosystem
    let isOnlyUnlocker=false;
    if(isUnlocker&&ecoName){
      const eco=ECOSYSTEM_MAP[ecoName];
      const allIds=[...myCards,...(householdSetup?p2Cards:[])];
      const unlockerCount=eco.unlockers.filter(uName=>CARDS.some(c=>allIds.includes(c.id)&&c.name===uName)).length;
      // Count how many of user's cards are unlockers (could be >1 if they have CSP + CSR)
      const unlockerCardIds=allIds.filter(id=>{const c=CARDS.find(x=>x.id===id);return c&&eco.unlockers.includes(c.name);});
      if(unlockerCardIds.length===1) isOnlyUnlocker=true;
    }
    const synergies=CARD_SYNERGIES[card.name]||[];
    const hasSynergies=synergies.length>0;
    const isStrategic=hasTransferEco||isUnlocker||isEarnerInEco;
    // Build context note
    let note=null;
    if(isUnlocker&&ecoName){
      const tpd=TRANSFER_PARTNER_DATA[ecoName];
      const valRange=tpd?tpd.transferValue+"¢":"2-3¢";
      note=(isOnlyUnlocker?"🔑 ":"")+"Unlocks "+ecoName.split(" ")[0]+" transfer partners ("+valRange+"/point)"+(householdSetup?" for your household":"");
    } else if(isEarnerInEco&&earnerEcoName){
      note="Earns "+earnerEcoName.split(" ")[0]+" points → flows to household transfer pool";
    } else if(hasTransferEco&&hv){
      note="Transfer partner access via "+hv.transferEcosystem.split(" ")[0];
    }
    return {isStrategic,isUnlocker,isOnlyUnlocker,isEarnerInEco,hasTransferEco,ecoName,valueUplift,note};
  }

  // Calculate per-card used credit values
  function buildCardStats(cardList,owner){
    return cardList.map(card=>{
      const usedVal=cardUsedValue(card);
      const potentialVal=cardCreditVal(card);
      let renewDays=card.fee>0?getRenewalDays(card.id,anniversaryDates):null;
      const roiPct=card.fee>0?Math.round((usedVal/card.fee)*100):null;
      const strat=getStrategicValue(card);
      let verdict;
      if(card.fee===0) verdict=null;
      else if(roiPct>=100) verdict="worth-it";
      else if(roiPct>=50&&strat.isStrategic) verdict="on-track";
      else if(roiPct>=50) verdict="on-track";
      else if(strat.isStrategic) verdict="strategic";
      else verdict="at-risk";
      return {card,usedVal,potentialVal,renewDays,roiPct,verdict,owner,strat};
    });
  }
  const cardStats=useMemo(()=>buildCardStats(cards,"you"),[cards,anniversaryDates,checkedSet,firstYearCards]);
  const p2CardStats=useMemo(()=>buildCardStats(p2Resolved,p2Name||"Partner"),[p2Resolved,anniversaryDates,p2Name,checkedSet,firstYearCards]);

  // Split into fee cards (sorted by nearest renewal) and free cards
  const allStats=useMemo(()=>[...cardStats,...p2CardStats],[cardStats,p2CardStats]);

  // Detect redundant household unlockers — when both partners have an unlocker in the same
  // ecosystem and that ecosystem allows household point combining, only one is needed.
  const redundancyMap=useMemo(()=>{
    if(!householdSetup) return new Map();
    const map=new Map();
    for(const[ecoName,eco] of Object.entries(ECOSYSTEM_MAP)){
      const rules=POINT_SHARING_RULES[ecoName];
      if(!rules||!rules.canShareHousehold) continue;
      const p1Unlockers=allStats.filter(s=>s.owner==="you"&&eco.unlockers.includes(s.card.name));
      const p2Unlockers=allStats.filter(s=>s.owner!=="you"&&eco.unlockers.includes(s.card.name));
      if(p1Unlockers.length===0||p2Unlockers.length===0) continue;
      // Both partners have unlockers — pick the most valuable to keep
      const all=[...p1Unlockers,...p2Unlockers];
      all.sort((a,b)=>{
        if(a.card.fee!==b.card.fee) return b.card.fee-a.card.fee;
        if(a.usedVal!==b.usedVal) return b.usedVal-a.usedVal;
        return a.owner==="you"?1:-1; // tie: keep partner's, flag user's
      });
      for(let i=1;i<all.length;i++){
        const r=all[i];
        const keeperOwnerName=all[0].owner==="you"?"Your":((p2Name||"Partner")+"'s");
        const keeperCardName=all[0].card.short||all[0].card.name;
        map.set(r.card.id+r.owner,{ecoName,keeperOwnerName,keeperCardName,fee:r.card.fee});
      }
    }
    return map;
  },[allStats,householdSetup,p2Name]);

  const verdictOrder={"redundant":0,"at-risk":0,"on-track":1,"strategic":2,"worth-it":3};
  const sortByRenewal=(a,b)=>{
    const aO=verdictOrder[a.verdict]??2;const bO=verdictOrder[b.verdict]??2;
    if(aO!==bO) return aO-bO;
    const aD=a.renewDays!=null?a.renewDays:9999;const bD=b.renewDays!=null?b.renewDays:9999;return aD-bD;
  };
  const feeCards=useMemo(()=>allStats.filter(cs=>cs.card.fee>0).sort(sortByRenewal),[allStats]);
  const freeCards=useMemo(()=>cardStats.filter(cs=>cs.card.fee===0),[cardStats]);
  const p2FreeCards=useMemo(()=>p2CardStats.filter(cs=>cs.card.fee===0),[p2CardStats]);

  // Write upcoming renewals to Firestore for newsletter reminders
  useEffect(()=>{
    if(!user)return;
    const fb=window.CS_FB;
    if(!fb)return;
    const upcoming=feeCards.filter(({renewDays})=>renewDays!=null&&renewDays<=60)
      .map(({card,renewDays})=>({cardId:card.id,cardName:card.short||card.name,daysUntilRenewal:renewDays,fee:card.fee}));
    fb.setDoc(fb.doc(fb.db,'users',user.uid),{upcomingRenewals:upcoming},{merge:true})
      .catch(e=>console.warn('Renewal sync failed:',e.message));
  },[feeCards,user]);

  if(!user||!myCards.length){
    return (
      <div style={{padding:"0 16px"}}>
        {/* Hero Section */}
        <div className="home-hero">
          <div className="home-hero-content">
            <div className="home-hero-eyebrow">ANNUAL FEE RENEWAL ENGINE</div>
            <h1 className="home-hero-title">Is the fee<br/>worth it?</h1>
            <p className="home-hero-subtitle">Know exactly which cards to keep, cancel, or downgrade — before renewal day.</p>
            <button className="btn" onClick={()=>{if(user)setTab("benefits");else if(onAuthClick)onAuthClick();}}>Run Your Free Fee Check →</button>
          </div>
          <div className="home-hero-card">
            <div className="hero-card-mockup">
              <div className="hero-card-inner">
                {/* Top row: logo + brand */}
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M8 0L15.5 4.5V13.5L8 18L0.5 13.5V4.5L8 0Z" stroke="rgba(255,255,255,.8)" strokeWidth="1.2"/></svg>
                  <span style={{fontSize:10,letterSpacing:2.5,textTransform:'uppercase',fontWeight:700,opacity:.85}}>FEEWORTH</span>
                </div>
                {/* Card name */}
                <div style={{flex:1,display:'flex',alignItems:'center'}}>
                  <div style={{fontSize:20,fontFamily:"'Inter',sans-serif",fontStyle:'italic',fontWeight:500}}>Sage Platinum</div>
                </div>
                {/* Card number dots */}
                <div style={{fontSize:12,letterSpacing:3,marginBottom:10,opacity:.7,fontFamily:'monospace'}}>•••• &nbsp;•••• &nbsp;•••• &nbsp;8842</div>
                {/* Cardholder + chip + visa */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                  <div>
                    <div style={{fontSize:7,letterSpacing:1.5,textTransform:'uppercase',opacity:.45,marginBottom:3}}>CARD HOLDER</div>
                    <div style={{fontSize:11,letterSpacing:1,fontWeight:600}}>ALEXANDER SAGE</div>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-end',gap:16}}>
                    <div style={{width:40,height:30,borderRadius:4,background:'linear-gradient(135deg,#14b8b8,#0d7377)',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 5px,rgba(255,255,255,.15) 5px,rgba(255,255,255,.15) 6px),repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(255,255,255,.15) 7px,rgba(255,255,255,.15) 8px)'}}/>
                    </div>
                    <div style={{fontSize:18,fontStyle:'italic',fontWeight:700,opacity:.8,letterSpacing:1}}>VISA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Feature Cards Section */}
        <div className="home-features-divider"/>
        <div className="home-features">
          <div className="home-feature-card">
            <div className="home-feature-icon"><Icon name="calendar" size={24} color="#fff"/></div>
            <h3 className="home-feature-title">Renewal Countdown</h3>
            <p className="home-feature-desc">See exactly when each annual fee hits. Never be surprised by a renewal charge again.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon"><Icon name="target" size={24} color="#fff"/></div>
            <h3 className="home-feature-title">Keep vs Cancel Verdict</h3>
            <p className="home-feature-desc">Get a clear keep, cancel, or downgrade recommendation backed by the actual math on your usage.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon"><Icon name="heart" size={24} color="#fff"/></div>
            <h3 className="home-feature-title">Household Optimization</h3>
            <p className="home-feature-desc">Optimize cards across partners and family members. See whose name each card should be under.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"16px 16px 0"}}>
      {/* Dashboard header */}
      <div style={{marginBottom:20}}>
        <h2 className="page-title" style={{fontSize:36}}>Fee Dashboard</h2>
        <p className="page-subtitle">{allHouseCards.length} card{allHouseCards.length!==1?'s':''}{householdSetup?" (household)":""} · {feeCards.length} with annual fees</p>
      </div>

      {/* Renewal notification banners */}
      {feeCards.filter(({renewDays})=>renewDays!=null&&renewDays<=60).map(({card,renewDays,owner})=>(
        <div key={card.id+owner+"banner"} onClick={()=>setTab("benefits")}
          style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:8,borderRadius:12,cursor:"pointer",
            background:renewDays<=7?"rgba(220,38,38,.08)":renewDays<=30?"rgba(13,115,119,.08)":"rgba(13,115,119,.06)",
            border:renewDays<=7?"1px solid rgba(220,38,38,.2)":renewDays<=30?"1px solid rgba(13,115,119,.2)":"1px solid rgba(13,115,119,.15)"}}>
          <Icon name="alert-triangle" size={16} color={renewDays<=7?"var(--red2)":renewDays<=30?"#d97706":"var(--acc)"}/>
          <div style={{flex:1,fontSize:12,fontWeight:600,color:"var(--tx)",lineHeight:1.4}}>
            {householdSetup&&owner!=="you"?<span style={{color:"var(--acc)"}}>{owner}&rsquo;s </span>:"Your "}<strong>{card.short||card.name}</strong> annual fee hits in {renewDays} day{renewDays!==1?"s":""}. <span style={{color:"var(--acc)",fontWeight:700}}>Review ROI →</span>
          </div>
        </div>
      ))}

      {/* Top stats row */}
      <div className="stats-grid fu">
        <div className="stat-box">
          <div className="stat-val" style={{color:"var(--red2)"}}>${totalFees}</div>
          <div className="stat-lbl">Total Annual Fees</div>
        </div>
        <div className="stat-box">
          <div className="stat-val grn-text">${totalCredits}</div>
          <div className="stat-lbl">Credits Captured</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{color:netROI>=0?"var(--grn2)":"var(--red2)"}}>
            {netROI>=0?"+":""}${Math.abs(netROI)}
          </div>
          <div className="stat-lbl">Net ROI</div>
        </div>
      </div>


      {/* Card Renewal Timeline */}
      {feeCards.length>0&&(
        <div style={{marginBottom:16}}>
          <div className="section-hdr" style={{marginBottom:12}}>
            <div className="section-title"><Icon name="calendar" size={14} color="var(--acc)"/> RENEWAL TIMELINE</div>
          </div>
          {feeCards.map(({card,usedVal,renewDays,roiPct,verdict,owner,strat})=>{
            const palette=getIssuerPalette(card.issuer);
            const rInfo=redundancyMap.get(card.id+owner);
            const isRedundant=!!rInfo;
            const verdictLabel=isRedundant?"Redundant":verdict==="worth-it"?"Worth It":verdict==="on-track"?"On Track":verdict==="strategic"?"Keeper":"Behind";
            const verdictTip=isRedundant?(rInfo.keeperOwnerName+" "+rInfo.keeperCardName+" already unlocks "+rInfo.ecoName.split(" ")[0]+" transfer partners. Downgrade to save $"+rInfo.fee+"/yr."):verdict==="worth-it"?"Credits already exceed the annual fee":verdict==="on-track"?"Earning back the annual fee at a healthy pace":verdict==="strategic"?"Valuable for transfer partners, perks, or household strategy":"Credits captured haven\u2019t covered the fee yet";
            const verdictColor=isRedundant?"#d97706":verdict==="worth-it"?"var(--grn2)":verdict==="on-track"?"var(--acc)":verdict==="strategic"?"#2563eb":"var(--red2)";
            const verdictBg=isRedundant?"rgba(217,119,6,.1)":verdict==="worth-it"?"rgba(22,163,74,.1)":verdict==="on-track"?"rgba(13,115,119,.1)":verdict==="strategic"?"rgba(37,99,235,.1)":"rgba(220,38,38,.1)";
            const barPct=Math.min(roiPct||0,100);
            const barColor=isRedundant?"#d97706":verdict==="worth-it"?"var(--grn2)":verdict==="on-track"?"var(--acc)":verdict==="strategic"?"#2563eb":"var(--red2)";
            return(
              <div key={card.id+owner} className="surf fu" style={{marginBottom:8,cursor:"pointer",borderLeft:`4px solid ${palette.grad[0]}`,padding:"14px 16px"}}
                onClick={()=>setTab("benefits")}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:14,fontWeight:700,color:"var(--tx)",lineHeight:1.2}}>{card.short||card.name}</span>
                      {strat.isOnlyUnlocker&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,background:"rgba(37,99,235,.1)",color:"#2563eb",letterSpacing:.3,whiteSpace:"nowrap"}}>🔑 Household Key</span>}
                      {householdSetup&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,background:owner==="you"?"rgba(13,115,119,.1)":"rgba(154,110,26,.1)",color:owner==="you"?"var(--acc)":"var(--gold)",letterSpacing:.3,textTransform:"uppercase",whiteSpace:"nowrap"}}>{owner==="you"?"You":owner}</span>}
                    </div>
                    <div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>{card.issuer} · ${card.fee}/yr</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    {renewDays!=null?(
                      <div style={{fontSize:11,color:renewDays<=60?"var(--red2)":renewDays<=120?"var(--gold)":"var(--tx3)",fontWeight:600,whiteSpace:"nowrap"}}>
                        {renewDays<=0?"Renews today":renewDays+" days"}
                      </div>
                    ):(
                      <div style={{fontSize:11,color:"var(--acc)",fontWeight:600,whiteSpace:"nowrap",cursor:"pointer"}}
                        onClick={e=>{e.stopPropagation();setTab("wallet");}}>
                        Set renewal date →
                      </div>
                    )}
                    <span title={verdictTip} style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:99,
                      fontSize:10,fontWeight:700,letterSpacing:.3,color:verdictColor,background:verdictBg,whiteSpace:"nowrap",cursor:"help"}}>
                      {verdictLabel}
                    </span>
                  </div>
                </div>
                {/* ROI progress bar */}
                <div style={{marginBottom:strat.note?4:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                    <span style={{fontSize:11,fontWeight:600,color:"var(--tx2)"}}>${usedVal} of ${card.fee} captured</span>
                    <span style={{fontSize:11,fontWeight:700,color:verdictColor}}>{roiPct}%</span>
                  </div>
                  <div className="prog-track" style={{height:6,borderRadius:99}}>
                    <div className="prog-fill" style={{width:barPct+"%",background:barColor,borderRadius:99}}/>
                  </div>
                </div>
                {(isRedundant||strat.note)&&(
                  <div style={{fontSize:11,color:isRedundant?"#d97706":verdict==="strategic"?"#2563eb":"var(--acc)",lineHeight:1.4,fontWeight:500}}>
                    {isRedundant?("Redundant \u2014 "+rInfo.keeperOwnerName+" "+rInfo.keeperCardName+" already unlocks "+rInfo.ecoName.split(" ")[0]+" transfer partners. Downgrade to save $"+rInfo.fee+"/yr."):strat.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No Annual Fee cards — collapsed section */}
      {freeCards.length>0&&(
        <div style={{marginBottom:householdSetup&&p2FreeCards.length>0?8:16}}>
          <button onClick={()=>setShowFreeCards(!showFreeCards)}
            style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:"none",border:"none",
              cursor:"pointer",padding:"10px 0",borderTop:"1px solid var(--br2)"}}>
            <Icon name={showFreeCards?"chevron-down":"chevron-right"} size={14} color="var(--tx3)"/>
            <span style={{fontSize:12,fontWeight:600,color:"var(--tx3)",letterSpacing:.5,textTransform:"uppercase"}}>
              {householdSetup?"Your ":""}No Annual Fee ({freeCards.length})
            </span>
          </button>
          {showFreeCards&&(
            <div style={{paddingLeft:4}}>
              {freeCards.map(({card,strat})=>{
                const palette=getIssuerPalette(card.issuer);
                return(
                  <div key={card.id} className="surf" style={{marginBottom:6,borderLeft:`4px solid ${palette.grad[0]}`,padding:"10px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{card.short||card.name}</div>
                        <div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>{card.issuer} · $0/yr</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,color:"var(--tx3)",background:"rgba(107,114,128,.08)",whiteSpace:"nowrap"}}>✓ Free</span>
                    </div>
                    {strat.note&&(
                      <div style={{fontSize:11,color:"var(--acc)",lineHeight:1.4,fontWeight:500,marginTop:4}}>
                        {strat.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {householdSetup&&p2FreeCards.length>0&&(
        <div style={{marginBottom:16}}>
          <button onClick={()=>setShowP2Free(!showP2Free)}
            style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:"none",border:"none",
              cursor:"pointer",padding:"10px 0",borderTop:"1px solid var(--br2)"}}>
            <Icon name={showP2Free?"chevron-down":"chevron-right"} size={14} color="var(--tx3)"/>
            <span style={{fontSize:12,fontWeight:600,color:"var(--tx3)",letterSpacing:.5,textTransform:"uppercase"}}>
              {p2Name||"Partner"}&rsquo;s No Annual Fee ({p2FreeCards.length})
            </span>
          </button>
          {showP2Free&&(
            <div style={{paddingLeft:4}}>
              {p2FreeCards.map(({card,strat})=>{
                const palette=getIssuerPalette(card.issuer);
                return(
                  <div key={card.id+"p2"} className="surf" style={{marginBottom:6,borderLeft:`4px solid ${palette.grad[0]}`,padding:"10px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{card.short||card.name}</div>
                        <div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>{card.issuer} · $0/yr</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,color:"var(--tx3)",background:"rgba(107,114,128,.08)",whiteSpace:"nowrap"}}>✓ Free</span>
                    </div>
                    {strat.note&&(
                      <div style={{fontSize:11,color:"var(--acc)",lineHeight:1.4,fontWeight:500,marginTop:4}}>
                        {strat.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── BENEFITS TAB ─────────────────────────────────────────────────────────── */
// RESET_LABELS maps benefit reset frequency codes to human-readable labels.
// For example, 'monthly' becomes 'Monthly', 'semi-annual' becomes 'Semi-annual'.
// The benefit tracker screen. Lists all monthly and annual perks for your cards,
// lets you check off benefits you've redeemed, and shows when each benefit resets.
const RESET_LABELS={monthly:"Monthly",quarterly:"Quarterly","semi-annual":"Semi-annual",annual:"Annual"};
// BenefitsTab shows all credit card benefits the user can track and check off.
// It displays a progress bar showing what percentage of benefits have been redeemed,
// category filter pills, and an expandable list of every benefit grouped by card.
// Each benefit can be checked/unchecked and expanded to see details and activation links.
// Props: myCards, checkedSet, setCheckedBenefits, checkDates, setCheckDates, resetBadges.
function BenefitsTab({myCards,checkedSet,setCheckedBenefits,checkDates,setCheckDates,resetBadges=new Set(),skippedSet=new Set(),setSkippedBenefits}){
  const [filterCat,setFilterCat]=useState("all");
  const [openBen,setOpenBen]=useState(null);
  const [upgradeCard,setUpgradeCard]=useState(null);

  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);

  const allBenefits=useMemo(()=>{
    const list=[];
    cards.forEach(card=>{
      card.annual.forEach(b=>list.push({...b,cardId:card.id,card,key:benKey(card.id,b,false),isMonthly:false}));
      card.monthly.forEach(b=>list.push({...b,cardId:card.id,card,key:benKey(card.id,b,true),isMonthly:true}));
    });
    return list;
  },[cards]);

  const trackable=useMemo(()=>allBenefits.filter(b=>b.v!=null),[allBenefits]);

  const filtered=useMemo(()=>{
    if(filterCat==="all")return allBenefits;
    if(filterCat==="unused")return trackable.filter(b=>{
      const pk=periodKeys(b.cardId,b,b.isMonthly);
      if(pk) return pk.some(p=>!checkedSet.has(p.key));
      return !checkedSet.has(b.key);
    });
    return allBenefits.filter(b=>b.cat===filterCat);
  },[allBenefits,trackable,filterCat,checkedSet]);

  // For multi-period benefits, count each period separately — exclude skipped from progress
  const unskippedTrackable=useMemo(()=>trackable.filter(b=>!skippedSet.has(b.key)),[trackable,skippedSet]);
  const totalPeriodSlots=useMemo(()=>{
    let count=0;
    unskippedTrackable.forEach(b=>{
      const pk=periodKeys(b.cardId,b,b.isMonthly);
      count+=pk?pk.length:1;
    });
    return count;
  },[unskippedTrackable]);
  const checkedCount=useMemo(()=>{
    let count=0;
    unskippedTrackable.forEach(b=>{
      const pk=periodKeys(b.cardId,b,b.isMonthly);
      if(pk) pk.forEach(p=>{if(checkedSet.has(p.key))count++;});
      else if(checkedSet.has(b.key)) count++;
    });
    return count;
  },[unskippedTrackable,checkedSet]);
  const pct=useMemo(()=>totalPeriodSlots?Math.round((checkedCount/totalPeriodSlots)*100):0,[checkedCount,totalPeriodSlots]);
  const usedValue=useMemo(()=>{
    let total=0;
    unskippedTrackable.forEach(b=>{
      const pk=periodKeys(b.cardId,b,b.isMonthly);
      if(pk) pk.forEach(p=>{if(checkedSet.has(p.key))total+=b.v;});
      else if(checkedSet.has(b.key)) total+=annualBenValue(b);
    });
    return total;
  },[unskippedTrackable,checkedSet]);
  const totalValue=useMemo(()=>unskippedTrackable.reduce((s,b)=>s+annualBenValue(b),0),[unskippedTrackable]);

  function toggle(key,e){
    e.stopPropagation();
    const willCheck=!checkedSet.has(key);
    setCheckedBenefits(prev=>{
      const n=new Set(prev);
      n.has(key)?n.delete(key):n.add(key);
      return n;
    });
    if(setCheckDates){
      if(willCheck){
        setCheckDates(prev=>({...prev,[key]:new Date().toISOString()}));
      }else{
        setCheckDates(prev=>{const n={...prev};delete n[key];return n;});
      }
    }
  }

  function toggleExpand(key){
    setOpenBen(prev=>prev===key?null:key);
  }
  function toggleSkip(key,e){
    e.stopPropagation();
    if(!setSkippedBenefits) return;
    setSkippedBenefits(prev=>{
      const n=new Set(prev);
      n.has(key)?n.delete(key):n.add(key);
      return n;
    });
  }

  if(!myCards.length){
    return <div style={{padding:40,textAlign:"center",color:"var(--tx3)"}}>Add cards to see your benefits.</div>;
  }

  return (
    <div style={{padding:"16px 16px 0"}}>
      {/* Page header */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <h2 className="page-title" style={{textAlign:"center"}}>Your Benefits Ledger</h2>
      </div>

      {/* Progress */}
      <div className="surf fu" style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>Benefits Used This Year</div>
            <div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>${usedValue.toLocaleString()} of ${totalValue.toLocaleString()} in credits redeemed</div>
          </div>
          <div style={{fontSize:26,fontWeight:900,color:pct>60?"var(--grn2)":"var(--gld2)",lineHeight:1,fontFamily:"'Inter',sans-serif"}}>{pct}%</div>
        </div>
        <div className="prog-track">
          <div className="prog-fill" style={{width:pct+"%",background:"linear-gradient(90deg,var(--acc),var(--pur))"}}/>
        </div>
      </div>

      {/* Category filter */}
      <div className="hscroll" style={{marginBottom:14,gap:6}}>
        {[{id:"all",label:"All",iconName:"clipboard"},{id:"unused",label:"Unused",iconName:"bolt"},
          ...Object.entries(BCAT).map(([id,b])=>({id,label:b.label,iconName:BCAT_ICON_MAP[id]||"credit-card"}))
        ].map(f=>(
          <button key={f.id} className={"pill "+(filterCat===f.id?"pill-a":"pill-i")} onClick={()=>setFilterCat(f.id)}>
            <Icon name={f.iconName} size={12}/> {f.label}
          </button>
        ))}
      </div>

      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"32px 0",color:"var(--tx3)"}}>No benefits in this category.</div>
      ):(
        <div className="benefits-list">{cards.map(card=>{
          const cardBens=filtered.filter(b=>b.cardId===card.id);
          if(!cardBens.length)return null;
          const trackHere=cardBens.filter(b=>b.v!=null&&!skippedSet.has(b.key));
          let totalSlots=0,usedHere=0;
          trackHere.forEach(b=>{
            const pk=periodKeys(card.id,b,b.isMonthly);
            if(pk){totalSlots+=pk.length;pk.forEach(p=>{if(checkedSet.has(p.key))usedHere++;});}
            else{totalSlots++;if(checkedSet.has(b.key))usedHere++;}
          });
          const skippedHere=cardBens.filter(b=>b.v!=null&&skippedSet.has(b.key)).length;
          return (
            <div key={card.id} style={{marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,background:getIssuerTint(card.issuer),borderRadius:12,padding:"10px 12px",border:`1px solid ${getIssuerColor(card.issuer)}15`}}>
                <CreditCardDisplay card={card} size="sm"/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:16,fontWeight:600,color:getIssuerColor(card.issuer)}}>{card.short||card.name}{card.confidence==="estimated"&&<span style={{fontSize:10,color:"#9ca3af",fontStyle:"italic",fontWeight:400,marginLeft:4}}>(unverified)</span>}</div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{usedHere}/{totalSlots} credits used{skippedHere>0&&<span style={{marginLeft:4,fontSize:10,fontStyle:"italic",color:"#9ca3af"}}>({skippedHere} skipped)</span>}</div>
                </div>
                <div className="prog-track" style={{width:80}}>
                  <div className="prog-fill" style={{width:(totalSlots?Math.round(usedHere/totalSlots*100):0)+"%",background:getIssuerColor(card.issuer)}}/>
                </div>
              </div>
              {/* Per-card value summary */}
              {(()=>{
                const creditBens=allBenefits.filter(b=>b.cardId===card.id&&b.v!=null);
                const totalCredits=creditBens.reduce((s,b)=>s+annualBenValue(b),0);
                const netValue=totalCredits-card.fee;
                return (
                  <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:80,padding:"6px 10px",borderRadius:8,background:"var(--s3)",textAlign:"center"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Fee</div>
                      <div style={{fontSize:14,fontWeight:800,color:"var(--tx)"}}>{card.fee===0?"Free":"$"+card.fee}</div>
                    </div>
                    <div style={{flex:1,minWidth:80,padding:"6px 10px",borderRadius:8,background:"var(--s3)",textAlign:"center"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Credits</div>
                      <div style={{fontSize:14,fontWeight:800,color:"var(--tx)"}}>${totalCredits.toLocaleString()}</div>
                    </div>
                    <div style={{flex:1,minWidth:80,padding:"6px 10px",borderRadius:8,background:netValue>=0?"rgba(22,163,74,.06)":"rgba(220,38,38,.06)",textAlign:"center"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Net Value</div>
                      <div style={{fontSize:14,fontWeight:800,color:netValue>=0?"var(--grn2)":"var(--red2)"}}>{netValue>=0?"+":""}{netValue<0?"-":""}${Math.abs(netValue).toLocaleString()}</div>
                    </div>
                    {netValue<0&&card.fee>0&&(
                      <button onClick={()=>setUpgradeCard(card)}
                        style={{width:"100%",padding:"5px 0",background:"none",border:"none",cursor:"pointer",
                          fontSize:11,fontWeight:600,color:"var(--acc)",fontFamily:"'Inter',sans-serif",textAlign:"center"}}
                        onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
                        onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>
                        Consider upgrading? →
                      </button>
                    )}
                  </div>
                );
              })()}
              {(()=>{
                const activeCreditBens=cardBens.filter(b=>b.type!=="perk"&&!skippedSet.has(b.key));
                const activePerkBens=cardBens.filter(b=>b.type==="perk"&&!skippedSet.has(b.key));
                const skippedBens=cardBens.filter(b=>skippedSet.has(b.key));
                return (
                  <div className="benefit-item" style={{borderLeftColor:getIssuerColor(card.issuer),padding:"0 14px"}}>
                    {/* ── Active trackable credits (with checkboxes) ── */}
                    {activeCreditBens.map((b,i)=>{
                      const pk=periodKeys(card.id,b,b.isMonthly);
                      const isMulti=!!pk;
                      const done=isMulti?pk.every(p=>checkedSet.has(p.key)):checkedSet.has(b.key);
                      const isOpen=openBen===b.key;
                      const bc=BCAT[b.cat]||BCAT.statement;
                      const rl=RESET_LABELS[b.reset];
                      const wasReset=resetBadges.has(b.key);
                      const periodLabel=b.reset==="quarterly"?"quarter":b.reset==="semi-annual"?"6 months":b.isMonthly?"month":"year";
                      return (
                        <div key={b.key} onClick={()=>toggleExpand(b.key)}
                          role="button" tabIndex={0}
                          onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&toggleExpand(b.key)}
                          style={{borderBottom:i<activeCreditBens.length-1?"1px solid var(--br)":"none",padding:"10px 0",cursor:"pointer"}}>
                          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                            {!isMulti&&(
                              <button className={"ben-check"+(done?" done":"")} onClick={e=>toggle(b.key,e)} style={{marginTop:2}}>
                                {done&&<Icon name="check" size={13} color="var(--bg)"/>}
                              </button>
                            )}
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                                <span style={{fontSize:13,fontWeight:600,color:done?"var(--tx3)":"var(--tx)",textDecoration:done?"line-through":"none"}}>{b.n}</span>
                                <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,color:bc.color,background:bc.bg}}><Icon name={BCAT_ICON_MAP[b.cat]||"credit-card"} size={10} color={bc.color}/> {bc.label}</span>
                                {rl&&<span style={{padding:"1px 6px",borderRadius:99,fontSize:10,background:"rgba(148,163,184,.15)",color:"var(--tx3)",fontWeight:600}}>{rl}</span>}
                                {wasReset&&<span style={{padding:"1px 7px",borderRadius:99,fontSize:10,background:"rgba(212,168,64,.18)",color:"var(--gld3)",fontWeight:700}}>↺ Refreshed</span>}
                              </div>
                              {isMulti&&(
                                <div style={{display:"flex",alignItems:"center",gap:pk.length>2?8:14,marginTop:6,marginBottom:4}}>
                                  {pk.map(p=>{
                                    const pd=checkedSet.has(p.key);
                                    return (
                                      <div key={p.key} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:p.past&&!pd?0.45:1}}>
                                        <button className={"ben-check"+(pd?" done":"")}
                                          onClick={e=>toggle(p.key,e)}
                                          style={{width:22,height:22,borderRadius:6,border:p.current&&!pd?"2px solid var(--acc)":"",boxShadow:p.current?"0 0 0 2px rgba(13,115,119,.2)":"none"}}>
                                          {pd&&<Icon name="check" size={11} color="var(--bg)"/>}
                                        </button>
                                        <span style={{fontSize:10,fontWeight:p.current?700:500,color:p.current?"var(--acc)":"var(--tx3)"}}>{p.label}</span>
                                        {p.sub&&<span style={{fontSize:8,color:"var(--tx4)"}}>{p.sub}</span>}
                                      </div>
                                    );
                                  })}
                                  <div style={{fontSize:12,fontWeight:700,color:"var(--grn2)",marginLeft:4}}>${b.v}<span style={{fontSize:10,fontWeight:500,color:"var(--tx3)"}}> / {periodLabel}</span></div>
                                </div>
                              )}
                              {!isMulti&&b.v&&<div style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Up to ${b.isMonthly?b.v+"/mo ($"+b.v*12+"/yr)":b.v+(b.reset==="annual"?"/yr":"")}</div>}
                            </div>
                            {/* Skip button */}
                            <button onClick={e=>toggleSkip(b.key,e)} title="Skip this benefit"
                              style={{flexShrink:0,background:"none",border:"none",cursor:"pointer",padding:4,marginTop:2,opacity:0.35,transition:"opacity .15s"}}
                              onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.35}>
                              <Icon name="x" size={13} color="var(--tx3)"/>
                            </button>
                            <span style={{flexShrink:0,transition:"transform .15s",display:"inline-flex",transform:isOpen?"rotate(90deg)":"rotate(0deg)",marginTop:4}}><Icon name="chevron-right" size={14} color="var(--tx3)"/></span>
                          </div>
                          {isOpen&&(
                            <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--br)"}}>
                              {b.d&&<p style={{fontSize:12,color:"var(--tx2)",margin:"0 0 8px",lineHeight:1.6}}>{b.d}</p>}
                              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
                                {b.v&&<span style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Value: ${b.v}/{periodLabel} (${annualBenValue(b)}/yr)</span>}
                                {rl&&<span style={{fontSize:11,color:"var(--tx3)"}}>↺ Resets: {rl}</span>}
                                {b.enroll&&<span style={{fontSize:11,color:"var(--gld3)",fontWeight:600,display:"inline-flex",alignItems:"center",gap:3}}><Icon name="bolt" size={11} color="var(--gld3)"/> Activation required</span>}
                              </div>
                              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                                {b.enrollUrl&&<a href={b.enrollUrl} target="_blank" rel="noopener noreferrer"
                                  onClick={e=>e.stopPropagation()}
                                  style={{fontSize:12,color:"var(--acc)",fontWeight:600,textDecoration:"none"}}>Activate →</a>}
                                {b.useUrl&&<a href={b.useUrl} target="_blank" rel="noopener noreferrer"
                                  onClick={e=>e.stopPropagation()}
                                  style={{fontSize:12,color:"var(--acc)",fontWeight:600,textDecoration:"none"}}>Use benefit →</a>}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* ── Active always-on perks (read-only, no checkbox) ── */}
                    {activePerkBens.length>0&&(
                      <>
                        {activeCreditBens.length>0&&(
                          <div style={{borderTop:"1px solid var(--br)",margin:"6px 0",paddingTop:10}}>
                            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:"#9ca3af",textTransform:"uppercase",marginBottom:6}}>INCLUDED PROTECTIONS & PERKS</div>
                          </div>
                        )}
                        {activePerkBens.map((b,i)=>{
                          const isOpen=openBen===b.key;
                          return (
                            <div key={b.key} onClick={()=>toggleExpand(b.key)}
                              style={{borderBottom:i<activePerkBens.length-1?"1px solid var(--br)":"none",padding:"8px 0",cursor:"pointer"}}>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d7377" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                                  <path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z"/><path d="M9 12l2 2 4-4"/>
                                </svg>
                                <div style={{flex:1,minWidth:0}}>
                                  <span style={{fontSize:12,fontWeight:500,color:"#6b7280"}}>{b.n}</span>
                                  {b.v&&<span style={{fontSize:10,color:"#9ca3af",marginLeft:6}}>up to ${b.v.toLocaleString()}</span>}
                                </div>
                                <span style={{flexShrink:0,transition:"transform .15s",display:"inline-flex",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={12} color="#9ca3af"/></span>
                              </div>
                              {isOpen&&(
                                <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--br)",marginLeft:26}}>
                                  {b.d&&<p style={{fontSize:11,color:"#9ca3af",margin:0,lineHeight:1.5}}>{b.d}</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                    {/* ── Skipped benefits (dimmed, with undo) ── */}
                    {skippedBens.length>0&&(
                      <>
                        <div style={{borderTop:"1px solid var(--br)",margin:"6px 0",paddingTop:10}}>
                          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:"#9ca3af",textTransform:"uppercase",marginBottom:6}}>SKIPPED</div>
                        </div>
                        {skippedBens.map((b,i)=>{
                          const isOpen=openBen===b.key;
                          return (
                            <div key={b.key} onClick={()=>toggleExpand(b.key)}
                              style={{borderBottom:i<skippedBens.length-1?"1px solid var(--br)":"none",padding:"8px 0",cursor:"pointer",opacity:0.4}}>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                                    <span style={{fontSize:12,fontWeight:500,color:"var(--tx)",textDecoration:"line-through"}}>{b.n}</span>
                                    <span style={{fontSize:10,fontStyle:"italic",color:"#9ca3af"}}>skipped</span>
                                  </div>
                                  {b.v&&<div style={{fontSize:10,color:"var(--tx3)"}}>${b.v}{b.isMonthly?"/mo":b.reset==="quarterly"?"/quarter":b.reset==="semi-annual"?"/6 mo":"/yr"}</div>}
                                </div>
                                <button onClick={e=>toggleSkip(b.key,e)} title="Un-skip benefit"
                                  style={{flexShrink:0,background:"none",border:"none",cursor:"pointer",padding:4,opacity:1}}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                                </button>
                                <span style={{flexShrink:0,transition:"transform .15s",display:"inline-flex",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={12} color="#9ca3af"/></span>
                              </div>
                              {isOpen&&(
                                <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--br)",marginLeft:4}}>
                                  {b.d&&<p style={{fontSize:11,color:"#9ca3af",margin:0,lineHeight:1.5}}>{b.d}</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}</div>
      )}

      {/* Upgrade suggestion modal */}
      {upgradeCard&&(()=>{
        const uc=upgradeCard;
        // Find the top earn categories for this card
        const topCats=Object.entries(uc.earn||{}).filter(([k,v])=>k!=="o"&&parseFloat(String(v).replace(/[^0-9.]/g,""))>1).map(([k])=>k);
        // Find alternative cards the user doesn't own that earn more in those categories or have better net value
        const alternatives=CARDS.filter(c=>
          c.id!==uc.id&&!myCards.includes(c.id)&&c.issuer===uc.issuer
        );
        // Also find cross-issuer cards that dominate the same categories
        const crossIssuer=CARDS.filter(c=>
          c.id!==uc.id&&!myCards.includes(c.id)&&c.issuer!==uc.issuer&&
          topCats.some(cat=>c.earn&&parseFloat(String(c.earn[cat]||"0").replace(/[^0-9.]/g,""))>parseFloat(String(uc.earn[cat]||"0").replace(/[^0-9.]/g,"")))
        );
        const allAlts=[...alternatives,...crossIssuer];
        // Score by net value (credits - fee) and earning rate overlap
        const scored=allAlts.map(c=>{
          const bens=[...c.annual,...c.monthly];
          const credits=bens.filter(b=>b.v!=null).reduce((s,b)=>s+annualBenValue(b),0);
          const net=credits-c.fee;
          let earnBoost=0;
          topCats.forEach(cat=>{
            const oldRate=parseFloat(String(uc.earn[cat]||"0").replace(/[^0-9.]/g,""));
            const newRate=parseFloat(String((c.earn&&c.earn[cat])||"0").replace(/[^0-9.]/g,""));
            if(newRate>oldRate) earnBoost+=(newRate-oldRate);
          });
          return {...c,credits,net,earnBoost,score:net+earnBoost*100};
        }).filter(c=>c.net>upgradeCard.fee*-1||c.earnBoost>0).sort((a,b)=>b.score-a.score).slice(0,3);

        return (
          <div className="sheet-overlay" onClick={()=>setUpgradeCard(null)}>
            <div className="sheet" onClick={e=>e.stopPropagation()} style={{maxWidth:500,padding:"24px 20px 40px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <div style={{fontSize:18,fontWeight:800,color:"var(--tx)",fontFamily:"'Inter',sans-serif"}}>Upgrade Options</div>
                  <div style={{fontSize:12,color:"var(--tx3)",marginTop:2}}>Cards with better value than {uc.short||uc.name}</div>
                </div>
                <button onClick={()=>setUpgradeCard(null)} style={{background:"none",border:"none",fontSize:22,color:"var(--tx3)",cursor:"pointer",padding:4,lineHeight:1}}>&times;</button>
              </div>

              {scored.length===0?(
                <div style={{textAlign:"center",padding:"24px 0",color:"var(--tx3)",fontSize:13}}>No clear upgrades found for your spending categories. This card may still be worth keeping for its specific benefits.</div>
              ):(
                scored.map(alt=>{
                  const palette=getIssuerPalette(alt.issuer);
                  const applyUrl=APPLY_URLS[alt.id]&&!APPLY_URLS[alt.id].startsWith("#")?APPLY_URLS[alt.id]:null;
                  return (
                    <div key={alt.id} style={{marginBottom:14,borderRadius:12,border:"1px solid var(--br2)",overflow:"hidden"}}>
                      <div style={{padding:"14px 16px",borderLeft:`3px solid ${palette.text}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                          <div style={{width:36,height:22,borderRadius:5,background:`linear-gradient(135deg,${alt.c1},${alt.c2})`,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.12)"}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>{alt.short||alt.name}</div>
                            <div style={{fontSize:11,color:"var(--tx3)"}}>{alt.issuer} · {alt.fee===0?"No fee":"$"+alt.fee+"/yr"}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:14,fontWeight:800,color:alt.net>=0?"var(--grn2)":"var(--tx2)"}}>{alt.net>=0?"+":""}${alt.net.toLocaleString()}</div>
                            <div style={{fontSize:9,color:"var(--tx3)",textTransform:"uppercase",fontWeight:600}}>Net value</div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                          <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"rgba(22,163,74,.08)",color:"var(--grn2)",border:"1px solid rgba(22,163,74,.15)"}}>${alt.credits.toLocaleString()} in credits</span>
                          {alt.earnBoost>0&&<span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"rgba(13,115,119,.08)",color:"var(--acc)",border:"1px solid rgba(13,115,119,.15)"}}>+{alt.earnBoost}x earn boost</span>}
                        </div>
                        {alt.signup&&alt.signup!=="No signup bonus"&&alt.signup!=="No sign-up bonus"&&(
                          <div style={{fontSize:11,fontWeight:600,color:"var(--acc)",marginBottom:8}}>{alt.signup}</div>
                        )}
                        {applyUrl&&(
                          <div>
                            <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                              style={{display:"block",textAlign:"center",padding:"10px 20px",borderRadius:10,textDecoration:"none",
                                background:"linear-gradient(135deg,var(--acc),var(--gld2))",color:"#fff",
                                fontSize:13,fontWeight:700,boxShadow:"0 2px 8px rgba(13,115,119,.25)",transition:"all .2s"}}
                              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(13,115,119,.35)";}}
                              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 8px rgba(13,115,119,.25)";}}>
                              Apply Now →
                            </a>
                            <div className="apply-disclose" style={{textAlign:"center",marginTop:6}}>Affiliate link — we may earn a commission at no cost to you.</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ── RENEWAL ADVISOR TAB ──────────────────────────────────────────────────── */
// The core FeeWorth feature — a deep-dive decision page for a single card.
// Lets users pick a card, see benefit tracker, ROI verdict, retention scripts,
// downgrade paths, cancellation consequences, and replacement suggestions.
function RenewalAdvisorTab({myCards,checkedSet,setCheckedBenefits,checkDates,setCheckDates,resetBadges=new Set(),skippedSet=new Set(),setSkippedBenefits,anniversaryDates={},setAnniversaryDates,p2Cards=[],p2Name="",householdSetup=false,firstYearCards=[],setFirstYearCards}){
  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);
  const p2Resolved=useMemo(()=>householdSetup?p2Cards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean):[],[p2Cards,householdSetup]);
  const allCards=useMemo(()=>[...cards,...p2Resolved],[cards,p2Resolved]);
  const p2Set=useMemo(()=>new Set(p2Cards),[p2Cards]);
  // Build fee card entries with owner context — composite key "cardId:p1" / "cardId:p2"
  const feeCardEntries=useMemo(()=>{
    const entries=[];
    cards.filter(c=>c.fee>0).forEach(c=>entries.push({card:c,owner:"p1",key:c.id+":p1"}));
    if(householdSetup) p2Resolved.filter(c=>c.fee>0).forEach(c=>entries.push({card:c,owner:"p2",key:c.id+":p2"}));
    return entries;
  },[cards,p2Resolved,householdSetup]);
  const feeCards=useMemo(()=>feeCardEntries.map(e=>e.card),[feeCardEntries]);

  // Default to nearest-renewal card (prefer cards with anniversary dates set)
  const [selectedKey,setSelectedKey]=useState(()=>{
    if(!feeCardEntries.length) return null;
    let best=feeCardEntries[0], bestDays=9999;
    feeCardEntries.forEach(entry=>{
      const days=getRenewalDays(entry.card.id,anniversaryDates);
      if(days!=null&&days<bestDays){bestDays=days;best=entry;}
    });
    return best.key;
  });
  // Derive card and owner from selectedKey
  const selectedEntry=useMemo(()=>feeCardEntries.find(e=>e.key===selectedKey)||feeCardEntries[0]||null,[feeCardEntries,selectedKey]);
  const selectedId=selectedEntry?selectedEntry.card.id:null;
  const selectedOwner=selectedEntry?selectedEntry.owner:"p1";

  const [openBen,setOpenBen]=useState(null);
  const [showRetention,setShowRetention]=useState(false);
  const [showCancel,setShowCancel]=useState(false);
  const [showHiddenValue,setShowHiddenValue]=useState(false);
  const [expandedHiddenPerk,setExpandedHiddenPerk]=useState(null);
  const [showSynergies,setShowSynergies]=useState(false);
  const [expandedSynergy,setExpandedSynergy]=useState(null);
  const [showBenefits,setShowBenefits]=useState(true);
  const [showPaths,setShowPaths]=useState(false);
  const [showAllPaths,setShowAllPaths]=useState(false);
  const [showDowngrades,setShowDowngrades]=useState(false);
  const [showReplacement,setShowReplacement]=useState(false);
  const [showQuiz,setShowQuiz]=useState(false);
  const [quizStep,setQuizStep]=useState(0);
  const [quizAnswers,setQuizAnswers]=useState({});
  const [quizResult,setQuizResult]=useState(null);

  const card=useMemo(()=>CARDS.find(c=>c.id===selectedId),[selectedId]);

  // Reset collapsible sections when card selection changes
  useEffect(()=>{
    setShowRetention(false);setShowCancel(false);setShowHiddenValue(false);
    setShowSynergies(false);setShowPaths(false);setShowAllPaths(false);
    setShowDowngrades(false);setShowReplacement(false);setShowBenefits(true);setOpenBen(null);
    setExpandedHiddenPerk(null);setExpandedSynergy(null);
    setShowQuiz(false);setQuizStep(0);setQuizAnswers({});setQuizResult(null);
  },[selectedKey]);

  // Benefits for this card
  const allBenefits=useMemo(()=>{
    if(!card)return[];
    const list=[];
    card.annual.forEach(b=>list.push({...b,cardId:card.id,card,key:benKey(card.id,b,false),isMonthly:false}));
    card.monthly.forEach(b=>list.push({...b,cardId:card.id,card,key:benKey(card.id,b,true),isMonthly:true}));
    return list;
  },[card]);

  const isFirstYear=card?firstYearCards.includes(card.id):false;
  const isRenewalBlocked=useCallback(b=>!!b.requiresRenewal&&isFirstYear,[isFirstYear]);

  const trackable=useMemo(()=>allBenefits.filter(b=>b.v!=null&&!skippedSet.has(b.key)),[allBenefits,skippedSet]);
  // ROI-eligible trackable excludes renewal-only benefits in first year
  const roiTrackable=useMemo(()=>trackable.filter(b=>!isRenewalBlocked(b)),[trackable,isRenewalBlocked]);
  const totalCredits=useMemo(()=>roiTrackable.reduce((s,b)=>s+annualBenValue(b),0),[roiTrackable]);

  // Count checked periods (only ROI-eligible benefits)
  const checkedCount=useMemo(()=>{
    let count=0;
    roiTrackable.forEach(b=>{
      const pk=periodKeys(card?.id,b,b.isMonthly);
      if(pk) pk.forEach(p=>{if(checkedSet.has(p.key))count++;});
      else if(checkedSet.has(b.key)) count++;
    });
    return count;
  },[roiTrackable,checkedSet,card]);
  const totalSlots=useMemo(()=>{
    let count=0;
    roiTrackable.forEach(b=>{
      const pk=periodKeys(card?.id,b,b.isMonthly);
      count+=pk?pk.length:1;
    });
    return count;
  },[roiTrackable,card]);
  const usedValue=useMemo(()=>{
    let total=0;
    roiTrackable.forEach(b=>{
      const pk=periodKeys(card?.id,b,b.isMonthly);
      if(pk) pk.forEach(p=>{if(checkedSet.has(p.key))total+=b.v;});
      else if(checkedSet.has(b.key)) total+=annualBenValue(b);
    });
    return total;
  },[roiTrackable,checkedSet,card]);

  const usedRoiPct=card&&card.fee>0?Math.round((usedValue/card.fee)*100):0;
  const potentialRoiPct=card&&card.fee>0?Math.round((totalCredits/card.fee)*100):0;
  const verdict=usedRoiPct>=100?"worth-it":usedRoiPct>=50?"on-track":"at-risk";

  // Renewal days from user-set anniversary month
  const renewDays=useMemo(()=>{
    if(!card||card.fee===0)return null;
    return getRenewalDays(card.id,anniversaryDates);
  },[card,anniversaryDates]);

  // Toggle benefit check
  function toggle(key,e){
    e.stopPropagation();
    const willCheck=!checkedSet.has(key);
    setCheckedBenefits(prev=>{
      const n=new Set(prev);
      n.has(key)?n.delete(key):n.add(key);
      return n;
    });
    if(setCheckDates){
      if(willCheck) setCheckDates(prev=>({...prev,[key]:new Date().toISOString()}));
      else setCheckDates(prev=>{const n={...prev};delete n[key];return n;});
    }
  }
  function toggleExpand(key){setOpenBen(prev=>prev===key?null:key);}
  function toggleSkip(key,e){
    e.stopPropagation();
    if(!setSkippedBenefits)return;
    setSkippedBenefits(prev=>{const n=new Set(prev);n.has(key)?n.delete(key):n.add(key);return n;});
  }

  // Downgrade paths and retention data
  const downgrades=card?(card.downgradePaths||[]):[];
  const retentionOffers=card?(card.retentionOffers||[]):[];
  const issuerPhone=card?(ISSUER_PHONES[card.issuer]||ISSUER_PHONES[card.name.split(' ')[0]]||null):null;
  const pointsInfo=card&&card.ifYouCancel?card.ifYouCancel:null;

  // Replacement suggestion: best same-category card user doesn't own
  const replacement=useMemo(()=>{
    if(!card||card.fee===0)return null;
    const topCats=Object.entries(card.earn||{}).filter(([k,v])=>k!=="o"&&parseFloat(String(v).replace(/[^0-9.]/g,""))>1).map(([k])=>k);
    const allOwnedIds=[...myCards,...p2Cards];
    const candidates=CARDS.filter(c=>c.id!==card.id&&!allOwnedIds.includes(c.id)&&c.isBiz===card.isBiz)
      .map(c=>{
        const bens=[...c.annual,...c.monthly];
        const credits=bens.filter(b=>b.v!=null).reduce((s,b)=>s+annualBenValue(b),0);
        const net=credits-c.fee;
        let earnBoost=0;
        topCats.forEach(cat=>{
          const oldR=parseFloat(String((card.earn&&card.earn[cat])||"0").replace(/[^0-9.]/g,""));
          const newR=parseFloat(String((c.earn&&c.earn[cat])||"0").replace(/[^0-9.]/g,""));
          if(newR>oldR)earnBoost+=(newR-oldR);
        });
        return {...c,credits,net,earnBoost,score:net+earnBoost*100};
      })
      .filter(c=>c.net>0||c.earnBoost>0)
      .sort((a,b)=>b.score-a.score);
    return candidates[0]||null;
  },[card,myCards,p2Cards]);

  if(!feeCards.length){
    return (
      <div style={{padding:40,textAlign:"center",color:"var(--tx3)"}}>
        <Icon name="shield-check" size={36} color="var(--tx4)"/>
        <div style={{marginTop:12,fontSize:15,fontWeight:600,color:"var(--tx2)"}}>No annual-fee cards {householdSetup?"in your household":"in your wallet"}</div>
        <div style={{marginTop:4,fontSize:12}}>Add cards with annual fees to get renewal analysis.</div>
      </div>
    );
  }

  if(!card) return null;

  const palette=getIssuerPalette(card.issuer);
  const allChecked=totalSlots>0&&checkedCount>=totalSlots;
  const noneChecked=checkedCount===0;
  const hasHV=!!card.hiddenValue;
  const hvSuffix=hasHV?" Consider the hidden value below — transfer partners and insurance may close the gap.":"";

  // 5-state messaging
  let roiDesc;
  if(noneChecked){
    roiDesc="Check off benefits you use to see your real ROI.";
  } else if(usedValue>=card.fee&&allChecked){
    roiDesc="This card is paying for itself.";
  } else if(usedValue>=card.fee){
    roiDesc="This card is paying for itself — and you haven't even checked everything off.";
  } else if(allChecked){
    roiDesc="You're using everything available."+hvSuffix;
  } else {
    roiDesc="Check off more benefits you use.";
  }
  const verdictConfig={
    "worth-it":{label:"Worth It",icon:"check",bg:"rgba(22,163,74,.06)",border:"rgba(22,163,74,.2)",color:"var(--grn2)",desc:roiDesc,tip:"Credits already exceed the annual fee"},
    "on-track":{label:"On Track",icon:"zap",bg:"rgba(13,115,119,.06)",border:"rgba(13,115,119,.2)",color:"var(--acc)",desc:roiDesc,tip:"Earning back the annual fee at a healthy pace"},
    "at-risk":{label:"Behind",icon:"alert-triangle",bg:"rgba(220,38,38,.06)",border:"rgba(220,38,38,.2)",color:"var(--red2)",desc:roiDesc,tip:"Credits captured haven\u2019t covered the fee yet"}
  };
  const vc=verdictConfig[verdict];

  const creditBens=allBenefits.filter(b=>b.type!=="perk"&&!skippedSet.has(b.key));
  const perkBens=allBenefits.filter(b=>b.type==="perk"&&!skippedSet.has(b.key));
  const skippedBens=allBenefits.filter(b=>skippedSet.has(b.key));

  // ── Coverage overlap detection for "If You Cancel" ──
  // Maps benefit name patterns to coverage categories so we can cross-reference
  // whether other wallet cards provide the same protection.
  const COVERAGE_CATS=[
    {cat:"primary-rental",match:/Primary.*(?:Car|Rental|CDW)/i,label:"Primary rental car insurance",detail:b=>{const m=b.d.match(/\$[\d,]+/);return m?m[0]+" coverage":null}},
    {cat:"secondary-rental",match:/(?:Secondary.*(?:Car|Rental)|Auto Rental CDW)/i,label:"Rental car insurance (secondary)",detail:b=>{const m=b.d.match(/\$[\d,]+/);return m?m[0]+" coverage":null}},
    {cat:"trip-delay",match:/Trip Delay/i,label:"Trip delay reimbursement",detail:b=>{const hrs=b.d.match(/(\d+)-hour/i);const amt=b.d.match(/\$[\d,]+/);return (amt?amt[0]:"")+((hrs?" / "+hrs[1]+"-hr trigger":""))}},
    {cat:"trip-cancel",match:/Trip Cancel/i,label:"Trip cancellation/interruption",detail:b=>{const m=b.d.match(/\$[\d,]+/);return m?m[0]+" per person":null}},
    {cat:"baggage",match:/Baggage|Lost Luggage/i,label:"Baggage coverage",detail:b=>{const m=b.d.match(/\$[\d,]+/);return m?m[0]:null}},
    {cat:"purchase-prot",match:/Purchase Protection/i,label:"Purchase protection",detail:b=>{const days=b.d.match(/(\d+) days/i);return days?days[1]+"-day window":null}},
    {cat:"ext-warranty",match:/Extended Warranty/i,label:"Extended warranty",detail:b=>{const yrs=b.d.match(/(\d+) extra year/i);const cap=b.d.match(/(\d+) years or less/i);return (yrs?"+"+yrs[1]+" year":"")+(cap?" (warranties ≤"+cap[1]+"yr)":"")}},
    {cat:"return-prot",match:/Return Protection/i,label:"Return protection",detail:b=>{const m=b.d.match(/\$[\d,]+\/item/i);return m?m[0]:null}},
    {cat:"cell-phone",match:/Cell Phone/i,label:"Cell phone protection",detail:b=>{const m=b.d.match(/\$[\d,]+/);const ded=b.d.match(/\$\d+ deductible/i);return (m?m[0]:"")+(ded?" ("+ded[0]+")":"")}},
    {cat:"priority-pass",match:/Priority Pass/i,label:"Priority Pass lounge access",detail:null},
    {cat:"lounge",match:/(?:Centurion|Capital One Lounge|Lounge Access|Sky Club)/i,label:"Airport lounge access",detail:null},
    {cat:"hotel-status",match:/(?:Elite|Discoverist|Diamond|Gold Status|Platinum Status|Silver Elite|15 Elite Night)/i,label:"Hotel elite status",detail:b=>b.n},
    {cat:"concierge",match:/Concierge/i,label:"Concierge service",detail:null}
  ];

  // Build other-wallet-cards (excluding the card being analyzed)
  const otherWalletCards=useMemo(()=>{
    const allIds=[...myCards,...p2Cards].filter(id=>id!==(card&&card.id));
    return allIds.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean);
  },[myCards,p2Cards,card]);

  // For a benefit name, find matching coverage category and overlapping cards
  function findCoverage(ben){
    for(const cc of COVERAGE_CATS){
      if(!cc.match.test(ben.n))continue;
      const matches=[];
      for(const oc of otherWalletCards){
        const allOcBens=[...oc.annual,...oc.monthly];
        const hit=allOcBens.find(ob=>cc.match.test(ob.n));
        if(hit){
          const myDetail=cc.detail?cc.detail(ben):null;
          const theirDetail=cc.detail?cc.detail(hit):null;
          matches.push({card:oc,ben:hit,myDetail,theirDetail});
        }
      }
      return {cat:cc.cat,label:cc.label,matches};
    }
    // Special: check transfer partner access
    if(ben.n&&/transfer/i.test(ben.n)){
      const partnerCards=otherWalletCards.filter(oc=>oc.partners&&oc.partners.length>0&&oc.cur===card.cur);
      if(partnerCards.length>0) return {cat:"transfer",label:"Transfer partner access",matches:partnerCards.map(oc=>({card:oc,ben:null,myDetail:null,theirDetail:null}))};
    }
    return null;
  }

  return (
    <div style={{padding:"16px 16px 0"}}>
      {/* ── CARD SELECTOR ── */}
      <div style={{marginBottom:20}}>
        <label style={{fontSize:10,fontWeight:700,letterSpacing:1,color:"var(--tx3)",textTransform:"uppercase",marginBottom:6,display:"block"}}>Analyze Card</label>
        <div className="ra-selector">
          <select value={selectedKey||""} onChange={e=>setSelectedKey(e.target.value)}
            style={{width:"100%",padding:"14px 16px",fontSize:15,fontWeight:600,color:"var(--tx)",
              background:"var(--bg)",border:`2px solid ${palette.text}20`,borderRadius:14,
              appearance:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
            {householdSetup&&feeCardEntries.some(e=>e.owner==="p2")?(
              <>
                <optgroup label="Your Cards">
                  {feeCardEntries.filter(e=>e.owner==="p1").map(e=>
                    <option key={e.key} value={e.key}>{e.card.short||e.card.name} — ${e.card.fee}/yr</option>
                  )}
                </optgroup>
                <optgroup label={(p2Name||"Partner")+"'s Cards"}>
                  {feeCardEntries.filter(e=>e.owner==="p2").map(e=>
                    <option key={e.key} value={e.key}>{e.card.short||e.card.name} — ${e.card.fee}/yr</option>
                  )}
                </optgroup>
              </>
            ):(
              feeCardEntries.map(e=><option key={e.key} value={e.key}>{e.card.short||e.card.name} — ${e.card.fee}/yr</option>)
            )}
          </select>
          <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
            <Icon name="chevron-right" size={16} color="var(--tx3)" style={{transform:"rotate(90deg)"}}/>
          </div>
        </div>
      </div>

      {/* ── CARD HEADER ── */}
      <div className="surf fu ra-header" style={{marginBottom:16,borderLeft:`4px solid ${palette.text}`,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <CreditCardDisplay card={card} size="sm"/>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:700,color:palette.text}}>{card.short||card.name}</span>
              {householdSetup&&<span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:99,background:selectedOwner==="p2"?"rgba(154,110,26,.1)":"rgba(13,115,119,.1)",color:selectedOwner==="p2"?"var(--gold)":"var(--acc)",letterSpacing:.3,textTransform:"uppercase",whiteSpace:"nowrap"}}>{selectedOwner==="p2"?(p2Name||"Partner"):"You"}</span>}
            </div>
            <div style={{fontSize:12,color:"var(--tx3)"}}>{card.issuer} · {card.network}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <div style={{flex:1,minWidth:80,padding:"8px 10px",borderRadius:10,background:"var(--s3)",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Annual Fee</div>
            <div style={{fontSize:18,fontWeight:800,color:"var(--tx)"}}>${card.fee}</div>
          </div>
          <div style={{flex:1,minWidth:80,padding:"8px 10px",borderRadius:10,background:"var(--s3)",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Total Credits</div>
            <div style={{fontSize:18,fontWeight:800,color:"var(--grn2)"}}>${totalCredits.toLocaleString()}</div>
          </div>
          <div style={{flex:1,minWidth:80,padding:"8px 10px",borderRadius:10,background:totalCredits-card.fee>=0?"rgba(22,163,74,.06)":"rgba(220,38,38,.06)",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Net Value</div>
            <div style={{fontSize:18,fontWeight:800,color:totalCredits-card.fee>=0?"var(--grn2)":"var(--red2)"}}>{totalCredits-card.fee>=0?"+":""}${(totalCredits-card.fee).toLocaleString()}</div>
          </div>
        </div>
        {renewDays!=null?(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:"var(--s3)"}}>
            <Icon name="calendar" size={16} color={renewDays<=60?"var(--red2)":renewDays<=120?"var(--acc)":"var(--tx3)"}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:renewDays<=60?"var(--red2)":renewDays<=120?"var(--acc)":"var(--tx2)"}}>
                {renewDays<=0?"Renewal due now":renewDays===1?"Renews tomorrow":`Renews in ${renewDays} days`}
              </div>
            </div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:"'Source Code Pro',monospace",color:renewDays<=60?"var(--red2)":"var(--tx)"}}>{renewDays}d</div>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:"rgba(13,115,119,.06)",border:"1px solid rgba(13,115,119,.15)"}}>
            <Icon name="calendar" size={16} color="var(--acc)"/>
            <div style={{flex:1,fontSize:12,fontWeight:600,color:"var(--acc)"}}>Set your anniversary month for an accurate countdown</div>
            <select value={anniversaryDates[card.id]||""} onChange={e=>{
              const v=e.target.value;
              if(setAnniversaryDates) setAnniversaryDates(prev=>{
                const next={...prev};
                if(v) next[card.id]=parseInt(v);
                else delete next[card.id];
                return next;
              });
            }} className="ra-selector" style={{minWidth:80,padding:"5px 8px",borderRadius:8,border:"1px solid rgba(13,115,119,.3)",
              background:"var(--bg)",fontSize:11,fontWeight:600,color:"var(--tx)",cursor:"pointer"}}>
              <option value="">Month</option>
              {MONTH_NAMES.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── FIRST YEAR TOGGLE ── */}
      {card&&card.fee>0&&(
        <div style={{marginBottom:16,padding:"14px 16px",borderRadius:12,
          background:isFirstYear?"rgba(212,168,64,.05)":"rgba(13,115,119,.03)",
          border:isFirstYear?"1px solid rgba(212,168,64,.18)":"1px solid rgba(13,115,119,.1)"}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--tx2)",marginBottom:10}}>Is this your first year with this card?</div>
          <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"1.5px solid "+(isFirstYear?"var(--gold)":"var(--acc)"),background:"var(--bg)"}}>
            <button onClick={()=>{
              if(setFirstYearCards) setFirstYearCards(prev=>{const s=new Set(prev);s.add(card.id);return [...s];});
            }} style={{flex:1,padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer",border:"none",transition:"all .2s",
              background:isFirstYear?"var(--gold)":"transparent",
              color:isFirstYear?"#fff":"var(--tx3)"}}>
              First Year
            </button>
            <button onClick={()=>{
              if(setFirstYearCards) setFirstYearCards(prev=>{const s=new Set(prev);s.delete(card.id);return [...s];});
            }} style={{flex:1,padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer",border:"none",borderLeft:"1.5px solid "+(isFirstYear?"var(--gold)":"var(--acc)"),transition:"all .2s",
              background:isFirstYear?"transparent":"var(--acc)",
              color:isFirstYear?"var(--tx3)":"#fff"}}>
              Renewal Year
            </button>
          </div>
          <div style={{fontSize:11,color:"var(--tx3)",marginTop:8,lineHeight:1.4}}>
            {isFirstYear
              ?(allBenefits.some(b=>b.requiresRenewal)
                ?"First year — renewal-only benefits (free nights, anniversary bonuses) are excluded from your ROI."
                :"First year — some issuers waive the fee in year one. Your ROI may differ from renewal years.")
              :(allBenefits.some(b=>b.requiresRenewal)
                ?"All benefits including renewal-only perks are counted in your ROI."
                :"Showing renewal-year ROI with full annual fee.")}
          </div>
        </div>
      )}

      {/* ── ROI PROGRESS + VERDICT ── */}
      <div className="surf fu" style={{marginBottom:16,border:`1px solid ${vc.border}`,background:vc.bg}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:totalCredits>0?10:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Icon name={vc.icon} size={18} color={vc.color}/>
            <span style={{fontSize:16,fontWeight:800,color:vc.color,fontFamily:"'Inter',sans-serif"}}>{vc.label}</span>
          </div>
          {totalCredits>0&&<span style={{fontSize:16,fontWeight:800,fontFamily:"'Source Code Pro',monospace",color:vc.color}}>{usedRoiPct}% ROI</span>}
        </div>
        {totalCredits>0&&(
          <>
            <div style={{fontSize:12,color:"var(--tx2)",marginBottom:8}}>
              ${ usedValue.toLocaleString()} used of ${ totalCredits.toLocaleString()} in benefits you'd consider
            </div>
            <div className="prog-track" style={{height:10,marginBottom:8,position:"relative",overflow:"hidden"}}>
              <div className="prog-fill" style={{position:"absolute",top:0,left:0,height:"100%",width:Math.min((usedValue/totalCredits)*100,100)+"%",background:vc.color,borderRadius:"inherit",transition:"width .5s ease"}}/>
            </div>
          </>
        )}
        <p style={{fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.5}}>{vc.desc}</p>
      </div>

      {/* ── TRANSFER PARTNER VALUE NOTE ── */}
      {card.partners&&card.partners.length>0&&(
        <div style={{marginBottom:16,padding:"12px 14px",borderRadius:12,background:"rgba(13,115,119,.05)",border:"1px solid rgba(13,115,119,.12)"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <span style={{fontSize:16,lineHeight:1,flexShrink:0,marginTop:1}}>💡</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"var(--acc)",marginBottom:4}}>Transfer Partners Add Hidden Value</div>
              <p style={{fontSize:11,color:"var(--tx2)",margin:0,lineHeight:1.6}}>
                {card.cur} transfer to {card.partners.slice(0,3).join(", ")}{card.partners.length>3?`, and ${card.partners.length-3} more`:""} — often worth 2-5x cash value for flights and hotel stays. If you transfer points to partners, the real ROI is likely much higher than shown above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── BENEFIT TRACKER ── */}
      <div className="surf fu" style={{marginBottom:16}}>
        <button onClick={()=>setShowBenefits(!showBenefits)}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
          <div style={{width:40,height:40,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Icon name="check-circle" size={20} color="var(--acc)"/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Benefit Tracker</div>
            <div style={{fontSize:11,color:"var(--tx3)"}}>{checkedCount}/{totalSlots} checked · ${usedValue.toLocaleString()} of ${totalCredits.toLocaleString()} captured{skippedBens.length>0?` · ${skippedBens.length} skipped`:""}</div>
          </div>
          <span style={{transition:"transform .2s",transform:showBenefits?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
        </button>
        {showBenefits&&(
        <div className="benefit-item" style={{borderLeftColor:palette.text,padding:"0 14px",marginTop:16}}>
          {/* Credits with checkboxes */}
          {creditBens.map((b,i)=>{
            const blocked=isRenewalBlocked(b);
            const pk=periodKeys(card.id,b,b.isMonthly);
            const isMulti=!!pk;
            const done=!blocked&&(isMulti?pk.every(p=>checkedSet.has(p.key)):checkedSet.has(b.key));
            const isOpen=openBen===b.key;
            const bc=BCAT[b.cat]||BCAT.statement;
            const rl=RESET_LABELS[b.reset];
            const wasReset=resetBadges.has(b.key);
            const periodLabel=b.reset==="quarterly"?"quarter":b.reset==="semi-annual"?"6 months":b.isMonthly?"month":"year";
            if(blocked) return (
              <div key={b.key} style={{borderBottom:i<creditBens.length-1?"1px solid var(--br)":"none",padding:"10px 0",opacity:0.45}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:22,height:22,borderRadius:6,border:"2px dashed var(--br2)",flexShrink:0,marginTop:2}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600,color:"var(--tx3)"}}>{b.n}</span>
                      <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,color:bc.color,background:bc.bg,opacity:0.6}}><Icon name={BCAT_ICON_MAP[b.cat]||"credit-card"} size={10} color={bc.color}/> {bc.label}</span>
                    </div>
                    {b.v&&<div style={{fontSize:11,color:"var(--tx3)"}}>Worth ${b.isMonthly?b.v+"/mo":""+b.v+"/yr"} — not counted in year-1 ROI</div>}
                    <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,padding:"2px 8px",borderRadius:99,background:"rgba(212,168,64,.1)",border:"1px solid rgba(212,168,64,.2)"}}>
                      <span style={{fontSize:10}}>🔒</span>
                      <span style={{fontSize:10,fontWeight:600,color:"var(--gold)"}}>Available after your first renewal</span>
                    </div>
                  </div>
                </div>
              </div>
            );
            return (
              <div key={b.key} onClick={()=>toggleExpand(b.key)}
                role="button" tabIndex={0}
                onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&toggleExpand(b.key)}
                style={{borderBottom:i<creditBens.length-1?"1px solid var(--br)":"none",padding:"10px 0",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  {!isMulti&&(
                    <button className={"ben-check"+(done?" done":"")} onClick={e=>toggle(b.key,e)} style={{marginTop:2}}>
                      {done&&<Icon name="check" size={13} color="var(--bg)"/>}
                    </button>
                  )}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600,color:done?"var(--tx3)":"var(--tx)",textDecoration:done?"line-through":"none"}}>{b.n}</span>
                      <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,color:bc.color,background:bc.bg}}><Icon name={BCAT_ICON_MAP[b.cat]||"credit-card"} size={10} color={bc.color}/> {bc.label}</span>
                      {rl&&<span style={{padding:"1px 6px",borderRadius:99,fontSize:10,background:"rgba(148,163,184,.15)",color:"var(--tx3)",fontWeight:600}}>{rl}</span>}
                      {wasReset&&<span style={{padding:"1px 7px",borderRadius:99,fontSize:10,background:"rgba(212,168,64,.18)",color:"var(--gld3)",fontWeight:700}}>↺ Refreshed</span>}
                    </div>
                    {isMulti&&(
                      <div style={{display:"flex",alignItems:"center",gap:pk.length>2?8:14,marginTop:6,marginBottom:4}}>
                        {pk.map(p=>{
                          const pd=checkedSet.has(p.key);
                          return (
                            <div key={p.key} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:p.past&&!pd?0.45:1}}>
                              <button className={"ben-check"+(pd?" done":"")}
                                onClick={e=>toggle(p.key,e)}
                                style={{width:22,height:22,borderRadius:6,border:p.current&&!pd?"2px solid var(--acc)":"",boxShadow:p.current?"0 0 0 2px rgba(13,115,119,.2)":"none"}}>
                                {pd&&<Icon name="check" size={11} color="var(--bg)"/>}
                              </button>
                              <span style={{fontSize:10,fontWeight:p.current?700:500,color:p.current?"var(--acc)":"var(--tx3)"}}>{p.label}</span>
                              {p.sub&&<span style={{fontSize:8,color:"var(--tx4)"}}>{p.sub}</span>}
                            </div>
                          );
                        })}
                        <div style={{fontSize:12,fontWeight:700,color:"var(--grn2)",marginLeft:4}}>${b.v}<span style={{fontSize:10,fontWeight:500,color:"var(--tx3)"}}> / {periodLabel}</span></div>
                      </div>
                    )}
                    {!isMulti&&b.v&&<div style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Up to ${b.isMonthly?b.v+"/mo ($"+b.v*12+"/yr)":b.v+(b.reset==="annual"?"/yr":"")}</div>}
                  </div>
                  <button onClick={e=>toggleSkip(b.key,e)} title="Skip — won't count toward your potential"
                    style={{flexShrink:0,background:"none",border:"1px solid var(--br2)",borderRadius:6,cursor:"pointer",padding:"3px 6px",marginTop:2,opacity:0.5,transition:"opacity .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>
                    <Icon name="x" size={12} color="var(--tx3)"/>
                  </button>
                  <span style={{flexShrink:0,transition:"transform .15s",display:"inline-flex",transform:isOpen?"rotate(90deg)":"rotate(0deg)",marginTop:4}}><Icon name="chevron-right" size={14} color="var(--tx3)"/></span>
                </div>
                {isOpen&&(
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--br)"}}>
                    {b.d&&<p style={{fontSize:12,color:"var(--tx2)",margin:"0 0 8px",lineHeight:1.6}}>{b.d}</p>}
                    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
                      {b.v&&<span style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Value: ${b.v}/{periodLabel} (${annualBenValue(b)}/yr)</span>}
                      {rl&&<span style={{fontSize:11,color:"var(--tx3)"}}>↺ Resets: {rl}</span>}
                      {b.enroll&&<span style={{fontSize:11,color:"var(--gld3)",fontWeight:600,display:"inline-flex",alignItems:"center",gap:3}}><Icon name="bolt" size={11} color="var(--gld3)"/> Activation required</span>}
                    </div>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {b.enrollUrl&&<a href={b.enrollUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:12,color:"var(--acc)",fontWeight:600,textDecoration:"none"}}>Activate →</a>}
                      {b.useUrl&&<a href={b.useUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:12,color:"var(--acc)",fontWeight:600,textDecoration:"none"}}>Use benefit →</a>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Perks (read-only) */}
          {perkBens.length>0&&(
            <>
              {creditBens.length>0&&(
                <div style={{borderTop:"1px solid var(--br)",margin:"6px 0",paddingTop:10}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:"#9ca3af",textTransform:"uppercase",marginBottom:6}}>INCLUDED PROTECTIONS & PERKS</div>
                </div>
              )}
              {perkBens.map((b,i)=>{
                const isOpen=openBen===b.key;
                const blocked=isRenewalBlocked(b);
                return (
                  <div key={b.key} onClick={blocked?undefined:()=>toggleExpand(b.key)}
                    style={{borderBottom:i<perkBens.length-1?"1px solid var(--br)":"none",padding:"8px 0",cursor:blocked?"default":"pointer",opacity:blocked?0.45:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d7377" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                        <path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z"/><path d="M9 12l2 2 4-4"/>
                      </svg>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:12,fontWeight:500,color:"#6b7280"}}>{b.n}</span>
                        {b.v&&!blocked&&<span style={{fontSize:10,color:"#9ca3af",marginLeft:6}}>up to ${b.v.toLocaleString()}</span>}
                        {blocked&&<div style={{display:"inline-flex",alignItems:"center",gap:4,marginLeft:6,padding:"1px 6px",borderRadius:99,background:"rgba(212,168,64,.1)",border:"1px solid rgba(212,168,64,.2)"}}>
                          <span style={{fontSize:9}}>🔒</span>
                          <span style={{fontSize:9,fontWeight:600,color:"var(--gold)"}}>After renewal</span>
                        </div>}
                      </div>
                      {!blocked&&<span style={{flexShrink:0,transition:"transform .15s",display:"inline-flex",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={12} color="#9ca3af"/></span>}
                    </div>
                    {isOpen&&!blocked&&(
                      <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--br)",marginLeft:26}}>
                        {b.d&&<p style={{fontSize:11,color:"#9ca3af",margin:0,lineHeight:1.5}}>{b.d}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Skipped benefits */}
          {skippedBens.length>0&&(
            <>
              <div style={{borderTop:"1px solid var(--br)",margin:"6px 0",paddingTop:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:"#9ca3af",textTransform:"uppercase"}}>SKIPPED ({skippedBens.length})</div>
                  <div style={{fontSize:10,color:"#9ca3af",fontStyle:"italic"}}>Not counted toward your potential</div>
                </div>
              </div>
              {skippedBens.map((b,i)=>(
                <div key={b.key} style={{borderBottom:i<skippedBens.length-1?"1px solid var(--br)":"none",padding:"8px 0",opacity:0.45}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <span style={{fontSize:12,fontWeight:500,color:"var(--tx)",textDecoration:"line-through"}}>{b.n}</span>
                      {b.v&&<span style={{fontSize:10,color:"var(--tx3)",marginLeft:6}}>${annualBenValue(b)}/yr</span>}
                    </div>
                    <button onClick={e=>toggleSkip(b.key,e)} title="Restore this benefit"
                      style={{flexShrink:0,background:"rgba(13,115,119,.06)",border:"1px solid rgba(13,115,119,.15)",borderRadius:6,cursor:"pointer",padding:"3px 8px",display:"flex",alignItems:"center",gap:4}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      <span style={{fontSize:10,fontWeight:600,color:"var(--acc)"}}>Restore</span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        )}
      </div>

      {/* ── BEYOND THE NUMBERS — HIDDEN VALUE ── */}
      {card.hiddenValue&&(
        <div className="surf fu" style={{marginBottom:16}}>
          <button onClick={()=>{setShowHiddenValue(!showHiddenValue);setExpandedHiddenPerk(null);}}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="star" size={20} color="var(--acc)"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Beyond the Numbers</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>Transfer partners, insurance, status perks & more</div>
            </div>
            <span style={{transition:"transform .2s",transform:showHiddenValue?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
          </button>
          {showHiddenValue&&(
            <div style={{marginTop:16}}>
              {/* Intangible note */}
              <p style={{fontSize:13,color:"var(--tx2)",margin:"0 0 16px",lineHeight:1.7,fontStyle:"italic"}}>{card.hiddenValue.intangibleNote}</p>

              {/* Transfer Partner mini-card */}
              {card.hiddenValue.transferEcosystem&&TRANSFER_PARTNER_DATA[card.hiddenValue.transferEcosystem]&&(()=>{
                const eco=TRANSFER_PARTNER_DATA[card.hiddenValue.transferEcosystem];
                const multiplier=(eco.transferValue/eco.cashValue).toFixed(1);
                return (
                  <div style={{padding:"12px 14px",borderRadius:12,background:"rgba(13,115,119,.06)",border:"1px solid rgba(13,115,119,.15)",marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <span style={{fontSize:14}}>🔄</span>
                      <div style={{fontSize:12,fontWeight:700,color:"var(--acc)"}}>Transfer Partner Value</div>
                    </div>
                    <p style={{fontSize:12,color:"var(--tx2)",margin:"0 0 10px",lineHeight:1.6}}>
                      Your {card.hiddenValue.transferEcosystem} points are worth <strong>{eco.cashValue}¢ as cash</strong>, but <strong style={{color:"var(--acc)"}}>{eco.transferValue}¢ via transfer partners</strong> — a <strong style={{color:"var(--grn2)"}}>{multiplier}x uplift</strong>.
                    </p>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {eco.topPartners.slice(0,4).map((tp,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:11}}>
                          <span style={{width:6,height:6,borderRadius:99,background:"var(--acc)",flexShrink:0}}/>
                          <span style={{fontWeight:600,color:"var(--tx)",minWidth:90}}>{tp.name}</span>
                          <span style={{color:"var(--grn2)",fontWeight:700,fontFamily:"'Source Code Pro',monospace",minWidth:55}}>{tp.cpp}</span>
                          <span style={{color:"var(--tx3)",fontStyle:"italic"}}>{tp.sweetSpot}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Hidden perks grouped by category */}
              {(()=>{
                const grouped={};
                (card.hiddenValue.hiddenPerks||[]).forEach(p=>{
                  if(!grouped[p.category])grouped[p.category]=[];
                  grouped[p.category].push(p);
                });
                return Object.entries(grouped).map(([catKey,perks])=>{
                  const cat=HIDDEN_VALUE_CATEGORIES[catKey]||{label:catKey,icon:"📋"};
                  return (
                    <div key={catKey} style={{marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <span style={{fontSize:13}}>{cat.icon}</span>
                        <span style={{fontSize:11,fontWeight:700,letterSpacing:.5,color:"var(--tx2)",textTransform:"uppercase"}}>{cat.label}</span>
                      </div>
                      {perks.map((p,j)=>{
                        const perkKey=catKey+"-"+j;
                        const isExpanded=expandedHiddenPerk===perkKey;
                        return (
                          <div key={j} onClick={()=>setExpandedHiddenPerk(isExpanded?null:perkKey)}
                            style={{padding:"8px 10px",borderRadius:8,background:"var(--bg)",border:"1px solid var(--br)",marginBottom:4,cursor:"pointer"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{flex:1,fontSize:12,fontWeight:600,color:"var(--tx)"}}>{p.perk}</div>
                              <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(13,115,119,.08)",color:"var(--acc)",whiteSpace:"nowrap",fontFamily:"'Source Code Pro',monospace"}}>{p.estimatedValue}</span>
                              <span style={{transition:"transform .15s",transform:isExpanded?"rotate(90deg)":"rotate(0deg)",display:"inline-flex"}}><Icon name="chevron-right" size={12} color="var(--tx3)"/></span>
                            </div>
                            {isExpanded&&<p style={{fontSize:11,color:"var(--tx2)",margin:"6px 0 0",lineHeight:1.6}}>{p.details}</p>}
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}

              {/* Universal hidden values */}
              <div style={{marginTop:8,paddingTop:12,borderTop:"1px solid var(--br)"}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:"var(--tx3)",textTransform:"uppercase",marginBottom:8}}>Also Consider</div>
                {UNIVERSAL_HIDDEN_VALUES.filter(u=>
                  u.applies==="All cards"||(u.applies.includes("ecosystem")&&card.hiddenValue.transferEcosystem)||(u.applies.includes("annual fees")&&card.fee>0)||(u.applies.includes("Visa Signature")||u.applies.includes("Mastercard")||u.applies.includes("Amex"))
                ).slice(0,3).map((u,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
                    <span style={{fontSize:10,color:"var(--acc)",marginTop:2,flexShrink:0}}>▸</span>
                    <div>
                      <span style={{fontSize:11,fontWeight:600,color:"var(--tx)"}}>{u.title}: </span>
                      <span style={{fontSize:11,color:"var(--tx3)"}}>{u.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RETENTION OFFER SECTION ── */}
      {retentionOffers.length>0&&(
        <div className="surf fu" style={{marginBottom:16}}>
          <button onClick={()=>setShowRetention(!showRetention)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="phone" size={20} color="var(--acc)"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Retention Offers</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>Call before you cancel — most people get an offer</div>
            </div>
            <span style={{transition:"transform .2s",transform:showRetention?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
          </button>
          {showRetention&&(
            <div style={{marginTop:16}}>
              {issuerPhone&&(
                <a href={"tel:"+issuerPhone.replace(/[^0-9]/g,"")} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,background:palette.tint,border:`1px solid ${palette.text}15`,textDecoration:"none",marginBottom:14}}>
                  <Icon name="phone" size={18} color={palette.text}/>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:palette.text}}>{issuerPhone}</div>
                    <div style={{fontSize:11,color:"var(--tx3)"}}>{card.issuer} Retention Line</div>
                  </div>
                </a>
              )}
              <div style={{fontSize:11,fontWeight:700,letterSpacing:.8,color:"var(--tx3)",textTransform:"uppercase",marginBottom:8}}>Typical offers reported</div>
              {retentionOffers.map((offer,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                  <div style={{width:6,height:6,borderRadius:99,background:"var(--acc)",marginTop:5,flexShrink:0}}/>
                  <span style={{fontSize:13,color:"var(--tx2)"}}>{offer}</span>
                </div>
              ))}
              <div style={{marginTop:14,padding:"12px 14px",borderRadius:10,background:"var(--s3)",border:"1px solid var(--br)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--tx)",marginBottom:6}}>What to say:</div>
                <p style={{fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.6,fontStyle:"italic"}}>
                  "Hi, I'm considering canceling my {card.short||card.name} because I'm not sure the ${card.fee} annual fee is worth it for me. Are there any retention offers or annual fee credits available on my account?"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IF YOU CANCEL ── */}
      <div className="surf fu" style={{marginBottom:16}}>
        <button onClick={()=>setShowCancel(!showCancel)}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
          <div style={{width:40,height:40,borderRadius:10,background:"rgba(220,38,38,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Icon name="alert-triangle" size={20} color="var(--red2)"/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>If You Cancel</div>
            <div style={{fontSize:11,color:"var(--tx3)"}}>What you'll lose and what happens to your points</div>
          </div>
          <span style={{transition:"transform .2s",transform:showCancel?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
        </button>
        {showCancel&&(
          <div style={{marginTop:16}}>
            {/* Lost benefits with coverage overlap detection */}
            <div style={{fontSize:11,fontWeight:700,letterSpacing:.8,color:"var(--tx3)",textTransform:"uppercase",marginBottom:8}}>Benefits you'll lose</div>
            <div style={{marginBottom:14}}>
              {allBenefits.filter(b=>!skippedSet.has(b.key)).map((b,i)=>{
                const cov=findCoverage(b);
                const hasCoverage=cov&&cov.matches.length>0;
                return (
                  <div key={i} style={{marginBottom:hasCoverage?10:6}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                      <Icon name="x" size={12} color="var(--red2)" style={{marginTop:2,flexShrink:0}}/>
                      <span style={{fontSize:12,color:"var(--tx2)"}}>{b.n}{b.v?" ($"+annualBenValue(b)+"/yr)":""}</span>
                    </div>
                    {cov&&hasCoverage?(
                      <div style={{marginLeft:20,marginTop:3}}>
                        {cov.matches.slice(0,2).map((m,j)=>{
                          let note="";
                          if(m.myDetail&&m.theirDetail&&m.myDetail!==m.theirDetail) note=" ("+m.theirDetail+" vs. your "+m.myDetail+")";
                          return (
                            <div key={j} style={{fontSize:11,color:"var(--grn2)",fontWeight:600,lineHeight:1.6}}>
                              ✅ Still covered — your {m.card.short||m.card.name} also has this{note}
                            </div>
                          );
                        })}
                        {cov.matches.length>2&&<div style={{fontSize:10,color:"var(--tx3)",marginTop:1}}>+{cov.matches.length-2} more card{cov.matches.length-2>1?"s":""}</div>}
                      </div>
                    ):cov&&!hasCoverage?(
                      <div style={{marginLeft:20,marginTop:3,fontSize:11,color:"var(--red2)",fontWeight:600,lineHeight:1.6}}>
                        ⚠️ No other card in your wallet covers this
                      </div>
                    ):null}
                  </div>
                );
              })}
            </div>

            {/* Transfer partners — cross-referenced with wallet */}
            {card.partners&&card.partners.length>0&&(()=>{
              // For each partner, check if any other wallet card also has that partner
              const partnerCoverage=card.partners.map(p=>{
                const coveringCards=otherWalletCards.filter(oc=>oc.partners&&oc.partners.some(op=>op.toLowerCase().includes(p.toLowerCase().split(" ")[0])||p.toLowerCase().includes(op.toLowerCase().split(" ")[0])));
                return {partner:p,covered:coveringCards};
              });
              const coveredCount=partnerCoverage.filter(pc=>pc.covered.length>0).length;
              return (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:.8,color:"var(--tx3)",textTransform:"uppercase",marginBottom:8}}>Transfer partners lost</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {partnerCoverage.map(pc=>(
                      <div key={pc.partner} style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:11,padding:"3px 10px",borderRadius:99,
                          background:pc.covered.length>0?"rgba(22,163,74,.06)":"rgba(220,38,38,.06)",
                          color:pc.covered.length>0?"var(--grn2)":"var(--red2)",
                          fontWeight:600,border:pc.covered.length>0?"1px solid rgba(22,163,74,.12)":"1px solid rgba(220,38,38,.12)"}}>
                          {pc.covered.length>0?"✓":"✗"} {pc.partner}
                        </span>
                        {pc.covered.length>0&&<span style={{fontSize:10,color:"var(--grn2)",fontWeight:500}}>via {pc.covered[0].short||pc.covered[0].name}</span>}
                      </div>
                    ))}
                  </div>
                  {coveredCount>0&&coveredCount===card.partners.length&&(
                    <div style={{marginTop:8,fontSize:11,color:"var(--grn2)",fontWeight:600}}>✅ All transfer partners still accessible through other cards</div>
                  )}
                  {coveredCount>0&&coveredCount<card.partners.length&&(
                    <div style={{marginTop:8,fontSize:11,color:"var(--tx2)",fontWeight:600}}>⚠️ {card.partners.length-coveredCount} partner{card.partners.length-coveredCount>1?"s":""} would become inaccessible</div>
                  )}
                </div>
              );
            })()}

            {/* Points on cancel */}
            {pointsInfo&&(
              <div style={{padding:"12px 14px",borderRadius:10,background:"rgba(13,115,119,.05)",border:"1px solid rgba(13,115,119,.15)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <Icon name="zap" size={14} color="var(--acc)"/>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>Your {card.cur||"Points"}</span>
                </div>
                <p style={{fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.6}}>{pointsInfo.pointsFate||""}</p>
                {pointsInfo.loseAccess&&pointsInfo.loseAccess.length>0&&(
                  <div style={{marginTop:8}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:"var(--red2)",textTransform:"uppercase",marginBottom:4}}>You lose access to</div>
                    {pointsInfo.loseAccess.map((item,j)=>(
                      <div key={j} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                        <Icon name="x" size={11} color="var(--red2)" style={{marginTop:2,flexShrink:0}}/>
                        <span style={{fontSize:11,color:"var(--tx2)"}}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Household point sharing context */}
            {householdSetup&&card&&card.cur&&POINT_SHARING_RULES[card.cur]&&(()=>{
              const rule=POINT_SHARING_RULES[card.cur];
              const eco=ECOSYSTEM_MAP[card.cur];
              const isUnlocker=eco&&eco.unlockers.some(u=>card.name===u);
              const p2Resolved=p2Cards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean);
              const partnerSameEco=p2Resolved.filter(c=>c.cur===card.cur);
              const partnerHasUnlocker=eco&&partnerSameEco.some(c=>eco.unlockers.includes(c.name));
              if(!partnerSameEco.length||!isUnlocker)return null;
              return (
                <div style={{marginTop:14,padding:"12px 14px",borderRadius:10,
                  background:rule.canShareHousehold?"rgba(22,163,74,.05)":"rgba(220,38,38,.05)",
                  border:rule.canShareHousehold?"1px solid rgba(22,163,74,.15)":"1px solid rgba(220,38,38,.15)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <Icon name="users" size={14} color={rule.canShareHousehold?"var(--grn2)":"var(--red2)"}/>
                    <span style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>Household Impact</span>
                  </div>
                  {rule.canShareHousehold&&partnerHasUnlocker?(
                    <p style={{fontSize:12,color:"var(--grn2)",margin:0,lineHeight:1.6,fontWeight:600}}>
                      ✅ {p2Name||"Your partner"}'s {partnerSameEco.find(c=>eco.unlockers.includes(c.name)).short||partnerSameEco.find(c=>eco.unlockers.includes(c.name)).name} can still unlock transfers for your {card.cur.split(" ")[0]} points — {card.cur.split(" ")[0]} allows household point {rule.method.toLowerCase().includes("combine")?"combining":"sharing"}.
                    </p>
                  ):rule.canShareHousehold&&!partnerHasUnlocker?(
                    <p style={{fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.6}}>
                      ⚠️ {p2Name||"Your partner"} has {partnerSameEco[0].short||partnerSameEco[0].name} but it doesn't unlock transfers. {card.cur.split(" ")[0]} allows household point sharing, but someone still needs a transfer-unlocking card ({eco.cheapestUnlocker}, ${eco.cheapestUnlockerFee}/yr).
                    </p>
                  ):(
                    <p style={{fontSize:12,color:"var(--red2)",margin:0,lineHeight:1.6,fontWeight:600}}>
                      ⚠️ {p2Name||"Your partner"}'s {partnerSameEco[0].short||partnerSameEco[0].name} won't help — {card.cur.split(" ")[0]} doesn't allow point transfers between household members. {rule.implication}
                    </p>
                  )}
                  {rule.warning&&(
                    <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:"rgba(212,168,64,.08)",border:"1px solid rgba(212,168,64,.2)"}}>
                      <p style={{fontSize:11,color:"var(--gold)",margin:0,lineHeight:1.5,fontWeight:600}}>⚠️ {rule.warning}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── DOWNGRADE PATHS ── */}
      {downgrades.length>0&&(
        <div className="surf fu" style={{marginBottom:16}}>
          <button onClick={()=>setShowDowngrades(!showDowngrades)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="arrow-down" size={20} color="var(--acc)"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Downgrade Options</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>{downgrades.length} product change{downgrades.length>1?"s":""} available · No hard pull</div>
            </div>
            <span style={{transition:"transform .2s",transform:showDowngrades?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
          </button>
          {showDowngrades&&(
          <div style={{marginTop:16}}>
          {downgrades.map((dg,i)=>{
            const dgCard=dg.affiliateKey?CARDS.find(c=>c.id===dg.affiliateKey):null;
            const applyUrl=dg.affiliateKey&&APPLY_URLS[dg.affiliateKey]&&!APPLY_URLS[dg.affiliateKey].startsWith("#")?APPLY_URLS[dg.affiliateKey]:null;
            return (
              <div key={i} className="surf fu" style={{marginBottom:10,borderLeft:`3px solid ${palette.text}40`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  {dgCard&&<div style={{width:36,height:22,borderRadius:5,background:`linear-gradient(135deg,${dgCard.c1},${dgCard.c2})`,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.12)"}}/>}
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>{dg.cardName}</div>
                    <div style={{fontSize:11,color:"var(--tx3)"}}>{dg.annualFee===0?"No annual fee":"$"+dg.annualFee+"/yr"} · Product change (no hard pull)</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:"var(--grn2)",textTransform:"uppercase",marginBottom:4}}>You keep</div>
                    <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                      <Icon name="check" size={11} color="var(--grn2)" style={{marginTop:2,flexShrink:0}}/>
                      <span style={{fontSize:11,color:"var(--tx2)"}}>{dg.whatYouKeep}</span>
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:"var(--red2)",textTransform:"uppercase",marginBottom:4}}>You lose</div>
                    <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                      <Icon name="x" size={11} color="var(--red2)" style={{marginTop:2,flexShrink:0}}/>
                      <span style={{fontSize:11,color:"var(--tx2)"}}>{dg.whatYouLose}</span>
                    </div>
                  </div>
                </div>
                {dg.note&&(
                  <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(13,115,119,.05)",border:"1px solid rgba(13,115,119,.10)",marginBottom:8}}>
                    <p style={{fontSize:11,color:"var(--acc)",margin:0,fontWeight:600,lineHeight:1.5}}>💡 {dg.note}</p>
                  </div>
                )}
                {applyUrl&&(
                  <div>
                    <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                      style={{display:"block",textAlign:"center",padding:"10px",borderRadius:10,textDecoration:"none",
                        background:palette.tint,color:palette.text,fontSize:12,fontWeight:700,border:`1px solid ${palette.text}20`}}>
                      View {dg.cardName} Details →
                    </a>
                    <div className="apply-disclose" style={{textAlign:"center",marginTop:4}}>Affiliate link — we may earn a commission at no cost to you.</div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
          )}
        </div>
      )}

      {/* ── ALTERNATIVE POINTS PATHS ── */}
      {card&&TRANSFER_PATHS[card.cur]&&(()=>{
        const tp=TRANSFER_PATHS[card.cur];
        const allOwnedIds=new Set([...myCards,...p2Cards]);
        // Sort sources: owned-first, then by ratio quality
        const enriched=tp.sources.map(src=>({...src,ownedCards:src.cards.filter(id=>allOwnedIds.has(id)),srcCards:src.cards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean)}));
        const owned=enriched.filter(s=>s.ownedCards.length>0);
        const couldGet=enriched.filter(s=>s.ownedCards.length===0);
        const totalPaths=enriched.length;
        const visibleOwned=owned;
        const visibleCouldGet=showAllPaths?couldGet:couldGet.slice(0,Math.max(0,3-owned.length));
        const hiddenCount=totalPaths-visibleOwned.length-visibleCouldGet.length;
        const ownedCount=owned.reduce((s,o)=>s+o.ownedCards.length,0);

        function renderPath(src){
          return (
            <div key={src.currency} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:"var(--s3)",border:"1px solid var(--br)"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>{src.currency}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:99,
                    background:src.ratio==="1:1"?"rgba(22,163,74,.08)":"rgba(13,115,119,.08)",
                    color:src.ratio==="1:1"?"var(--grn2)":"var(--acc)",letterSpacing:.3}}>{src.ratio}</span>
                </div>
                {src.note&&<div style={{fontSize:10,color:"var(--tx3)",marginTop:2,fontStyle:"italic"}}>{src.note}</div>}
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>
                  {src.srcCards.map(sc=>{
                    const isOwned=allOwnedIds.has(sc.id);
                    return <span key={sc.id} style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:99,
                      background:isOwned?"rgba(22,163,74,.08)":"var(--bg)",color:isOwned?"var(--grn2)":"var(--tx3)",
                      border:isOwned?"1px solid rgba(22,163,74,.2)":"1px solid var(--br2)"}}>{isOwned?"✓ ":""}{sc.short||sc.name}</span>;
                  })}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="surf fu" style={{marginBottom:16}}>
            <button onClick={()=>{setShowPaths(!showPaths);if(showPaths)setShowAllPaths(false);}}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
              <div style={{width:40,height:40,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="refresh" size={20} color="var(--acc)"/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Alternative Points Paths</div>
                <div style={{fontSize:11,color:"var(--tx3)"}}>{ownedCount>0?ownedCount+" path"+(ownedCount>1?"s":"")+" already in your wallet":totalPaths+" transfer path"+(totalPaths>1?"s":"")+" available"}</div>
              </div>
              <span style={{transition:"transform .2s",transform:showPaths?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
            </button>
            {showPaths&&(
            <div style={{marginTop:16}}>
              <div style={{fontSize:12,color:"var(--tx2)",lineHeight:1.6,marginBottom:12}}>
                You can still earn <strong>{tp.program}</strong> points through these transfer partners{ownedCount>0?"":" if you pick up a flexible-points card"}.
              </div>
              {visibleOwned.length>0&&(
                <div style={{marginBottom:visibleCouldGet.length>0?10:0}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:"var(--grn2)",textTransform:"uppercase",marginBottom:6}}>✅ You already have</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {visibleOwned.map(renderPath)}
                  </div>
                </div>
              )}
              {visibleCouldGet.length>0&&(
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:"var(--tx3)",textTransform:"uppercase",marginBottom:6,marginTop:visibleOwned.length>0?10:0}}>Could get</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {visibleCouldGet.map(renderPath)}
                  </div>
                </div>
              )}
              {hiddenCount>0&&!showAllPaths&&(
                <button onClick={e=>{e.stopPropagation();setShowAllPaths(true);}}
                  style={{display:"block",margin:"10px auto 0",background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--acc)"}}>
                  Show all {totalPaths} paths →
                </button>
              )}
              <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(154,110,26,.06)",border:"1px solid rgba(154,110,26,.12)",marginTop:12}}>
                <p style={{fontSize:11,color:"var(--tx2)",margin:0,lineHeight:1.6}}>
                  <strong style={{color:"var(--gold)"}}>Trade-off:</strong> Co-branded cards earn at higher rates on brand spending and include perks like free nights and elite status credits.
                </p>
              </div>
            </div>
            )}
          </div>
        );
      })()}

      {/* ── RECOMMENDED REPLACEMENT ── */}
      {replacement&&verdict==="at-risk"&&(
        <div className="surf fu" style={{marginBottom:16}}>
          <button onClick={()=>setShowReplacement(!showReplacement)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:10,background:"rgba(22,163,74,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="arrow-up" size={20} color="var(--grn2)"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Recommended Replacement</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>{replacement.short||replacement.name} · +${replacement.net.toLocaleString()} net value</div>
            </div>
            <span style={{transition:"transform .2s",transform:showReplacement?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
          </button>
          {showReplacement&&(
          <div style={{marginTop:16}}>
            <div style={{borderLeft:`3px solid var(--grn2)`,borderRadius:10,padding:"14px",background:"var(--s3)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:42,height:26,borderRadius:6,background:`linear-gradient(135deg,${replacement.c1},${replacement.c2})`,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.12)"}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--tx)"}}>{replacement.short||replacement.name}</div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{replacement.issuer} · {replacement.fee===0?"No fee":"$"+replacement.fee+"/yr"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:"var(--grn2)"}}>+${replacement.net.toLocaleString()}</div>
                  <div style={{fontSize:9,color:"var(--tx3)",textTransform:"uppercase",fontWeight:600}}>Net value</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"rgba(22,163,74,.08)",color:"var(--grn2)",border:"1px solid rgba(22,163,74,.15)"}}>${replacement.credits.toLocaleString()} in credits</span>
                {replacement.earnBoost>0&&<span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"rgba(13,115,119,.08)",color:"var(--acc)",border:"1px solid rgba(13,115,119,.15)"}}>+{replacement.earnBoost}x earn boost</span>}
              </div>
              {replacement.signup&&replacement.signup!=="No signup bonus"&&replacement.signup!=="No sign-up bonus"&&(
                <div style={{fontSize:11,fontWeight:600,color:"var(--acc)",marginBottom:10}}>{replacement.signup}</div>
              )}
              {/* Why upgrade? comparison */}
              {(()=>{
                const bullets=[];
                const currentCredits=[...card.annual,...card.monthly].filter(b=>b.v!=null).reduce((s,b)=>s+annualBenValue(b),0);
                if(replacement.credits>currentCredits) bullets.push({text:"$"+replacement.credits.toLocaleString()+" in annual credits vs $"+currentCredits.toLocaleString()+" with your "+card.short,positive:true});
                const earnUps=[];const catLabelsMap={d:"dining",g:"groceries",gas:"gas",t:"travel",s:"streaming",a:"Amazon",tr:"rideshare",p:"pharmacy"};
                Object.keys(catLabelsMap).forEach(k=>{
                  const oldR=parseFloat(String((card.earn&&card.earn[k])||"0").replace(/[^0-9.]/g,""));
                  const newR=parseFloat(String((replacement.earn&&replacement.earn[k])||"0").replace(/[^0-9.]/g,""));
                  if(newR>oldR) earnUps.push(catLabelsMap[k]+" ("+newR+"x vs "+oldR+"x)");
                });
                if(earnUps.length>0) bullets.push({text:"Higher earn on "+earnUps.slice(0,3).join(", ")+(earnUps.length>3?" +more":""),positive:true});
                const replPartners=(replacement.partners||[]).length;const curPartners=(card.partners||[]).length;
                if(replPartners>0&&curPartners>0) bullets.push({text:replPartners===curPartners?"Same transfer partner access":"Access to "+replPartners+" transfer partners"+(curPartners>0?" (vs "+curPartners+")":""),positive:true});
                else if(replPartners>0&&curPartners===0) bullets.push({text:"Adds "+replPartners+" transfer partners",positive:true});
                const replBenNames=new Set([...replacement.annual,...replacement.monthly].filter(b=>b.v!=null).map(b=>b.n));
                const curBenNames=new Set([...card.annual,...card.monthly].filter(b=>b.v!=null).map(b=>b.n));
                const gained=[...replBenNames].filter(n=>!curBenNames.has(n)).slice(0,3);
                if(gained.length>0) bullets.push({text:"Adds: "+gained.join(", "),positive:true});
                const lost=[...curBenNames].filter(n=>!replBenNames.has(n)).slice(0,2);
                if(lost.length>0) bullets.push({text:"You\u2019d lose: "+lost.join(", "),positive:false});
                const feeDiff=replacement.fee-card.fee;
                if(feeDiff>0&&replacement.credits>card.fee+feeDiff) bullets.push({text:"Fee increases by $"+feeDiff+", but credits more than cover the difference",positive:true});
                else if(feeDiff>0) bullets.push({text:"Fee increases from $"+card.fee+" to $"+replacement.fee+" (+$"+feeDiff+")",positive:false});
                else if(feeDiff<0) bullets.push({text:"Fee drops from $"+card.fee+" to $"+replacement.fee+" (\u2212$"+Math.abs(feeDiff)+")",positive:true});
                return bullets.length>0?(
                  <div style={{marginBottom:12,padding:"10px 12px",borderRadius:8,background:"rgba(13,115,119,.03)",border:"1px solid rgba(13,115,119,.08)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--acc)",marginBottom:6}}>Why upgrade?</div>
                    {bullets.map((b,i)=><div key={i} style={{fontSize:11,lineHeight:1.5,color:b.positive?"var(--tx2)":"var(--tx3)",marginBottom:2}}>
                      <span style={{color:b.positive?"var(--acc)":"var(--red2)",marginRight:4}}>{b.positive?"+":"\u2212"}</span>{b.text}
                    </div>)}
                  </div>
                ):null;
              })()}
              {(()=>{
                const applyUrl=APPLY_URLS[replacement.id]&&!APPLY_URLS[replacement.id].startsWith("#")?APPLY_URLS[replacement.id]:null;
                return applyUrl?(
                  <div>
                    <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                      style={{display:"block",textAlign:"center",padding:"12px 20px",borderRadius:10,textDecoration:"none",
                        background:"linear-gradient(135deg,var(--acc),var(--gld2))",color:"#fff",
                        fontSize:13,fontWeight:700,boxShadow:"0 2px 8px rgba(13,115,119,.25)"}}>
                      Apply Now →
                    </a>
                    <div className="apply-disclose" style={{textAlign:"center",marginTop:6}}>Affiliate link — we may earn a commission at no cost to you.</div>
                  </div>
                ):null;
              })()}
            </div>
          </div>
          )}
        </div>
      )}

      {/* ── STRATEGY PLAYS (SYNERGIES) ── */}
      {(()=>{
        const synergies=card?CARD_SYNERGIES[card.name]:null;
        if(!synergies||!synergies.length)return null;
        const userCardNames=new Set(myCards.map(id=>{const c=CARDS.find(x=>x.id===id);return c?c.name:null;}).filter(Boolean));
        const p2CardNames=new Set((householdSetup?p2Cards:[]).map(id=>{const c=CARDS.find(x=>x.id===id);return c?c.name:null;}).filter(Boolean));
        const allHHCardNames=new Set([...userCardNames,...p2CardNames]);
        // Sort: owned pairs first (check entire household)
        const sorted=[...synergies].sort((a,b)=>{
          const aOwned=allHHCardNames.has(a.pairWith)?1:0;
          const bOwned=allHHCardNames.has(b.pairWith)?1:0;
          return bOwned-aOwned;
        });
        const isWorthIt=usedRoiPct>=100;
        // Ecosystem alert: check if user has earners but no unlocker
        const ecoAlerts=[];
        if(card.cur){
          Object.entries(ECOSYSTEM_MAP).forEach(([ecoName,eco])=>{
            const hasEarner=eco.earners.some(n=>allHHCardNames.has(n));
            const hasUnlocker=eco.unlockers.some(n=>allHHCardNames.has(n));
            if(hasEarner&&!hasUnlocker){
              ecoAlerts.push({ecoName,...eco});
            }
          });
        }
        const sectionContent=(
          <div style={{marginTop:12}}>
            {/* Ecosystem alert */}
            {ecoAlerts.map((ea,i)=>(
              <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(13,115,119,.06)",border:"1px solid rgba(13,115,119,.18)",marginBottom:12,display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:16,lineHeight:1,flexShrink:0}}>⚡</span>
                <p style={{fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.6}}>
                  You have <strong>{ea.ecoName}</strong> points but no card to unlock transfer partners. Adding <strong style={{color:"var(--acc)"}}>{ea.cheapestUnlocker}</strong> (${ea.cheapestUnlockerFee}/yr) would make those points worth <strong style={{color:"var(--grn2)"}}>{ea.valueUplift}</strong>.
                  {ea.warning&&<span style={{display:"block",marginTop:4,color:"var(--red2)",fontWeight:600,fontSize:11}}>{ea.warning}</span>}
                </p>
              </div>
            ))}
            {/* ROI < 100% callout */}
            {!isWorthIt&&(
              <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(13,115,119,.05)",border:"1px solid rgba(13,115,119,.12)",marginBottom:14}}>
                <p style={{fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.5,fontStyle:"italic"}}>This card could be worth keeping if you pair it with the right card.</p>
              </div>
            )}
            {/* Synergy tiles */}
            {sorted.map((syn,i)=>{
              const st=SYNERGY_TYPES[syn.type]||SYNERGY_TYPES.companionCombo;
              const pairCard=CARDS.find(c=>c.name===syn.pairWith);
              const ownedByMe=userCardNames.has(syn.pairWith);
              const ownedByP2=p2CardNames.has(syn.pairWith);
              const ownedByHH=ownedByMe||ownedByP2;
              const p2OwnerName=ownedByP2?(p2Name||"Partner"):null;
              const pairShort=pairCard?pairCard.short||pairCard.name:syn.pairWith;
              const isExpanded=expandedSynergy===(card.id+"-"+i);
              return (
                <div key={i} className="surf fu" style={{marginBottom:10,borderLeft:`3px solid ${ownedByHH?"var(--grn2)":st.color}`,position:"relative"}}>
                  {/* Type badge */}
                  <div style={{position:"absolute",top:10,right:10}}>
                    {ownedByHH?(
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(22,163,74,.08)",color:"var(--grn2)",border:"1px solid rgba(22,163,74,.15)",whiteSpace:"nowrap"}}>{"✅"} Active combo</span>
                    ):(
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:st.color+"12",color:st.color,border:`1px solid ${st.color}25`,whiteSpace:"nowrap"}}>{st.icon} {st.label}</span>
                    )}
                  </div>
                  {/* Pair card header */}
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,marginRight:100}}>
                    {pairCard&&<div style={{width:36,height:22,borderRadius:5,background:`linear-gradient(135deg,${pairCard.c1},${pairCard.c2})`,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.12)"}}/>}
                    <div>
                      <div style={{fontSize:10,fontWeight:600,color:ownedByHH?"var(--grn2)":"var(--tx3)",textTransform:"uppercase",letterSpacing:.5}}>
                        {ownedByHH?"✅ You already have this combo":"Pair with"}
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>
                        {pairShort}
                        {ownedByP2&&!ownedByMe&&<span style={{fontSize:10,fontWeight:500,color:"var(--acc)",marginLeft:6}}>via {p2OwnerName}</span>}
                      </div>
                    </div>
                  </div>
                  {/* Pitch */}
                  <p style={{fontSize:13,color:ownedByHH?"var(--tx)":"var(--tx2)",margin:"0 0 8px",lineHeight:1.6,fontWeight:ownedByHH?600:400}}>
                    {ownedByHH
                      ?(ownedByP2&&!ownedByMe
                        ?p2OwnerName+"'s "+pairShort+" combined with your "+(card.short||card.name)+" — this combo is already working for you. "
                        :"You already have "+pairShort+" — here's the strategy you're sitting on: ")
                      :(householdSetup?"Neither you nor "+(p2Name||"partner")+" has this card yet. ":"")
                    }
                    {syn.youGet}
                  </p>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    {ownedByHH?(
                      <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:"rgba(22,163,74,.08)",color:"var(--grn2)",border:"1px solid rgba(22,163,74,.15)"}}>{"✅"} Already unlocked</span>
                    ):(
                      <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:"rgba(13,115,119,.08)",color:"var(--acc)",border:"1px solid rgba(13,115,119,.15)",fontFamily:"'Source Code Pro',monospace"}}>+{syn.estimatedUplift}</span>
                    )}
                    {!ownedByHH&&syn.bestFor&&<span style={{fontSize:10,color:"var(--tx3)"}}>Best for: {syn.bestFor}</span>}
                    {ownedByHH&&<span style={{fontSize:10,color:"var(--grn2)",fontWeight:500}}>You're already getting this value</span>}
                  </div>
                  {/* Expandable details */}
                  <button onClick={e=>{e.stopPropagation();setExpandedSynergy(isExpanded?null:card.id+"-"+i);}}
                    style={{marginTop:8,background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:"var(--acc)"}}>
                    {isExpanded?"Hide details":"See the math →"}
                    <span style={{transition:"transform .15s",transform:isExpanded?"rotate(90deg)":"rotate(0deg)",display:"inline-flex"}}><Icon name="chevron-right" size={11} color="var(--acc)"/></span>
                  </button>
                  {isExpanded&&(
                    <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--br)"}}>
                      <p style={{fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.7}}>{syn.details}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
        const synergySubtitle=isWorthIt
          ?sorted.length+" synerg"+(sorted.length===1?"y":"ies")+" to level up your strategy"
          :"Pair with the right card to close the gap";
        return (
          <div className="surf fu" style={{marginBottom:16}}>
            <button onClick={()=>setShowSynergies(!showSynergies)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
              <div style={{width:40,height:40,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="key" size={20} color="var(--acc)"/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Strategy Plays</div>
                <div style={{fontSize:11,color:"var(--tx3)"}}>{synergySubtitle}</div>
              </div>
              <span style={{transition:"transform .2s",transform:showSynergies?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
            </button>
            {showSynergies&&<div style={{marginTop:16}}>{sectionContent}</div>}
          </div>
        );
      })()}

      {/* ── STILL UNSURE? GUIDED DECISION QUIZ ── */}
      {card&&card.fee>0&&(()=>{
        // ── Build adaptive question bank ──
        const hv=HIDDEN_VALUES[card.name]||null;
        const tpd=card.cur?TRANSFER_PARTNER_DATA[card.cur]:null;
        const hasTransfer=!!(tpd||(hv&&hv.transferEcosystem));
        const eco=Object.entries(ECOSYSTEM_MAP).find(([,d])=>d.unlockers.includes(card.name)||d.earners.includes(card.name));
        const ecoName=eco?eco[0]:null;
        const ecoData=eco?eco[1]:null;
        const isUnlocker=ecoData?ecoData.unlockers.includes(card.name):false;
        const allHHIds=[...myCards,...(householdSetup?p2Cards:[])];
        // Detect partner's unlocker status in same ecosystem
        const partnerUnlockerCard=isUnlocker&&ecoData&&householdSetup?p2Resolved.find(c=>ecoData.unlockers.includes(c.name)):null;
        const partnerHasUnlocker=!!partnerUnlockerCard;
        const hhUnlockerCount=isUnlocker&&ecoData?ecoData.unlockers.filter(u=>CARDS.some(c=>allHHIds.includes(c.id)&&c.name===u)).length:0;
        const isOnlyUnlocker=isUnlocker&&hhUnlockerCount===1;
        const onlyCardInEco=ecoName?allHHIds.filter(id=>{const c=CARDS.find(x=>x.id===id);return c&&(ecoData.earners.includes(c.name)||ecoData.unlockers.includes(c.name));}).length===1:false;
        const psr=ecoName?POINT_SHARING_RULES[ecoName]:null;
        const canShareHH=psr&&psr.canShareHousehold;
        const synergies=CARD_SYNERGIES[card.name]||[];
        const earnCats=Object.entries(card.earn||{}).filter(([k,v])=>k!=="o"&&parseFloat(String(v).replace(/[^0-9.]/g,""))>1);
        const hasTravelBens=(()=>{const allBens=[...card.annual,...card.monthly];return allBens.some(b=>{const n=(b.n||"").toLowerCase();return n.includes("lounge")||n.includes("travel credit")||n.includes("airline")||n.includes("global entry")||n.includes("tsa")||n.includes("hotel credit")||n.includes("trip");});})();
        const isBrandedCard=(()=>{const n=card.name.toLowerCase();return n.includes("marriott")||n.includes("hilton")||n.includes("hyatt")||n.includes("delta")||n.includes("united")||n.includes("southwest")||n.includes("ihg")||n.includes("alaska");})();
        const brandName=(()=>{const n=card.name.toLowerCase();if(n.includes("marriott"))return"Marriott";if(n.includes("hilton"))return"Hilton";if(n.includes("hyatt"))return"Hyatt";if(n.includes("delta"))return"Delta";if(n.includes("united"))return"United";if(n.includes("southwest"))return"Southwest";if(n.includes("ihg"))return"IHG";if(n.includes("alaska"))return"Alaska";return null;})();
        const hasHHOverlap=householdSetup&&p2Resolved.length>0&&(()=>{const myBens=[...card.annual,...card.monthly].map(b=>(b.n||"").toLowerCase());return p2Resolved.some(pc=>[...pc.annual,...pc.monthly].some(b=>myBens.includes((b.n||"").toLowerCase())));})();
        const catLabels={d:"dining",g:"groceries",gas:"gas",t:"travel",s:"streaming",a:"Amazon",tr:"rideshare",p:"pharmacy"};

        // Pre-populate Q3 from existing benefit tracker checked state
        const benefitOptions=useMemo(()=>{
          const bens=[...card.annual,...card.monthly].filter(b=>b.v!=null).map(b=>({name:b.n,value:annualBenValue(b),checked:checkedSet.has(benKey(card.id,b,!!b.reset&&b.reset==="monthly"))}));
          const hvPerks=(hv&&hv.hiddenPerks||[]).filter(hp=>hp.category!=="transferPartners"&&/\$\d+/.test(hp.estimatedValue||"")).map(hp=>{
            const valMatch=(hp.estimatedValue||"").match(/\$(\d+)/);
            return {name:hp.perk,value:valMatch?parseInt(valMatch[1]):0,checked:false,isHidden:true};
          });
          return [...bens,...hvPerks];
        },[card,checkedSet,hv]);

        const questions=useMemo(()=>{
          const qs=[];
          // Q1: Spending patterns
          if(earnCats.length>0){
            const catStr=earnCats.map(([k,v])=>(catLabels[k]||k)+" ("+v+"x)").join(", ");
            qs.push({id:"spending",title:"How much do you spend monthly in this card's bonus categories?",subtitle:card.short+"'s bonus categories: "+catStr,
              type:"single",options:[
                {label:"$0 \u2014 I use other cards for these categories",value:"zero"},
                {label:"Less than $200/mo",value:"low"},
                {label:"$200 - $500/mo",value:"med"},
                {label:"$500 - $1,000/mo",value:"high"},
                {label:"Over $1,000/mo",value:"vhigh"}
              ]});
          }
          // Q2: Transfer partner usage
          if(hasTransfer){
            qs.push({id:"transfer",title:"Do you transfer points to airline/hotel partners for flights or stays?",
              type:"single",options:[
                {label:"Yes, regularly (3+ times/year)",value:"regular"},
                {label:"Sometimes (1-2 times/year)",value:"sometimes"},
                {label:"Rarely or never",value:"rarely"},
                {label:"I didn't know I could do that",value:"didnt_know"}
              ]});
          }
          // Q3: Benefit usage (multi-select)
          if(benefitOptions.length>0){
            qs.push({id:"benefits",title:"Which of these card benefits do you actually use?",subtitle:"Check all that apply. Pre-checked items reflect your benefit tracker above.",
              type:"multi",options:benefitOptions.map(b=>({label:b.name+(b.value?" ($"+b.value+"/yr)":"")+(b.isHidden?" (hidden perk)":""),value:b.name,checked:b.checked}))
            });
          }
          // Q4: Household redundancy
          if(householdSetup&&hasHHOverlap){
            const overlaps=[];
            const myBens=[...card.annual,...card.monthly];
            p2Resolved.forEach(pc=>{
              const pcBens=[...pc.annual,...pc.monthly];
              myBens.forEach(b=>{
                if(pcBens.some(pb=>(pb.n||"").toLowerCase()===(b.n||"").toLowerCase())){
                  overlaps.push((pc.short||pc.name)+" also has "+b.n);
                }
              });
            });
            const overlapStr=overlaps.slice(0,3).join("; ");
            qs.push({id:"household",title:(p2Name||"Your partner")+"'s cards overlap with some benefits. Would you still need this card if you relied on theirs?",
              subtitle:overlapStr,
              type:"single",options:[
                {label:"Yes - I need my own coverage (we travel separately)",value:"need_own"},
                {label:"Probably not - we're always together",value:"dont_need"},
                {label:"Not sure",value:"unsure"}
              ]});
          }
          // Q5: Travel frequency
          if(hasTravelBens){
            qs.push({id:"travel",title:"How often do you travel?",
              type:"single",options:[
                {label:"Frequently (6+ trips/year)",value:"frequent"},
                {label:"A few times (2-5 trips/year)",value:"sometimes"},
                {label:"Rarely (0-1 trips/year)",value:"rarely"}
              ]});
          }
          // Q6: Brand loyalty
          if(isBrandedCard&&brandName){
            qs.push({id:"loyalty",title:"How important is your "+brandName+" loyalty status to you?",
              type:"single",options:[
                {label:"Very - I always stay/fly with "+brandName,value:"very"},
                {label:"Somewhat - I use them when convenient",value:"somewhat"},
                {label:"Not much - I go wherever is cheapest",value:"notmuch"}
              ]});
          }
          // Q7: Points balance risk
          if(onlyCardInEco&&ecoName){
            qs.push({id:"balance",title:"Do you have a significant "+ecoName+" points balance?",
              type:"single",options:[
                {label:"Yes, over 50,000 points",value:"large"},
                {label:"Some, under 50,000",value:"some"},
                {label:"Very few / already used them",value:"few"}
              ]});
          }
          // Q8: Retention willingness
          qs.push({id:"retention",title:"Would you call "+card.issuer+" to ask for a retention offer before deciding?",
            type:"single",options:[
              {label:"Yes, I'd definitely call",value:"yes"},
              {label:"Maybe, if it's worth it",value:"maybe"},
              {label:"No, I'd rather just decide now",value:"no"}
            ]});
          // Q9: Fee sensitivity
          qs.push({id:"fee_sense",title:"How do you feel about this card's $"+card.fee+"/yr annual fee?",
            type:"single",options:[
              {label:"Fine if I'm getting the value",value:"fine"},
              {label:"It's a stretch - I'd prefer to pay less",value:"stretch"},
              {label:"I really want to eliminate it",value:"eliminate"}
            ]});
          return qs;
        },[card,earnCats,hasTransfer,benefitOptions,householdSetup,hasHHOverlap,hasTravelBens,isBrandedCard,brandName,onlyCardInEco,ecoName,p2Name]);

        // ── Recommendation engine ──
        function computeRecommendation(answers){
          let totalValue=0;
          const reasons=[];
          const warnings=[];
          const tips=[];

          // Checked benefit value from tracker
          const trackerVal=usedValue;
          if(trackerVal>0){totalValue+=trackerVal;reasons.push("You've captured $"+trackerVal+" in direct benefits from your tracker");}

          // Q3: Additional benefits checked in quiz — separate hidden perks from tracker benefits
          if(answers.benefits){
            // Hidden perks (insurance, protection, etc.) — add value individually with names
            benefitOptions.filter(bo=>bo.isHidden&&answers.benefits.includes(bo.name)&&bo.value>0).forEach(bo=>{
              totalValue+=bo.value;reasons.push(bo.name+" adds ~$"+bo.value+"/yr in hidden value");
            });
            // Untracked annual/monthly benefits — don't add to score, redirect to tracker
            const untrackedBens=benefitOptions.filter(bo=>!bo.isHidden&&answers.benefits.includes(bo.name)&&!bo.checked);
            if(untrackedBens.length>0){
              tips.push("You said you use "+untrackedBens.map(b=>b.name).join(", ")+" \u2014 mark "+(untrackedBens.length===1?"it":"them")+" in your Benefit Tracker above to see "+(untrackedBens.length===1?"its":"their")+" full impact on your ROI.");
            }
          }

          // Q1: Spending value
          if(answers.spending&&earnCats.length>0){
            const spendMap={zero:0,low:150,med:350,high:750,vhigh:1500};
            const monthlySpend=spendMap[answers.spending]||0;
            const avgRate=earnCats.reduce((s,[,v])=>s+parseFloat(String(v).replace(/[^0-9.]/g,"")),0)/earnCats.length;
            const cpp=tpd?tpd.transferValue/100:0.01;
            const annualEarnValue=Math.round(monthlySpend*12*avgRate*cpp);
            if(annualEarnValue>0){totalValue+=annualEarnValue;reasons.push("Your spending earns ~$"+annualEarnValue+"/yr in points value (you earn "+avgRate.toFixed(1)+"x points on bonus categories, worth "+(tpd?tpd.transferValue:1)+"\u00a2 each through travel partners)");}
          }

          // Q2: Transfer partner multiplier
          // Skip transfer bonus if partner already has an unlocker with sharing — the transfer access is redundant for THIS card
          if(answers.transfer&&!(partnerHasUnlocker&&canShareHH)){
            const transferBonus=answers.transfer==="regular"?150:answers.transfer==="sometimes"?75:0;
            if(transferBonus>0){totalValue+=transferBonus;reasons.push("Transferring points to travel partners is worth ~$"+transferBonus+"/yr more than taking cash back (your points are worth ~"+(tpd?tpd.transferValue:"1.5")+"\u00a2 each vs "+(tpd?tpd.cashValue:"1")+"\u00a2 as cash)");}
            if(answers.transfer==="didnt_know"&&tpd){
              tips.push("If you started transferring to partners, your points could be worth "+tpd.transferValue+"c each instead of "+tpd.cashValue+"c. This alone could change the math.");
            }
            if(answers.transfer==="rarely"&&tpd){
              tips.push("Transferring to partners could boost your point value from "+tpd.cashValue+"c to "+tpd.transferValue+"c each. Consider trying before deciding.");
            }
          } else if(answers.transfer&&partnerHasUnlocker&&canShareHH){
            tips.push("You still get full transfer partner access through "+(p2Name||"partner")+"'s "+(partnerUnlockerCard?.short||partnerUnlockerCard?.name||"card")+" via household point combining.");
          }

          // Q4: Household redundancy discount
          if(answers.household==="dont_need"){
            // If partner has an unlocker in same ecosystem with sharing, be much more aggressive
            if(partnerHasUnlocker&&canShareHH){
              const discount=Math.round(totalValue*0.7);
              totalValue-=discount;
              reasons.push("Your partner's card covers the same benefits (-$"+discount+") \u2014 since "+ecoName.split(" ")[0]+" lets household members combine points, you can downgrade this card without losing transfer access");
            } else {
              const discount=Math.round(totalValue*0.3);
              totalValue-=discount;
              reasons.push("Your partner's card covers overlapping benefits (-$"+discount+") \u2014 you're both paying for similar perks that only one of you needs");
            }
          }

          // Q5: Travel frequency scaling
          if(answers.travel){
            const travelBenTotal=[...card.annual,...card.monthly].filter(b=>{const n=(b.n||"").toLowerCase();return b.v&&(n.includes("lounge")||n.includes("travel")||n.includes("airline")||n.includes("global entry")||n.includes("tsa")||n.includes("hotel credit")||n.includes("trip"));}).reduce((s,b)=>s+annualBenValue(b),0);
            if(travelBenTotal>0){
              const scale=answers.travel==="frequent"?1:answers.travel==="sometimes"?0.6:0.2;
              const travelVal=Math.round(travelBenTotal*scale);
              const alreadyCounted=Math.min(travelBenTotal,trackerVal);
              const extra=Math.max(0,travelVal-alreadyCounted);
              if(extra>0){totalValue+=extra;reasons.push("Travel benefits worth ~$"+travelVal+"/yr at your travel frequency (includes lounge access, travel credits, and trip protections you\u2019d otherwise pay for)");}
            }
          }

          // Q6: Loyalty status scaling
          if(answers.loyalty&&isBrandedCard){
            const loyaltyBens=[...card.annual,...card.monthly].filter(b=>{const n=(b.n||"").toLowerCase();return b.v&&(n.includes("free night")||n.includes("status")||n.includes("certificate")||n.includes("companion"));});
            const loyaltyTotal=loyaltyBens.reduce((s,b)=>s+annualBenValue(b),0);
            if(loyaltyTotal>0){
              const weight=answers.loyalty==="very"?1:answers.loyalty==="somewhat"?0.5:0.3;
              const loyaltyVal=Math.round(loyaltyTotal*weight);
              reasons.push(brandName+" loyalty perks worth ~$"+loyaltyVal+"/yr based on your usage (free nights, elite status upgrades, and certificates that offset hotel costs)");
            }
          }

          // Q8: Retention offer value
          if(answers.retention==="yes"&&retentionOffers.length>0){
            const offerMatch=(retentionOffers[0]||"").match(/\$(\d+)/);
            const retVal=offerMatch?parseInt(offerMatch[1]):75;
            totalValue+=retVal;
            reasons.push("Likely retention offer adds ~$"+retVal+" \u2014 if you call to cancel, the issuer typically offers statement credits or bonus points to keep you (e.g., "+retentionOffers[0]+")");
          } else if(answers.retention==="maybe"&&retentionOffers.length>0){
            const offerMatch=(retentionOffers[0]||"").match(/\$(\d+)/);
            const retVal=offerMatch?Math.round(parseInt(offerMatch[1])*0.5):40;
            totalValue+=retVal;
            reasons.push("Possible retention offer could add ~$"+retVal+" \u2014 if you call to cancel, the issuer may offer statement credits or bonus points to keep you (a \u2018retention offer\u2019)");
          }

          // Synergy value — skip if partner covers same ecosystem unlocker (synergy works through their card)
          // Scale synergy value based on user's actual usage patterns instead of assuming full benefit
          if(synergies.length>0&&!(partnerHasUnlocker&&canShareHH&&isUnlocker)){
            const ownedSyns=synergies.filter(s=>{const pc=CARDS.find(c=>c.name===s.pairWith);return pc&&allHHIds.includes(pc.id);});
            if(ownedSyns.length>0){
              const syn=ownedSyns[0];
              const synMatch=(syn.estimatedUplift||"").match(/\$(\d+)/);
              const baseSynVal=synMatch?parseInt(synMatch[1]):100;
              const pairName=syn.pairWith.replace(/[®℠]/g,"").replace(/ Credit Card/,"").trim();
              // Scale by synergy type and relevant user behavior
              let synScale=0;let synNote="";
              if(syn.type==="statusStacking"){
                // Hotel status stacking — value depends on travel frequency
                synScale=answers.travel==="frequent"?0.5:answers.travel==="sometimes"?0.25:0;
                if(synScale>0){
                  const synVal=Math.round(baseSynVal*synScale);
                  totalValue+=synVal;
                  reasons.push("Pairs well with "+pairName+" (~$"+synVal+"/yr value) \u2014 "+(syn.youGet||"hotel status benefits stack together for upgrades and elite perks"));
                } else {
                  reasons.push("This card pairs with your "+pairName+" for hotel status benefits \u2014 but since you travel infrequently, the added value is minimal");
                }
              } else if(syn.type==="ecosystemUnlocker"){
                // Transfer unlocking — value depends on transfer partner usage
                synScale=answers.transfer==="regular"?0.5:answers.transfer==="sometimes"?0.25:0;
                if(synScale>0){
                  const synVal=Math.round(baseSynVal*synScale);
                  totalValue+=synVal;
                  reasons.push("Pairs well with "+pairName+" (~$"+synVal+"/yr value) \u2014 "+(syn.youGet||"unlocks transfer partners so your points are worth 2-3x more than cash back"));
                } else {
                  reasons.push("This card pairs with your "+pairName+" to unlock transfer partners \u2014 but since you don\u2019t use transfers, the added value is minimal. Worth exploring: transferring to travel partners can double your point value");
                }
              } else {
                // companionCombo / categoryCoverage — value depends on spending
                synScale=answers.spending==="vhigh"||answers.spending==="high"?0.5:answers.spending==="med"||answers.spending==="low"?0.25:0;
                if(synScale>0){
                  const synVal=Math.round(baseSynVal*synScale);
                  totalValue+=synVal;
                  reasons.push("Pairs well with "+pairName+" (~$"+synVal+"/yr value) \u2014 "+(syn.youGet||"together they cover more spending categories at higher earn rates"));
                } else {
                  reasons.push("This card pairs with your "+pairName+" for earning optimization \u2014 but since you don\u2019t spend on this card, the combo benefit is minimal");
                }
              }
            }
          }

          // Ecosystem unlocker analysis — household-aware
          if(isUnlocker&&ecoName&&householdSetup){
            if(partnerHasUnlocker&&canShareHH){
              // Partner ALSO has an unlocker AND points can be shared
              // This card's ENTIRE transfer-unlocking value is redundant
              const freeEarner=ecoData.earners.find(e=>!ecoData.unlockers.includes(e));
              const freeEarnerName=freeEarner?freeEarner.replace(/[®℠]/g,"").replace(/ Credit Card/,"").trim():"a free earner card";
              const bestDg=downgrades.find(d=>d.annualFee===0)||downgrades[0];
              const dgName=bestDg?bestDg.cardName:freeEarnerName;
              const dgFee=bestDg?bestDg.annualFee:0;
              const savings=card.fee-dgFee;
              // Aggressively reduce — fee is wasted + redundancy penalty
              totalValue-=card.fee;
              totalValue-=200;
              // Cap any remaining value low — non-transfer perks don't justify the fee
              if(totalValue>0) totalValue=Math.min(totalValue,Math.round(card.fee*0.3));
              reasons.push((p2Name||"Partner")+"'s "+(partnerUnlockerCard.short||partnerUnlockerCard.name)+" already unlocks "+ecoName.split(" ")[0]+" transfer partners \u2014 without it, all your "+ecoName.split(" ")[0]+" points are limited to "+(tpd?tpd.cashValue:"1")+"\u00a2 cash back instead of "+(tpd?tpd.transferValue:"2")+"\u00a2+ through airline/hotel transfers");
              reasons.push(ecoName.split(" ")[0]+" lets household members combine points \u2014 your points flow to "+(p2Name||"partner")+"'s account for the same transfer access, so you don\u2019t need your own unlocker card");
              if(savings>0) reasons.push("Downgrade to "+dgName+" ($"+dgFee+"/yr) and save $"+savings+"/yr \u2014 you keep earning points and they still transfer through "+(p2Name||"partner")+"'s card");
            } else if(partnerHasUnlocker&&!canShareHH){
              // Partner has unlocker but can't share — both need their own
              reasons.push("You both have "+ecoName.split(" ")[0]+" transfer access \u2014 unlike Chase or Capital One, "+ecoName.split(" ")[0]+" doesn\u2019t let household members combine points, so you each need your own unlocker card to transfer");
            } else if(isOnlyUnlocker){
              // Only unlocker in household — card is essential
              totalValue+=200;
              reasons.push("Only card in your household that unlocks "+ecoName.split(" ")[0]+" transfer partners (+$200 strategic value) \u2014 without it, all your "+ecoName.split(" ")[0]+" points are limited to "+(tpd?tpd.cashValue:"1")+"\u00a2 cash back instead of "+(tpd?tpd.transferValue:"2")+"\u00a2+ through airline/hotel transfers");
              warnings.push("Canceling drops ALL household "+ecoName+" points to cash value \u2014 you\u2019d lose transfer partner access entirely");
            }
          } else if(isUnlocker&&ecoName&&!householdSetup){
            // Solo user — unlocker has strategic value
            if(isOnlyUnlocker){
              totalValue+=200;
              reasons.push("Only card you have that unlocks "+ecoName.split(" ")[0]+" transfer partners (+$200 strategic value) \u2014 without it, all your "+ecoName.split(" ")[0]+" points are limited to "+(tpd?tpd.cashValue:"1")+"\u00a2 cash back instead of "+(tpd?tpd.transferValue:"2")+"\u00a2+ through airline/hotel transfers");
              warnings.push("Canceling drops ALL your "+ecoName+" points to cash value \u2014 you\u2019d lose transfer partner access entirely");
            }
          }

          // Q7: Point balance risk
          if(answers.balance==="large"&&onlyCardInEco){
            warnings.push("You have 50k+ points and this is your only "+ecoName+" card. Canceling could forfeit them.");
          }

          // Q9: Fee sensitivity adjustment
          if(answers.fee_sense==="eliminate") totalValue-=50;
          if(answers.fee_sense==="stretch") totalValue-=25;

          const netValue=totalValue-card.fee;
          const bestDowngrade=downgrades.length>0?downgrades[0]:null;
          const isAmexMR=card.cur==="Amex Membership Rewards";

          let recommendation,recColor,recIcon,recLabel;
          // Override: force DOWNGRADE when partner has same ecosystem unlocker + sharing
          if(partnerHasUnlocker&&canShareHH&&isUnlocker&&bestDowngrade){
            recommendation="downgrade";recColor="#2563eb";recIcon="arrow-down";recLabel="DOWNGRADE";
          } else if(netValue>50){
            recommendation="renew";recColor="var(--grn2)";recIcon="check-circle";recLabel="RENEW";
          } else if(netValue>=-50){
            recommendation="borderline";recColor="var(--acc)";recIcon="help-circle";recLabel="BORDERLINE";
          } else if(bestDowngrade){
            recommendation="downgrade";recColor="#2563eb";recIcon="arrow-down";recLabel="DOWNGRADE";
          } else {
            recommendation="cancel";recColor="var(--red2)";recIcon="x-circle";recLabel="CANCEL";
          }

          // Override: never recommend outright cancel if large balance + only card
          if(recommendation==="cancel"&&answers.balance==="large"&&onlyCardInEco&&bestDowngrade){
            recommendation="downgrade";recColor="#2563eb";recIcon="arrow-down";recLabel="DOWNGRADE";
            warnings.push("Downgrade first to preserve your points, then cancel later if you want");
          }

          // Amex MR safety net
          if((recommendation==="cancel"||recommendation==="downgrade")&&isAmexMR&&onlyCardInEco){
            tips.push("Since this is your only Amex MR card, always downgrade to EveryDay ($0/yr) first to preserve your Membership Rewards points.");
          }

          return {recommendation,recColor,recIcon,recLabel,totalValue,netValue,reasons,warnings,tips,bestDowngrade};
        }

        const currentQ=questions[quizStep];
        const isLastStep=quizStep===questions.length-1;
        const hasAnswer=currentQ?(currentQ.type==="multi"?true:!!quizAnswers[currentQ.id]):false;

        function handleAnswer(qId,value,type){
          if(type==="multi"){
            setQuizAnswers(prev=>{
              const existing=prev[qId]||benefitOptions.filter(b=>b.checked).map(b=>b.name);
              const next=existing.includes(value)?existing.filter(v=>v!==value):[...existing,value];
              return {...prev,[qId]:next};
            });
          } else {
            setQuizAnswers(prev=>({...prev,[qId]:value}));
          }
        }

        function finishQuiz(){
          // Pre-populate multi-select defaults if user didn't touch Q3
          const finalAnswers={...quizAnswers};
          if(!finalAnswers.benefits){
            finalAnswers.benefits=benefitOptions.filter(b=>b.checked).map(b=>b.name);
          }
          setQuizResult(computeRecommendation(finalAnswers));
        }

        function retakeQuiz(){
          setQuizStep(0);setQuizAnswers({});setQuizResult(null);
        }

        return (
          <div style={{marginBottom:16,borderLeft:"4px solid var(--acc)",borderRadius:12,overflow:"hidden"}}>
            <button onClick={()=>setShowQuiz(!showQuiz)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"rgba(13,115,119,.03)",border:"none",cursor:"pointer",padding:"16px",textAlign:"left"}}>
              <div style={{width:40,height:40,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>
                {"🤔"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Still unsure? Let us help you decide.</div>
                <div style={{fontSize:11,color:"var(--tx3)"}}>Answer a few quick questions for a personalized recommendation.</div>
              </div>
              <span style={{transition:"transform .2s",transform:showQuiz?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={16} color="var(--tx3)"/></span>
            </button>

            {showQuiz&&(
              <div style={{padding:"0 16px 16px",background:"rgba(13,115,119,.02)"}}>
                {!quizResult?(
                  <div>
                    {/* Progress */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,paddingTop:4}}>
                      <span style={{fontSize:11,fontWeight:600,color:"var(--tx3)"}}>Question {quizStep+1} of {questions.length}</span>
                      <div style={{display:"flex",gap:3}}>
                        {questions.map((_,i)=>(
                          <div key={i} style={{width:i===quizStep?16:8,height:4,borderRadius:2,background:i<quizStep?"var(--acc)":i===quizStep?"var(--acc)":"var(--br2)",transition:"all .2s"}}/>
                        ))}
                      </div>
                    </div>

                    {currentQ&&(
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:"var(--tx)",lineHeight:1.4,marginBottom:4}}>{currentQ.title}</div>
                        {currentQ.subtitle&&<div style={{fontSize:12,color:"var(--tx3)",marginBottom:12,lineHeight:1.4}}>{currentQ.subtitle}</div>}

                        {currentQ.type==="single"&&(
                          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
                            {currentQ.options.map(opt=>{
                              const selected=quizAnswers[currentQ.id]===opt.value;
                              return(
                                <button key={opt.value} onClick={()=>handleAnswer(currentQ.id,opt.value,"single")}
                                  style={{display:"block",width:"100%",padding:"12px 14px",borderRadius:10,border:selected?"2px solid var(--acc)":"2px solid var(--br2)",
                                    background:selected?"rgba(13,115,119,.06)":"var(--bg)",cursor:"pointer",textAlign:"left",
                                    fontSize:13,fontWeight:selected?600:500,color:selected?"var(--acc)":"var(--tx)",transition:"all .15s",
                                    fontFamily:"'Inter',sans-serif"}}>
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {currentQ.type==="multi"&&(
                          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16,maxHeight:260,overflowY:"auto"}}>
                            {currentQ.options.map(opt=>{
                              const checked=(quizAnswers[currentQ.id]||benefitOptions.filter(b=>b.checked).map(b=>b.name)).includes(opt.value);
                              return(
                                <button key={opt.value} onClick={()=>handleAnswer(currentQ.id,opt.value,"multi")}
                                  style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:8,
                                    border:checked?"2px solid var(--acc)":"2px solid var(--br2)",background:checked?"rgba(13,115,119,.06)":"var(--bg)",
                                    cursor:"pointer",textAlign:"left",fontSize:12,fontWeight:checked?600:500,
                                    color:checked?"var(--acc)":"var(--tx)",transition:"all .15s",fontFamily:"'Inter',sans-serif"}}>
                                  <span style={{width:18,height:18,borderRadius:4,border:checked?"2px solid var(--acc)":"2px solid var(--br3)",
                                    background:checked?"var(--acc)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                    {checked&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>{"✓"}</span>}
                                  </span>
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Navigation */}
                        <div style={{display:"flex",gap:8}}>
                          {quizStep>0&&(
                            <button onClick={()=>setQuizStep(s=>s-1)}
                              style={{flex:1,padding:"12px",borderRadius:10,border:"1.5px solid var(--br2)",background:"var(--bg)",
                                cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--tx2)",fontFamily:"'Inter',sans-serif"}}>
                              Back
                            </button>
                          )}
                          {isLastStep?(
                            <button onClick={finishQuiz} disabled={!hasAnswer}
                              style={{flex:2,padding:"12px",borderRadius:10,border:"none",
                                background:hasAnswer?"linear-gradient(135deg,var(--acc),var(--gld2))":"var(--br2)",
                                cursor:hasAnswer?"pointer":"default",fontSize:13,fontWeight:700,color:hasAnswer?"#fff":"var(--tx4)",
                                fontFamily:"'Inter',sans-serif",transition:"all .2s"}}>
                              Get My Recommendation
                            </button>
                          ):(
                            <button onClick={()=>setQuizStep(s=>s+1)} disabled={!hasAnswer}
                              style={{flex:2,padding:"12px",borderRadius:10,border:"none",
                                background:hasAnswer?"var(--acc)":"var(--br2)",
                                cursor:hasAnswer?"pointer":"default",fontSize:13,fontWeight:700,color:hasAnswer?"#fff":"var(--tx4)",
                                fontFamily:"'Inter',sans-serif",transition:"all .2s"}}>
                              Next
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ):(
                  /* ── RECOMMENDATION RESULT ── */
                  <div style={{paddingTop:8}}>
                    <div className="surf" style={{border:`2px solid ${quizResult.recColor}`,borderRadius:14,padding:"20px 16px",marginBottom:12,
                      background:quizResult.recommendation==="renew"?"rgba(22,163,74,.04)":quizResult.recommendation==="downgrade"?"rgba(37,99,235,.04)":quizResult.recommendation==="cancel"?"rgba(220,38,38,.04)":"rgba(13,115,119,.04)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                        <Icon name={quizResult.recIcon} size={22} color={quizResult.recColor}/>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:"var(--tx3)",letterSpacing:.5}}>Our Recommendation</div>
                          <div style={{fontSize:20,fontWeight:800,color:quizResult.recColor,fontFamily:"'Inter',sans-serif"}}>{quizResult.recLabel}</div>
                        </div>
                      </div>

                      <p style={{fontSize:13,color:"var(--tx)",lineHeight:1.6,margin:"0 0 14px"}}>
                        {quizResult.recommendation==="renew"
                          ?"Based on your answers, this card delivers ~$"+quizResult.totalValue+" in annual value against the $"+card.fee+" fee."
                          :quizResult.recommendation==="borderline"
                          ?"This is a close call. The card delivers ~$"+quizResult.totalValue+" against the $"+card.fee+" fee. Consider these factors:"
                          :quizResult.recommendation==="downgrade"&&quizResult.bestDowngrade
                          ?"Consider downgrading to "+quizResult.bestDowngrade.cardName+" ($"+quizResult.bestDowngrade.annualFee+"/yr)."
                          :"This card doesn't deliver enough value for your usage pattern."}
                      </p>

                      {/* Reasons */}
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:.8,color:"var(--tx3)",textTransform:"uppercase",marginBottom:6}}>Why</div>
                        {quizResult.reasons.map((r,i)=>(
                          <div key={i} style={{display:"flex",gap:8,marginBottom:4,fontSize:12,color:"var(--tx2)",lineHeight:1.5}}>
                            <span style={{color:"var(--grn2)",flexShrink:0}}>{"+"}</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>

                      {/* Warnings */}
                      {quizResult.warnings.length>0&&(
                        <div style={{marginBottom:12}}>
                          {quizResult.warnings.map((w,i)=>(
                            <div key={i} style={{display:"flex",gap:8,marginBottom:4,fontSize:12,color:"var(--red2)",lineHeight:1.5,fontWeight:500}}>
                              <span style={{flexShrink:0}}>{"⚠️"}</span>
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Downgrade details */}
                      {quizResult.recommendation==="downgrade"&&quizResult.bestDowngrade&&(
                        <div style={{padding:"10px 12px",borderRadius:8,background:"rgba(37,99,235,.06)",border:"1px solid rgba(37,99,235,.12)",marginBottom:12}}>
                          <div style={{fontSize:12,fontWeight:700,color:"#2563eb",marginBottom:4}}>Downgrade to {quizResult.bestDowngrade.cardName} (${quizResult.bestDowngrade.annualFee}/yr)</div>
                          {quizResult.bestDowngrade.whatYouKeep&&<div style={{fontSize:11,color:"var(--tx2)",marginBottom:2,lineHeight:1.4}}>Keep: {quizResult.bestDowngrade.whatYouKeep.split(",").slice(0,3).join(", ")}</div>}
                          {quizResult.bestDowngrade.whatYouLose&&<div style={{fontSize:11,color:"var(--red2)",lineHeight:1.4}}>Lose: {quizResult.bestDowngrade.whatYouLose.split(",").slice(0,3).join(", ")}</div>}
                          {quizResult.bestDowngrade.note&&<div style={{fontSize:11,color:"var(--tx3)",marginTop:4,fontStyle:"italic"}}>{quizResult.bestDowngrade.note}</div>}
                        </div>
                      )}

                      {/* Tips */}
                      {quizResult.tips.length>0&&(
                        <div style={{marginBottom:12}}>
                          {quizResult.tips.map((t,i)=>(
                            <div key={i} style={{display:"flex",gap:8,marginBottom:4,fontSize:12,color:"var(--acc)",lineHeight:1.5,fontWeight:500}}>
                              <span style={{flexShrink:0}}>{"💡"}</span>
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Retention reminder */}
                      {quizResult.recommendation!=="renew"&&issuerPhone&&(
                        <div style={{padding:"10px 12px",borderRadius:8,background:"rgba(13,115,119,.05)",border:"1px solid rgba(13,115,119,.1)",marginBottom:12}}>
                          <div style={{fontSize:12,color:"var(--tx)",lineHeight:1.5}}>
                            {"📞 "}But first: Call {card.issuer} at <strong>{issuerPhone}</strong> to ask for a retention offer. Many cardholders get $150+ in credits just by asking.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={retakeQuiz}
                        style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--br2)",background:"var(--bg)",
                          cursor:"pointer",fontSize:12,fontWeight:600,color:"var(--tx2)",fontFamily:"'Inter',sans-serif"}}>
                        Retake Quiz
                      </button>
                      {quizResult.recommendation==="downgrade"&&downgrades.length>0&&(
                        <button onClick={()=>{setShowDowngrades(true);document.querySelector(".ra-selector")?.scrollIntoView({behavior:"smooth"});}}
                          style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"#2563eb",
                            cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Inter',sans-serif"}}>
                          View Downgrade Options
                        </button>
                      )}
                      {quizResult.recommendation==="cancel"&&(
                        <button onClick={()=>{setShowCancel(true);document.querySelector(".ra-selector")?.scrollIntoView({behavior:"smooth"});}}
                          style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"var(--red2)",
                            cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Inter',sans-serif"}}>
                          View If You Cancel
                        </button>
                      )}
                      {quizResult.recommendation==="renew"&&issuerPhone&&(
                        <button onClick={()=>{setShowRetention(true);document.querySelector(".ra-selector")?.scrollIntoView({behavior:"smooth"});}}
                          style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"var(--acc)",
                            cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Inter',sans-serif"}}>
                          View Retention Offers
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ── HOUSEHOLD TAB ────────────────────────────────────────────────────────── */
// Couples/household optimizer — lets user manage P1 + P2 wallets,
// detect redundant benefits, suggest optimizations, and show coverage map.
function HouseholdTab({myCards,p2Cards,setP2Cards,p2Name,setP2Name,householdSetup,setHouseholdSetup,checkedSet,user,onAuthClick,setTab,firstYearCards=[]}){
  const [addingP2,setAddingP2]=useState(false);
  const [p2Search,setP2Search]=useState("");

  // Resolve card objects
  const p1Cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);
  const p2Resolved=useMemo(()=>p2Cards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[p2Cards]);

  // Per-card stats helper — uses captured credits (checked-off benefits) to match Dashboard
  function cardStat(card){
    let totalVal=0;
    const isFirst=firstYearCards.includes(card.id);
    const allBens=[...card.annual.map(b=>({...b,isMonthly:false})),...card.monthly.map(b=>({...b,isMonthly:true}))];
    allBens.forEach(b=>{
      if(!b.v)return;
      if(b.requiresRenewal&&isFirst)return;
      const pk=periodKeys(card.id,b,b.isMonthly);
      if(pk) pk.forEach(p=>{if(checkedSet.has(p.key))totalVal+=b.v;});
      else if(checkedSet.has(benKey(card.id,b,b.isMonthly))) totalVal+=annualBenValue(b);
    });
    const roiPct=card.fee>0?Math.round((totalVal/card.fee)*100):null;
    const verdict=card.fee===0?null:roiPct>=100?"worth-it":roiPct>=50?"on-track":"at-risk";
    return {totalVal,roiPct,verdict};
  }

  // Household totals
  const p1Fees=useMemo(()=>p1Cards.reduce((s,c)=>s+c.fee,0),[p1Cards]);
  const p2Fees=useMemo(()=>p2Resolved.reduce((s,c)=>s+c.fee,0),[p2Resolved]);
  const p1Credits=useMemo(()=>p1Cards.reduce((s,c)=>s+cardStat(c).totalVal,0),[p1Cards,checkedSet,firstYearCards]);
  const p2Credits=useMemo(()=>p2Resolved.reduce((s,c)=>s+cardStat(c).totalVal,0),[p2Resolved,checkedSet,firstYearCards]);
  const hhFees=p1Fees+p2Fees;
  const hhCredits=p1Credits+p2Credits;
  const hhNet=hhCredits-hhFees;

  // ── Household Insights Detection ──
  const insights=useMemo(()=>{
    if(!p2Resolved.length)return[];
    const results=[];

    // Helper: collect all benefit names + hiddenPerk names for a card
    function allPerks(card){
      const names=[...card.annual,...card.monthly].map(b=>b.n);
      if(card.hiddenValue&&card.hiddenValue.hiddenPerks) card.hiddenValue.hiddenPerks.forEach(hp=>names.push(hp.perk));
      return names;
    }
    function matchesKeywords(perkNames,keywords){
      return perkNames.some(n=>keywords.some(kw=>n.toLowerCase().includes(kw.toLowerCase())));
    }

    // Grammar helpers for "You" vs partner name
    const pn=p2Name||"Partner";
    function pos(o){return o==="You"?"your":o+"'s";}
    function has(o){return o==="You"?"have":"has";}
    function they(o){return o==="You"?"you":"they";}
    function their(o){return o==="You"?"your":"their";}
    function They(o){return o==="You"?"You":"They";}

    // ── 1. ECOSYSTEM INSIGHTS ──
    Object.entries(ECOSYSTEM_MAP).forEach(([currency,eco])=>{
      const rule=POINT_SHARING_RULES[currency];
      if(!rule)return;
      const p1InEco=p1Cards.filter(c=>c.cur===currency);
      const p2InEco=p2Resolved.filter(c=>c.cur===currency);
      const ecoName=currency.split(" ")[0];
      const combineWord=rule.method.toLowerCase().includes("combine")?"combine":"share";
      const uplift=eco.valueUplift||"";
      const cashVal=uplift.split("→")[0]?.trim()||"1¢";
      const transferVal=uplift.split("→")[1]?.split("(")[0]?.trim()||"2-3¢";
      const earnerList=eco.earners.filter(n=>!eco.unlockers.includes(n));
      const freeEarnerName=earnerList[0]?earnerList[0].replace(/®|℠/g,"").replace(/Credit Card/,"").trim():"a free earner card";

      // ── Case C: Only one side has cards in this ecosystem ──
      if(p1InEco.length===0||p2InEco.length===0){
        const solo=p1InEco.length>0?p1InEco:p2InEco;
        const soloOwner=p1InEco.length>0?"You":pn;
        const otherOwner=p1InEco.length>0?pn:"You";
        if(solo.length===0)return;
        const soloUnlockers=solo.filter(c=>eco.unlockers.includes(c.name));
        const hasUnlocker=soloUnlockers.length>0;
        const onlyOneCard=solo.length===1;
        const isMR=currency==="Amex Membership Rewards";

        if(!rule.canShareHousehold){
          // Amex/Bilt — can't share, warn about point stranding
          let detail=`Unlike Chase, ${ecoName} does NOT let household members combine or transfer points between each other. ${pos(soloOwner)} ${currency} points are locked to ${their(soloOwner)} account.`;
          if(onlyOneCard&&isMR){
            detail+=` CRITICAL: If ${they(soloOwner)} cancel ${their(soloOwner)} ${solo[0]?.short||solo[0]?.name||"card"} without downgrading to a free Amex card (like EveryDay, $0/yr), ${they(soloOwner)} permanently lose ALL ${their(soloOwner)} Membership Rewards points.`;
          } else if(onlyOneCard){
            detail+=` If ${they(soloOwner)} cancel ${their(soloOwner)} only ${ecoName} card, ${they(soloOwner)} lose all accumulated ${ecoName} points.`;
          }
          detail+=` Since ${otherOwner} ${otherOwner==="You"?"don't":"doesn't"} have an ${ecoName} card, ${they(otherOwner)} can't be a backup — ${pos(soloOwner)} card (or a downgrade) is essential.`;
          results.push({color:"red",icon:"🔴",headline:`${ecoName} — Point Loss Risk`,detail,badge:"Warning",cards:solo});
        } else if(hasUnlocker){
          // Can share — note that other partner could add a free earner
          results.push({color:"teal",icon:"🟢",headline:`${ecoName} — ${soloOwner} Only`,
            detail:`Only ${soloOwner} ${has(soloOwner)} ${ecoName} cards. Since ${ecoName} lets household members ${combineWord} points, ${otherOwner} could add a free ${freeEarnerName} ($0/yr) and ${combineWord} those points via ${pos(soloOwner)} ${soloUnlockers[0]?.short||soloUnlockers[0]?.name||"card"} — boosting household earn with no extra annual fee.`,
            badge:"Tip",cards:solo});
        }
        return;
      }

      // Both sides have cards in this ecosystem
      const p1Unlockers=p1InEco.filter(c=>eco.unlockers.includes(c.name));
      const p2Unlockers=p2InEco.filter(c=>eco.unlockers.includes(c.name));
      const p1EarnOnly=p1InEco.filter(c=>eco.earners.includes(c.name)&&!eco.unlockers.includes(c.name));
      const p2EarnOnly=p2InEco.filter(c=>eco.earners.includes(c.name)&&!eco.unlockers.includes(c.name));

      if(rule.canShareHousehold){
        // ── Case A: Both have unlockers — redundancy ──
        if(p1Unlockers.length>0&&p2Unlockers.length>0){
          const allCards=[...p1Unlockers,...p2Unlockers];
          const cheapest=allCards.reduce((a,b)=>a.fee<=b.fee?a:b);
          const expensive=allCards.filter(c=>c.id!==cheapest.id);
          const savings=expensive.reduce((s,c)=>{
            const dg=c.downgradePaths&&c.downgradePaths[0];
            return s+(dg?c.fee-dg.annualFee:c.fee);
          },0);
          const keepOwner=p1Unlockers.includes(cheapest)?"You":pn;
          const dropOwner=p1Unlockers.includes(cheapest)?pn:"You";
          const expCard=expensive[0];
          const dg=expCard&&expCard.downgradePaths&&expCard.downgradePaths[0];
          const dgName=dg?dg.cardName:freeEarnerName;
          const dgFee=dg?dg.annualFee:0;
          let detail=`You only need ONE unlocker card between you to unlock transfer partners for ALL your household ${ecoName} points. ${ecoName} lets household members at the same address ${combineWord} points, so ${pos(dropOwner)} points flow to ${pos(keepOwner)} ${cheapest?.short||cheapest?.name||"card"} for transfer partner access at ${transferVal} each instead of ${cashVal} cash.`;
          detail+=` ${They(dropOwner)} can downgrade ${their(dropOwner)} ${expCard?.short||expCard?.name||"card"} to ${dgName} ($${dgFee}/yr) and save $${savings}/yr — ${they(dropOwner)}'ll still earn points and ${combineWord} them with ${pos(keepOwner)} account.`;
          detail+=` Just make sure at least one of you always keeps an unlocker card (${eco.unlockers.map(u=>u.replace(/®|℠/g,"").replace(/ Credit Card/,"").trim()).join(", ")}).`;
          results.push({color:"red",icon:"🔴",headline:`${ecoName} — Only Need One Unlocker`,detail,savings,badge:"Potential savings",cards:allCards});
        }
        // ── Case B: One unlocker + other has earners ──
        else if((p1Unlockers.length>0&&p2EarnOnly.length>0)||(p2Unlockers.length>0&&p1EarnOnly.length>0)){
          const unlockerOwner=p1Unlockers.length>0?"You":pn;
          const earnerOwner=p1EarnOnly.length>0?"You":pn;
          const unlockerCard=p1Unlockers.length>0?p1Unlockers[0]:p2Unlockers[0];
          const earnerCards=p1EarnOnly.length>0?p1EarnOnly:p2EarnOnly;
          const earnerNames=earnerCards.map(c=>c?.short||c?.name||"card").join(" and ");
          let detail=`${pos(unlockerOwner)} ${unlockerCard?.short||unlockerCard?.name||"card"} unlocks transfer partners for the entire household. ${pos(earnerOwner)} ${earnerNames} earn${earnerCards.length===1?"s":""} ${ecoName} points, and since ${ecoName} lets household members ${combineWord} points, those points flow to ${pos(unlockerOwner)} ${unlockerCard?.short||unlockerCard?.name||"card"} where they're worth ${transferVal} each instead of ${cashVal} cash.`;
          detail+=` Your current setup is already the sweet spot — one unlocker (${pos(unlockerOwner)} ${unlockerCard?.short||unlockerCard?.name||"card"} at $${unlockerCard?.fee||0}/yr) plus earner${earnerCards.length>1?"s":""} (${pos(earnerOwner)} ${earnerNames} at $${earnerCards.reduce((s,c)=>s+(c?.fee||0),0)}/yr). You don't need two unlocker cards.`;
          detail+=` Don't cancel ${pos(unlockerOwner)} ${unlockerCard?.short||unlockerCard?.name||"card"} unless ${earnerOwner} ${earnerOwner==="You"?"get your":"gets their"} own unlocker first, or ALL household ${ecoName} points drop to ${cashVal} cash.`;
          results.push({color:"teal",icon:"🟢",headline:`${ecoName} — Optimized`,detail,badge:"Optimized",cards:[...p1InEco,...p2InEco]});
        }
        // ── Case B variant: One unlocker only, other side has no eco earners ──
        else if((p1Unlockers.length>0&&p2EarnOnly.length===0&&p2Unlockers.length===0)||(p2Unlockers.length>0&&p1EarnOnly.length===0&&p1Unlockers.length===0)){
          const unlockerOwner=p1Unlockers.length>0?"You":pn;
          const otherOwner=p1Unlockers.length>0?pn:"You";
          const unlockerCard=p1Unlockers.length>0?p1Unlockers[0]:p2Unlockers[0];
          results.push({color:"teal",icon:"🟢",headline:`${ecoName} — ${unlockerOwner} Unlocks`,
            detail:`${pos(unlockerOwner)} ${unlockerCard?.short||unlockerCard?.name||"card"} unlocks ${ecoName} transfer partners. ${otherOwner} could add a free ${freeEarnerName} ($0/yr) and ${combineWord} those points through ${pos(unlockerOwner)} account for ${transferVal} per point value — no extra annual fee needed.`,
            badge:"Tip",cards:p1Unlockers.length>0?p1InEco:p2InEco});
        }
        // Add deadline warning if applicable
        if(rule.warning){
          results.push({color:"gold",icon:"⚠️",headline:`${ecoName} — Sharing Ending Soon`,
            detail:rule.warning+" "+rule.implication,
            badge:"Warning",cards:[...p1InEco,...p2InEco]});
        }
      } else {
        // ── Can't share — both have cards but points are siloed ──
        const isMR=currency==="Amex Membership Rewards";
        let detail=`Unlike Chase, ${ecoName} does NOT let household members combine or transfer points between each other. Each of you needs your own card to access transfer partners — dropping one means that person's points drop from ${transferVal} to ${cashVal} cash value.`;
        // Check if either side has only one MR card
        if(isMR){
          [["You",p1InEco],[pn,p2InEco]].forEach(([owner,cards])=>{
            if(cards.length===1){
              detail+=` CRITICAL: If ${they(owner)} cancel ${their(owner)} ${cards[0]?.short||cards[0]?.name||"card"} without downgrading to a free Amex card (like EveryDay, $0/yr), ${they(owner)} permanently lose ALL ${their(owner)} Membership Rewards points.`;
            }
          });
        }
        results.push({color:"red",icon:"🔴",headline:`${ecoName} — Can't Share Points`,detail,badge:"Warning",cards:[...p1InEco,...p2InEco]});
      }
    });

    // ── 2. HOTEL/AIRLINE STATUS INSIGHTS ──
    const hotelStatusMap={
      "Marriott":{keywords:["Marriott Gold","Gold Elite Status","Silver Elite","Platinum Elite","Titanium Elite"],
        tiers:{"Titanium Elite":5,"Platinum Elite":4,"Gold Elite":3,"Gold Elite Status":3,"Marriott Gold":3,"Silver Elite":2},
        sharing:"Marriott lets you pool points (100k/yr free transfer). Book stays under either name for that person's tier perks.",
        redundancyNote:"Hotel elite status is per-person and can't be shared — each person needs their own card for their own status. If you always travel together, only the higher-status card matters for room perks, but the lower-status card may still be worth keeping for free night certificates or point earning."},
      "Hilton":{keywords:["Diamond Status","Diamond","Hilton Diamond","Gold Status","Hilton Gold","Silver Status"],
        tiers:{"Diamond Status":4,"Hilton Diamond Status":4,"Diamond":4,"Gold Status":3,"Hilton Gold Elite":3,"Hilton Gold":3,"Silver Status":2},
        sharing:"Hilton lets you pool points with up to 10 members for free. Diamond benefits (breakfast, lounge, F&B credits) extend to guests in the room, so book under the Diamond member's name.",
        redundancyNote:"Hotel elite status is per-person. When traveling together, book under the Diamond member's name — Diamond breakfast, lounge access, and daily F&B credits extend to guests in the room."},
      "Hyatt":{keywords:["Globalist","Explorist Status","Discoverist Status","Discoverist"],
        tiers:{"Globalist":4,"Explorist Status":3,"Discoverist Status":2,"Discoverist":2},
        sharing:"Hyatt lets you combine points by submitting a signed form (plan ahead — not instant).",
        redundancyNote:"Hotel elite status is per-person. When traveling together, book under the higher-tier member's name for suite upgrades and club lounge access."}
    };
    Object.entries(hotelStatusMap).forEach(([chain,cfg])=>{
      function findStatus(cards){
        let best=null,bestTier=0,bestCard=null;
        cards.forEach(card=>{
          allPerks(card).forEach(p=>{
            Object.entries(cfg.tiers).forEach(([name,tier])=>{
              if(p.toLowerCase().includes(name.toLowerCase())&&tier>bestTier){bestTier=tier;best=name;bestCard=card;}
            });
          });
        });
        return {status:best,tier:bestTier,card:bestCard};
      }
      const p1Status=findStatus(p1Cards);
      const p2Status=findStatus(p2Resolved);
      if(p1Status.status&&p2Status.status){
        const higherOwner=p1Status.tier>=p2Status.tier?"You":pn;
        const higherStatus=p1Status.tier>=p2Status.tier?p1Status.status:p2Status.status;
        const lowerOwner=p1Status.tier>=p2Status.tier?pn:"You";
        const lowerStatus=p1Status.tier>=p2Status.tier?p2Status.status:p1Status.status;
        const higherCard=p1Status.tier>=p2Status.tier?p1Status.card:p2Status.card;
        const lowerCard=p1Status.tier>=p2Status.tier?p2Status.card:p1Status.card;
        const sameLevel=p1Status.tier===p2Status.tier;
        let detail=sameLevel
          ?`You both have ${chain} ${higherStatus} — yours from the ${p1Status.card?.short||p1Status.card?.name||"card"}, ${pn}'s from the ${p2Status.card?.short||p2Status.card?.name||"card"}. ${cfg.redundancyNote} ${cfg.sharing}`
          :`${higherOwner} ${has(higherOwner)} ${chain} ${higherStatus} (${higherCard?.short||higherCard?.name||"card"}), ${lowerOwner} ${has(lowerOwner)} ${chain} ${lowerStatus} (${lowerCard?.short||lowerCard?.name||"card"}). ${cfg.redundancyNote} ${cfg.sharing}`;
        results.push({color:"teal",icon:"🟢",headline:`${chain} Status — Both Covered`,detail,badge:"Optimized",
          cards:[p1Status.card,p2Status.card].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i)});
      }
    });

    // ── 3. LOUNGE ACCESS OVERLAP ──
    const loungeKw=["Priority Pass","Centurion Lounge","Capital One Lounge","Delta Sky Club","United Club","Admirals Club"];
    function findLounges(cards){
      const found=[];
      cards.forEach(card=>{
        const perks=allPerks(card);
        const matched=loungeKw.filter(kw=>perks.some(p=>p.toLowerCase().includes(kw.toLowerCase())));
        if(matched.length>0) found.push({card,lounges:matched});
      });
      return found;
    }
    const p1Lounges=findLounges(p1Cards);
    const p2Lounges=findLounges(p2Resolved);
    if(p1Lounges.length>0&&p2Lounges.length>0){
      const p1LoungeNames=new Set(p1Lounges.flatMap(l=>l.lounges));
      const p2LoungeNames=new Set(p2Lounges.flatMap(l=>l.lounges));
      const shared=[...p1LoungeNames].filter(l=>p2LoungeNames.has(l));
      if(shared.length>0){
        const p1Only=[...p1LoungeNames].filter(l=>!p2LoungeNames.has(l));
        const p2Only=[...p2LoungeNames].filter(l=>!p1LoungeNames.has(l));
        const p1CardNames=p1Lounges.map(l=>l.card?.short||l.card?.name||"card").join(", ");
        const p2CardNames=p2Lounges.map(l=>l.card?.short||l.card?.name||"card").join(", ");
        let detail=`You both have ${shared.join(" and ")} access — yours through ${p1CardNames}, ${pn}'s through ${p2CardNames}. Lounge access is per-cardholder, so this is useful when you travel separately — NOT redundant.`;
        if(p1Only.length>0) detail+=` You also get ${p1Only.join(", ")} which ${pn} doesn't have.`;
        if(p2Only.length>0) detail+=` ${pn} also gets ${p2Only.join(", ")} which you don't have.`;
        detail+=" If you always travel together, you could potentially drop one lounge card — but you'd lose coverage for solo trips.";
        results.push({color:"teal",icon:"🟢",headline:"Lounge Access — Both Covered",detail,badge:"Optimized",
          cards:[...p1Lounges.map(l=>l.card),...p2Lounges.map(l=>l.card)].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i)});
      }
    }

    // ── 4. INSURANCE OVERLAP ──
    const insuranceGroups={
      "Rental Car Insurance":{keywords:["Primary Car Rental","Secondary Car Rental","Primary CDW","rental vehicle","Rental Car Insurance","CDW coverage"],
        tip:"Rental car insurance follows the cardholder, NOT the household. Both having coverage means you're each covered when renting separately — this is NOT redundant. Only the cardholder's card provides coverage for their rental."},
      "Trip Delay / Cancellation":{keywords:["Trip Cancellation","Trip Delay","Trip Interruption","Baggage Delay","Trip/Cancel/Baggage"],
        tip:"Trip insurance covers the cardholder's trip when booked on that card. Both having it means both partners are protected when traveling separately — NOT redundant. You'd only have redundancy if you always travel together AND always book on the same card."}
    };
    Object.entries(insuranceGroups).forEach(([label,cfg])=>{
      const p1Has=p1Cards.some(c=>matchesKeywords(allPerks(c),cfg.keywords));
      const p2Has=p2Resolved.some(c=>matchesKeywords(allPerks(c),cfg.keywords));
      if(p1Has&&p2Has){
        const p1Match=p1Cards.filter(c=>matchesKeywords(allPerks(c),cfg.keywords));
        const p2Match=p2Resolved.filter(c=>matchesKeywords(allPerks(c),cfg.keywords));
        results.push({color:"teal",icon:"🟢",headline:`${label} — Both Covered`,detail:cfg.tip,badge:"Optimized",
          cards:[...p1Match,...p2Match].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i)});
      }
    });

    // ── 5. OVERLAPPING CREDITS (savings-bearing) ──
    const p1Bens=[],p2Bens=[];
    p1Cards.forEach(card=>{[...card.annual,...card.monthly].forEach(b=>p1Bens.push({name:b.n,card}));});
    p2Resolved.forEach(card=>{[...card.annual,...card.monthly].forEach(b=>p2Bens.push({name:b.n,card}));});
    Object.entries(OVERLAP_GROUPS).forEach(([gid,group])=>{
      if(["marriott-status","hilton-status","hyatt-status","rental-car-insurance","trip-delay-insurance"].includes(gid))return;
      const p1M=p1Bens.filter(b=>group.keywords.some(kw=>b.name.toLowerCase().includes(kw.toLowerCase())));
      const p2M=p2Bens.filter(b=>group.keywords.some(kw=>b.name.toLowerCase().includes(kw.toLowerCase())));
      if(p1M.length>0&&p2M.length>0){
        const allC=[...p1M.map(m=>m.card),...p2M.map(m=>m.card)].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i);
        if(group.savings){
          results.push({color:"gold",icon:"⚠️",headline:`Overlapping: ${group.label}`,detail:group.tip+" If you always travel/spend together, one of these credits may go unused.",savings:group.savings,badge:"Potential savings",cards:allC});
        }
      }
    });

    // Deduplicate by headline
    const seen=new Set();
    return results.filter(r=>{if(seen.has(r.headline))return false;seen.add(r.headline);return true;});
  },[myCards,p2Cards,p1Cards,p2Resolved,p2Name]);

  // ── Household Suggestions ──
  const suggestions=useMemo(()=>{
    if(!p2Resolved.length)return[];
    const suggs=[];
    const allHHCards=[...p1Cards,...p2Resolved];
    const allHHIds=new Set([...myCards,...p2Cards]);

    // Check for category gaps
    const catLabels={d:"Dining",g:"Groceries",gas:"Gas",t:"Travel",s:"Streaming",tr:"Rideshare"};
    Object.entries(catLabels).forEach(([catKey,catLabel])=>{
      // Find best card in household for this category
      let bestRate=0;
      allHHCards.forEach(c=>{
        if(c.earn&&c.earn[catKey]){
          const rate=parseFloat(String(c.earn[catKey]).replace(/[^0-9.]/g,""));
          if(rate>bestRate)bestRate=rate;
        }
      });
      if(bestRate<=1.5){
        // Gap — find the best card for this category that nobody owns
        const topCardId=(EARN_PRIORITY[catKey]||[])[0];
        if(topCardId&&!allHHIds.has(topCardId)){
          const topCard=CARDS.find(c=>c.id===topCardId);
          if(topCard){
            const topRate=topCard.earn&&topCard.earn[catKey]?topCard.earn[catKey]:"top";
            suggs.push({
              type:"gap",
              text:`Neither partner has a strong ${catLabel.toLowerCase()} card. The ${topCard?.short||topCard?.name||"card"} earns ${topRate}x on ${catLabel.toLowerCase()}.`,
              card:topCard
            });
          }
        }
      }
    });

    // Check for redundant ecosystems where one could downgrade
    insights.filter(r=>r.color==="red"&&r.savings).forEach(r=>{
      const card=r.cards&&r.cards[0];
      if(!card) return;
      const paths=card.downgradePaths;
      if(paths&&paths.length>0){
        const best=paths[0];
        const sharingRule=card.cur?POINT_SHARING_RULES[card.cur]:null;
        const sharingNote=sharingRule&&sharingRule.canShareHousehold
          ?` Points can still be ${sharingRule.method.toLowerCase().includes("combine")?"combined":"shared"} with your account for transfers.`
          :"";
        suggs.push({
          type:"downgrade",
          text:`${p2Name||"P2"} should downgrade their ${card?.short||card?.name||"card"} to ${best.cardName} — ${p2Name?"they":"P2"} save${p2Name?"s":""} $${card.fee-best.annualFee}/yr.${sharingNote}`,
          card:card||null
        });
      }
    });

    return suggs;
  },[p1Cards,p2Resolved,myCards,p2Cards,insights,p2Name]);

  // ── Coverage Map ──
  const coverageMap=useMemo(()=>{
    const cats=BASIC_CATS.filter(c=>c.id!=="o"); // skip "everything else"
    return cats.map(cat=>{
      let p1Best=null,p1Rate=0,p2Best=null,p2Rate=0;
      p1Cards.forEach(c=>{
        if(c.earn&&c.earn[cat.id]){
          const r=parseFloat(String(c.earn[cat.id]).replace(/[^0-9.]/g,""));
          if(r>p1Rate){p1Rate=r;p1Best=c;}
        }
      });
      p2Resolved.forEach(c=>{
        if(c.earn&&c.earn[cat.id]){
          const r=parseFloat(String(c.earn[cat.id]).replace(/[^0-9.]/g,""));
          if(r>p2Rate){p2Rate=r;p2Best=c;}
        }
      });
      const winner=p1Rate>=p2Rate?"p1":"p2";
      const gap=Math.max(p1Rate,p2Rate)<=1.5;
      return {cat,p1Best,p1Rate,p2Best,p2Rate,winner,gap};
    });
  },[p1Cards,p2Resolved]);

  // ── P2 card management ──
  function toggleP2Card(id){
    setP2Cards(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  }

  const filteredCards=useMemo(()=>{
    if(!p2Search.trim())return CARDS;
    const q=p2Search.toLowerCase();
    return CARDS.filter(c=>
      c.name.toLowerCase().includes(q)||
      (c.short&&c.short.toLowerCase().includes(q))||
      c.issuer.toLowerCase().includes(q)
    );
  },[p2Search]);

  // ── SETUP SCREEN ──
  if(!householdSetup){
    return (
      <div style={{padding:"16px 16px 0"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <h2 className="page-title" style={{textAlign:"center"}}>Household Optimizer</h2>
        </div>
        <div className="surf fu" style={{textAlign:"center",padding:"32px 20px"}}>
          <div style={{width:56,height:56,borderRadius:16,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <Icon name="users" size={28} color="var(--acc)"/>
          </div>
          <div style={{fontSize:18,fontWeight:700,color:"var(--tx)",fontFamily:"'Inter',sans-serif",marginBottom:8}}>Add your partner to optimize your household</div>
          <p style={{fontSize:13,color:"var(--tx3)",lineHeight:1.6,marginBottom:24,maxWidth:360,margin:"0 auto 24px"}}>
            See where you're double-paying for benefits, find coverage gaps, and figure out which cards each partner should carry.
          </p>
          <button onClick={()=>setHouseholdSetup(true)}
            className="btn" style={{width:"100%",maxWidth:320,marginBottom:12}}>
            I'll manage both wallets
          </button>
          <div style={{fontSize:11,color:"var(--tx3)",marginBottom:20}}>Manually add your partner's cards below</div>
          <button disabled style={{width:"100%",maxWidth:320,padding:"12px 20px",borderRadius:12,
            background:"var(--s3)",border:"1px solid var(--br2)",color:"var(--tx3)",
            fontSize:14,fontWeight:600,cursor:"not-allowed",opacity:0.5}}>
            Invite partner — Coming soon
          </button>
          <div style={{fontSize:10,color:"var(--tx4)",marginTop:6}}>Partner links their own FeeWorth account (V2)</div>
        </div>
      </div>
    );
  }

  // ── P2 CARD ADDING MODAL ──
  const p2Modal=addingP2&&(
    <div className="sheet-overlay" onClick={()=>{setAddingP2(false);setP2Search("");}}>
      <div className="sheet" onClick={e=>e.stopPropagation()} style={{maxWidth:500,padding:"20px 16px 40px",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:700,color:"var(--tx)",fontFamily:"'Inter',sans-serif"}}>{p2Name||"Partner"}'s Cards</div>
          <button onClick={()=>{setAddingP2(false);setP2Search("");}} style={{background:"none",border:"none",fontSize:22,color:"var(--tx3)",cursor:"pointer",padding:4,lineHeight:1}}>&times;</button>
        </div>
        <input type="text" placeholder="Search cards..." value={p2Search} onChange={e=>setP2Search(e.target.value)}
          style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--br2)",fontSize:14,
            background:"var(--s3)",color:"var(--tx)",marginBottom:12,outline:"none",boxSizing:"border-box"}}/>
        <div style={{flex:1,overflowY:"auto",margin:"0 -16px",padding:"0 16px"}}>
          {filteredCards.map(card=>{
            const inP2=p2Cards.includes(card.id);
            const palette=getIssuerPalette(card.issuer);
            return (
              <button key={card.id} onClick={()=>toggleP2Card(card.id)}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",
                  borderRadius:10,border:inP2?`2px solid ${palette.text}`:"1px solid var(--br)",
                  background:inP2?palette.tint:"var(--bg)",marginBottom:6,cursor:"pointer",textAlign:"left",
                  transition:"all .15s"}}>
                <div style={{width:36,height:22,borderRadius:5,background:`linear-gradient(135deg,${card.c1},${card.c2})`,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.12)"}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--tx)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.short||card.name}</div>
                  <div style={{fontSize:10,color:"var(--tx3)"}}>{card.issuer} · {card.fee===0?"No fee":"$"+card.fee+"/yr"}</div>
                </div>
                {inP2&&<Icon name="check" size={16} color={palette.text}/>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const verdictBadge=(verdict)=>{
    if(!verdict)return null;
    const cfg={
      "worth-it":{label:"Worth It",color:"var(--grn2)",bg:"rgba(22,163,74,.08)",tip:"Credits already exceed the annual fee"},
      "on-track":{label:"On Track",color:"var(--acc)",bg:"rgba(13,115,119,.08)",tip:"Earning back the annual fee at a healthy pace"},
      "at-risk":{label:"Behind",color:"var(--red2)",bg:"rgba(220,38,38,.08)",tip:"Credits captured haven\u2019t covered the fee yet"}
    }[verdict];
    return <span title={cfg.tip} style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,color:cfg.color,background:cfg.bg,cursor:"help"}}>{cfg.label}</span>;
  };

  // Card list renderer for P1 or P2
  const renderCardList=(cards,label)=>(
    <div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:"var(--tx3)",textTransform:"uppercase",marginBottom:8}}>{label==="You"?"Your":label+"'s"} Cards</div>
      {cards.length===0?(
        <div style={{padding:"16px 0",fontSize:12,color:"var(--tx3)",fontStyle:"italic"}}>No cards added yet.</div>
      ):cards.map(card=>{
        const stat=cardStat(card);
        const palette=getIssuerPalette(card.issuer);
        return (
          <div key={card.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,
            background:palette.tint,border:`1px solid ${palette.text}10`,marginBottom:6}}>
            <div style={{width:34,height:20,borderRadius:4,background:`linear-gradient(135deg,${card.c1},${card.c2})`,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.1)"}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:"var(--tx)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.short||card.name}</div>
              <div style={{fontSize:10,color:"var(--tx3)"}}>{card.fee===0?"Free":"$"+card.fee+"/yr"} · ${stat.totalVal.toLocaleString()} credits</div>
            </div>
            {verdictBadge(stat.verdict)}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{padding:"16px 16px 0"}}>
      {p2Modal}

      {/* Page header */}
      <div style={{textAlign:"center",marginBottom:24}}>
        <h2 className="page-title" style={{textAlign:"center"}}>Household Optimizer</h2>
      </div>

      {/* Partner name + manage */}
      <div className="surf fu" style={{marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}>
          <label style={{fontSize:10,fontWeight:700,letterSpacing:.8,color:"var(--tx3)",textTransform:"uppercase",marginBottom:4,display:"block"}}>Partner Name</label>
          <input type="text" value={p2Name} onChange={e=>setP2Name(e.target.value)} placeholder="e.g. Alex"
            style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid var(--br2)",fontSize:14,
              fontWeight:600,color:"var(--tx)",background:"var(--bg)",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={()=>setAddingP2(true)} className="btn" style={{flexShrink:0,padding:"10px 16px",fontSize:12}}>
          {p2Cards.length?`Edit Cards (${p2Cards.length})`:"Add Cards"}
        </button>
      </div>

      {/* ── Household Totals ── */}
      <div className="hh-stats-row" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        <div className="surf fu" style={{textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Total Fees</div>
          <div style={{fontSize:20,fontWeight:800,color:"var(--tx)",fontFamily:"'Source Code Pro',monospace"}}>${hhFees.toLocaleString()}</div>
          <div style={{fontSize:10,color:"var(--tx3)",marginTop:2}}>You ${p1Fees.toLocaleString()} · {p2Name||"P2"} ${p2Fees.toLocaleString()}</div>
        </div>
        <div className="surf fu" style={{textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Total Credits</div>
          <div style={{fontSize:20,fontWeight:800,color:"var(--grn2)",fontFamily:"'Source Code Pro',monospace"}}>${hhCredits.toLocaleString()}</div>
          <div style={{fontSize:10,color:"var(--tx3)",marginTop:2}}>You ${p1Credits.toLocaleString()} · {p2Name||"P2"} ${p2Credits.toLocaleString()}</div>
        </div>
        <div className="surf fu" style={{textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:"var(--tx3)",textTransform:"uppercase"}}>Net ROI</div>
          <div style={{fontSize:20,fontWeight:800,color:hhNet>=0?"var(--grn2)":"var(--red2)",fontFamily:"'Source Code Pro',monospace"}}>{hhNet>=0?"+":""}${hhNet.toLocaleString()}</div>
          <div style={{fontSize:10,color:"var(--tx3)",marginTop:2}}>You ${(p1Credits-p1Fees).toLocaleString()} · {p2Name||"P2"} ${(p2Credits-p2Fees).toLocaleString()}</div>
        </div>
      </div>

      {/* ── P1 / P2 Two-Column Layout ── */}
      <div className="hh-columns" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div className="surf fu">{renderCardList(p1Cards,"You")}</div>
        <div className="surf fu">{renderCardList(p2Resolved,p2Name||"Partner")}</div>
      </div>

      {/* ── Household Insights ── */}
      {p2Resolved.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(13,115,119,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:18}}>🏠</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:"var(--tx)",fontFamily:"'Inter',sans-serif"}}>Household Insights</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>
                {insights.length===0?"No overlaps detected":`${insights.length} insight${insights.length!==1?"s":""} found`}
              </div>
            </div>
          </div>
          {insights.length===0?(
            <div className="surf fu" style={{borderLeft:"3px solid var(--grn2)",background:"rgba(22,163,74,.03)"}}>
              <p style={{fontSize:12,color:"var(--grn2)",margin:0,lineHeight:1.6,fontWeight:600}}>
                ✅ Your household cards complement each other well — no overlaps or concerns detected.
              </p>
            </div>
          ):insights.map((ins,i)=>{
            const borderColor=ins.color==="red"?"#ef4444":ins.color==="teal"?"#0d7377":"#d97706";
            const bgTint=ins.color==="red"?"rgba(239,68,68,.03)":ins.color==="teal"?"rgba(13,115,119,.03)":"rgba(217,119,6,.04)";
            const badgeCfg=ins.badge==="Optimized"?{bg:"rgba(22,163,74,.08)",border:"rgba(22,163,74,.15)",color:"var(--grn2)",label:"🟢 Optimized"}
              :ins.badge==="Potential savings"?{bg:"rgba(217,119,6,.08)",border:"rgba(217,119,6,.15)",color:"#d97706",label:"🟡 Potential savings"}
              :ins.badge==="Warning"?{bg:"rgba(239,68,68,.08)",border:"rgba(239,68,68,.15)",color:"#ef4444",label:"🔴 Warning"}
              :ins.badge==="Tip"?{bg:"rgba(13,115,119,.08)",border:"rgba(13,115,119,.15)",color:"var(--acc)",label:"💡 Tip"}
              :null;
            return (
              <div key={i} className="surf fu" style={{marginBottom:8,borderLeft:`3px solid ${borderColor}`,background:bgTint}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
                  <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{ins.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>{ins.headline}</div>
                  </div>
                  {badgeCfg&&(
                    <span style={{flexShrink:0,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,background:badgeCfg.bg,border:`1px solid ${badgeCfg.border}`,color:badgeCfg.color,whiteSpace:"nowrap"}}>{badgeCfg.label}</span>
                  )}
                </div>
                <p style={{fontSize:12,color:"var(--tx2)",margin:"0 0 8px",lineHeight:1.6}}>{ins.detail}</p>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  {ins.savings&&typeof ins.savings==="number"&&(
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:"rgba(22,163,74,.08)",border:"1px solid rgba(22,163,74,.15)",color:"var(--grn2)",whiteSpace:"nowrap"}}>Save ${ins.savings}/yr</span>
                  )}
                  {ins.savings&&typeof ins.savings==="string"&&(
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:"rgba(22,163,74,.08)",border:"1px solid rgba(22,163,74,.15)",color:"var(--grn2)",whiteSpace:"nowrap"}}>{ins.savings}</span>
                  )}
                  {ins.cards&&ins.cards.length>0&&ins.cards.filter(Boolean).map(c=>{
                    const p=getIssuerPalette(c.issuer);
                    return <span key={c.id} style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:p.tint,color:p.text,border:`1px solid ${p.text}15`}}>{c?.short||c?.name||"Card"}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Household Suggestions ── */}
      {suggestions.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <Icon name="zap" size={16} color="var(--acc)"/>
            <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Recommendations</div>
          </div>
          {suggestions.map((s,i)=>{
            const applyUrl=s.card&&APPLY_URLS[s.card.id]&&!APPLY_URLS[s.card.id].startsWith("#")?APPLY_URLS[s.card.id]:null;
            return (
              <div key={i} className="surf fu" style={{marginBottom:8,borderLeft:"3px solid var(--acc)"}}>
                <p style={{fontSize:13,color:"var(--tx2)",margin:"0 0 8px",lineHeight:1.6}}>{s.text}</p>
                {s.card&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:applyUrl?10:0}}>
                    <div style={{width:30,height:18,borderRadius:4,background:`linear-gradient(135deg,${s.card.c1},${s.card.c2})`,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.1)"}}/>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--tx)"}}>{s.card?.short||s.card?.name||"Card"}</span>
                    <span style={{fontSize:10,color:"var(--tx3)"}}>{s.card?.fee===0?"No fee":"$"+(s.card?.fee||0)+"/yr"}</span>
                  </div>
                )}
                {applyUrl&&(
                  <div>
                    <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                      style={{display:"block",textAlign:"center",padding:"10px",borderRadius:10,textDecoration:"none",
                        background:"linear-gradient(135deg,var(--acc),var(--gld2))",color:"#fff",
                        fontSize:12,fontWeight:700,boxShadow:"0 2px 8px rgba(13,115,119,.25)"}}>
                      Apply Now →
                    </a>
                    <div className="apply-disclose" style={{textAlign:"center",marginTop:4}}>Affiliate link — we may earn a commission at no cost to you.</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Coverage Map ── */}
      {p2Resolved.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <Icon name="target" size={16} color="var(--acc)"/>
            <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>Coverage Map</div>
          </div>
          <div className="surf fu" style={{padding:"12px 10px",overflowX:"auto"}}>
            <table className="hh-coverage-table" style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left",padding:"8px",fontSize:13,fontWeight:700,letterSpacing:.5,color:"var(--tx2)",textTransform:"uppercase",borderBottom:"2px solid var(--br2)"}}>Category</th>
                  <th style={{textAlign:"center",padding:"8px",fontSize:13,fontWeight:700,letterSpacing:.5,color:"var(--tx2)",textTransform:"uppercase",borderBottom:"2px solid var(--br2)"}}>You</th>
                  <th style={{textAlign:"center",padding:"8px",fontSize:13,fontWeight:700,letterSpacing:.5,color:"var(--tx2)",textTransform:"uppercase",borderBottom:"2px solid var(--br2)"}}>{p2Name||"Partner"}</th>
                  <th style={{textAlign:"center",padding:"8px",fontSize:13,fontWeight:700,letterSpacing:.5,color:"var(--tx2)",textTransform:"uppercase",borderBottom:"2px solid var(--br2)"}}>Best</th>
                </tr>
              </thead>
              <tbody>
                {coverageMap.map(row=>(
                  <tr key={row.cat.id} style={{background:row.gap?"rgba(220,38,38,.03)":"transparent"}}>
                    <td style={{padding:"8px",fontSize:15,fontWeight:600,color:"var(--tx)",borderBottom:"1px solid var(--br)"}}>
                      {row.cat.label}
                      {row.gap&&<span style={{fontSize:10,fontWeight:700,color:"var(--red2)",marginLeft:6}}>GAP</span>}
                    </td>
                    <td style={{textAlign:"center",padding:"8px",borderBottom:"1px solid var(--br)"}}>
                      {row.p1Best?(
                        <div>
                          <div style={{fontSize:18,fontWeight:700,color:row.winner==="p1"?"var(--grn2)":"var(--tx2)"}}>{row.p1Rate}x</div>
                          <div style={{fontSize:13,fontWeight:500,color:"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{row.p1Best?.short||row.p1Best?.name||"Card"}</div>
                        </div>
                      ):<span style={{color:"var(--tx4)",fontSize:18}}>—</span>}
                    </td>
                    <td style={{textAlign:"center",padding:"8px",borderBottom:"1px solid var(--br)"}}>
                      {row.p2Best?(
                        <div>
                          <div style={{fontSize:18,fontWeight:700,color:row.winner==="p2"?"var(--grn2)":"var(--tx2)"}}>{row.p2Rate}x</div>
                          <div style={{fontSize:13,fontWeight:500,color:"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{row.p2Best?.short||row.p2Best?.name||"Card"}</div>
                        </div>
                      ):<span style={{color:"var(--tx4)",fontSize:18}}>—</span>}
                    </td>
                    <td style={{textAlign:"center",padding:"8px",borderBottom:"1px solid var(--br)"}}>
                      {row.gap?(
                        <span style={{fontSize:14,fontWeight:700,color:"var(--red2)"}}>None</span>
                      ):(
                        <span style={{fontSize:14,fontWeight:700,color:"var(--grn2)"}}>{row.winner==="p1"?"You":p2Name||"Partner"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Reset household ── */}
      <div style={{textAlign:"center",paddingBottom:16}}>
        <button onClick={()=>{if(confirm("Reset household? This will remove your partner's cards.")){setP2Cards([]);setP2Name("");setHouseholdSetup(false);}}}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"var(--tx4)",textDecoration:"underline"}}>
          Reset household setup
        </button>
      </div>
    </div>
  );
}

/* ── TIPS TAB ─────────────────────────────────────────────────────────────── */
// The tips and strategies screen. Shows curated advice for earning and redeeming points,
// grouped by category, with a beginner/advanced toggle and 'Start Here' section for newcomers.
// TIP_SECTIONS defines the navigation tabs within the Tips page.
// Each section groups tips by topic: Flights, Hotels, Stacking, and Other.
const TIP_SECTIONS=[
  {id:"flights",label:"Flights"},
  {id:"hotels",label:"Hotels"},
  {id:"stacking",label:"Stacking"},
  {id:"other",label:"Other"},
];

// TipsTab shows credit card tips and strategies, organized by section (Flights, Hotels, etc.).
// Tips are split into two groups: ones the user can use with their current cards,
// and ones that require cards they don't have yet (shown as locked/unlock-able).
// Each tip card expands to show details, related cards, transfer partners, and apply links.
// Props: myCards (array of card IDs in the user's wallet).
function TipsTab({myCards}){
  const [section,setSection]=useState("flights");
  const [openTip,setOpenTip]=useState(null);

  const sectionTips=TIPS_DB.filter(t=>t.section===section);

  const isUnlocked=tip=>{
    if(!tip.requiresCards||tip.requiresCards.length===0) return true;
    return tip.requiresCards.every(id=>myCards.includes(id));
  };

  const hasAnyRequired=tip=>{
    if(!tip.requiresCards||tip.requiresCards.length===0) return true;
    return tip.requiresCards.some(id=>myCards.includes(id));
  };

  const withYourCards=sectionTips.filter(t=>isUnlocked(t));
  const unlockTips=sectionTips.filter(t=>!isUnlocked(t));

  const getMissingCards=tip=>{
    if(!tip.requiresCards) return [];
    return tip.requiresCards
      .filter(id=>!myCards.includes(id))
      .map(id=>CARDS.find(c=>c.id===id))
      .filter(Boolean);
  };

  const getPartners=tip=>{
    const s=new Set();
    const cards=tip.requiresCards||[];
    cards.forEach(id=>{const c=CARDS.find(x=>x.id===id);if(c&&c.partners)c.partners.forEach(p=>s.add(p));});
    return [...s];
  };

  const LockIcon=()=>(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d7377" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );

  const renderTipCard=(tip,isLocked)=>{
    const isOpen=openTip===tip.id;
    const tipCards=(tip.requiresCards||[]).map(id=>CARDS.find(c=>c.id===id)).filter(Boolean);
    const partners=isOpen?getPartners(tip):[];
    const missing=isLocked?getMissingCards(tip):[];
    const firstMissing=missing[0];

    return (
      <div key={tip.id}
           className={"tip-card"+(isOpen?" open":"")+(isLocked?" tip-unlock":"")}
           onClick={()=>setOpenTip(isOpen?null:tip.id)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div className="tip-title">{tip.title}{tip.confidence==="estimated"&&<span style={{fontSize:10,color:"#9ca3af",fontStyle:"italic",fontWeight:400,marginLeft:4,fontFamily:"'Inter',sans-serif"}}>(unverified)</span>}</div>
          </div>
          <span style={{transition:"transform .2s",transform:isOpen?"rotate(90deg)":"none",flexShrink:0,marginTop:3,display:"inline-flex"}}>
            <Icon name="chevron-right" size={14} color="var(--tx3)"/>
          </span>
        </div>

        {isOpen&&(
          <div style={{marginTop:12,borderTop:"1px solid var(--br)",paddingTop:12}}>
            <div className="tip-body" style={{marginBottom:tipCards.length>0?14:0}} dangerouslySetInnerHTML={{__html:tip.body}}/>

            {tipCards.length>0&&(
              <div style={{marginBottom:partners.length>0?12:0}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>USE WITH</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {tipCards.map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(255,255,255,.05)",borderRadius:8,border:"1px solid var(--br)"}}>
                      <div style={{width:8,height:8,borderRadius:2,background:c.c1}}/>
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:600,color:myCards.includes(c.id)?"var(--tx)":"var(--tx3)"}}>{c.short}</span>
                      {myCards.includes(c.id)&&<Icon name="check" size={10} color="var(--grn2)"/>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {partners.length>0&&(
              <div style={{marginBottom:firstMissing?12:0}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>TRANSFER PARTNERS</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {partners.map(p=>(
                    <span key={p} style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:99,background:"rgba(117,91,6,.1)",color:"var(--acc)",border:"1px solid rgba(117,91,6,.2)"}}>{p}</span>
                  ))}
                </div>
              </div>
            )}

            {isLocked&&firstMissing&&(
              <div style={{padding:"10px 12px",background:"rgba(117,91,6,.06)",borderRadius:10,border:"1px dashed rgba(117,91,6,.2)"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"var(--tx2)",marginBottom:8}}>Add <strong style={{color:"var(--tx)"}}>{firstMissing.name}</strong> to unlock this strategy</div>
                <a href={APPLY_URLS[firstMissing.id]||"#apply-"+firstMissing.id} target="_blank"
                   onClick={e=>e.stopPropagation()}
                   style={{fontFamily:"'Inter',sans-serif",display:"inline-block",fontSize:11,fontWeight:700,color:"var(--acc)",background:"rgba(117,91,6,.1)",padding:"5px 12px",borderRadius:8,border:"1px solid rgba(117,91,6,.25)",textDecoration:"none"}}>
                  Apply for {firstMissing.short} →
                </a>
                <div className="apply-disclose">Affiliate link — we may earn a commission at no cost to you.</div>
              </div>
            )}
          </div>
        )}

        {isLocked&&!isOpen&&missing.length>0&&(
          <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
            {missing.map(c=>{
              const applyUrl=APPLY_URLS[c.id];
              return applyUrl&&!applyUrl.startsWith("#")?(
                <a key={c.id} href={applyUrl} target="_blank" rel="noopener noreferrer" className="tip-requires-chip"
                  onClick={e=>e.stopPropagation()} style={{textDecoration:"none",cursor:"pointer"}}>Requires: {c.short}</a>
              ):(
                <span key={c.id} className="tip-requires-chip">Requires: {c.short}</span>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <h2 className="page-title" style={{textAlign:"center"}}>Tips &amp; Strategies</h2>
      </div>

      {/* Section pills */}
      <div className="hscroll" style={{marginBottom:20,gap:8}}>
        {TIP_SECTIONS.map(s=>(
          <button key={s.id}
            className={"tip-section-pill "+(section===s.id?"active":"inactive")}
            onClick={()=>{setSection(s.id);setOpenTip(null);}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Subsection A — With Your Cards */}
      {withYourCards.length>0&&(
        <>
          <div className="tip-sub-label">WITH YOUR CARDS</div>
          <div className="tips-list">
            {withYourCards.map(t=>renderTipCard(t,false))}
          </div>
        </>
      )}

      {withYourCards.length===0&&myCards.length===0&&(
        <div style={{fontFamily:"'Inter',sans-serif",textAlign:"center",padding:"32px 16px",color:"#9ca3af",fontSize:14,fontStyle:"italic",lineHeight:1.6}}>
          Add cards to your wallet to see personalized tips.
        </div>
      )}

      {/* Subsection B — Unlock With New Cards */}
      {unlockTips.length>0&&(
        <>
          <div className="tip-sub-label">
            <LockIcon/> UNLOCK WITH NEW CARDS
          </div>
          <div className="tips-list">
            {unlockTips.map(t=>renderTipCard(t,true))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── PLAN TAB (Trip Planner) ──────────────────────────────────────────────── */
// PlanTab is a trip planning assistant. Users enter a destination and preferences,
// and the app generates wallet-aware point strategy recommendations.
// It matches destinations to regions, cross-references the user's card portfolio,
// and surfaces relevant transfer partners, point estimates, and card recommendations.
const HOTEL_BRANDS=["Any","Hyatt","Marriott","Hilton","IHG"];
const TRAVEL_CLASSES=["Economy","Business","First"];

function PlanTab({myCards}){
  const [savedTrips,setSavedTrips]=useLS(CS_CONFIG.LS_KEYS.savedTrips,[]);
  const [origin,setOrigin]=useState("");
  const [destination,setDestination]=useState("");
  const [tripType,setTripType]=useState("both");
  const [travelClass,setTravelClass]=useState("Business");
  const [hotelBrand,setHotelBrand]=useState("Any");
  const [travelers,setTravelers]=useState(1);
  const [results,setResults]=useState(null);
  const [openStrat,setOpenStrat]=useState(null);

  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);

  // Collect all transfer partners from user's wallet
  const walletPartners=useMemo(()=>{
    const s=new Set();
    cards.forEach(c=>{if(c.partners)c.partners.forEach(p=>s.add(p));});
    return s;
  },[cards]);

  // Match destination input to a region
  function matchRegion(input){
    const q=input.toLowerCase().trim();
    if(!q) return null;
    for(const[key,region] of Object.entries(DEST_REGIONS)){
      if(region.keywords.some(kw=>q.includes(kw))) return {...region,key};
    }
    // Fuzzy: check if any keyword starts with the query or vice-versa
    for(const[key,region] of Object.entries(DEST_REGIONS)){
      if(region.keywords.some(kw=>kw.startsWith(q)||q.startsWith(kw))) return {...region,key};
    }
    return null;
  }

  // Generate strategies from user's cards for a matched region
  function generateStrategies(region){
    const strategies=[];
    // Find which wallet cards have transfer partners relevant to this destination
    cards.forEach(card=>{
      if(!card.partners||!card.partners.length) return;
      const relevantPartners=card.partners.filter(p=>
        region.transferPartners.some(tp=>p.toLowerCase().includes(tp.toLowerCase())||tp.toLowerCase().includes(p.toLowerCase()))
      );
      if(!relevantPartners.length) return;

      // Build strategy per card with relevant partners
      const classKey=travelClass.toLowerCase();
      const est=region.estimates[classKey]||region.estimates.economy;
      const partnerMatch=relevantPartners.find(p=>est.partner.toLowerCase().includes(p.split(" ")[0].toLowerCase()));

      strategies.push({
        cardId:card.id,cardName:card.short||card.name,issuer:card.issuer,
        currency:card.cur,
        partners:relevantPartners,
        bestPartner:partnerMatch||relevantPartners[0],
        estimate:est,
        description:buildStratDescription(card,relevantPartners,region,travelClass)
      });
    });

    // Deduplicate by currency (group cards of same program)
    const byCurrency={};
    strategies.forEach(s=>{
      if(!byCurrency[s.currency]||s.partners.length>byCurrency[s.currency].partners.length){
        byCurrency[s.currency]=s;
      }
    });
    return Object.values(byCurrency);
  }

  function buildStratDescription(card,partners,region,cls){
    const partnerStr=partners.slice(0,3).join(", ");
    const classLabel=cls==="First"?"first class":cls==="Business"?"business class":"economy";
    const fromStr=origin?` from ${origin}`:"";
    if(tripType==="flights"||tripType==="both"){
      return `Transfer ${card.cur} to ${partnerStr} for ${classLabel} flights${fromStr} to ${region.name}. ${region.notes.split(".")[0]}.`;
    }
    return `Use ${card.cur} with ${partnerStr} for hotels in ${region.name}.`;
  }

  // Find card recommendations the user doesn't have
  function getRecommendations(region){
    const recs=[];
    // Cards with strong travel partners for this destination that user doesn't own
    const travelCards=CARDS.filter(c=>
      !myCards.includes(c.id)&&c.partners&&c.partners.length>0&&
      c.partners.some(p=>region.transferPartners.some(tp=>p.toLowerCase().includes(tp.toLowerCase())||tp.toLowerCase().includes(p.toLowerCase())))
    );
    // Score by relevance
    const scored=travelCards.map(c=>{
      const matchCount=c.partners.filter(p=>region.transferPartners.some(tp=>p.toLowerCase().includes(tp.toLowerCase())||tp.toLowerCase().includes(p.toLowerCase()))).length;
      let score=matchCount*10;
      // Boost premium cards for business/first
      if((travelClass==="Business"||travelClass==="First")&&c.fee>=450) score+=15;
      // Boost co-branded hotel cards if hotel preference matches
      if(hotelBrand!=="Any"&&c.name.toLowerCase().includes(hotelBrand.toLowerCase())) score+=20;
      return {...c,score,matchCount};
    }).sort((a,b)=>b.score-a.score);

    return scored.slice(0,3).map(c=>{
      const matchedPartners=c.partners.filter(p=>region.transferPartners.some(tp=>p.toLowerCase().includes(tp.toLowerCase())||tp.toLowerCase().includes(p.toLowerCase())));
      let why="";
      if(matchedPartners.length>0){
        why=`Transfers to ${matchedPartners.slice(0,2).join(" and ")} for ${region.name} routes.`;
      }
      if(c.fee===0) why+=" No annual fee.";
      else if(c.fee>=450) why+=" Premium lounge access and travel credits offset the fee.";
      return {card:c,why,matchedPartners};
    });
  }

  // Find relevant TIPS_DB entries
  function findRelevantTips(region){
    return TIPS_DB.filter(t=>{
      const body=(t.body+" "+t.title).toLowerCase();
      return region.keywords.some(kw=>body.includes(kw))||
        region.airlines.some(a=>body.includes(a.toLowerCase()))||
        (hotelBrand!=="Any"&&body.includes(hotelBrand.toLowerCase()));
    }).slice(0,4);
  }

  function handleSubmit(e){
    if(e) e.preventDefault();
    const region=matchRegion(destination);
    if(!region){
      setResults({region:null,strategies:[],recommendations:[],tips:[],estimates:null,fallback:true});
      return;
    }
    const strategies=generateStrategies(region);
    const recommendations=getRecommendations(region);
    const tips=findRelevantTips(region);
    setResults({region,strategies,recommendations,tips,estimates:region.estimates,fallback:false});

    // Save trip (max 3)
    const trip={origin,destination,tripType,travelClass,hotelBrand,travelers};
    const key=JSON.stringify(trip);
    setSavedTrips(prev=>{
      const filtered=prev.filter(t=>JSON.stringify(t)!==key);
      return [trip,...filtered].slice(0,3);
    });
  }

  function loadTrip(trip){
    setOrigin(trip.origin||"");
    setDestination(trip.destination);
    setTripType(trip.tripType);
    setTravelClass(trip.travelClass);
    setHotelBrand(trip.hotelBrand);
    setTravelers(trip.travelers);
    // Auto-run after state settles
    setTimeout(()=>{
      const region=matchRegion(trip.destination);
      if(!region){setResults({region:null,strategies:[],recommendations:[],tips:[],estimates:null,fallback:true});return;}
      const strategies=[];
      const walletCards=myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean);
      walletCards.forEach(card=>{
        if(!card.partners||!card.partners.length) return;
        const relevantPartners=card.partners.filter(p=>
          region.transferPartners.some(tp=>p.toLowerCase().includes(tp.toLowerCase())||tp.toLowerCase().includes(p.toLowerCase()))
        );
        if(!relevantPartners.length) return;
        const classKey=trip.travelClass.toLowerCase();
        const est=region.estimates[classKey]||region.estimates.economy;
        const partnerMatch=relevantPartners.find(p=>est.partner.toLowerCase().includes(p.split(" ")[0].toLowerCase()));
        strategies.push({
          cardId:card.id,cardName:card.short||card.name,issuer:card.issuer,
          currency:card.cur,partners:relevantPartners,bestPartner:partnerMatch||relevantPartners[0],
          estimate:est,description:`Transfer ${card.cur} to ${relevantPartners.slice(0,3).join(", ")} for ${trip.travelClass.toLowerCase()} flights${trip.origin?` from ${trip.origin}`:""} to ${region.name}.`
        });
      });
      const byCurrency={};
      strategies.forEach(s=>{if(!byCurrency[s.currency]||s.partners.length>byCurrency[s.currency].partners.length) byCurrency[s.currency]=s;});
      const recs=CARDS.filter(c=>!myCards.includes(c.id)&&c.partners&&c.partners.length>0&&
        c.partners.some(p=>region.transferPartners.some(tp=>p.toLowerCase().includes(tp.toLowerCase())||tp.toLowerCase().includes(p.toLowerCase())))
      ).slice(0,3).map(c=>({card:c,why:`Transfers to partners for ${region.name} routes.`,matchedPartners:c.partners.filter(p=>region.transferPartners.some(tp=>p.toLowerCase().includes(tp.toLowerCase())))}));
      const tips=TIPS_DB.filter(t=>{const b=(t.body+" "+t.title).toLowerCase();return region.keywords.some(kw=>b.includes(kw));}).slice(0,4);
      setResults({region,strategies:Object.values(byCurrency),recommendations:recs,tips,estimates:region.estimates,fallback:false});
    },50);
  }

  function removeTrip(idx,e){
    e.stopPropagation();
    setSavedTrips(prev=>prev.filter((_,i)=>i!==idx));
  }

  // SVG icons used in the form
  const FlightIcon=({size=16,color="currentColor"})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C20.3 6.7 21 5.5 21 5c0-1-1-2-2-2-.5 0-1.7.7-2.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5L2 9l6.5 3L6 14.5 3.5 14 2 15.5 4.5 17l1.5 2.5L7.5 18 7 15.5 9.5 13l3 6.5 2.3-1.5c.4-.3.6-.8.5-1.3z"/>
    </svg>
  );
  const HotelIcon=({size=16,color="currentColor"})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14"/><path d="M3 11h18"/><path d="M9 21V15h6v6"/>
    </svg>
  );

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{padding:"16px 16px 0",maxWidth:720,margin:"0 auto"}}>
      {/* Page header */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <h2 className="page-title" style={{textAlign:"center"}}>Plan Your Trip</h2>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#6b7280",margin:"8px 0 0",lineHeight:1.5}}>Enter your destination and we'll show you how to get there with points</p>
      </div>

      {/* Saved trips */}
      {savedTrips.length>0&&!results&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:"var(--tx3)",textTransform:"uppercase",marginBottom:8,fontFamily:"'Inter',sans-serif"}}>RECENT TRIPS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {savedTrips.map((trip,i)=>(
              <button key={i} onClick={()=>loadTrip(trip)}
                style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:99,
                  background:"var(--gld3)",border:"1px solid rgba(13,115,119,.2)",cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx)"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {trip.origin?`${trip.origin} → ${trip.destination}`:trip.destination}
                <span style={{color:"var(--tx3)",fontWeight:400}}>· {trip.travelClass} · {trip.tripType==="flights"?"Flights":trip.tripType==="hotels"?"Hotels":"Both"}</span>
                <span onClick={e=>removeTrip(i,e)} style={{marginLeft:2,color:"var(--tx3)",cursor:"pointer",lineHeight:1}} title="Remove">&times;</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── FORM ── */}
      <form onSubmit={handleSubmit}>
        <div className="surf fu" style={{padding:20,marginBottom:16}}>
          {/* Origin */}
          <div style={{marginBottom:16}}>
            <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx)",display:"block",marginBottom:6}}>Origin</label>
            <input type="text" value={origin} onChange={e=>setOrigin(e.target.value)}
              placeholder="Flying from... (e.g. New York, Chicago, Los Angeles)"
              required
              style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--br2)",
                fontFamily:"'Inter',sans-serif",fontSize:14,color:"var(--tx)",background:"var(--bg)",
                outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor="var(--acc)"}
              onBlur={e=>e.target.style.borderColor="var(--br2)"}/>
          </div>

          {/* Destination */}
          <div style={{marginBottom:16}}>
            <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx)",display:"block",marginBottom:6}}>Destination</label>
            <input type="text" value={destination} onChange={e=>setDestination(e.target.value)}
              placeholder="City, country, or region (e.g. Tokyo, Amalfi Coast)"
              required
              style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--br2)",
                fontFamily:"'Inter',sans-serif",fontSize:14,color:"var(--tx)",background:"var(--bg)",
                outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor="var(--acc)"}
              onBlur={e=>e.target.style.borderColor="var(--br2)"}/>
          </div>

          {/* Trip type pills */}
          <div style={{marginBottom:16}}>
            <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx)",display:"block",marginBottom:6}}>Trip Type</label>
            <div style={{display:"flex",gap:6}}>
              {[{id:"flights",label:"Flights",Ic:FlightIcon},{id:"hotels",label:"Hotels",Ic:HotelIcon},{id:"both",label:"Both",Ic:null}].map(opt=>(
                <button key={opt.id} type="button" onClick={()=>setTripType(opt.id)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                    padding:"8px 12px",borderRadius:10,border:tripType===opt.id?"1.5px solid var(--acc)":"1.5px solid var(--br2)",
                    background:tripType===opt.id?"var(--gld3)":"var(--bg)",cursor:"pointer",
                    fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:tripType===opt.id?600:400,
                    color:tripType===opt.id?"var(--acc)":"var(--tx2)",transition:"all .15s"}}>
                  {opt.Ic&&<opt.Ic size={14} color={tripType===opt.id?"var(--acc)":"var(--tx3)"}/>}
                  {opt.id==="both"&&<><FlightIcon size={14} color={tripType===opt.id?"var(--acc)":"var(--tx3)"}/><span style={{margin:"0 -2px"}}>+</span><HotelIcon size={14} color={tripType===opt.id?"var(--acc)":"var(--tx3)"}/></>}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Travel class (shown for flights/both) */}
          {(tripType==="flights"||tripType==="both")&&(
            <div style={{marginBottom:16}}>
              <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx)",display:"block",marginBottom:6}}>Travel Class</label>
              <div style={{display:"flex",gap:6}}>
                {TRAVEL_CLASSES.map(cls=>(
                  <button key={cls} type="button" onClick={()=>setTravelClass(cls)}
                    style={{flex:1,padding:"8px 12px",borderRadius:10,
                      border:travelClass===cls?"1.5px solid var(--acc)":"1.5px solid var(--br2)",
                      background:travelClass===cls?"var(--gld3)":"var(--bg)",cursor:"pointer",
                      fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:travelClass===cls?600:400,
                      color:travelClass===cls?"var(--acc)":"var(--tx2)",transition:"all .15s"}}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hotel brand (shown for hotels/both) */}
          {(tripType==="hotels"||tripType==="both")&&(
            <div style={{marginBottom:16}}>
              <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx)",display:"block",marginBottom:6}}>Preferred Hotel Brand</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {HOTEL_BRANDS.map(brand=>(
                  <button key={brand} type="button" onClick={()=>setHotelBrand(brand)}
                    style={{padding:"6px 14px",borderRadius:10,
                      border:hotelBrand===brand?"1.5px solid var(--acc)":"1.5px solid var(--br2)",
                      background:hotelBrand===brand?"var(--gld3)":"var(--bg)",cursor:"pointer",
                      fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:hotelBrand===brand?600:400,
                      color:hotelBrand===brand?"var(--acc)":"var(--tx2)",transition:"all .15s"}}>
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Travelers stepper */}
          <div style={{marginBottom:16}}>
            <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx)",display:"block",marginBottom:6}}>Travelers</label>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button type="button" onClick={()=>setTravelers(Math.max(1,travelers-1))}
                style={{width:34,height:34,borderRadius:10,border:"1.5px solid var(--br2)",background:"var(--bg)",
                  cursor:"pointer",fontSize:18,color:"var(--tx2)",display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'Inter',sans-serif",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--acc)";e.currentTarget.style.color="var(--acc)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--br2)";e.currentTarget.style.color="var(--tx2)";}}>
                -
              </button>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:700,color:"var(--tx)",minWidth:24,textAlign:"center"}}>{travelers}</span>
              <button type="button" onClick={()=>setTravelers(Math.min(6,travelers+1))}
                style={{width:34,height:34,borderRadius:10,border:"1.5px solid var(--br2)",background:"var(--bg)",
                  cursor:"pointer",fontSize:18,color:"var(--tx2)",display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'Inter',sans-serif",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--acc)";e.currentTarget.style.color="var(--acc)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--br2)";e.currentTarget.style.color="var(--tx2)";}}>
                +
              </button>
              {travelers>1&&<span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"var(--tx3)"}}>Point estimates multiply by {travelers}</span>}
            </div>
          </div>

          {/* Submit */}
          <button type="submit"
            style={{width:"100%",padding:"12px 24px",borderRadius:12,border:"none",
              background:"linear-gradient(135deg,var(--acc),var(--gld2))",color:"#fff",
              fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer",
              letterSpacing:.3,transition:"all .2s",boxShadow:"0 2px 8px rgba(13,115,119,.25)"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(13,115,119,.35)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(13,115,119,.25)"}>
            Find Strategies
          </button>
        </div>
      </form>

      {/* ── RESULTS ── */}
      {results&&(
        <div style={{marginTop:8}}>
          {/* Back / edit button */}
          <button onClick={()=>setResults(null)}
            style={{display:"inline-flex",alignItems:"center",gap:5,marginBottom:16,padding:"6px 12px",
              borderRadius:8,border:"1px solid var(--br2)",background:"var(--bg)",cursor:"pointer",
              fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"var(--tx2)"}}>
            <Icon name="chevron-right" size={12} color="var(--tx3)" style={{transform:"rotate(180deg)"}}/> Edit Trip
          </button>

          {results.fallback?(
            <div className="surf fu" style={{padding:24,textAlign:"center"}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:600,color:"var(--tx)",marginBottom:8}}>Region Not Found</div>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"var(--tx2)",lineHeight:1.6,margin:0}}>
                We couldn't match "{destination}" to a specific region. Try a city name like "Tokyo", "Paris", or "Cancun".
                <br/><br/>Supported regions: Japan, Europe, UK, Caribbean, Mexico, Hawaii, Southeast Asia, Middle East, South Pacific, South America, Africa, India, South Korea.
              </p>
            </div>
          ):(
            <>
              {/* Region header */}
              <div style={{marginBottom:20,padding:"16px 20px",borderRadius:14,
                background:"linear-gradient(135deg,rgba(13,115,119,.06),rgba(13,115,119,.02))",
                border:"1px solid rgba(13,115,119,.12)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:700,color:"var(--tx)"}}>{results.region.display}</span>
                </div>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"var(--tx2)",margin:0,lineHeight:1.5}}>{results.region.notes}</p>
              </div>

              {/* Section 1 — With Your Cards */}
              {results.strategies.length>0?(
                <div style={{marginBottom:24}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,color:"var(--grn2)",textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                    <Icon name="check" size={12} color="var(--grn2)"/> WITH YOUR CARDS
                  </div>
                  {results.strategies.map((strat,i)=>{
                    const isOpen=openStrat===strat.cardId;
                    const palette=getIssuerPalette(strat.issuer);
                    return (
                      <div key={strat.cardId} className="surf fu"
                        style={{marginBottom:10,padding:16,borderLeft:`3px solid ${palette.text}`,cursor:"pointer"}}
                        onClick={()=>setOpenStrat(isOpen?null:strat.cardId)}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                              <span style={{fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:700,color:"var(--tx)"}}>{strat.currency}</span>
                              <span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,
                                background:palette.tint,color:palette.text}}>{strat.issuer}</span>
                            </div>
                            <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"var(--tx2)",margin:0,lineHeight:1.5}}>{strat.description}</p>
                          </div>
                          <span style={{flexShrink:0,transition:"transform .15s",transform:isOpen?"rotate(90deg)":"none",marginTop:4,display:"inline-flex"}}>
                            <Icon name="chevron-right" size={14} color="var(--tx3)"/>
                          </span>
                        </div>

                        {/* Points estimate */}
                        <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"var(--acc)",fontWeight:700}}>
                            ~{strat.estimate.pts} pts{travelers>1?` × ${travelers}`:""}</span>
                          <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"var(--tx3)"}}>
                            via {strat.bestPartner}</span>
                          <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"var(--grn2)",fontWeight:600}}>
                            ~{strat.estimate.cash} saved vs cash</span>
                        </div>

                        {isOpen&&(
                          <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--br)"}}>
                            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>HOW TO DO THIS</div>
                            <ol style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"var(--tx2)",lineHeight:1.7,margin:0,paddingLeft:18}}>
                              <li>Search for award availability on the airline's website for your dates</li>
                              <li>Transfer {strat.currency} to <strong>{strat.bestPartner}</strong> (usually 1:1 ratio, instant or 1-2 days)</li>
                              <li>Book through {strat.bestPartner}'s website or call center</li>
                              {travelers>1&&<li>Transfer additional points for {travelers-1} more traveler(s) — {strat.estimate.pts} each</li>}
                              <li>Use remaining {strat.issuer} cards for trip purchases to earn bonus points</li>
                            </ol>
                            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                              {strat.partners.map(p=>(
                                <span key={p} style={{fontFamily:"'Inter',sans-serif",fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:99,
                                  background:"rgba(13,115,119,.08)",color:"var(--acc)",border:"1px solid rgba(13,115,119,.15)"}}>{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ):(
                <div className="surf fu" style={{padding:20,marginBottom:24,textAlign:"center"}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"var(--tx3)"}}>
                    {myCards.length===0?"Add cards to your wallet to see personalized strategies.":"Your current cards don't have direct transfer partners for this destination. See card recommendations below."}
                  </div>
                </div>
              )}

              {/* Section 2 — Unlock With These Cards */}
              {results.recommendations.length>0&&(
                <div style={{marginBottom:24}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,color:"var(--acc)",textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg> UNLOCK WITH THESE CARDS
                  </div>
                  {results.recommendations.map(rec=>{
                    const palette=getIssuerPalette(rec.card.issuer);
                    return (
                      <div key={rec.card.id} className="surf fu" style={{marginBottom:10,padding:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                          <CreditCardDisplay card={rec.card} size="xs"/>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,color:palette.text}}>{rec.card.short||rec.card.name}</div>
                            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"var(--tx3)"}}>{rec.card.issuer} · ${rec.card.fee}/yr</div>
                          </div>
                        </div>
                        <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"var(--tx2)",margin:"0 0 8px",lineHeight:1.5}}>{rec.why}</p>
                        <a href={APPLY_URLS[rec.card.id]||"#apply-"+rec.card.id} target="_blank" rel="noopener noreferrer"
                          onClick={e=>e.stopPropagation()}
                          style={{fontFamily:"'Inter',sans-serif",display:"inline-block",fontSize:11,fontWeight:700,color:"var(--acc)",
                            background:"rgba(13,115,119,.08)",padding:"5px 14px",borderRadius:8,
                            border:"1px solid rgba(13,115,119,.2)",textDecoration:"none"}}>
                          Apply for {rec.card.short} →
                        </a>
                        <div className="apply-disclose">Affiliate link — we may earn a commission at no cost to you.</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Section 3 — Point Estimates */}
              {results.estimates&&(
                <div style={{marginBottom:24}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,color:"var(--tx3)",textTransform:"uppercase",marginBottom:12}}>POINT ESTIMATES</div>
                  <div className="surf fu" style={{padding:0,overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Inter',sans-serif",fontSize:12}}>
                      <thead>
                        <tr style={{background:"var(--s3)"}}>
                          <th style={{textAlign:"left",padding:"10px 14px",fontWeight:700,color:"var(--tx)",fontSize:11}}>Option</th>
                          <th style={{textAlign:"left",padding:"10px 14px",fontWeight:700,color:"var(--tx)",fontSize:11}}>Points{travelers>1?` (×${travelers})`:""}</th>
                          <th style={{textAlign:"left",padding:"10px 14px",fontWeight:700,color:"var(--tx)",fontSize:11}}>Via</th>
                          <th style={{textAlign:"left",padding:"10px 14px",fontWeight:700,color:"var(--tx)",fontSize:11}}>Cash Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tripType==="flights"||tripType==="both")&&(
                          <>
                            <tr style={{borderTop:"1px solid var(--br)"}}>
                              <td style={{padding:"8px 14px",color:"var(--tx2)"}}>Economy RT</td>
                              <td style={{padding:"8px 14px",color:"var(--acc)",fontWeight:600}}>{results.estimates.economy.pts}</td>
                              <td style={{padding:"8px 14px",color:"var(--tx3)"}}>{results.estimates.economy.partner}</td>
                              <td style={{padding:"8px 14px",color:"var(--grn2)",fontWeight:600}}>~{results.estimates.economy.cash}</td>
                            </tr>
                            <tr style={{borderTop:"1px solid var(--br)"}}>
                              <td style={{padding:"8px 14px",color:"var(--tx2)"}}>Business RT</td>
                              <td style={{padding:"8px 14px",color:"var(--acc)",fontWeight:600}}>{results.estimates.business.pts}</td>
                              <td style={{padding:"8px 14px",color:"var(--tx3)"}}>{results.estimates.business.partner}</td>
                              <td style={{padding:"8px 14px",color:"var(--grn2)",fontWeight:600}}>~{results.estimates.business.cash}</td>
                            </tr>
                            {results.estimates.first.pts!=="N/A"&&(
                              <tr style={{borderTop:"1px solid var(--br)"}}>
                                <td style={{padding:"8px 14px",color:"var(--tx2)"}}>First RT</td>
                                <td style={{padding:"8px 14px",color:"var(--acc)",fontWeight:600}}>{results.estimates.first.pts}</td>
                                <td style={{padding:"8px 14px",color:"var(--tx3)"}}>{results.estimates.first.partner}</td>
                                <td style={{padding:"8px 14px",color:"var(--grn2)",fontWeight:600}}>~{results.estimates.first.cash}</td>
                              </tr>
                            )}
                          </>
                        )}
                        {(tripType==="hotels"||tripType==="both")&&(
                          <tr style={{borderTop:"1px solid var(--br)"}}>
                            <td style={{padding:"8px 14px",color:"var(--tx2)"}}>Hotel (5 nights)</td>
                            <td style={{padding:"8px 14px",color:"var(--acc)",fontWeight:600}}>{results.estimates.hotel5.pts}</td>
                            <td style={{padding:"8px 14px",color:"var(--tx3)"}}>{results.estimates.hotel5.partner}</td>
                            <td style={{padding:"8px 14px",color:"var(--grn2)",fontWeight:600}}>~{results.estimates.hotel5.cash}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div style={{padding:"8px 14px",fontSize:10,color:"var(--tx3)",fontStyle:"italic",borderTop:"1px solid var(--br)"}}>
                      Estimates are approximate one-way per person for flights. Actual costs vary by date and availability.
                    </div>
                  </div>
                </div>
              )}

              {/* Related tips */}
              {results.tips.length>0&&(
                <div style={{marginBottom:24}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,color:"var(--tx3)",textTransform:"uppercase",marginBottom:12}}>RELATED TIPS</div>
                  {results.tips.map(tip=>(
                    <div key={tip.id} className="surf fu" style={{marginBottom:8,padding:14}}>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,color:"var(--tx)",marginBottom:4}}>{tip.title}</div>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"var(--tx2)",lineHeight:1.5,
                        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}
                        dangerouslySetInnerHTML={{__html:tip.body}}/>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── USE CARD TAB ─────────────────────────────────────────────────────────── */
// The 'which card to use' guide. For each spending category (dining, groceries, gas, etc.),
// shows which of your cards earns the most points, ranked from best to worst.
// UsecardTab is the "Optimizer Guide" that tells users which card to pull at the register.
// It has four modes: Basic (everyday categories), Specialty (airline/hotel cards),
// Rotating (quarterly bonus categories), and Merchant (search by store name).
// For each category or merchant, it shows the top 1-3 cards ranked by earn rate.
// Props: myCards (array of card IDs in the user's wallet).
function UsecardTab({myCards}){
  const [mode,setMode]=useState("basic");
  const [selCat,setSelCat]=useState(null);
  const [showNote,setShowNote]=useState(null);
  const [merchant,setMerchant]=useState("");
  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);

  // getBestForCat finds the best cards in the user's wallet for a given spending category.
  // It checks the global EARN_PRIORITY list, filters to wallet cards, and returns the top 3.
  // Returns an array of {card, rate} objects. Falls back to the user's first 2 cards if none match.
  function getBestForCat(catId){
    const priority=EARN_PRIORITY[catId]||[];
    const inWallet=priority.filter(id=>myCards.includes(id));
    const results=inWallet.slice(0,3).map(id=>{
      const c=CARDS.find(x=>x.id===id);
      return c?{card:c,rate:(c.earn&&c.earn[catId])||"1x"}:null;
    }).filter(Boolean);
    if(!results.length&&cards.length){
      return cards.slice(0,2).map(c=>({card:c,rate:(c.earn&&c.earn[catId])||"1x"}));
    }
    return results;
  }

  // merchantResults uses the search text to guess which spending category a merchant falls into
  // (e.g., typing "Starbucks" maps to dining, "Shell" maps to gas) and then finds the best cards.
  const merchantResults=useMemo(()=>{
    if(merchant.trim().length<2)return[];
    const q=merchant.toLowerCase();
    const hints={
      grocery:["g"],grocer:["g"],supermarket:["g"],safeway:["g"],kroger:["g"],"whole foods":["g"],"trader joe":["g"],walmart:["g"],target:["g"],costco:["g"],
      restaurant:["d"],dining:["d"],cafe:["d"],coffee:["d"],starbucks:["d"],chipotle:["d"],mcdonald:["d"],pizza:["d"],sushi:["d"],burger:["d"],taco:["d"],
      gas:["gas"],shell:["gas"],chevron:["gas"],bp:["gas"],exxon:["gas"],mobil:["gas"],
      uber:["tr","d"],lyft:["tr"],
      amazon:["a"],
      pharmacy:["p"],cvs:["p"],walgreens:["p"],
      airline:["t"],flight:["t"],hotel:["t"],airbnb:["t"],marriott:["t"],hilton:["t"],hyatt:["t"],
      streaming:["s"],netflix:["s"],hulu:["s"],spotify:["s"],disney:["s"],
    };
    let bestCats=["o"];
    for(const[kw,cats] of Object.entries(hints)){
      if(q.includes(kw)){bestCats=cats;break;}
    }
    return bestCats.flatMap(cid=>getBestForCat(cid));
  },[merchant,myCards]);

  // MODE_TABS defines the four sub-tabs within the Use Card page.
  // Each has an id, a short label, and a subtitle description.
  const MODE_TABS=[
    {id:"basic",l:"Basic",s:"Everyday categories"},
    {id:"specialty",l:"Specialty",s:"Airline & hotel cards"},
    {id:"rotating",l:"Rotating",s:"Q1 2026 bonuses"},
    {id:"merchant",l:"Merchant",s:"Specific stores"},
  ];

  if(!myCards.length){
    return <div style={{padding:40,textAlign:"center",color:"var(--tx3)"}}>Add cards to get recommendations.</div>;
  }

  return (
    <div style={{padding:"16px 16px 0"}}>
      {/* Page header */}
      <div style={{marginBottom:24}}>
        <h2 className="page-title">Optimizer Guide</h2>
        <p className="page-subtitle">Which card to pull at the register for maximum rewards.</p>
      </div>
      {/* Mode toggle */}
      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
        {MODE_TABS.map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);setSelCat(null);}}
            style={{flexShrink:0,padding:"9px 14px",borderRadius:12,border:"1.5px solid",
              borderColor:mode===m.id?"var(--acc)":"var(--br2)",
              background:mode===m.id?"rgba(99,102,241,.12)":"rgba(255,255,255,.03)",
              cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:12,fontWeight:700,color:mode===m.id?"var(--tx)":"var(--tx3)",whiteSpace:"nowrap"}}>{m.l}</div>
            <div style={{fontSize:9,color:mode===m.id?"var(--acc2)":"var(--tx4)",whiteSpace:"nowrap"}}>{m.s}</div>
          </button>
        ))}
      </div>

      {/* ── BASIC ── */}
      {mode==="basic"&&(
        <div>
          <div className="cat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
            {BASIC_CATS.map(cat=>(
              <div key={cat.id} className={"cat-tile"+(selCat===cat.id?" sel":"")}
                style={{borderColor:selCat===cat.id?cat.color:"var(--br)"}}
                onClick={()=>{setSelCat(selCat===cat.id?null:cat.id);setShowNote(null);}}>
                <Icon name={SPEND_CAT_ICON[cat.id]||"credit-card"} size={22} color={cat.color}/>
                <div style={{fontSize:11,fontWeight:700,color:"var(--tx)",textAlign:"center"}}>{cat.label}</div>
                <div style={{fontSize:9,color:"var(--tx3)",textAlign:"center"}}>{cat.sub}</div>
              </div>
            ))}
          </div>
          {selCat&&(()=>{
            const cat=BASIC_CATS.find(c=>c.id===selCat);
            const results=getBestForCat(selCat);
            // Find cards in wallet with portal earn data for this category
            const portalCards=selCat==="t"?results.filter(({card})=>card.portalEarn):[];
            return (
              <div className="surf fu" style={{borderColor:cat.color+"44"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>Best card for</span>
                  <CatChip cat={SPEND_CAT_COLOR[selCat]||"other"} label={cat.label}/>
                  {cat.note&&(
                    <button className="cat-info-btn" onClick={e=>{e.stopPropagation();setShowNote(showNote===selCat?null:selCat);}}
                      title="What counts for this category?">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showNote===selCat?"var(--acc)":"#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                    </button>
                  )}
                </div>
                {showNote===selCat&&cat.note&&(
                  <div className="cat-note">{cat.note}</div>
                )}
                <div style={{marginTop:10}}>
                {!results.length?(
                  <div style={{color:"var(--tx3)",fontSize:13}}>No matching cards in wallet for this category.</div>
                ):(
                  <>
                  {results.map(({card,rate},i)=>(
                    <div key={card.id}>
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<results.length-1&&!card.portalEarn?"1px solid var(--br)":"none"}}>
                        <div style={{width:30,height:30,borderRadius:9,background:`linear-gradient(135deg,${card.c1},${card.c2})`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"rgba(255,255,255,.8)"}}>#{i+1}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{card.short}{card.confidence==="estimated"&&<span style={{fontSize:9,color:"#9ca3af",fontStyle:"italic",fontWeight:400,marginLeft:3}}>(unverified)</span>}</span>
                          </div>
                          <div style={{fontSize:11,color:"var(--tx3)"}}>{card.cur}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:19,fontWeight:800,color:i===0?"var(--gld2)":"var(--tx2)"}}>{rate}</span>
                          <CatChip cat={SPEND_CAT_COLOR[selCat]||"other"} label={cat.label}/>
                        </div>
                      </div>
                      {/* Portal earn breakdown for travel category */}
                      {selCat==="t"&&card.portalEarn&&(
                        <div style={{marginLeft:42,marginBottom:8}}>
                          <div className="portal-row">
                            <span className="portal-badge">Portal</span>
                            <span style={{fontSize:11,color:"var(--tx2)",flex:1}}>
                              Via {card.portalEarn.portal}
                            </span>
                            <span style={{fontSize:15,fontWeight:800,color:"var(--acc)"}}>
                              {card.portalEarn.rates.f&&card.portalEarn.rates.h
                                ?`${card.portalEarn.rates.h} hotels / ${card.portalEarn.rates.f} flights`
                                :card.portalEarn.rates.f||card.portalEarn.rates.h||rate}
                            </span>
                          </div>
                          <div className="portal-note">{card.portalEarn.note}</div>
                          {i<results.length-1&&<div style={{borderBottom:"1px solid var(--br)",marginTop:8}}/>}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Best without portal callout */}
                  {selCat==="t"&&portalCards.length>0&&(
                    <div className="portal-section">
                      <div className="portal-section-label">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        BEST WITHOUT A PORTAL
                      </div>
                      <div style={{fontSize:12,color:"var(--tx2)",lineHeight:1.5,marginBottom:8}}>
                        Prefer to book direct for elite status, upgrades, or flexibility?
                      </div>
                      {(()=>{
                        // Find the best direct-booking travel rate from user's wallet
                        const directRanked=cards.filter(c=>c.earn&&c.earn.t)
                          .map(c=>({card:c,directRate:c.earn.t}))
                          .sort((a,b)=>parseFloat(b.directRate)-parseFloat(a.directRate))
                          .slice(0,2);
                        return directRanked.map(({card,directRate})=>(
                          <div key={card.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0"}}>
                            <div style={{width:24,height:24,borderRadius:7,background:`linear-gradient(135deg,${card.c1},${card.c2})`,flexShrink:0}}/>
                            <span style={{fontSize:12,fontWeight:600,color:"var(--tx)",flex:1}}>{card.short}</span>
                            <span style={{fontSize:15,fontWeight:800,color:"var(--tx2)"}}>{directRate}</span>
                            <span style={{fontSize:10,color:"var(--tx3)"}}>direct</span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                  </>
                )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── SPECIALTY ── */}
      {mode==="specialty"&&(
        <div>
          <div style={{fontSize:11,color:"var(--tx3)",marginBottom:12}}>Cards with maximum earn rates on their own brand properties:</div>
          {SPECIAL_CATS.filter(sc=>myCards.includes(sc.cardId)).length===0?(
            <div style={{textAlign:"center",padding:"28px 0",color:"var(--tx3)"}}>
              <div style={{marginBottom:6}}>No specialty cards in your wallet yet.</div>
              <div style={{fontSize:12}}>Add airline or hotel cards to see brand-specific earning rates.</div>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {SPECIAL_CATS.filter(sc=>myCards.includes(sc.cardId)).map(sc=>{
                const c=CARDS.find(x=>x.id===sc.cardId);
                return (
                  <div key={sc.id} className="surf" style={{padding:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <Icon name={SPECIAL_CAT_ICON[sc.id]||"star"} size={18} color={sc.color}/>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>{sc.label}</div>
                        <div style={{fontSize:10,color:"var(--tx3)"}}>{sc.sub}</div>
                      </div>
                    </div>
                    <div style={{fontSize:22,fontWeight:800,color:"var(--gld2)"}}>{sc.rate}</div>
                    <div style={{fontSize:10,color:"var(--tx3)",marginTop:2}}>Use: {c?.short}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ROTATING ── */}
      {mode==="rotating"&&(
        <div>
          <div className="surf-glow" style={{marginBottom:14,padding:"10px 14px"}}>
            <div style={{fontSize:11,fontWeight:800,color:"var(--acc2)",marginBottom:4,display:"flex",alignItems:"center",gap:4}}><Icon name="calendar" size={12} color="var(--acc2)"/> Q1 2026 ROTATING BONUS CATEGORIES</div>
            <div style={{fontSize:11,color:"var(--tx3)"}}>You MUST activate each quarter — missing it means earning only 1x instead of 5x</div>
          </div>
          {ROTATING_Q1.filter(r=>myCards.includes(r.id)).length===0?(
            <div style={{textAlign:"center",padding:"28px 0",color:"var(--tx3)"}}>
              <div style={{marginBottom:6}}>No rotating bonus cards in your wallet.</div>
              <div style={{fontSize:12}}>Rotating cards: Chase Freedom Flex, Discover it, U.S. Bank Cash+</div>
            </div>
          ):(
            ROTATING_Q1.filter(r=>myCards.includes(r.id)).map(r=>(
              <div key={r.id} className="surf" style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>{r.card}</div>
                  <div style={{fontSize:20,fontWeight:800,color:"var(--gld2)"}}>{r.rate}</div>
                </div>
                <div style={{fontSize:13,color:"var(--acc2)",fontWeight:600,marginBottom:6}}>{r.cats}</div>
                <div style={{fontSize:11,color:"var(--tx3)"}}>{r.note}</div>
                {!r.verified&&<div style={{fontSize:10,color:"var(--gld2)",marginTop:4,display:"flex",alignItems:"center",gap:3}}><Icon name="warning" size={10} color="var(--gld2)"/> Verify current quarter at card issuer's website</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MERCHANT ── */}
      {mode==="merchant"&&(
        <div>
          <div style={{marginBottom:14}}>
            <input className="inp" placeholder="Type a merchant — e.g. Whole Foods, Shell, Uber Eats…"
              value={merchant} onChange={e=>setMerchant(e.target.value)}/>
          </div>
          {merchantResults.length>0?(
            <div className="surf fu">
              <div style={{fontSize:12,color:"var(--tx3)",marginBottom:10}}>Best card to use at <strong style={{color:"var(--tx)"}}>{merchant}</strong>:</div>
              {merchantResults.slice(0,3).map(({card,rate},i)=>(
                <div key={card.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<2?"1px solid var(--br)":"none"}}>
                  <CreditCardDisplay card={card} size="sm"/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>{card.short}</div>
                    <div style={{fontSize:11,color:"var(--tx3)"}}>{card.cur}</div>
                  </div>
                  <div style={{fontSize:22,fontWeight:800,color:i===0?"var(--gld2)":"var(--tx2)"}}>{rate}</div>
                </div>
              ))}
            </div>
          ):merchant.length>1?(
            <div style={{textAlign:"center",padding:"28px 0",color:"var(--tx3)"}}>
              No exact match. Try category keywords: "grocery", "gas", "restaurant", "hotel", "airline".
            </div>
          ):null}
        </div>
      )}
    </div>
  );
}

/* ── OFFERS TAB ───────────────────────────────────────────────────────────── */
// MERCHANT_OFFERS is a large database of real merchant-specific credit card offers.
// Each entry has: merchant name, URL slug, category, optional aliases for search,
// and an array of programs (e.g., Amex Offers, Chase Offers) with typical deal values,
// how often the offer appears (frequent/seasonal/occasional), and usage notes.
// This data is curated from public sources and powers the Offers tab.
const MERCHANT_OFFERS=[
// ── SHOPPING ──────────────────────────────────────────────────────────────
{merchant:"Nike",slug:"nike",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$10–$15 back on $50+",freq:"frequent",note:"Check Amex app under 'Amex Offers'. Activate before purchasing in-store or online."},
  {prog:"Chase Offers",typical:"10% back (up to $15)",freq:"seasonal",note:"Most common around back-to-school and the holidays. Find in the Chase app or chase.com/offers."},
]},
{merchant:"Adidas",slug:"adidas",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$15–$20 back on $75+",freq:"seasonal",note:"Often runs in fall around new product launches. Activate in Amex app."},
  {prog:"Capital One Offers",typical:"5–8% back",freq:"occasional",note:"Check the Capital One app or shopping portal."},
]},
{merchant:"Apple",slug:"apple",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$10–$20 back on $100+",freq:"seasonal",note:"Runs around September product launches and the holiday season."},
  {prog:"Chase Offers",typical:"5% back (up to $20)",freq:"occasional",note:"Check the Chase app. More likely in December."},
]},
{merchant:"Best Buy",slug:"bestbuy",cat:"shopping",aliases:["best buy"],programs:[
  {prog:"Amex Offers",typical:"$15–$25 back on $100+",freq:"frequent",note:"One of the most consistent Amex Offers. Activate before any electronics purchase."},
  {prog:"Chase Offers",typical:"10% back (up to $30)",freq:"frequent",note:"Appears reliably in the Chase app. Always check before a Best Buy run."},
  {prog:"Citi Offers",typical:"8% back",freq:"seasonal",note:"Check your Citi app around Black Friday and tax-refund season."},
]},
{merchant:"Target",slug:"target",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$10 back on $50+",freq:"frequent",note:"Appears frequently in the Amex app. Activate before every trip."},
  {prog:"BofA Deals",typical:"5% back (up to $20)",freq:"occasional",note:"Found in the BofA app under 'Deals'."},
]},
{merchant:"Walmart",slug:"walmart",cat:"shopping",programs:[
  {prog:"Chase Offers",typical:"5% back (up to $10)",freq:"seasonal",note:"Check the Chase app around the holiday season and back-to-school."},
  {prog:"BofA Deals",typical:"3% back",freq:"occasional",note:"Check your BofA app's deals section."},
]},
{merchant:"Nordstrom",slug:"nordstrom",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$25–$50 back on $100+",freq:"seasonal",note:"Often runs during the Nordstrom Anniversary Sale (July) and the holiday season."},
  {prog:"Chase Offers",typical:"10% back (up to $25)",freq:"seasonal",note:"Check the Chase app around major Nordstrom sale events."},
]},
{merchant:"Macy's",slug:"macys",cat:"shopping",aliases:["macys","macy"],programs:[
  {prog:"Amex Offers",typical:"$15 back on $75+",freq:"frequent",note:"Amex frequently offers Macy's deals. Activate in your Amex app."},
  {prog:"Citi Offers",typical:"10% back",freq:"seasonal",note:"Often appears around department store sale events."},
]},
{merchant:"Sephora",slug:"sephora",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$10–$15 back on $50+",freq:"frequent",note:"One of the most consistent Amex Offers merchants. Check before every order."},
  {prog:"Chase Offers",typical:"10% back (up to $15)",freq:"seasonal",note:"Check the Chase app during Sephora sale events."},
]},
{merchant:"Ulta Beauty",slug:"ulta",cat:"shopping",aliases:["ulta"],programs:[
  {prog:"Amex Offers",typical:"$10 back on $50+",freq:"frequent",note:"Activate in your Amex app before in-store or online purchases."},
  {prog:"Citi Offers",typical:"8% back",freq:"seasonal",note:"Check during Ulta's 21 Days of Beauty event."},
]},
{merchant:"Home Depot",slug:"homedepot",cat:"shopping",aliases:["home depot"],programs:[
  {prog:"Amex Offers",typical:"$20–$30 back on $100+",freq:"frequent",note:"Among the highest-value and most frequent Amex Offers. Check before any home improvement run."},
  {prog:"Chase Offers",typical:"5–10% back (up to $30)",freq:"seasonal",note:"Often runs in spring and around the holidays."},
]},
{merchant:"Lowe's",slug:"lowes",cat:"shopping",aliases:["lowes"],programs:[
  {prog:"Amex Offers",typical:"$20 back on $100+",freq:"seasonal",note:"Check your Amex app in spring and fall."},
  {prog:"Wells Fargo Deals",typical:"5% back",freq:"occasional",note:"Look in the Wells Fargo app under 'My Deals'."},
]},
{merchant:"Wayfair",slug:"wayfair",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$20–$30 back on $100+",freq:"seasonal",note:"Runs during Way Day and Black Friday. Activate in your Amex app."},
  {prog:"Chase Offers",typical:"8% back (up to $20)",freq:"seasonal",note:"Check the Chase app around major Wayfair sale events."},
]},
{merchant:"Gap / Old Navy",slug:"gap",cat:"shopping",aliases:["gap","old navy","oldnavy","banana republic","athleta"],programs:[
  {prog:"Amex Offers",typical:"$15–$20 back on $75+",freq:"seasonal",note:"Works at Gap, Old Navy, Banana Republic, and Athleta. Activate in Amex app."},
  {prog:"Citi Offers",typical:"10% back",freq:"seasonal",note:"Check your Citi app during seasonal sale events."},
]},
{merchant:"Amazon",slug:"amazon",cat:"shopping",programs:[
  {prog:"Chase Offers",typical:"5% back on select items",freq:"occasional",note:"Prime Day often triggers Chase offers. Always check before a large order."},
  {prog:"Amex Offers",typical:"$10–$20 back on $50+",freq:"seasonal",note:"Less common but worth checking around Prime Day and the holidays."},
]},
{merchant:"Microsoft",slug:"microsoft",cat:"shopping",aliases:["microsoft store","xbox","surface"],programs:[
  {prog:"Amex Offers",typical:"$20–$30 back on $100+",freq:"seasonal",note:"Activate in your Amex app around back-to-school and the holiday season."},
  {prog:"Chase Offers",typical:"5–10% back",freq:"seasonal",note:"Check the Chase app."},
]},
{merchant:"Dell",slug:"dell",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$30–$50 back on $200+",freq:"seasonal",note:"High-value offer — check your Amex app around back-to-school."},
  {prog:"Citi Offers",typical:"10% back",freq:"seasonal",note:"Check your Citi app."},
]},
{merchant:"Samsung",slug:"samsung",cat:"shopping",programs:[
  {prog:"Amex Offers",typical:"$25–$50 back on $200+",freq:"seasonal",note:"Often runs during Galaxy launches and the holiday season. Activate in Amex app."},
  {prog:"Chase Offers",typical:"8–10% back",freq:"seasonal",note:"Check the Chase app."},
]},
// ── DINING ────────────────────────────────────────────────────────────────
{merchant:"Starbucks",slug:"starbucks",cat:"dining",programs:[
  {prog:"Amex Offers",typical:"$5–$10 back on $20+",freq:"frequent",note:"Among the most frequently activated Amex Offers. Check your app monthly."},
  {prog:"Chase Offers",typical:"10% back (up to $5)",freq:"frequent",note:"Chase consistently runs Starbucks offers. Find in the Chase app."},
  {prog:"Capital One Offers",typical:"5% back",freq:"frequent",note:"Check Capital One's offers in the app."},
]},
{merchant:"Chipotle",slug:"chipotle",cat:"dining",programs:[
  {prog:"Amex Offers",typical:"$5 back on $25+",freq:"frequent",note:"Activate in your Amex app. Works in-store and online."},
  {prog:"Chase Offers",typical:"10% back (up to $5)",freq:"frequent",note:"Regularly in the Chase app. Check before every order."},
]},
{merchant:"DoorDash",slug:"doordash",cat:"dining",aliases:["door dash"],programs:[
  {prog:"Chase Offers",typical:"$5–$10 back on $30+",freq:"frequent",note:"CSR includes complimentary DashPass. Additional spend-back offers also appear regularly in the Chase app."},
  {prog:"Amex Offers",typical:"10% back on orders",freq:"frequent",note:"Activate in your Amex app. Check around major food delivery promotions."},
]},
{merchant:"Uber Eats",slug:"ubereats",cat:"dining",aliases:["uber eats"],programs:[
  {prog:"Amex Offers",typical:"$10 back on $30+",freq:"frequent",note:"Amex Platinum includes monthly Uber Cash — Amex Offers are additional and can stack. Activate in app."},
  {prog:"Capital One Offers",typical:"5% back",freq:"seasonal",note:"Check Capital One's dining offers section."},
]},
{merchant:"Grubhub",slug:"grubhub",cat:"dining",programs:[
  {prog:"Chase Offers",typical:"$10 back on $30+",freq:"frequent",note:"Freedom and Sapphire cards often feature Grubhub. Check the Chase app."},
]},
{merchant:"Shake Shack",slug:"shakeshack",cat:"dining",aliases:["shake shack"],programs:[
  {prog:"Amex Offers",typical:"$5 back on $25+",freq:"seasonal",note:"Activate in your Amex app before visiting."},
  {prog:"Chase Offers",typical:"15% back",freq:"seasonal",note:"Less frequent but a high-percentage return when it does appear."},
]},
{merchant:"Sweetgreen",slug:"sweetgreen",cat:"dining",programs:[
  {prog:"Amex Offers",typical:"$5 back on $20+",freq:"seasonal",note:"Tends to appear in Q1 and Q3. Check your Amex app."},
]},
{merchant:"McDonald's",slug:"mcdonalds",cat:"dining",aliases:["mcdonalds","mcdonald"],programs:[
  {prog:"Amex Offers",typical:"$3–$5 back on $15+",freq:"occasional",note:"Lower value but occasionally appears — activate in your Amex app."},
  {prog:"Chase Offers",typical:"10% back",freq:"seasonal",note:"Check the Chase app during promotions."},
]},
// ── TRAVEL ────────────────────────────────────────────────────────────────
{merchant:"Marriott",slug:"marriott",cat:"travel",programs:[
  {prog:"Amex Offers",typical:"$50–$75 back on $250+ stay",freq:"frequent",note:"Amex Gold and Platinum are excellent for Marriott offers. Activate before booking."},
  {prog:"Chase Offers",typical:"10% back on stays (up to $50)",freq:"frequent",note:"Sapphire Reserve and Preferred regularly feature Marriott offers. May stack with Bonvoy card benefits."},
]},
{merchant:"Hyatt",slug:"hyatt",cat:"travel",programs:[
  {prog:"Chase Offers",typical:"$50–$100 back or 5,000 bonus pts",freq:"frequent",note:"Strong Hyatt–Chase partnership. Offers appear on Sapphire cards, the Hyatt Card, and Freedom cards."},
  {prog:"Amex Offers",typical:"$25 back on $150+ stay",freq:"occasional",note:"Worth checking in your Amex app before any Hyatt booking."},
]},
{merchant:"Hilton",slug:"hilton",cat:"travel",programs:[
  {prog:"Amex Offers",typical:"$50–$100 back on stays",freq:"frequent",note:"Amex is Hilton's primary partner. Offers are most common on Hilton Amex cards and the Platinum."},
  {prog:"Capital One Offers",typical:"5–10% back on stays",freq:"seasonal",note:"Check Capital One's travel offers section."},
]},
{merchant:"Delta",slug:"delta",cat:"travel",programs:[
  {prog:"Amex Offers",typical:"Bonus miles or $25–$50 back on flights",freq:"frequent",note:"Amex is Delta's exclusive co-brand partner. Offers appear often on all Delta Amex cards and the Platinum."},
  {prog:"Chase Offers",typical:"5% back on Delta purchases",freq:"occasional",note:"Less common but does appear — check your Chase app."},
]},
{merchant:"United Airlines",slug:"united",cat:"travel",aliases:["united airlines","mileageplus"],programs:[
  {prog:"Chase Offers",typical:"$50–$75 back or 5,000 bonus miles",freq:"frequent",note:"Chase is United's primary partner. Offers appear on United Explorer, Club, and Sapphire cards."},
  {prog:"Amex Offers",typical:"5% back on United flights",freq:"occasional",note:"Occasional — check your Amex app."},
]},
{merchant:"Southwest Airlines",slug:"southwest",cat:"travel",aliases:["southwest airlines","rapid rewards"],programs:[
  {prog:"Chase Offers",typical:"$25–$50 back on $100+",freq:"frequent",note:"Southwest co-brands with Chase. Offers appear on Southwest Priority, Plus, and Sapphire cards."},
]},
{merchant:"American Airlines",slug:"aa",cat:"travel",aliases:["american airlines","aadvantage"],programs:[
  {prog:"Citi Offers",typical:"Bonus miles or 5% back",freq:"frequent",note:"Citi co-brands with AA. Offers appear on AAdvantage cards and occasionally on the Double Cash and Premier."},
  {prog:"Amex Offers",typical:"5% back on AA flights",freq:"occasional",note:"Check your Amex app."},
]},
{merchant:"Airbnb",slug:"airbnb",cat:"travel",programs:[
  {prog:"Amex Offers",typical:"$25–$50 back on $200+",freq:"seasonal",note:"Runs around major travel seasons. Activate in your Amex app before booking."},
  {prog:"Chase Offers",typical:"10% back (up to $30)",freq:"seasonal",note:"Check the Chase app, especially before summer and holiday travel."},
]},
{merchant:"Hertz",slug:"hertz",cat:"travel",programs:[
  {prog:"Amex Offers",typical:"$20–$30 back on car rentals",freq:"frequent",note:"One of the most consistent Amex Offers. Platinum cardholders get Gold Plus Rewards — offers can stack."},
  {prog:"Chase Offers",typical:"10–15% back (up to $30)",freq:"frequent",note:"Regularly in the Chase app. CSR provides primary rental insurance — a natural pairing."},
]},
{merchant:"Avis",slug:"avis",cat:"travel",programs:[
  {prog:"Amex Offers",typical:"$20–$30 back on rentals",freq:"frequent",note:"Activate in your Amex app before renting. Preferred membership benefits may stack."},
  {prog:"Citi Offers",typical:"10% back",freq:"occasional",note:"Check your Citi app."},
]},
{merchant:"IHG Hotels",slug:"ihg",cat:"travel",aliases:["ihg","holiday inn","intercontinental","crowne plaza"],programs:[
  {prog:"Chase Offers",typical:"$25–$50 back on stays",freq:"frequent",note:"Chase IHG Premier cardholders see the best offers. Also appears on Sapphire cards."},
  {prog:"Amex Offers",typical:"$20 back on $100+ stay",freq:"occasional",note:"Check your Amex app before booking."},
]},
// ── STREAMING ─────────────────────────────────────────────────────────────
{merchant:"Spotify",slug:"spotify",cat:"streaming",programs:[
  {prog:"Amex Offers",typical:"$5–$10 back on subscription",freq:"seasonal",note:"Often runs at the start of the year or Q4. Activate in your Amex app."},
  {prog:"Chase Offers",typical:"10–20% back",freq:"seasonal",note:"Check the Chase app. Usually runs once or twice a year."},
]},
{merchant:"Netflix",slug:"netflix",cat:"streaming",programs:[
  {prog:"Amex Offers",typical:"$5–$10 back on subscription",freq:"seasonal",note:"Check your Amex app. Usually runs once or twice per year."},
  {prog:"Chase Offers",typical:"5–10% back",freq:"occasional",note:"Occasional — worth checking before your renewal date."},
]},
{merchant:"Disney+",slug:"disneyplus",cat:"streaming",aliases:["disney plus","disney+"],programs:[
  {prog:"Amex Offers",typical:"$10–$15 back on annual plan",freq:"seasonal",note:"Commonly runs around Disney's annual subscription renewal periods."},
  {prog:"Capital One Offers",typical:"5% back",freq:"seasonal",note:"Check your Capital One app."},
]},
{merchant:"Hulu",slug:"hulu",cat:"streaming",programs:[
  {prog:"Chase Offers",typical:"10–20% back on subscription",freq:"seasonal",note:"Check the Chase app. Usually runs in Q4 or early Q1."},
  {prog:"Amex Offers",typical:"$5 back",freq:"occasional",note:"Check your Amex app."},
]},
{merchant:"Apple TV+",slug:"appletv",cat:"streaming",aliases:["apple tv","apple tv+","appletv+"],programs:[
  {prog:"Amex Offers",typical:"$5–$10 back on annual subscription",freq:"seasonal",note:"Often runs around Apple's September product launch season."},
]},
// ── GAS ───────────────────────────────────────────────────────────────────
{merchant:"Shell",slug:"shell",cat:"gas",programs:[
  {prog:"Amex Offers",typical:"$10 back on $50+",freq:"frequent",note:"Shell offers appear often in the Amex app. Activate before filling up."},
  {prog:"Chase Offers",typical:"10% back (up to $10)",freq:"seasonal",note:"Check the Chase app, especially in summer driving season."},
]},
{merchant:"BP",slug:"bp",cat:"gas",programs:[
  {prog:"Amex Offers",typical:"$5–$10 back on $30+",freq:"frequent",note:"BP offers appear regularly in the Amex app. Activate before you pump."},
  {prog:"Citi Offers",typical:"5% back",freq:"seasonal",note:"Check your Citi card app."},
]},
{merchant:"ExxonMobil",slug:"exxon",cat:"gas",aliases:["exxon","mobil","exxonmobil"],programs:[
  {prog:"Amex Offers",typical:"$10–$15 back on $50+",freq:"frequent",note:"One of the most reliable gas-station Amex Offers. Check before filling up."},
  {prog:"Capital One Offers",typical:"5% back",freq:"occasional",note:"Check the Capital One app."},
]},
{merchant:"Chevron",slug:"chevron",cat:"gas",aliases:["texaco"],programs:[
  {prog:"Amex Offers",typical:"$10 back on $50+",freq:"seasonal",note:"Activate in your Amex app."},
  {prog:"Wells Fargo Deals",typical:"5% back",freq:"occasional",note:"Look in the Wells Fargo app under 'My Deals'."},
]},
// ── HEALTH ────────────────────────────────────────────────────────────────
{merchant:"Walgreens",slug:"walgreens",cat:"health",programs:[
  {prog:"Chase Offers",typical:"10% back (up to $10)",freq:"frequent",note:"Freedom cards often feature Walgreens. Check around flu season and Q4."},
  {prog:"Amex Offers",typical:"$5–$10 back on $25+",freq:"frequent",note:"Activate in your Amex app."},
]},
{merchant:"CVS",slug:"cvs",cat:"health",programs:[
  {prog:"Amex Offers",typical:"$5–$10 back on $25+",freq:"frequent",note:"Activate in your Amex app before shopping."},
  {prog:"Chase Offers",typical:"10% back (up to $10)",freq:"frequent",note:"Freedom Unlimited gives 3x on pharmacy — combine with a Chase Offer for max value."},
]},
{merchant:"Peloton",slug:"peloton",cat:"health",programs:[
  {prog:"Amex Offers",typical:"$50–$100 back on $500+",freq:"seasonal",note:"High-value offer. Typically runs around New Year and Black Friday."},
  {prog:"Capital One Offers",typical:"5% back",freq:"seasonal",note:"Check the Capital One app."},
]},
{merchant:"Orangetheory",slug:"orangetheory",cat:"health",aliases:["orange theory"],programs:[
  {prog:"Amex Offers",typical:"$30–$50 back on monthly membership",freq:"seasonal",note:"Runs around New Year's fitness season. Activate in your Amex app."},
]},
// ── GROCERY ───────────────────────────────────────────────────────────────
{merchant:"Whole Foods",slug:"wholefoods",cat:"grocery",aliases:["whole foods","amazon fresh"],programs:[
  {prog:"Amex Offers",typical:"$10–$15 back on $50+",freq:"frequent",note:"Activate in your Amex app. Amex Gold gives 4x on grocery stores — combine for maximum value."},
  {prog:"Chase Offers",typical:"5% back (up to $10)",freq:"seasonal",note:"Check the Chase app."},
]},
{merchant:"Kroger",slug:"kroger",cat:"grocery",aliases:["fred meyer","ralphs","king soopers","harris teeter","fry's"],programs:[
  {prog:"Amex Offers",typical:"$10 back on $50+",freq:"seasonal",note:"Activate in Amex app. Works at Kroger-family stores (Fred Meyer, Ralphs, King Soopers, Harris Teeter)."},
  {prog:"Wells Fargo Deals",typical:"5% back",freq:"occasional",note:"Check your Wells Fargo app."},
]},
{merchant:"Instacart",slug:"instacart",cat:"grocery",programs:[
  {prog:"Amex Offers",typical:"$15–$20 back on $75+",freq:"frequent",note:"Amex Platinum includes complimentary Instacart+ — spend-back offers can stack. Activate in Amex app."},
  {prog:"Chase Offers",typical:"10% back (up to $15)",freq:"seasonal",note:"Check the Chase app."},
]},
];

// PROG_COLORS assigns a color scheme to each card issuer's offers program.
// Used to visually distinguish Amex Offers (blue) from Chase Offers (navy), etc.
const PROG_COLORS={
  "Amex Offers":       {bg:"rgba(0,111,203,.1)",  text:"#005a9e", border:"rgba(0,111,203,.22)"},
  "Chase Offers":      {bg:"rgba(0,34,100,.1)",   text:"#002264", border:"rgba(0,34,100,.22)"},
  "Capital One Offers":{bg:"rgba(204,0,0,.1)",    text:"#a00000", border:"rgba(204,0,0,.22)"},
  "Citi Offers":       {bg:"rgba(0,63,141,.1)",   text:"#003f8d", border:"rgba(0,63,141,.22)"},
  "BofA Deals":        {bg:"rgba(227,24,55,.1)",  text:"#b8001a", border:"rgba(227,24,55,.22)"},
  "Wells Fargo Deals": {bg:"rgba(198,37,22,.1)",  text:"#9a1c0f", border:"rgba(198,37,22,.22)"},
  "Discover Cashback": {bg:"rgba(247,111,32,.1)", text:"#c85200", border:"rgba(247,111,32,.22)"},
  "US Bank Offers":    {bg:"rgba(0,83,159,.1)",   text:"#00539f", border:"rgba(0,83,159,.22)"},
};

// FREQ_CONFIG maps offer frequency labels (frequent, seasonal, occasional) to their
// display colors. Frequent offers are green, seasonal are gold, occasional are gray.
const FREQ_CONFIG={
  frequent:  {label:"Frequent",  bg:"rgba(22,163,74,.1)",   text:"#15803d"},
  seasonal:  {label:"Seasonal",  bg:"rgba(154,110,26,.12)", text:"#7a5a12"},
  occasional:{label:"Occasional",bg:"rgba(25,28,30,.07)",   text:"#6b7280"},
};

// ISSUER_TO_PROG maps card issuer names to their offer program names.
// For example, 'American Express' maps to 'Amex Offers'.
// Used to determine which offers are relevant to the user's cards.
const ISSUER_TO_PROG={
  "American Express":"Amex Offers",
  "Chase":"Chase Offers",
  "Capital One":"Capital One Offers",
  "Citi":"Citi Offers",
  "Bank of America":"BofA Deals",
  "Wells Fargo":"Wells Fargo Deals",
  "Discover":"Discover Cashback",
  "US Bank":"US Bank Offers",
};

// MerchantOfferCard renders a single merchant row in the Offers tab.
// It shows the merchant name, category badge, and issuer program pills in a collapsed view.
// When expanded, it shows detailed offer information grouped by the user's programs first,
// then other programs. Merchants without matching cards appear dimmed.
// Props: m (merchant offer object), myPrograms (Set of user's program names), showOnlyMine (boolean).
function MerchantOfferCard({m, myPrograms, showOnlyMine}){
  const [open,setOpen]=useState(false);
  const pColor=p=>PROG_COLORS[p.prog]||{bg:"rgba(117,91,6,.1)",text:"var(--acc)",border:"rgba(117,91,6,.22)"};

  const noWallet=myPrograms.size===0;
  const myProgs=m.programs.filter(p=>myPrograms.has(p.prog));
  const otherProgs=m.programs.filter(p=>!myPrograms.has(p.prog));
  const hasMatch=noWallet||myProgs.length>0;

  // Pills in header: user's programs first
  const previewProgs=noWallet?m.programs:[...myProgs,...otherProgs];

  const renderProg=(p,dim)=>{
    const pc=pColor(p);
    const fc=FREQ_CONFIG[p.freq]||FREQ_CONFIG.occasional;
    return(
      <div key={p.prog} style={{background:pc.bg,border:`1px solid ${pc.border}`,borderRadius:10,
        padding:"10px 12px",marginBottom:8,opacity:dim?.4:1,transition:"opacity .15s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:12,fontWeight:700,color:pc.text}}>{p.prog}</span>
          <span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:600,
            background:fc.bg,color:fc.text,whiteSpace:"nowrap"}}>{fc.label}</span>
        </div>
        <div style={{fontSize:13,fontWeight:600,color:"var(--tx)",marginBottom:p.note?5:0}}>
          Typical: {p.typical}
        </div>
        {p.note&&<div style={{fontSize:11,color:"var(--tx2)",lineHeight:1.55}}>{p.note}</div>}
      </div>
    );
  };

  return(
    <div className={`tip-card fu${open?" open":""}`}
      style={{marginBottom:8,opacity:hasMatch?1:.38,transition:"opacity .2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,cursor:"pointer"}}
        onClick={()=>setOpen(o=>!o)}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,color:"var(--tx)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.merchant}</div>
            <div style={{marginTop:4}}><CatChip cat={m.cat}/></div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          {previewProgs.slice(0,2).map(p=>{
            const pc=pColor(p);
            const isMine=myPrograms.has(p.prog);
            return(
              <span key={p.prog} style={{padding:"2px 7px",borderRadius:99,fontSize:9,fontWeight:700,
                background:pc.bg,color:pc.text,border:`1px solid ${pc.border}`,letterSpacing:.2,
                whiteSpace:"nowrap",opacity:noWallet||isMine?1:.35}}>
                {p.prog.split(" ")[0]}
              </span>
            );
          })}
          {m.programs.length>2&&<span style={{fontSize:10,color:"var(--tx3)",fontWeight:600}}>+{m.programs.length-2}</span>}
          <span style={{marginLeft:2,display:"inline-flex"}}><Icon name={open?"chevron-up":"chevron-down"} size={11} color="var(--tx3)"/></span>
        </div>
      </div>
      {open&&(
        <div style={{marginTop:12,borderTop:"1px solid var(--br)",paddingTop:12,cursor:"default"}}
          onClick={e=>e.stopPropagation()}>
          {/* User's matching programs */}
          {!noWallet&&myProgs.length>0&&(
            <>
              {!showOnlyMine&&<div style={{fontSize:10,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Your cards' programs</div>}
              {myProgs.map(p=>renderProg(p,false))}
            </>
          )}
          {/* No match message */}
          {!noWallet&&myProgs.length===0&&(
            <div style={{textAlign:"center",padding:"10px 0 6px",color:"var(--tx3)",fontSize:12}}>
              None of your cards have tracked offers here.
            </div>
          )}
          {/* Other programs (show-all mode only) */}
          {!showOnlyMine&&otherProgs.length>0&&(
            <>
              {!noWallet&&myProgs.length>0&&(
                <div style={{fontSize:10,color:"var(--tx4)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,margin:"10px 0 8px"}}>Other programs</div>
              )}
              {otherProgs.map(p=>renderProg(p,!noWallet))}
            </>
          )}
          {/* No wallet: show everything normally */}
          {noWallet&&m.programs.map(p=>renderProg(p,false))}
          <div style={{fontSize:11,color:"var(--tx3)",fontStyle:"italic",lineHeight:1.5,paddingTop:2}}>
            <Icon name="lightbulb" size={12} color="var(--tx3)"/> Historical patterns only — always verify and activate in your card's app before spending.
          </div>
        </div>
      )}
    </div>
  );
}

// OffersTab is the main Offers page that lets users browse merchant-specific credit card deals.
// It shows a wallet summary of which offer programs the user has access to,
// a toggle between "Only my cards' offers" and "Show all merchants",
// a search bar, category filter pills, and a scrollable list of merchant offer cards.
// Props: myCards (array of card IDs in the user's wallet).
// The merchant offers screen. Shows current card-linked offers from issuers,
// highlighting which ones match cards in your wallet.
function OffersTab({myCards}){
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("all");
  const [showOnlyMine,setShowOnlyMine]=useState(true);

  const CATS=[
    {id:"all",label:"All"},
    {id:"shopping",label:"Shopping"},
    {id:"dining",label:"Dining"},
    {id:"travel",label:"Travel"},
    {id:"streaming",label:"Streaming"},
    {id:"gas",label:"Gas"},
    {id:"health",label:"Health"},
    {id:"grocery",label:"Grocery"},
  ];

  // Build set of offer programs the user has
  const myPrograms=useMemo(()=>{
    const s=new Set();
    (myCards||[]).forEach(id=>{
      const c=CARDS.find(x=>x.id===id);
      if(c){const prog=ISSUER_TO_PROG[c.issuer];if(prog)s.add(prog);}
    });
    return s;
  },[myCards]);

  // Cards that have known offer programs
  const offerCards=useMemo(()=>(myCards||[])
    .map(id=>CARDS.find(c=>c.id===id))
    .filter(c=>c&&ISSUER_TO_PROG[c.issuer])
  ,[myCards]);

  const catCounts=useMemo(()=>{
    const out={all:MERCHANT_OFFERS.length};
    MERCHANT_OFFERS.forEach(m=>{out[m.cat]=(out[m.cat]||0)+1;});
    return out;
  },[]);

  const filtered=useMemo(()=>{
    let list=MERCHANT_OFFERS;
    if(cat!=="all")list=list.filter(m=>m.cat===cat);
    const q2=q.trim().toLowerCase();
    if(q2)list=list.filter(m=>
      m.merchant.toLowerCase().includes(q2)||
      m.slug.includes(q2)||
      (m.aliases&&m.aliases.some(a=>a.includes(q2)))
    );
    if(myPrograms.size>0){
      if(showOnlyMine){
        list=list.filter(m=>m.programs.some(p=>myPrograms.has(p.prog)));
      }else{
        // Sort: matched merchants first, unmatched after
        list=[...list].sort((a,b)=>{
          const am=a.programs.some(p=>myPrograms.has(p.prog));
          const bm=b.programs.some(p=>myPrograms.has(p.prog));
          return am===bm?0:am?-1:1;
        });
      }
    }
    return list;
  },[q,cat,myPrograms,showOnlyMine]);

  const hasWallet=myPrograms.size>0;

  return(
    <div style={{padding:"20px 16px"}}>
      <div style={{marginBottom:28}}>
        <h2 className="page-title" style={{fontSize:40,marginBottom:6}}>Limited Time Offers</h2>
        <p className="page-subtitle" style={{maxWidth:600}}>
          Curated selections designed to maximize your lifestyle rewards. Search a merchant to find offers matched to your cards.
        </p>
      </div>

      {/* Wallet summary */}
      {hasWallet?(
        <div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.2)",
          borderRadius:12,padding:"11px 14px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--grn)",marginBottom:6}}>
            You have {offerCards.length} card{offerCards.length!==1?"s":""} that frequently get merchant offers
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[...myPrograms].map(prog=>{
              const pc=PROG_COLORS[prog]||{};
              return(
                <span key={prog} style={{padding:"2px 9px",borderRadius:99,fontSize:10,fontWeight:700,
                  background:pc.bg||"rgba(117,91,6,.1)",color:pc.text||"var(--acc)",
                  border:`1px solid ${pc.border||"rgba(117,91,6,.2)"}`}}>
                  {prog}
                </span>
              );
            })}
          </div>
        </div>
      ):(myCards&&myCards.length>0)?(
        <div style={{background:"var(--s3)",border:"1px solid var(--br)",borderRadius:12,
          padding:"11px 14px",marginBottom:14,fontSize:12,color:"var(--tx3)"}}>
          Your cards don't include issuers with tracked offer programs (Amex, Chase, Capital One, Citi, etc.).
        </div>
      ):null}

      {/* Personalization toggle */}
      {hasWallet&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"9px 12px",
          background:"var(--s1)",border:"1px solid var(--br2)",borderRadius:10}}>
          <button onClick={()=>setShowOnlyMine(true)}
            style={{flex:1,padding:"6px 0",fontSize:12,fontWeight:600,border:"none",cursor:"pointer",borderRadius:7,
              background:showOnlyMine?"var(--acc)":"transparent",
              color:showOnlyMine?"#fff":"var(--tx3)",transition:"all .15s"}}>
            Only my cards' offers
          </button>
          <button onClick={()=>setShowOnlyMine(false)}
            style={{flex:1,padding:"6px 0",fontSize:12,fontWeight:600,border:"none",cursor:"pointer",borderRadius:7,
              background:!showOnlyMine?"var(--s4)":"transparent",
              color:!showOnlyMine?"var(--tx)":"var(--tx3)",transition:"all .15s"}}>
            Show all merchants
          </button>
        </div>
      )}

      <div style={{position:"relative",marginBottom:10}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,
          pointerEvents:"none",color:"var(--tx3)"}}><Icon name="search" size={15} color="var(--tx3)"/></span>
        <input className="inp" style={{paddingLeft:42}} value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Nike, Hyatt, Starbucks, Home Depot…"/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:12,top:"50%",
          transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",
          fontSize:18,color:"var(--tx3)",lineHeight:1}}>×</button>}
      </div>
      <div className="hscroll" style={{marginBottom:14,gap:6}}>
        {CATS.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)}
            className={`pill ${cat===c.id?"pill-a":"pill-i"}`}
            style={{fontSize:11}}>
            {c.label}{catCounts[c.id]?` · ${catCounts[c.id]}`:""}
          </button>
        ))}
      </div>
      <div style={{background:"rgba(117,91,6,.06)",border:"1px solid rgba(117,91,6,.14)",
        borderRadius:10,padding:"9px 14px",marginBottom:14,fontSize:12,color:"var(--tx2)",
        lineHeight:1.5,display:"flex",gap:8,alignItems:"flex-start"}}>
        <Icon name="bolt" size={14} color="var(--acc2)"/>
        <span>Offer history is curated from public sources. Always verify and activate in your card issuer's app before purchasing.</span>
      </div>
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"44px 20px",color:"var(--tx3)"}}>
          <div style={{marginBottom:10}}><Icon name="search" size={36} color="var(--tx3)"/></div>
          <div style={{fontSize:15,fontWeight:700,color:"var(--tx)",marginBottom:5}}>
            {q?`No results for "${q}"`:"No merchants match your cards' programs"}
          </div>
          <div style={{fontSize:13}}>
            {q?"Try a different spelling or browse a category above":"Try switching to \"Show all merchants\""}
          </div>
        </div>
      ):(
        <>
          <div className="section-title" style={{marginBottom:10}}>
            {q
              ?`${filtered.length} RESULT${filtered.length!==1?"S":""} · "${q.toUpperCase()}"`
              :cat!=="all"
                ?`${filtered.length} MERCHANTS · ${cat.toUpperCase()}`
                :showOnlyMine&&hasWallet
                  ?`${filtered.length} MERCHANTS WITH YOUR CARDS' OFFERS`
                  :`${MERCHANT_OFFERS.length} MERCHANTS TRACKED`}
          </div>
          <div className="merchants-list">
            {filtered.map(m=>(
              <MerchantOfferCard key={m.slug} m={m}
                myPrograms={myPrograms} showOnlyMine={showOnlyMine}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── WALLET TAB ───────────────────────────────────────────────────────────── */
// WalletTab lets users manage their credit card collection.
// It has three views: (1) the main wallet grid showing all added cards with visual card art,
// (2) the "Add Cards" browser where users can filter by issuer and toggle cards in/out,
// (3) a card detail view showing full info, benefits, partners, and apply/remove buttons.
// Props: myCards (array of card IDs), setMyCards (setter to update the wallet).
// The card browser. Browse all ~100 cards, search by name, filter by issuer,
// and add or remove cards from your personal wallet.
function WalletTab({myCards,setMyCards,anniversaryDates,setAnniversaryDates}){
  const [showAdd,setShowAdd]=useState(false);
  const [issuerFilter,setIssuerFilter]=useState("All");
  const [detailId,setDetailId]=useState(null);
  const myCardObjs=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);
  const issuers=["All",...[...new Set(CARDS.map(c=>c.issuer))].sort()];
  const filtered=issuerFilter==="All"?CARDS:CARDS.filter(c=>c.issuer===issuerFilter);

  function toggleCard(id){setMyCards(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}

  // ── Card detail view ──
  if(detailId){
    const c=CARDS.find(x=>x.id===detailId);
    if(!c)return null;
    const annCredits=c.annual.reduce((s,b)=>{
      if(!b.v)return s;
      if(b.reset==="quarterly")return s+b.v*4;
      if(b.reset==="semi-annual")return s+b.v*2;
      return s+b.v;
    },0);
    const monCredits=c.monthly.reduce((s,b)=>s+((b.v||0)*12),0);
    const totalCredits=annCredits+monCredits;
    return (
      <div style={{padding:"16px 16px 0"}}>
        <button className="btn-ghost btn-sm" onClick={()=>setDetailId(null)} style={{marginBottom:14}}>← Back</button>
        <div className="fu">
          {/* Card hero */}
          <div style={{background:`linear-gradient(135deg,${c.c1},${c.c2})`,borderRadius:20,padding:"22px 20px 18px",marginBottom:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-50,right:-30,width:130,height:130,background:"rgba(255,255,255,.06)",borderRadius:"50%",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-20,left:10,width:90,height:90,background:"rgba(255,255,255,.04)",borderRadius:"50%",pointerEvents:"none"}}/>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>{c.issuer}</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff",marginBottom:6,lineHeight:1.2}}>{c.name}</div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <div><div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>Annual Fee</div><div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{c.fee===0?"Free":"$"+c.fee}</div></div>
              <div><div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>Currency</div><div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)"}}>{c.cur}</div></div>
              {c.isNew&&<span className="badge new-badge" style={{alignSelf:"flex-end"}}>NEW</span>}
              {c.isBiz&&<span className="badge biz-badge" style={{alignSelf:"flex-end"}}>Business</span>}
            </div>
          </div>

          {/* Signup bonus */}
          {c.signup&&(
            <div style={{background:"rgba(13,115,119,.08)",border:"1px solid rgba(13,115,119,.2)",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:800,color:"var(--gld2)",textTransform:"uppercase",letterSpacing:1,marginBottom:4,display:"flex",alignItems:"center",gap:4}}><Icon name="gift" size={11} color="var(--gld2)"/> Signup Bonus</div>
              <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.5}}>{c.signup}</div>
            </div>
          )}

          {/* Value math */}
          <div className="stats-grid" style={{marginBottom:12}}>
            <div className="stat-box"><div className="stat-val" style={{color:"var(--red2)"}}>-${c.fee}</div><div className="stat-lbl">Annual Fee</div></div>
            <div className="stat-box"><div className="stat-val grn-text">+${totalCredits}</div><div className="stat-lbl">Credits/yr</div></div>
            <div className="stat-box">
              <div className="stat-val" style={{color:totalCredits-c.fee>=0?"var(--grn2)":"var(--red2)"}}>
                {totalCredits-c.fee>=0?"+":""}{totalCredits-c.fee}
              </div>
              <div className="stat-lbl">Net Value</div>
            </div>
          </div>

          {/* Anniversary month selector */}
          {c.fee>0&&myCards.includes(c.id)&&(
            <div style={{marginBottom:12,padding:"12px 14px",background:"rgba(13,115,119,.05)",border:"1px solid rgba(13,115,119,.15)",borderRadius:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--tx)",marginBottom:2,display:"flex",alignItems:"center",gap:6}}>
                    <Icon name="calendar" size={14} color="var(--acc)"/> Anniversary Month
                  </div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>When does your annual fee hit?</div>
                </div>
                <select
                  value={anniversaryDates[c.id]||""}
                  onChange={e=>{
                    const v=e.target.value;
                    setAnniversaryDates(prev=>{
                      const next={...prev};
                      if(v) next[c.id]=parseInt(v);
                      else delete next[c.id];
                      return next;
                    });
                  }}
                  className="ra-selector"
                  style={{minWidth:100,padding:"6px 10px",borderRadius:8,border:"1px solid var(--br2)",background:"var(--bg)",
                    fontSize:12,fontWeight:600,color:"var(--tx)",cursor:"pointer"}}>
                  <option value="">Not set</option>
                  {MONTH_NAMES.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              {anniversaryDates[c.id]&&(()=>{
                const days=getRenewalDays(c.id,anniversaryDates);
                return days!=null?(
                  <div style={{marginTop:8,fontSize:11,fontWeight:600,color:days<=60?"var(--red2)":days<=120?"var(--acc)":"var(--tx2)"}}>
                    <Icon name="clock" size={11} color="currentColor"/> Renews in {days} day{days!==1?"s":""}
                  </div>
                ):null;
              })()}
            </div>
          )}

          {/* Benefits list */}
          {(c.annual.length>0||c.monthly.length>0)&&(
            <div style={{marginBottom:12}}>
              <div className="section-title" style={{marginBottom:10}}>BENEFITS</div>
              <div className="surf" style={{padding:"0 14px"}}>
                {[...c.annual.map(b=>({...b,type:"Annual"})),...c.monthly.map(b=>({...b,type:"Monthly"}))].map((b,i,arr)=>{
                  const bc=BCAT[b.cat]||BCAT.statement;
                  return (
                    <div key={i} style={{padding:"10px 0",borderBottom:i<arr.length-1?"1px solid var(--br)":"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                            <span style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{b.n}</span>
                            <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,color:bc.color,background:bc.bg,fontWeight:700}}><Icon name={BCAT_ICON_MAP[b.cat]||"credit-card"} size={10} color={bc.color}/> {bc.label}</span>
                            <span style={{padding:"1px 6px",borderRadius:99,fontSize:10,background:"rgba(255,255,255,.07)",color:"var(--tx3)",fontWeight:600}}>{b.type}</span>
                          </div>
                          {b.d&&<div style={{fontSize:11,color:"var(--tx3)",lineHeight:1.5}}>{b.d}</div>}
                        </div>
                        {b.v&&<div style={{fontSize:14,fontWeight:800,color:"var(--grn2)",flexShrink:0}}>${b.v}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transfer partners */}
          {c.partners&&c.partners.length>0&&(
            <div style={{marginBottom:12}}>
              <div className="section-title" style={{marginBottom:8}}>TRANSFER PARTNERS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {c.partners.map(p=>(
                  <span key={p} style={{padding:"4px 10px",background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.2)",borderRadius:99,fontSize:11,color:"var(--acc2)",fontWeight:600}}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Apply / Remove */}
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",gap:10,marginBottom:4}}>
              {!myCards.includes(c.id)?(
                <a className="apply-btn" href={APPLY_URLS[c.id]||"#apply-"+c.id} target="_blank" rel="noopener noreferrer" style={{flex:1,justifyContent:"center",textDecoration:"none"}}>
                  <Icon name="rocket" size={14} color="#fff"/> Apply for {c.short||c.name} →
                </a>
              ):(
                <button className="btn-ghost" style={{flex:1}} onClick={()=>{toggleCard(c.id);setDetailId(null);}}>Remove from Wallet</button>
              )}
            </div>
            {!myCards.includes(c.id)&&<div className="apply-disclose" style={{textAlign:"center"}}>Affiliate link — we may earn a commission at no cost to you.</div>}
          </div>
        </div>
      </div>
    );
  }

  // ── Add cards view ──
  if(showAdd){
    return (
      <div style={{padding:"16px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:800}}>Add Cards</div>
          <button className="btn-ghost btn-sm" onClick={()=>setShowAdd(false)}>← Done ({myCards.length} selected)</button>
        </div>
        <div className="hscroll" style={{marginBottom:14,gap:6}}>
          {issuers.map(iss=>(
            <button key={iss} className={"pill "+(issuerFilter===iss?"pill-a":"pill-i")} onClick={()=>setIssuerFilter(iss)}>{iss}</button>
          ))}
        </div>
        <div className="card-browser-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,paddingBottom:16}}>
          {filtered.map(card=>{
            const inWallet=myCards.includes(card.id);
            return (
              <div key={card.id} onClick={()=>toggleCard(card.id)}
                style={{background:inWallet?getIssuerTint(card.issuer)+"80":"rgba(255,255,255,.03)",border:"1.5px solid",borderColor:inWallet?"var(--grn)":"var(--br2)",borderLeft:`4px solid ${getIssuerColor(card.issuer)}`,borderRadius:14,padding:12,cursor:"pointer",transition:"all .18s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{width:10,height:10,borderRadius:3,background:getIssuerPalette(card.issuer).grad[0],flexShrink:0,marginTop:2}}/>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    {card.isBiz&&<span className="badge biz-badge">Biz</span>}
                    {card.isNew&&<span className="badge new-badge">New</span>}
                  </div>
                </div>
                <div style={{fontSize:11,fontWeight:700,color:"var(--tx)",marginBottom:2,lineHeight:1.3}}>{card.name}{card.confidence==="estimated"&&<span style={{fontSize:9,color:"#9ca3af",fontStyle:"italic",fontWeight:400,marginLeft:4}}>(unverified)</span>}</div>
                <div style={{fontSize:10,color:"var(--tx3)",marginBottom:6}}>{card.issuer}</div>
                {!inWallet&&card.signup&&card.signup!=="No signup bonus"&&card.signup!=="No sign-up bonus"&&(
                  <div style={{fontSize:10,fontWeight:600,color:"var(--acc)",background:"rgba(13,115,119,.07)",
                    border:"1px solid rgba(13,115,119,.15)",borderRadius:6,padding:"3px 8px",marginBottom:6,lineHeight:1.35}}>
                    {card.signup}
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:11,color:card.fee===0?"var(--grn2)":"var(--tx3)",fontWeight:700,display:"block"}}>{card.fee===0?"No fee":"$"+card.fee+"/yr"}</span>
                    {APPLY_URLS[card.id]&&!APPLY_URLS[card.id].startsWith("#")&&(
                      <a href={APPLY_URLS[card.id]} target="_blank" rel="noopener noreferrer"
                        onClick={e=>e.stopPropagation()}
                        style={{fontSize:10,fontWeight:600,color:"var(--acc)",textDecoration:"none",display:"inline-block",marginTop:2}}
                        onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
                        onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>Apply &rarr;</a>
                    )}
                  </div>
                  <div style={{width:20,height:20,borderRadius:"50%",background:inWallet?"var(--grn)":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",transition:"all .18s",flexShrink:0}}>
                    {inWallet?<Icon name="check" size={12} color="#fff"/>:<Icon name="plus" size={12} color="#fff"/>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Main wallet view ──
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Your Ledger</h2>
          <p className="page-subtitle">Managing {myCards.length} active credit line{myCards.length!==1?"s":""}</p>
          {myCardObjs.length>0&&(()=>{
            const issuers=[...new Set(myCardObjs.map(c=>c.issuer))];
            return <div style={{display:'flex',gap:4,marginTop:6}}>{issuers.map(iss=>(
              <div key={iss} title={iss} style={{width:10,height:10,borderRadius:'50%',background:getIssuerPalette(iss).grad[0],cursor:'default',transition:'transform .15s'}}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.4)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
            ))}</div>;
          })()}
        </div>
        <button className="page-action" onClick={()=>setShowAdd(true)}>+ Add New Card</button>
      </div>
      {!myCardObjs.length?(
        <div className="wallet-empty-slot" style={{padding:"64px 20px"}} onClick={()=>setShowAdd(true)}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 1px 6px rgba(0,0,0,.08)',fontSize:24,color:'var(--tx3)'}}>+</div>
          <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:18,color:'#0f172a'}}>Sync another card</div>
          <div style={{fontSize:13,color:'#6b7280',marginTop:6}}>Unlock more optimizations</div>
        </div>
      ):(
        <div className="wallet-card-grid">{myCardObjs.map(c=>{
          const ic=getIssuerColor(c.issuer);
          const it=getIssuerTint(c.issuer);
          const tags=getTopEarnCats(c);
          return (
            <div key={c.id} className="wallet-card" style={{borderLeft:`4px solid ${ic}`}} onClick={()=>setDetailId(c.id)}>
              <CreditCardDisplay card={c} size="md"/>
              <div className="wallet-card-info">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div>
                    <div className="wallet-card-name" style={{color:ic}}>{c.short||c.name}</div>
                    <div className="wallet-card-issuer">{c.issuer}</div>
                  </div>
                  <div className="wallet-card-fee-wrap">
                    <div className="wallet-card-fee-label">Annual Fee</div>
                    <div className="wallet-card-fee" style={{color:ic}}>{c.fee===0?'Free':'$'+c.fee}</div>
                  </div>
                </div>
                <div className="wallet-card-tags">
                  {tags.map(t=>(<span key={t} className="wallet-card-tag" style={{background:it,color:ic,border:`1px solid ${ic}20`}}>{t}</span>))}
                  {c.isBiz&&<span className="wallet-card-tag" style={{background:'rgba(13,115,119,.1)',color:'var(--acc)'}}>Business</span>}
                </div>
              </div>
            </div>
          );
        })}
          <div className="wallet-empty-slot" onClick={()=>setShowAdd(true)}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,.06)',fontSize:22,color:'var(--tx3)'}}>+</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,color:'#0f172a'}}>Sync another card</div>
            <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>Unlock more optimizations</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TOP NAV ──────────────────────────────────────────────────────────────── */
/* ── QUIZ ─────────────────────────────────────────────────────────────────── */
// QUIZ_QS defines the 5 questions in the Card Finder quiz.
// Each question has: an id, the question text (q), whether multiple answers are allowed (multi),
// and an array of answer options (opts) with id, label, optional subtitle, icon, and exclusivity flag.
// The quiz covers: top spending category, monthly spend amount, brand loyalty,
// annual fee tolerance, and rewards experience level.
const QUIZ_QS=[
  {id:"spend",q:"What do you spend the most on?",multi:false,opts:[
    {id:"dining",   label:"Dining & Restaurants",iconName:"utensils"},
    {id:"grocery",  label:"Groceries",           iconName:"shopping-cart"},
    {id:"travel",   label:"Travel",              iconName:"plane"},
    {id:"gas",      label:"Gas",                 iconName:"car"},
    {id:"everything",label:"Everything Equally", iconName:"bar-chart"},
  ]},
  {id:"monthly",q:"How much do you spend per month?",multi:false,opts:[
    {id:"1k2k",  label:"$1,000 – $2,000"},
    {id:"2k4k",  label:"$2,000 – $4,000"},
    {id:"4k8k",  label:"$4,000 – $8,000"},
    {id:"8kplus",label:"$8,000+"},
  ]},
  {id:"brand",q:"Preferred airline or hotel? Pick all that apply.",multi:true,opts:[
    {id:"none",     label:"No preference",     excl:true},
    {id:"united",   label:"United Airlines"},
    {id:"delta",    label:"Delta Air Lines"},
    {id:"aa",       label:"American Airlines"},
    {id:"southwest",label:"Southwest Airlines"},
    {id:"hyatt",    label:"World of Hyatt"},
    {id:"marriott", label:"Marriott Bonvoy"},
    {id:"hilton",   label:"Hilton"},
    {id:"alaska",   label:"Alaska / Hawaiian"},
  ]},
  {id:"fee",q:"How do you feel about annual fees?",multi:false,opts:[
    {id:"none",label:"No fees — ever",             sub:"Keep it completely free"},
    {id:"100", label:"Up to $100/year",            sub:"If the value is clear"},
    {id:"250", label:"Up to $250/year",            sub:"Happy to invest for perks"},
    {id:"any", label:"Worth it if the value's there",sub:"I'll do the math"},
  ]},
  {id:"exp",q:"How experienced are you with rewards?",multi:false,opts:[
    {id:"new", label:"Brand new",        sub:"Keep it simple, please"},
    {id:"some",label:"Some experience",  sub:"I've earned points before"},
    {id:"adv", label:"Advanced",         sub:"I know about transfer partners"},
  ]},
];

// parseEarnNum extracts a numeric earn rate from a string like "3x" or "5%".
// Returns the number (e.g., 3) or 1 as a default if the value cannot be parsed.
function parseEarnNum(v){const n=parseFloat(String(v||1).replace(/[^0-9.]/g,''));return isNaN(n)?1:n;}

// calcQuizResults takes the user's quiz answers and scores every personal (non-business) card.
// It considers: earn rate in the user's top spending category, transfer partner matches,
// brand loyalty alignment, experience level preferences, signup bonus presence,
// and whether the card's annual fee is justified by the user's spending level.
// Returns the top 3 cards sorted by score, each with a personalized explanation (reason).
function calcQuizResults(ans){
  const SPEND_FIELD={dining:'d',grocery:'g',travel:'t',gas:'gas',everything:'o'};
  const SPEND_LABEL={dining:'dining',grocery:'groceries',travel:'travel',gas:'gas',everything:'everyday spending'};
  const BRAND_WORD={united:'United',delta:'Delta',aa:'American',southwest:'Southwest',hyatt:'Hyatt',marriott:'Marriott',hilton:'Hilton',alaska:'Alaska'};
  const FEE_MAX={none:0,'100':100,'250':250,any:99999};
  const MONTHLY_AMT={'1k2k':1500,'2k4k':3000,'4k8k':6000,'8kplus':10000};

  const sf=SPEND_FIELD[ans.spend]||'o';
  const feeMax=FEE_MAX[ans.fee]??99999;
  const brands=(ans.brand||['none']).filter(b=>b!=='none');
  const brandWords=brands.map(b=>BRAND_WORD[b]).filter(Boolean);
  const monthlyAmt=MONTHLY_AMT[ans.monthly]||2000;

  return CARDS
    .filter(c=>!c.isBiz&&c.fee<=feeMax)
    .map(c=>{
      let score=0;
      const er=parseEarnNum(c.earn[sf]||c.earn.o);
      score+=er*20;
      if(ans.spend==='travel'&&c.partners)score+=c.partners.length*2;
      brandWords.forEach(bw=>{
        if(c.partners&&c.partners.some(p=>p.toLowerCase().includes(bw.toLowerCase())))score+=45;
        if(c.name.toLowerCase().includes(bw.toLowerCase()))score+=20;
      });
      if(ans.exp==='new'){
        if(c.fee===0)score+=30;
        if(c.fee>200)score-=25;
        if(c.cur==='Cash Back')score+=20;
      }else if(ans.exp==='some'){
        if(c.fee<=250)score+=10;
        if(c.partners&&c.partners.length>3)score+=15;
      }else{
        if(c.partners&&c.partners.length>3)score+=30;
        if(c.fee>=95)score+=10;
      }
      if(c.signup)score+=8;
      const annualSpend=monthlyAmt*12;
      const earnedBack=annualSpend*(er/100)*1.5;
      if(earnedBack>c.fee*1.5)score+=12;
      return {c,score,er,sf};
    })
    .sort((a,b)=>b.score-a.score)
    .slice(0,3)
    .map(entry=>{
      const {c,sf:f}=entry;
      const spendLabel=SPEND_LABEL[ans.spend];
      const earnVal=c.earn[f]||c.earn.o||'1x';
      const lines=[];
      lines.push(`Earns ${earnVal} on ${spendLabel} — one of the best rates for your primary spend category.`);
      const matched=brands.filter(b=>{const bw=BRAND_WORD[b];return bw&&c.partners&&c.partners.some(p=>p.toLowerCase().includes(bw.toLowerCase()));});
      if(matched.length)lines.push(`Transfers directly to ${matched.map(b=>BRAND_WORD[b]).join(' & ')}, matching your loyalty preference.`);
      else if(c.fee===0)lines.push('No annual fee — pure value with no commitment.');
      else{const tc=(c.annual||[]).reduce((s,b)=>s+(b.v||0),0)+(c.monthly||[]).reduce((s,b)=>s+(b.v||0)*12,0);
        if(tc>=c.fee)lines.push(`The $${c.fee} fee is largely offset by $${tc}+ in annual statement credits.`);
        else lines.push(`$${c.fee}/year annual fee — the earn rate makes it worth it at your spend level.`);}
      return {...entry,reason:lines.join(' ')};
    });
}

// pickQuizStrat recommends a card strategy based on the user's quiz answers.
// Considers brand loyalty (Alaska -> Atmos), experience level, and top spending category
// to pick one of the 6 defined strategies (e.g., Chase Trifecta, Amex Trifecta, etc.).
function pickQuizStrat(ans){
  const brands=(ans.brand||['none']).filter(b=>b!=='none');
  if(brands.includes('alaska'))return 'atmos-strategy';
  if(ans.exp==='adv'&&ans.spend==='dining')return 'amex-trifecta';
  if(ans.exp==='adv')return 'chase-trifecta';
  if(ans.exp==='some'&&(ans.spend==='travel'||ans.spend==='dining'))return 'chase-trifecta';
  if(ans.spend==='everything'&&ans.exp!=='new')return 'citi-duo';
  return 'c1-duo';
}

// QuizResults shows the quiz output after the user finishes all 5 questions.
// Displays the top 3 recommended cards with personalized reasons, Apply Now buttons,
// an "In wallet" badge for cards already owned, a recommended strategy section,
// and a Retake Quiz button.
// Props: answers (quiz answer object), onRetake (reset handler), myCards (wallet card IDs).
function QuizResults({answers,onRetake,myCards}){
  const [openStrat,setOpenStrat]=useState(false);
  const results=useMemo(()=>calcQuizResults(answers),[answers]);
  const strat=useMemo(()=>STRATS[pickQuizStrat(answers)],[answers]);
  return(
    <div style={{padding:"16px 16px 0",maxWidth:560,margin:"0 auto"}}>
      <div className="fu" style={{textAlign:"center",marginBottom:24}}>
        <div style={{marginBottom:8}}><Icon name="target" size={32} color="var(--acc)"/></div>
        <div style={{fontFamily:"'Inter',sans-serif",fontStyle:"italic",fontSize:24,fontWeight:700,color:"var(--tx)",marginBottom:4}}>Your Top Cards</div>
        <div style={{fontSize:12,color:"var(--tx3)"}}>Personalized picks based on your profile</div>
        <div style={{fontSize:10,color:"var(--tx4)",marginTop:6,lineHeight:1.4}}>Recommended cards include affiliate links. We earn a commission if you apply and are approved.</div>
      </div>

      {results.map(({c,reason},i)=>{
        const inWallet=myCards.includes(c.id);
        return(
          <div key={c.id} className="surf fu" style={{marginBottom:14,animationDelay:`${i*.07}s`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${c.c1},${c.c2})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,fontWeight:900,color:"rgba(255,255,255,.9)"}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:800,color:"var(--tx)",lineHeight:1.2}}>{c.name}</div>
                <div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>{c.issuer} · {c.fee>0?`$${c.fee}/yr`:'No annual fee'} · {c.cur}</div>
              </div>
              {inWallet&&<span style={{fontSize:10,fontWeight:700,color:"var(--grn2)",background:"rgba(16,185,129,.1)",padding:"2px 8px",borderRadius:99,flexShrink:0,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:3}}><Icon name="check" size={10} color="var(--grn2)"/> In wallet</span>}
            </div>
            <div style={{fontSize:12,color:"var(--tx2)",lineHeight:1.65,marginBottom:inWallet?0:12}}>{reason}</div>
            {!inWallet&&(
              <>
                <a href={APPLY_URLS[c.id]||'#apply-'+c.id} target="_blank"
                   style={{display:"block",textAlign:"center",padding:"11px 16px",background:"var(--acc)",color:"#fff",borderRadius:10,fontSize:13,fontWeight:700,textDecoration:"none",transition:"opacity .15s"}}
                   onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
                   onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  Apply Now →
                </a>
                <div className="apply-disclose" style={{textAlign:"center"}}>Affiliate link — we may earn a commission at no cost to you.</div>
              </>
            )}
          </div>
        );
      })}

      {strat&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:800,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Recommended Strategy</div>
          <div className="surf" style={{cursor:"pointer"}} onClick={()=>setOpenStrat(s=>!s)}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Icon name={STRAT_ICON_MAP[strat.id]||"diamond"} size={20} color="var(--acc)"/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>{strat.name}</div>
                <div style={{fontSize:11,color:"var(--grn2)",fontWeight:600,marginTop:1}}>{strat.value}</div>
              </div>
              <span style={{transition:"transform .2s",transform:openStrat?"rotate(90deg)":"none",display:"inline-flex"}}><Icon name="chevron-right" size={14} color="var(--tx3)"/></span>
            </div>
            {openStrat&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--br)"}}>
                <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.7}}>{strat.desc}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{textAlign:"center",paddingBottom:24}}>
        <button onClick={onRetake}
          style={{background:"transparent",border:"1.5px solid var(--br2)",color:"var(--tx3)",borderRadius:10,padding:"10px 24px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"color .15s,border-color .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.color="var(--tx)";e.currentTarget.style.borderColor="var(--br3)"}}
          onMouseLeave={e=>{e.currentTarget.style.color="var(--tx3)";e.currentTarget.style.borderColor="var(--br2)"}}>
          ↩ Retake Quiz
        </button>
      </div>
    </div>
  );
}

// QuizTab manages the Card Finder quiz flow -- showing one question at a time with
// animated transitions, a progress bar, single-select and multi-select question types.
// Saves completed answers to localStorage so results persist across visits.
// If the user already has saved answers, it shows QuizResults instead of the quiz.
// Props: myCards (array of card IDs in the user's wallet).
// The card finder quiz. Asks 5 questions about your spending habits and preferences,
// then recommends the top 3 cards and a strategy that fits your profile.
function QuizTab({myCards}){
  const [savedAnswers,setSavedAnswers]=useLS(CS_CONFIG.LS_KEYS.quiz,null);
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [multiSel,setMultiSel]=useState([]);
  const [animKey,setAnimKey]=useState(0);

  const retake=()=>{setSavedAnswers(null);setStep(0);setAnswers({});setMultiSel([]);setAnimKey(k=>k+1);};

  if(savedAnswers)return <QuizResults answers={savedAnswers} onRetake={retake} myCards={myCards}/>;

  const q=QUIZ_QS[step];
  const isLast=step===QUIZ_QS.length-1;

  const advance=(newAns)=>{
    setAnimKey(k=>k+1);
    if(!isLast){setStep(s=>s+1);setMultiSel([]);}
    else setSavedAnswers(newAns);
  };

  const handleSingle=(optId)=>{
    const newAns={...answers,[q.id]:optId};
    setAnswers(newAns);
    setTimeout(()=>advance(newAns),180);
  };

  const handleMultiToggle=(optId,excl)=>{
    if(excl){setMultiSel([optId]);return;}
    setMultiSel(sel=>{
      const without=sel.filter(s=>s!=='none'&&s!==optId);
      return sel.includes(optId)?without:[...without,optId];
    });
  };

  const handleMultiNext=()=>{
    const val=multiSel.length?multiSel:['none'];
    const newAns={...answers,[q.id]:val};
    setAnswers(newAns);
    advance(newAns);
  };

  return(
    <div style={{padding:"16px 16px 0",maxWidth:560,margin:"0 auto"}}>
      {/* Progress */}
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:11,color:"var(--tx3)",fontWeight:700,letterSpacing:.5}}>QUESTION {step+1} OF {QUIZ_QS.length}</span>
          <span style={{fontSize:11,color:"var(--tx4)"}}>Card Finder</span>
        </div>
        <div style={{height:3,background:"var(--s4)",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${((step+1)/QUIZ_QS.length)*100}%`,background:"linear-gradient(90deg,var(--acc),var(--acc2))",borderRadius:99,transition:"width .35s ease"}}/>
        </div>
      </div>

      {/* Question + options */}
      <div key={animKey} className="quiz-slide">
        <div style={{fontFamily:"'Inter',sans-serif",fontStyle:"italic",fontSize:22,fontWeight:700,color:"var(--tx)",marginBottom:22,lineHeight:1.35}}>
          {q.q}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {q.opts.map(opt=>{
            const isSel=q.multi?multiSel.includes(opt.id):false;
            return(
              <button key={opt.id}
                className="quiz-opt"
                onClick={()=>q.multi?handleMultiToggle(opt.id,opt.excl):handleSingle(opt.id)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",textAlign:"left",width:"100%",
                  background:isSel?"rgba(117,91,6,.07)":"var(--s1)",
                  border:`1.5px solid ${isSel?"var(--acc)":"var(--br2)"}`,
                  borderRadius:13,cursor:"pointer",transition:"background .12s,border-color .12s"}}>
                {opt.iconName&&<span style={{flexShrink:0,display:"inline-flex"}}><Icon name={opt.iconName} size={18}/></span>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{opt.label}</div>
                  {opt.sub&&<div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>{opt.sub}</div>}
                </div>
                {q.multi&&(
                  <div style={{width:19,height:19,borderRadius:5,border:"1.5px solid",borderColor:isSel?"var(--acc)":"var(--br3)",background:isSel?"var(--acc)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .12s"}}>
                    {isSel&&<Icon name="check" size={10} color="#fff"/>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {q.multi&&(
          <button onClick={handleMultiNext}
            style={{marginTop:18,width:"100%",padding:"13px",
              background:multiSel.length?"var(--acc)":"var(--s4)",
              color:multiSel.length?"#fff":"var(--tx4)",
              border:"none",borderRadius:13,cursor:multiSel.length?"pointer":"default",
              fontSize:13,fontWeight:700,transition:"background .15s,color .15s"}}>
            {isLast?"See My Cards →":"Next →"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── AUTH MODAL ──────────────────────────────────────────────────────────── */
// AuthModal is a popup for signing in or creating a FeeWorth account.
// Supports Google sign-in and email/password authentication.
// On sign-up, optionally subscribes the user to the newsletter.
// Shows error messages for common auth issues (wrong password, duplicate email, etc.).
// Props: onClose (handler to dismiss the modal).
// A login/signup popup. Lets users sign in with Google or email/password to sync their wallet across devices.
function AuthModal({onClose}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [isNew,setIsNew]=useState(false);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [nlChecked,setNlChecked]=useState(true);
  const fb=window.CS_FB;

  const subscribeNewsletter=async(user)=>{
    if(!fb||!user) return;
    try{
      const q=fb.query(fb.collection(fb.db,'newsletter_subscribers'),fb.where('email','==',user.email));
      const snap=await fb.getDocs(q);
      if(!snap.empty){
        const existingDoc=snap.docs[0];
        await fb.setDoc(existingDoc.ref,{uid:user.uid,source:'signup'},{merge:true});
      }else{
        await fb.setDoc(fb.doc(fb.db,'newsletter_subscribers',user.uid),{
          email:user.email,uid:user.uid,subscribedAt:fb.serverTimestamp(),source:'signup'
        });
      }
    }catch(err){console.warn('Newsletter subscribe failed:',err.message);}
  };

  const signInGoogle=async()=>{
    setLoading(true);setError('');
    try{
      const result=await fb.signInWithPopup(fb.auth,new fb.GoogleAuthProvider());
      if(nlChecked&&isNew) await subscribeNewsletter(result.user);
      onClose();
    }catch(e){
      console.error('Google auth error:',e.code,e.message);
      if(e.code!=='auth/popup-closed-by-user') setError('Google sign-in failed: '+(e.code||e.message||'Unknown error')+'. Try again.');
    }
    setLoading(false);
  };

  const signInEmail=async(e)=>{
    e.preventDefault();
    setLoading(true);setError('');
    try{
      let cred;
      if(isNew) cred=await fb.createUserWithEmailAndPassword(fb.auth,email,password);
      else cred=await fb.signInWithEmailAndPassword(fb.auth,email,password);
      if(nlChecked&&isNew) await subscribeNewsletter(cred.user);
      onClose();
    }catch(e){
      const msg={
        'auth/user-not-found':'No account found with that email.',
        'auth/wrong-password':'Incorrect password.',
        'auth/invalid-credential':'Incorrect email or password.',
        'auth/email-already-in-use':'An account already exists — try signing in.',
        'auth/weak-password':'Password must be at least 6 characters.',
        'auth/invalid-email':'Invalid email address.',
      }[e.code]||e.message;
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e=>e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close"><Icon name="x" size={18}/></button>
        <h2>Sign in to FeeWorth</h2>
        <p className="auth-modal-sub">Sync your wallet &amp; benefits across devices</p>
        <button className="auth-google-btn" onClick={signInGoogle} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 48 48" style={{flexShrink:0}}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
        <div className="auth-divider"><span>or</span></div>
        <form onSubmit={signInEmail}>
          {error&&<div className="auth-error">{error}</div>}
          <input className="auth-input" type="email" placeholder="Email" value={email}
            onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
          <input className="auth-input" type="password"
            placeholder={isNew?"Create a password (6+ chars)":"Password"}
            value={password} onChange={e=>setPassword(e.target.value)}
            required autoComplete={isNew?"new-password":"current-password"}/>
          {isNew&&(
            <label className="nl-check-wrap">
              <input type="checkbox" checked={nlChecked} onChange={e=>setNlChecked(e.target.checked)}/>
              <span className="nl-check-box">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span className="nl-check-label">Send me monthly credit card benefit reminders and tips</span>
            </label>
          )}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading?'…':isNew?'Create Account':'Sign In'}
          </button>
        </form>
        <div className="auth-toggle" onClick={()=>{setIsNew(n=>!n);setError('');}}>
          {isNew?<>Already have an account? <span>Sign in</span></>:<>No account? <span>Create one</span></>}
        </div>
      </div>
    </div>
  );
}

/* ── AUTH BUTTON (header) ────────────────────────────────────────────────── */
// AuthButton renders the login/account button in the top navigation bar.
// When not signed in, shows a "Login" button. When signed in, shows the user's avatar
// or initial with a dropdown menu containing their email, sync status, and sign-out option.
// Props: user (Firebase auth user or null), onSignIn (opens auth modal), fbReady (boolean).
// The sign-in / sign-out button shown in the navigation bar.
function AuthButton({user,onSignIn,fbReady}){
  const [open,setOpen]=useState(false);
  const wrapRef=useRef(null);

  useEffect(()=>{
    if(!open) return;
    const handler=e=>{if(wrapRef.current&&!wrapRef.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown',handler);
    return()=>document.removeEventListener('mousedown',handler);
  },[open]);

  if(!fbReady) return null;

  if(!user){
    return(
      <button className="auth-btn" onClick={onSignIn}>
        Login
      </button>
    );
  }

  const initial=(user.displayName||user.email||'?')[0].toUpperCase();
  const displayName=user.displayName||user.email?.split('@')[0]||'Account';

  return(
    <div className="auth-wrap" ref={wrapRef}>
      <button className="auth-btn" onClick={()=>setOpen(o=>!o)}>
        {user.photoURL
          ?<img className="auth-avatar" src={user.photoURL} referrerPolicy="no-referrer" alt=""/>
          :<span className="auth-initial">{initial}</span>}
        <span style={{maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {displayName}
        </span>
      </button>
      {open&&(
        <div className="auth-dropdown">
          <div className="auth-dropdown-name">{user.email}</div>
          <div style={{padding:'4px 8px 8px',fontSize:11,color:'var(--grn2)',fontWeight:600}}>
            <Icon name="check" size={11} color="var(--grn2)"/> Wallet synced to cloud
          </div>
          <button className="auth-dropdown-btn"
            onClick={async()=>{const fb=window.CS_FB;if(fb)await fb.signOut(fb.auth);setOpen(false);}}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// NAV_TABS defines the main navigation tabs shown at the top of the app.
// Each entry has an id (used for routing), a short label, and a subtitle.
const NAV_TABS=[
  {id:"home",     label:"Dashboard",       sub:"Your Overview"},
  {id:"benefits", label:"Fee Check",  sub:"Keep or Cancel"},
  {id:"household",label:"Household",        sub:"Couples Optimizer"},
  {id:"wallet",   label:"Wallet",           sub:"My Cards"},
  // REMOVED IN FEEWORTH PIVOT — preserved for reference
  // {id:"tips",   label:"Tips",     sub:"Pro Strategies"},
  // {id:"plan",   label:"Plan",     sub:"Trip Planner"},
  // {id:"usecard",label:"Use Card", sub:"Category Guide"},
  // {id:"offers", label:"Offers",   sub:"Explore Deals"},
];

// NavIcon renders a navigation-specific SVG icon for each tab in the top nav bar.
// Each icon is hand-drawn SVG for a consistent look. Returns null if the name is unknown.
function NavIcon({name,size=18}){
  const icons={
    home:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    benefits:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8V21M3 12h18M7.5 8C7.5 8 7.5 3 12 3s4.5 5 4.5 5"/><path d="M16.5 8C16.5 8 16.5 3 12 3"/></svg>,
    tips:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 2a7 7 0 015 11.9V16a1 1 0 01-1 1H8a1 1 0 01-1-1v-2.1A7 7 0 0112 2z"/></svg>,
    plan:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    usecard:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
    offers:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>,
    household:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    wallet:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 6V4a2 2 0 012-2h16a2 2 0 012 2v2"/><circle cx="17" cy="13" r="1.5"/></svg>
  };
  return icons[name]||null;
}

// TopNav is the sticky navigation bar at the top of every screen.
// It contains: the FeeWorth logo/wordmark, an optional PWA install button,
// the auth/login button, and a horizontal row of tab buttons for navigation.
// Props: tab, setTab, cardCount, user, onAuthClick, fbReady, pwaPrompt, onInstall.
function TopNav({tab,setTab,cardCount,user,onAuthClick,fbReady,pwaPrompt,onInstall}){
  return (
    <div className="top-nav">
      <div className="top-nav-brand">
        <div className="top-nav-brand-left">
        </div>
        <div className="top-nav-brand-title">
          <span className="logo-text">FeeWorth</span>
        </div>
        <div className="top-nav-brand-right">
          {pwaPrompt&&<button className="install-btn" onClick={onInstall}>⊕ Install</button>}
          <AuthButton user={user} onSignIn={onAuthClick} fbReady={fbReady}/>
        </div>
      </div>
      {user&&<div className="top-nav-tabs">
        {NAV_TABS.map(t=>(
          <button key={t.id} className={"nav-tab"+(tab===t.id?" active":"")} onClick={()=>setTab(t.id)}>
            <span className="nav-tab-icon"><NavIcon name={t.id}/></span>
            <span className="nav-tab-label">{t.label}</span>
          </button>
        ))}
      </div>}
    </div>
  );
}

/* ── BENEFIT RESET HELPER ─────────────────────────────────────────────────── */
// benKey creates a unique string key for each benefit, used to track check-off state.
// Monthly benefits get a "-m-" prefix to distinguish them from annual benefits with the same name.
function benKey(cardId,b,isMonthly){return isMonthly?cardId+"-m-"+b.n:cardId+"-"+b.n;}
// Returns an array of period keys for multi-period benefits (quarterly/semi-annual).
// For quarterly: [{key:"cardId-name-2026-Q1",label:"Q1",current:false}, ...x4]
// For semi-annual: [{key:"cardId-name-2026-H1",label:"H1",sub:"Jan–Jun",current:false}, ...x2]
// For monthly/annual/one-time: returns null (use single benKey instead).
function periodKeys(cardId,b,isMonthly){
  const year=new Date().getFullYear();
  const month=new Date().getMonth(); // 0-11
  const base=benKey(cardId,b,isMonthly);
  if(b.reset==="quarterly"){
    const cq=Math.floor(month/3);
    return [0,1,2,3].map(i=>({key:base+"-"+year+"-Q"+(i+1),label:"Q"+(i+1),current:i===cq,past:i<cq}));
  }
  if(b.reset==="semi-annual"){
    const ch=month<6?0:1;
    return [{key:base+"-"+year+"-H1",label:"H1",sub:"Jan–Jun",current:ch===0,past:false},
            {key:base+"-"+year+"-H2",label:"H2",sub:"Jul–Dec",current:ch===1,past:ch>1}];
  }
  return null;
}
// Returns the annual dollar value of a benefit accounting for its reset period.
function annualBenValue(b){
  if(!b.v)return 0;
  if(b.isMonthly)return b.v*12;
  if(b.reset==="quarterly")return b.v*4;
  if(b.reset==="semi-annual")return b.v*2;
  return b.v;
}
// needsReset checks whether a benefit's check-off should be automatically cleared.
// It compares the date the benefit was last checked against the current date,
// using the benefit's reset schedule (monthly, quarterly, semi-annual, or annual).
// Returns true if enough time has passed that the benefit has refreshed.
function needsReset(reset,checkDate,now){
  const cy=now.getFullYear(),cm=now.getMonth();
  const ly=checkDate.getFullYear(),lm=checkDate.getMonth();
  switch(reset){
    case'monthly':    return cy>ly||(cy===ly&&cm>lm);
    case'quarterly':  {const q=m=>Math.floor(m/3);return cy>ly||(cy===ly&&q(cm)>q(lm));}
    case'semi-annual':{const h=m=>m<6?0:1;return cy>ly||(cy===ly&&h(cm)>h(lm));}
    case'annual':     return cy>ly;
    default:          return false;
  }
}

/* ── APP ROOT ─────────────────────────────────────────────────────────────── */
// App is the root component that holds all app-wide state and renders everything.
// It manages: the user's card wallet, checked-off benefits, check dates, active tab,
// Firebase authentication, Firestore cloud sync, PWA install prompts, iOS/Android banners,
// and automatic benefit reset logic. All other components are rendered inside this one.
// The root component that ties everything together. Manages your card wallet,
// checked-off benefits, and which tab is currently showing. All other components live inside this.
function App(){
  const [myCards,setMyCards]=useLS(CS_CONFIG.LS_KEYS.cards,[]);
  const [tab,setTab]=useState("home");
  const [checkedArr,setCheckedArr]=useLS(CS_CONFIG.LS_KEYS.checked,[]);
  const [skippedArr,setSkippedArr]=useLS(CS_CONFIG.LS_KEYS.skipped,[]);
  const [checkDates,setCheckDates]=useLS(CS_CONFIG.LS_KEYS.checkDates,{});
  const [p2Cards,setP2Cards]=useLS(CS_CONFIG.LS_KEYS.p2Cards,[]);
  const [p2Name,setP2Name]=useLS(CS_CONFIG.LS_KEYS.p2Name,"");
  const [householdSetup,setHouseholdSetup]=useLS(CS_CONFIG.LS_KEYS.householdSetup,false);
  const [anniversaryDates,setAnniversaryDates]=useLS(CS_CONFIG.LS_KEYS.anniversaryDates,{});
  const [feedbackOpen,setFeedbackOpen]=useState(false);
  const [feedbackText,setFeedbackText]=useState("");
  const [feedbackSent,setFeedbackSent]=useState(false);
  const [feedbackSending,setFeedbackSending]=useState(false);
  const [firstYearCards,setFirstYearCards]=useLS(CS_CONFIG.LS_KEYS.firstYearCards,[]);
  const [resetBadges,setResetBadges]=useState(new Set());
  const [stratModal,setStratModal]=useState(null);
  const [user,setUser]=useState(null);
  const [authModal,setAuthModal]=useState(false);
  const [fbReady,setFbReady]=useState(!!window.CS_FB);
  const [pwaPrompt,setPwaPrompt]=useState(window._pwaPrompt||null);
  const [iosBanner,setIosBanner]=useState(()=>{
    const ua=navigator.userAgent;
    const isIos=/iphone|ipad|ipod/i.test(ua);
    const isAndroid=/android/i.test(ua);
    const isStandalone=window.navigator.standalone===true;
    if(localStorage.getItem(CS_CONFIG.LS_KEYS.iosDismissed)) return null;
    if(isIos&&!isStandalone){
      // CriOS = Chrome on iOS
      return /CriOS/i.test(ua)?'chrome-ios':'safari';
    }
    if(isAndroid&&/chrome/i.test(ua)&&!/android.*version\//i.test(ua)){
      // Android Chrome — show native install prompt banner
      return 'android';
    }
    return null;
  });

  // Refs so async callbacks always see latest values
  const cardsRef=useRef(myCards);   cardsRef.current=myCards;
  const checkedRef=useRef(checkedArr); checkedRef.current=checkedArr;
  const userRef=useRef(user);       userRef.current=user;
  // Prevent writing stale pre-load data on first mount
  const mountedRef=useRef(false);
  // Only allow Firestore writes when the user has explicitly changed data
  const dirtyRef=useRef(false);

  const checkedSet=useMemo(()=>new Set(checkedArr),[checkedArr]);
  const skippedSet=useMemo(()=>new Set(skippedArr),[skippedArr]);

  useEffect(()=>{
    if(!checkedArr.length) return;
    const now=new Date();
    const newChecked=new Set(checkedArr);
    const newDates={...checkDates};
    const badgeKeys=new Set();

    // Build flat benefit map for wallet cards + partner cards (includes period keys for multi-period benefits)
    const benefitMap={};
    const allWalletIds=[...myCards,...p2Cards];
    allWalletIds.forEach(cardId=>{
      const card=CARDS.find(c=>c.id===cardId);
      if(!card) return;
      card.annual.forEach(b=>{
        const entry={...b,isMonthly:false};
        benefitMap[benKey(cardId,b,false)]=entry;
        const pk=periodKeys(cardId,b,false);
        if(pk) pk.forEach(p=>{benefitMap[p.key]=entry;});
      });
      card.monthly.forEach(b=>{
        const entry={...b,isMonthly:true};
        benefitMap[benKey(cardId,b,true)]=entry;
      });
    });

    checkedArr.forEach(key=>{
      const b=benefitMap[key];
      const dateStr=checkDates[key];
      if(!b||!dateStr||!b.reset) return;
      // Period keys (e.g. -2026-Q1) reset when the year changes
      const isPeriodKey=/-\d{4}-[QH]\d$/.test(key);
      if(isPeriodKey){
        const keyYear=parseInt(key.match(/-(\d{4})-/)[1]);
        if(now.getFullYear()>keyYear){
          newChecked.delete(key);
          delete newDates[key];
          badgeKeys.add(key);
        }
      }else if(needsReset(b.reset,new Date(dateStr),now)){
        newChecked.delete(key);
        delete newDates[key];
        badgeKeys.add(key);
      }
    });

    if(badgeKeys.size>0){
      setCheckedArr([...newChecked]);
      setCheckDates(newDates);
      setResetBadges(badgeKeys);
    }
  },[]); // intentionally run once on mount

  function setCheckedBenefits(updateFn){
    dirtyRef.current=true;
    const newSet=updateFn(checkedSet);
    setCheckedArr([...newSet]);
  }
  function setSkippedBenefits(updateFn){
    dirtyRef.current=true;
    const newSet=updateFn(skippedSet);
    setSkippedArr([...newSet]);
  }

  // Dirty-aware wrappers for state setters passed as props to child components.
  // These mark data as user-modified so the Firestore write effect knows it's safe to sync.
  function dirtySetMyCards(v){dirtyRef.current=true;setMyCards(typeof v==='function'?v(myCards):v);}
  function dirtySetP2Cards(v){dirtyRef.current=true;setP2Cards(typeof v==='function'?v(p2Cards):v);}
  function dirtySetP2Name(v){dirtyRef.current=true;setP2Name(typeof v==='function'?v(p2Name):v);}
  function dirtySetHouseholdSetup(v){dirtyRef.current=true;setHouseholdSetup(typeof v==='function'?v(householdSetup):v);}
  function dirtySetAnniversaryDates(v){dirtyRef.current=true;setAnniversaryDates(typeof v==='function'?v(anniversaryDates):v);}
  function dirtySetFirstYearCards(v){dirtyRef.current=true;setFirstYearCards(typeof v==='function'?v(firstYearCards):v);}

  // ── PWA install prompt ────────────────────────────────────────────────────
  useEffect(()=>{
    const onReady=()=>setPwaPrompt(window._pwaPrompt);
    const onInstalled=()=>setPwaPrompt(null);
    window.addEventListener('cs-pwa-ready',onReady);
    window.addEventListener('cs-pwa-installed',onInstalled);
    return()=>{
      window.removeEventListener('cs-pwa-ready',onReady);
      window.removeEventListener('cs-pwa-installed',onInstalled);
    };
  },[]);

  const handleInstall=async()=>{
    if(!pwaPrompt) return;
    pwaPrompt.prompt();
    await pwaPrompt.userChoice;
    setPwaPrompt(null);
  };

  // ── Wait for Firebase module to finish loading ─────────────────────────────
  useEffect(()=>{
    if(window.CS_FB){setFbReady(true);return;}
    const handler=()=>setFbReady(true);
    window.addEventListener('cs-firebase-ready',handler);
    return()=>window.removeEventListener('cs-firebase-ready',handler);
  },[]);

  // ── Firebase auth + Firestore sync (runs once Firebase is ready) ──────────
  useEffect(()=>{
    if(!fbReady) return;
    const fb=window.CS_FB;
    if(!fb) return;
    const unsub=fb.onAuthStateChanged(fb.auth,async u=>{
      setUser(u);
      if(!u){
        userRef.current=null;
        setTab("home");
        mountedRef.current=true;
        window._csAuthDone=true;
        return;
      }
      mountedRef.current=false;
      userRef.current=u;
      // Load cloud data — Firestore is the source of truth for signed-in users.
      // Always apply cloud values so data syncs across devices.
      // The deferred-reload in sw-register.js ensures this completes before
      // any SW or version-check reload can interrupt it.
      try{
        const snap=await fb.getDoc(fb.doc(fb.db,'users',u.uid));
        if(snap.exists()){
          const cloud=snap.data();
          setMyCards(cloud.cs_cards||[]);
          setCheckedArr(cloud.cs_checked||[]);
          if(cloud.cs_skipped) setSkippedArr(cloud.cs_skipped);
          if(cloud.cs_p2_cards) setP2Cards(cloud.cs_p2_cards);
          if(cloud.cs_p2_name!=null) setP2Name(cloud.cs_p2_name);
          if(cloud.cs_household_setup!=null) setHouseholdSetup(cloud.cs_household_setup);
          if(cloud.cs_anniversary_dates) setAnniversaryDates(cloud.cs_anniversary_dates);
        }
        mountedRef.current=true;
        window._csAuthDone=true;
      }catch(e){
        console.warn('Firestore load failed:',e.message);
        mountedRef.current=true;
        window._csAuthDone=true;
      }
      // Link standalone newsletter subscription to this account (Task 3 dedup)
      try{
        if(fb.query&&fb.collection){
          const nlQ=fb.query(fb.collection(fb.db,'newsletter_subscribers'),fb.where('email','==',u.email));
          const nlSnap=await fb.getDocs(nlQ);
          if(!nlSnap.empty){
            const nlDoc=nlSnap.docs[0];
            if(!nlDoc.data().uid) await fb.setDoc(nlDoc.ref,{uid:u.uid},{merge:true});
          }
        }
      }catch(e){console.warn('Newsletter link failed:',e.message);}
    });
    return unsub;
  },[fbReady]);

  // ── Write to Firestore on every change (when signed in) ───────────────────
  useEffect(()=>{
    if(!dirtyRef.current) return; // only write when user has explicitly changed data
    const fb=window.CS_FB;
    const u=userRef.current;
    if(!fb||!u) return;
    fb.setDoc(fb.doc(fb.db,'users',u.uid),
      {cs_cards:myCards, cs_checked:checkedArr, cs_skipped:skippedArr,
       cs_p2_cards:p2Cards, cs_p2_name:p2Name, cs_household_setup:householdSetup,
       cs_anniversary_dates:anniversaryDates},
      {merge:true}
    ).then(()=>{dirtyRef.current=false;})
    .catch(e=>console.warn('Firestore write failed:',e.message));
  },[myCards,checkedArr,skippedArr,p2Cards,p2Name,householdSetup,anniversaryDates]);

  useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"});},[tab]);

  return (
    <div style={{minHeight:"100vh",paddingBottom:iosBanner?116:48}}>
      {authModal&&<AuthModal onClose={()=>setAuthModal(false)}/>}
      <TopNav tab={tab} setTab={setTab} cardCount={myCards.length} user={user} onAuthClick={()=>setAuthModal(true)} fbReady={fbReady} pwaPrompt={pwaPrompt} onInstall={handleInstall}/>
      {iosBanner&&(
        <div className="ios-install-banner">
          {iosBanner==='android'
            ? <>
                <span>Install FeeWorth for quick access</span>
                <div style={{display:'flex',gap:8,alignItems:'center',pointerEvents:'auto'}}>
                  <button className="install-btn" style={{pointerEvents:'auto'}} onClick={()=>{handleInstall();setIosBanner(null);localStorage.setItem(CS_CONFIG.LS_KEYS.iosDismissed,'1');}}>Install</button>
                  <button onClick={()=>{setIosBanner(null);localStorage.setItem(CS_CONFIG.LS_KEYS.iosDismissed,'1');}} aria-label="Dismiss" style={{pointerEvents:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--tx3)',padding:'4px 6px',flexShrink:0,WebkitTapHighlightColor:'transparent',display:'flex',alignItems:'center'}}><Icon name="x" size={16} color="var(--tx3)"/></button>
                </div>
              </>
            : <>
                <span>
                  {iosBanner==='chrome-ios'
                    ? <>Tap the <svg style={{display:'inline-block',verticalAlign:'middle',margin:'0 2px 2px'}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="14" rx="2"/><polyline points="12,2 12,14"/><polyline points="8,6 12,2 16,6"/></svg> icon at the <strong>top right</strong>, then <strong>"Add to Home Screen"</strong></>
                    : <>Tap the <svg style={{display:'inline-block',verticalAlign:'middle',margin:'0 2px 2px'}} width="18" height="18" viewBox="0 0 50 50" fill="none" stroke="#555" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="20" width="34" height="24" rx="4"/><polyline points="25,2 25,30"/><polyline points="15,12 25,2 35,12"/></svg> icon at the <strong>bottom of your screen</strong>, then <strong>"Add to Home Screen"</strong></>
                  }
                </span>
                <button onClick={()=>{setIosBanner(null);localStorage.setItem(CS_CONFIG.LS_KEYS.iosDismissed,'1');}} aria-label="Dismiss"><Icon name="x" size={16}/></button>
              </>
          }
        </div>
      )}
      <div className="tab-content-wrap" style={{paddingTop:8}}>
        {/* When not authenticated, always show HomeTab (which renders the landing page) */}
        {!user?(
          <HomeTab myCards={[]} setMyCards={dirtySetMyCards} checkedSet={checkedSet} setTab={setTab} setStratModal={setStratModal} anniversaryDates={anniversaryDates} user={user} onAuthClick={()=>setAuthModal(true)} p2Cards={p2Cards} p2Name={p2Name} householdSetup={householdSetup} firstYearCards={firstYearCards}/>
        ):(
          <>
            {tab==="home"&&    <HomeTab myCards={myCards} setMyCards={dirtySetMyCards} checkedSet={checkedSet} setTab={setTab} setStratModal={setStratModal} anniversaryDates={anniversaryDates} user={user} onAuthClick={()=>setAuthModal(true)} p2Cards={p2Cards} p2Name={p2Name} householdSetup={householdSetup} firstYearCards={firstYearCards}/>}
            {tab==="benefits"&&<RenewalAdvisorTab myCards={myCards} checkedSet={checkedSet} setCheckedBenefits={setCheckedBenefits} checkDates={checkDates} setCheckDates={setCheckDates} resetBadges={resetBadges} skippedSet={skippedSet} setSkippedBenefits={setSkippedBenefits} anniversaryDates={anniversaryDates} setAnniversaryDates={dirtySetAnniversaryDates} p2Cards={p2Cards} p2Name={p2Name} householdSetup={householdSetup} firstYearCards={firstYearCards} setFirstYearCards={dirtySetFirstYearCards}/>}
            {tab==="household"&&<HouseholdTab myCards={myCards} p2Cards={p2Cards} setP2Cards={dirtySetP2Cards} p2Name={p2Name} setP2Name={dirtySetP2Name} householdSetup={householdSetup} setHouseholdSetup={dirtySetHouseholdSetup} checkedSet={checkedSet} user={user} onAuthClick={()=>setAuthModal(true)} setTab={setTab} firstYearCards={firstYearCards}/>}
            {tab==="quiz"&&    <QuizTab myCards={myCards}/>}
            {tab==="wallet"&&  <WalletTab myCards={myCards} setMyCards={dirtySetMyCards} anniversaryDates={anniversaryDates} setAnniversaryDates={dirtySetAnniversaryDates}/>}
          </>
        )}
      </div>
      {stratModal&&<StratModal stratId={stratModal} myCards={myCards} onClose={()=>setStratModal(null)}/>}
      <NewsletterPopup user={user}/>
      <NewsletterSubscribe/>
      <div style={{padding:"32px 24px 28px",background:"var(--s3)",marginTop:24}}>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between",gap:"6px 16px",marginBottom:10,maxWidth:1000,margin:"0 auto 10px"}}>
          <span style={{fontSize:11,color:feedbackSent?"var(--grn2)":"var(--tx3)",textDecoration:"none",cursor:"pointer",transition:"color .2s"}}
             onClick={()=>{if(!feedbackSent)setFeedbackOpen(!feedbackOpen);}}
             onMouseEnter={e=>{if(!feedbackSent)e.currentTarget.style.color="var(--acc)";}}
             onMouseLeave={e=>{if(!feedbackSent)e.currentTarget.style.color="var(--tx3)";}}>
            {feedbackSent?"Thanks! We\u2019ll review this shortly.":"See outdated info? Let us know \u2192"}
          </span>
          <a href="./privacy-policy.html" target="_blank"
             style={{fontSize:11,color:"var(--tx3)",textDecoration:"none"}}
             onMouseEnter={e=>e.currentTarget.style.color="var(--acc)"}
             onMouseLeave={e=>e.currentTarget.style.color="var(--tx3)"}>
            Privacy Policy
          </a>
          <a href="./terms.html" target="_blank"
             style={{fontSize:11,color:"var(--tx3)",textDecoration:"none"}}
             onMouseEnter={e=>e.currentTarget.style.color="var(--acc)"}
             onMouseLeave={e=>e.currentTarget.style.color="var(--tx3)"}>
            Terms of Service
          </a>
          <a href="./affiliate-disclosure.html" target="_blank"
             style={{fontSize:11,color:"var(--tx3)",textDecoration:"none"}}
             onMouseEnter={e=>e.currentTarget.style.color="var(--acc)"}
             onMouseLeave={e=>e.currentTarget.style.color="var(--tx3)"}>
            Affiliate Disclosure
          </a>
        </div>
        {feedbackOpen&&!feedbackSent&&(
          <div style={{maxWidth:1000,margin:"0 auto 10px",overflow:"hidden",transition:"all .2s"}}>
            <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value)}
              placeholder="Tell us what's outdated or incorrect..."
              rows={3}
              style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",fontSize:12,fontFamily:"Inter,sans-serif",
                border:"1px solid var(--br2)",borderRadius:8,background:"var(--bg)",color:"var(--tx)",
                resize:"vertical",outline:"none",marginBottom:6}}
              onFocus={e=>e.currentTarget.style.borderColor="var(--acc)"}
              onBlur={e=>e.currentTarget.style.borderColor="var(--br2)"}/>
            <button onClick={async()=>{
              if(!feedbackText.trim())return;
              setFeedbackSending(true);
              try{
                await emailjs.send("service_jq89dig","template_ojxqunw",{message:feedbackText,from_page:window.location.href},"sbpCDiM6phLK4xj_y");
                setFeedbackSent(true);setFeedbackText("");setFeedbackOpen(false);
                setTimeout(()=>setFeedbackSent(false),4000);
              }catch(err){console.error("Feedback send failed:",err);alert("Failed to send. Please try again.");}
              setFeedbackSending(false);
            }}
              disabled={feedbackSending||!feedbackText.trim()}
              style={{padding:"6px 18px",fontSize:11,fontWeight:700,color:"#fff",background:feedbackSending||!feedbackText.trim()?"var(--tx4)":"var(--acc)",
                border:"none",borderRadius:99,cursor:feedbackSending?"wait":"pointer",transition:"background .2s"}}>
              {feedbackSending?"Sending...":"Submit"}
            </button>
          </div>
        )}
        <div style={{fontSize:11,color:"var(--tx3)",lineHeight:1.5,maxWidth:1000,margin:"0 auto"}}>
          FeeWorth may earn a commission from card applications. This does not influence our recommendations.
        </div>
      </div>
      <div style={{textAlign:"center",padding:"16px 0 24px",borderTop:"1px solid #e5e7eb"}}>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#9ca3af"}}>
          &copy; 2025&ndash;2026 FeeWorth. All rights reserved.
        </div>
      </div>
    </div>
  );
}

// This line starts the entire app by creating a React root on the HTML element with id="root"
// and rendering the App component into it. This is the entry point that kicks everything off.
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
