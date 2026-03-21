// components.js — All React components for CardSage
//
// This file contains every React component, hook, and helper used by CardSage.
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
//   App (root) → TopNav, HomeTab, BenefitsTab, TipsTab, UsecardTab,
//                 OffersTab, QuizTab, WalletTab, StratModal,
//                 NewsletterSubscribe, AuthModal
//
// Hooks: useLS (localStorage-backed state)
// Helpers: Icon, CardArt, CreditCardDisplay, ValueMeter, CatChip, etc.

const {useState,useEffect,useCallback,useMemo,useRef}=React;

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

/* LS hook */
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

/* ── Data loaded from cards-data.js ─────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════════════════
   ICON SYSTEM — SVG stroke icons (24×24 viewBox, 1.5 stroke-width)
   ═══════════════════════════════════════════════════════════════════════════ */
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
};

function Icon({name,size=18,color="currentColor",className=""}){
  const paths=ICON_PATHS[name];
  if(!paths)return null;
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>{paths}</svg>);
}

/* ── ID-based icon maps (no emoji literals) ──────────────────────────────── */
const STRAT_ICON_MAP={"chase-trifecta":"trident","amex-trifecta":"bolt","c1-duo":"diamond","citi-duo":"globe","ink-trio":"diamond","atmos-strategy":"wave"};
const BCAT_ICON_MAP={travel:"plane",dining:"utensils",entertainment:"film",status:"star",statement:"credit-card",awards:"gift",protection:"shield"};
const SPEND_CAT_ICON={d:"utensils",g:"shopping-cart",gas:"car",t:"plane",s:"tv",a:"package",tr:"car",p:"pill",o:"credit-card"};
const SPECIAL_CAT_ICON={hyatt:"building",delta:"plane",sw:"plane",united:"plane",hilton:"building",marriott:"building",alaska:"wave",aa:"plane",amazon:"package",rent:"home",ihg:"building"};

/* ── Category color system ────────────────────────────────────────────────── */
const CATEGORY_COLORS={
  dining:       {bg:"#fdf4ec",text:"#92400e",border:"#f59e0b"},
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
const SPEND_CAT_COLOR={d:"dining",g:"grocery",gas:"gas",t:"travel",s:"streaming",a:"shopping",tr:"transit",p:"health",o:"other"};
function CatChip({cat,label}){
  const cc=CATEGORY_COLORS[cat]||CATEGORY_COLORS.other;
  return <span className="cat-chip" style={{background:cc.bg,color:cc.text,borderColor:cc.border}}>{label||cat}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CreditCardDisplay — unified card component
   Usage: <CreditCardDisplay card={card} size="md"/> or size="sm"
   ═══════════════════════════════════════════════════════════════════════════ */
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
          <div style={{width:isSm?24:36,height:isSm?16:26,borderRadius:isSm?2:4,background:"linear-gradient(135deg,#e6c369,#b8860b)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(255,255,255,.15) 4px,rgba(255,255,255,.15) 5px),repeating-linear-gradient(90deg,transparent,transparent 6px,rgba(255,255,255,.15) 6px,rgba(255,255,255,.15) 7px)"}}/>
          </div>
          {!isSm&&<div style={{display:"flex",gap:4}}>{[0,1,2,3].map(i=><div key={i} style={{display:"flex",gap:2}}>{[0,1,2,3].map(j=><div key={j} style={{width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,.35)"}}/>)}</div>)}</div>}
        </div>
        <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:"italic",fontSize:isSm?11:16,opacity:.8}}>{card.network}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARDSAGE v3 — PART 2: REACT COMPONENTS
   Combines with cs_v3_part1.html (data layer + CSS)
═══════════════════════════════════════════════════════════════════════════ */

/* ── STITCH DESIGN HELPERS ────────────────────────────────────────────────── */
function getIssuerColor(issuer){
  const map={'Chase':'#112e51','American Express':'#006fcf','Capital One':'#003a70',
    'Citi':'#004c97','Cardless':'#1a1a1a','Bilt':'#1a1a1a',
    'Bank of America':'#c01230','Wells Fargo':'#c8222c','US Bank':'#003087',
    'Discover':'#f06c00','Barclays':'#00aeef'};
  return map[issuer]||'#0f172a';
}
function getIssuerGradient(card){
  if(card.id==='amex-plat')return'linear-gradient(135deg,#a8a8a8,#d4d4d4)';
  const map={'Chase':'linear-gradient(135deg,#0f1e3d,#1a3a6b)',
    'American Express':'linear-gradient(135deg,#006fcf,#00b2ff)',
    'Capital One':'linear-gradient(135deg,#0d1b2a,#1b3a5c)',
    'Citi':'linear-gradient(135deg,#003087,#0052cc)',
    'Bilt':'linear-gradient(135deg,#1a1a1a,#333)',
    'Cardless':'linear-gradient(135deg,#1a1a1a,#333)'};
  return map[card.issuer]||`linear-gradient(135deg,${card.c1},${card.c2})`;
}
function getTopEarnCats(card){
  const labels={d:'Dining',g:'Grocery',gas:'Gas',t:'Travel',s:'Streaming',
    a:'Amazon',tr:'Rideshare',p:'Pharmacy'};
  return Object.entries(card.earn||{})
    .filter(([k,v])=>k!=='o'&&parseFloat(String(v).replace(/[^0-9.]/g,''))>1)
    .sort((a,b)=>parseFloat(String(b[1]).replace(/[^0-9.]/g,''))-parseFloat(String(a[1]).replace(/[^0-9.]/g,'')))
    .slice(0,2).map(([k])=>labels[k]||k);
}
function NfcIcon(){
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 18.5a8 8 0 019-12.5"/><path d="M8 15.5a4.5 4.5 0 015.5-7"/><circle cx="10" cy="14" r="1" fill="rgba(255,255,255,.6)"/></svg>;
}

/* ── VALUE METER ──────────────────────────────────────────────────────────── */
function ValueMeter({v=1,max=3}){
  return <span className="value-badge" title={`Value: ${v}/${max}`}>
    {Array.from({length:max},(_,i)=>(
      <span key={i} className={i<v?"lit":""} style={{background:i<v?"#f59e0b":"#334155"}}/>
    ))}
  </span>;
}

/* ── CARD ART ─────────────────────────────────────────────────────────────── */
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
            <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
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
                  <div key={cardId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--br)"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{s.req_names[i]}</div>
                      <div style={{fontSize:11,color:"var(--tx3)"}}>Annual fee: {card.fee===0?"Free":"$"+card.fee}</div>
                    </div>
                    <div>
                      <a className="apply-btn" href={APPLY_URLS[cardId]||"#apply-"+cardId} target="_blank" rel="noopener noreferrer">Apply Now →</a>
                      <div className="apply-disclose">Affiliate link — we may earn a commission at no cost to you.</div>
                    </div>
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

/* ── HOME TAB ─────────────────────────────────────────────────────────────── */
function HomeTab({myCards,setMyCards,checkedSet,setTab,setStratModal}){
  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);

  const totalFees=useMemo(()=>cards.reduce((s,c)=>s+c.fee,0),[cards]);
  const totalCredits=useMemo(()=>cards.reduce((s,c)=>{
    const ann=c.annual.reduce((a,b)=>a+(b.v||0),0);
    const mon=c.monthly.reduce((a,b)=>a+((b.v||0)*12),0);
    return s+ann+mon;
  },0),[cards]);
  const netValue=totalCredits-totalFees;

  const myStratIds=useMemo(()=>{
    const seen=new Set();
    cards.forEach(c=>(c.strat||[]).forEach(s=>seen.add(s)));
    return [...seen];
  },[cards]);

  const oneCardAway=useMemo(()=>{
    if(!myCards.length)return[];
    return Object.values(STRATS).filter(s=>{
      if(myStratIds.includes(s.id))return false;
      if(s.req.filter(id=>!myCards.includes(id)).length===1)return true;
      if(s.alt)return s.alt.some(arr=>arr.filter(id=>!myCards.includes(id)).length===1);
      return false;
    }).slice(0,3);
  },[myCards,myStratIds]);

  const monthlyAlerts=useMemo(()=>{
    const list=[];
    cards.forEach(card=>{
      card.monthly.forEach(b=>{
        const key=benKey(card.id,b,true);
        if(!checkedSet.has(key))list.push({card,b,key});
      });
    });
    return list.slice(0,4);
  },[cards,checkedSet]);

  if(!myCards.length){
    return (
      <div style={{padding:"0 16px"}}>
        {/* Hero Section */}
        <div className="home-hero">
          <div className="home-hero-content">
            <div className="home-hero-eyebrow">ELITE FINANCIAL MANAGEMENT</div>
            <h1 className="home-hero-title">Welcome to<br/>CardSage</h1>
            <p className="home-hero-subtitle">The definitive editorial ledger for your premium credit portfolio. Track, optimize, and ascend.</p>
            <button className="btn" onClick={()=>setTab("wallet")}>Add Your Cards →</button>
          </div>
          <div className="home-hero-card">
            <div className="hero-card-mockup">
              <div className="hero-card-inner">
                {/* Top row: logo + brand */}
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M8 0L15.5 4.5V13.5L8 18L0.5 13.5V4.5L8 0Z" stroke="rgba(255,255,255,.8)" strokeWidth="1.2"/></svg>
                  <span style={{fontSize:10,letterSpacing:2.5,textTransform:'uppercase',fontWeight:700,opacity:.85}}>CARDSAGE</span>
                </div>
                {/* Card name */}
                <div style={{flex:1,display:'flex',alignItems:'center'}}>
                  <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontStyle:'italic',fontWeight:500}}>Sage Platinum</div>
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
                    <div style={{width:40,height:30,borderRadius:4,background:'linear-gradient(135deg,#d4a840,#b8860b)',position:'relative',overflow:'hidden'}}>
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
            <div className="home-feature-icon"><Icon name="shield-check" size={24} color="#fff"/></div>
            <h3 className="home-feature-title">Track Every Benefit</h3>
            <p className="home-feature-desc">Monitor your credits, perks, and statement credits. Never let a monthly benefit expire unused.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon"><Icon name="zap" size={24} color="#fff"/></div>
            <h3 className="home-feature-title">Optimize Every Spend</h3>
            <p className="home-feature-desc">Our Use Card guide tells you exactly which card to pull at every register for maximum rewards.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon"><Icon name="trophy" size={24} color="#fff"/></div>
            <h3 className="home-feature-title">Master the Rewards Game</h3>
            <p className="home-feature-desc">Expert strategies and pro tips to stack points, find sweet spots, and build the perfect wallet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"16px 16px 0"}}>
      {/* Dashboard header */}
      <div style={{marginBottom:20}}>
        <h2 className="page-title" style={{fontSize:36}}>Your Dashboard</h2>
        <p className="page-subtitle">{cards.length} card{cards.length!==1?'s':''} in your portfolio</p>
      </div>
      {/* Stats grid */}
      <div className="stats-grid fu">
        <div className="stat-box">
          <div className="stat-val" style={{color:"var(--red2)"}}>${totalFees}</div>
          <div className="stat-lbl">Annual Fees</div>
        </div>
        <div className="stat-box">
          <div className="stat-val grn-text">${totalCredits}</div>
          <div className="stat-lbl">Total Credits</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{color:netValue>=0?"var(--grn2)":"var(--red2)"}}>
            {netValue>=0?"+":""}{netValue}
          </div>
          <div className="stat-lbl">Net Value</div>
        </div>
      </div>

      {/* Monthly credits alert */}
      {monthlyAlerts.length>0&&(
        <div style={{marginBottom:16}}>
          <div className="section-hdr">
            <div className="section-title"><Icon name="bolt" size={14} color="var(--acc)"/> MONTHLY CREDITS TO USE</div>
            <button className="btn-ghost btn-sm" onClick={()=>setTab("benefits")}>See All</button>
          </div>
          {monthlyAlerts.map(({card,b,key})=>(
            <div key={key} className="surf" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <CreditCardDisplay card={card} size="sm"/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",marginBottom:2}}>{b.n}</div>
                <div style={{fontSize:11,color:"var(--tx3)",marginBottom:5}}>{card.short}</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",background:"rgba(16,185,129,.12)",borderRadius:99,fontSize:11,color:"var(--grn2)",fontWeight:700}}>
                  <Icon name="dollar" size={12} color="var(--grn2)"/> ${b.v}/mo — expires soon!
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active strategies */}
      {myStratIds.length>0&&(
        <div style={{marginBottom:16}}>
          <div className="section-title" style={{marginBottom:10}}><Icon name="trident" size={14} color="var(--acc)"/> YOUR ACTIVE STRATEGIES</div>
          <div className="strats-list">{myStratIds.map(sid=>{
            const s=STRATS[sid];
            if(!s)return null;
            return (
              <div key={sid} className="surf glow-card" style={{marginBottom:8,cursor:"pointer"}} onClick={()=>setStratModal(sid)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Icon name={STRAT_ICON_MAP[s.id]||"diamond"} size={24} color="var(--acc)"/>
                    <div>
                      <div style={{fontSize:14,fontWeight:800,color:"var(--tx)"}}>{s.name}</div>
                      <div style={{fontSize:11,color:"var(--grn2)",fontWeight:700,marginTop:1}}>{s.value}</div>
                    </div>
                  </div>
                  <span style={{color:"var(--tx3)",fontSize:14}}>→</span>
                </div>
                <div style={{fontSize:12,color:"var(--tx3)",marginTop:8,lineHeight:1.5}}>{s.desc.slice(0,110)}…</div>
              </div>
            );
          })}</div>
        </div>
      )}

      {/* One Card Away */}
      {oneCardAway.length>0&&(
        <div style={{marginBottom:16}}>
          <div className="section-title" style={{marginBottom:10}}><Icon name="target" size={14} color="var(--acc)"/> ONE CARD AWAY FROM…</div>
          {oneCardAway.map(s=>{
            const missingId=s.req.find(id=>!myCards.includes(id))||
              (s.alt&&s.alt.find(arr=>arr.filter(id=>!myCards.includes(id)).length===1)||[]).find(id=>!myCards.includes(id));
            const mc=CARDS.find(c=>c.id===missingId);
            return (
              <div key={s.id} className="surf glow-card" style={{marginBottom:8,cursor:"pointer",borderColor:"rgba(245,158,11,.2)"}} onClick={()=>setStratModal(s.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Icon name={STRAT_ICON_MAP[s.id]||"diamond"} size={20} color="var(--acc)"/>
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:"var(--tx)"}}>{s.name}</div>
                      <div style={{fontSize:11,color:"var(--gld2)",fontWeight:700}}>{s.value} potential</div>
                    </div>
                  </div>
                  <div className="badge" style={{background:"rgba(245,158,11,.12)",color:"#fbbf24",border:"1px solid rgba(245,158,11,.25)",flexShrink:0}}>1 Card Needed</div>
                </div>
                {mc&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(245,158,11,.06)",borderRadius:10,marginBottom:8}}>
                    <span style={{fontSize:11,color:"var(--tx3)"}}>Add:</span>
                    <span style={{fontSize:12,fontWeight:700,color:"var(--gld2)"}}>{mc.name}</span>
                    <span style={{fontSize:11,color:"var(--tx4)"}}>• {mc.fee===0?"Free":"$"+mc.fee+"/yr"}</span>
                  </div>
                )}
                <div style={{fontSize:11,color:"var(--tx4)",lineHeight:1.55}}>{(s.forBeginners||"").slice(0,120)}… <span style={{color:"var(--acc2)"}}>Tap to learn more →</span></div>
              </div>
            );
          })}
        </div>
      )}

      {/* My cards strip */}
      <div style={{marginBottom:16}}>
        <div className="section-hdr">
          <div className="section-title">MY WALLET ({cards.length})</div>
          <button className="btn-ghost btn-sm" onClick={()=>setTab("wallet")}>Edit</button>
        </div>
        <div className="hscroll" style={{paddingBottom:8}}>
          {cards.map(c=><CreditCardDisplay key={c.id} card={c} size="sm"/>)}
          <div onClick={()=>setTab("wallet")} style={{width:136,height:82,flexShrink:0,borderRadius:14,border:"2px dashed var(--br2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--tx3)",fontSize:24}}>+</div>
        </div>
      </div>
    </div>
  );
}

/* ── BENEFITS TAB ─────────────────────────────────────────────────────────── */
const RESET_LABELS={monthly:"Monthly",quarterly:"Quarterly","semi-annual":"Semi-annual",annual:"Annual"};
function BenefitsTab({myCards,checkedSet,setCheckedBenefits,checkDates,setCheckDates,resetBadges=new Set()}){
  const [filterCat,setFilterCat]=useState("all");
  const [openBen,setOpenBen]=useState(null);

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
    if(filterCat==="unused")return trackable.filter(b=>!checkedSet.has(b.key));
    return allBenefits.filter(b=>b.cat===filterCat);
  },[allBenefits,trackable,filterCat,checkedSet]);

  const checkedCount=useMemo(()=>trackable.filter(b=>checkedSet.has(b.key)).length,[trackable,checkedSet]);
  const pct=useMemo(()=>trackable.length?Math.round((checkedCount/trackable.length)*100):0,[checkedCount,trackable]);
  const usedValue=useMemo(()=>trackable.filter(b=>checkedSet.has(b.key)).reduce((s,b)=>s+(b.isMonthly?(b.v*12):b.v),0),[trackable,checkedSet]);
  const totalValue=useMemo(()=>trackable.reduce((s,b)=>s+(b.isMonthly?(b.v*12):b.v),0),[trackable]);

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
          <div style={{fontSize:26,fontWeight:900,color:pct>60?"var(--grn2)":"var(--gld2)",lineHeight:1,fontFamily:"'Playfair Display',Georgia,serif"}}>{pct}%</div>
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
          const trackHere=cardBens.filter(b=>b.v!=null);
          const usedHere=trackHere.filter(b=>checkedSet.has(b.key)).length;
          return (
            <div key={card.id} style={{marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <CreditCardDisplay card={card} size="sm"/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:600,color:"var(--tx)"}}>{card.short||card.name}</div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{usedHere}/{trackHere.length} credits used</div>
                </div>
                <div className="prog-track" style={{width:80}}>
                  <div className="prog-fill" style={{width:(trackHere.length?Math.round(usedHere/trackHere.length*100):0)+"%",background:getIssuerColor(card.issuer)}}/>
                </div>
              </div>
              <div className="benefit-item" style={{borderLeftColor:getIssuerColor(card.issuer),padding:"0 14px"}}>
                {cardBens.map((b,i)=>{
                  const done=checkedSet.has(b.key);
                  const isOpen=openBen===b.key;
                  const bc=BCAT[b.cat]||BCAT.statement;
                  const rl=RESET_LABELS[b.reset];
                  const wasReset=resetBadges.has(b.key);
                  return (
                    <div key={b.key} onClick={()=>toggleExpand(b.key)}
                      role="button" tabIndex={0}
                      onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&toggleExpand(b.key)}
                      style={{borderBottom:i<cardBens.length-1?"1px solid var(--br)":"none",padding:"10px 0",cursor:"pointer"}}>
                      {/* Collapsed row */}
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button className={"ben-check"+(done?" done":"")} onClick={e=>toggle(b.key,e)}>
                          {done&&<Icon name="check" size={13} color="var(--bg)"/>}
                        </button>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                            <span style={{fontSize:13,fontWeight:600,color:done?"var(--tx3)":"var(--tx)",textDecoration:done?"line-through":"none"}}>{b.n}</span>
                            <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,color:bc.color,background:bc.bg}}><Icon name={BCAT_ICON_MAP[b.cat]||"credit-card"} size={10} color={bc.color}/> {bc.label}</span>
                            {/* one-time (protections) intentionally shows no reset pill */}
                            {rl&&<span style={{padding:"1px 6px",borderRadius:99,fontSize:10,background:"rgba(148,163,184,.15)",color:"var(--tx3)",fontWeight:600}}>{rl}</span>}
                            {wasReset&&<span style={{padding:"1px 7px",borderRadius:99,fontSize:10,background:"rgba(212,168,64,.18)",color:"var(--gld3)",fontWeight:700}}>↺ Refreshed</span>}
                          </div>
                          {b.v&&<div style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Up to ${b.isMonthly?b.v+"/mo ("+b.v*12+"/yr)":b.v}</div>}
                        </div>
                        <span style={{flexShrink:0,transition:"transform .15s",display:"inline-flex",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}><Icon name="chevron-right" size={14} color="var(--tx3)"/></span>
                      </div>
                      {/* Expanded section */}
                      {isOpen&&(
                        <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--br)"}}>
                          {b.d&&<p style={{fontSize:12,color:"var(--tx2)",margin:"0 0 8px",lineHeight:1.6}}>{b.d}</p>}
                          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
                            {b.v&&<span style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Value: ${b.isMonthly?b.v+"/mo":b.v}</span>}
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
              </div>
            </div>
          );
        })}</div>
      )}
    </div>
  );
}

/* ── TIPS TAB ─────────────────────────────────────────────────────────────── */
const TIP_SECTIONS=[
  {id:"flights",label:"Flights"},
  {id:"hotels",label:"Hotels"},
  {id:"stacking",label:"Stacking"},
  {id:"other",label:"Other"},
];

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:"var(--tx)",lineHeight:1.4}}>{tip.title}</div>
          </div>
          <span style={{transition:"transform .2s",transform:isOpen?"rotate(90deg)":"none",flexShrink:0,marginTop:3,display:"inline-flex"}}>
            <Icon name="chevron-right" size={14} color="var(--tx3)"/>
          </span>
        </div>

        {isOpen&&(
          <div style={{marginTop:12,borderTop:"1px solid var(--br)",paddingTop:12}}>
            <div style={{fontSize:14,color:"#6b7280",lineHeight:1.75,marginBottom:tipCards.length>0?14:0}}>{tip.body}</div>

            {tipCards.length>0&&(
              <div style={{marginBottom:partners.length>0?12:0}}>
                <div style={{fontSize:10,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>USE WITH</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {tipCards.map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(255,255,255,.05)",borderRadius:8,border:"1px solid var(--br)"}}>
                      <div style={{width:8,height:8,borderRadius:2,background:c.c1}}/>
                      <span style={{fontSize:11,fontWeight:600,color:myCards.includes(c.id)?"var(--tx)":"var(--tx3)"}}>{c.short}</span>
                      {myCards.includes(c.id)&&<Icon name="check" size={10} color="var(--grn2)"/>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {partners.length>0&&(
              <div style={{marginBottom:firstMissing?12:0}}>
                <div style={{fontSize:10,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>TRANSFER PARTNERS</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {partners.map(p=>(
                    <span key={p} style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:99,background:"rgba(117,91,6,.1)",color:"var(--acc)",border:"1px solid rgba(117,91,6,.2)"}}>{p}</span>
                  ))}
                </div>
              </div>
            )}

            {isLocked&&firstMissing&&(
              <div style={{padding:"10px 12px",background:"rgba(117,91,6,.06)",borderRadius:10,border:"1px dashed rgba(117,91,6,.2)"}}>
                <div style={{fontSize:11,color:"var(--tx2)",marginBottom:8}}>Add <strong style={{color:"var(--tx)"}}>{firstMissing.name}</strong> to unlock this strategy</div>
                <a href={APPLY_URLS[firstMissing.id]||"#apply-"+firstMissing.id} target="_blank"
                   onClick={e=>e.stopPropagation()}
                   style={{display:"inline-block",fontSize:11,fontWeight:700,color:"var(--acc)",background:"rgba(117,91,6,.1)",padding:"5px 12px",borderRadius:8,border:"1px solid rgba(117,91,6,.25)",textDecoration:"none"}}>
                  Apply for {firstMissing.short} →
                </a>
                <div className="apply-disclose">Affiliate link — we may earn a commission at no cost to you.</div>
              </div>
            )}
          </div>
        )}

        {isLocked&&!isOpen&&missing.length>0&&(
          <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
            {missing.map(c=>(
              <span key={c.id} className="tip-requires-chip">Requires: {c.short}</span>
            ))}
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
        <div style={{textAlign:"center",padding:"32px 16px",color:"var(--tx3)",fontSize:13,lineHeight:1.6}}>
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

/* ── USE CARD TAB ─────────────────────────────────────────────────────────── */
function UsecardTab({myCards}){
  const [mode,setMode]=useState("basic");
  const [selCat,setSelCat]=useState(null);
  const [merchant,setMerchant]=useState("");
  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);

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
                onClick={()=>setSelCat(selCat===cat.id?null:cat.id)}>
                <Icon name={SPEND_CAT_ICON[cat.id]||"credit-card"} size={22} color={cat.color}/>
                <div style={{fontSize:11,fontWeight:700,color:"var(--tx)",textAlign:"center"}}>{cat.label}</div>
                <div style={{fontSize:9,color:"var(--tx3)",textAlign:"center"}}>{cat.sub}</div>
              </div>
            ))}
          </div>
          {selCat&&(()=>{
            const cat=BASIC_CATS.find(c=>c.id===selCat);
            const results=getBestForCat(selCat);
            return (
              <div className="surf fu" style={{borderColor:cat.color+"44"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>Best card for</span>
                  <CatChip cat={SPEND_CAT_COLOR[selCat]||"other"} label={cat.label}/>
                </div>
                {!results.length?(
                  <div style={{color:"var(--tx3)",fontSize:13}}>No matching cards in wallet for this category.</div>
                ):(
                  results.map(({card,rate},i)=>(
                    <div key={card.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<results.length-1?"1px solid var(--br)":"none"}}>
                      <div style={{width:30,height:30,borderRadius:9,background:`linear-gradient(135deg,${card.c1},${card.c2})`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"rgba(255,255,255,.8)"}}>#{i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{card.short}</span>
                        </div>
                        <div style={{fontSize:11,color:"var(--tx3)"}}>{card.cur}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:19,fontWeight:800,color:i===0?"var(--gld2)":"var(--tx2)"}}>{rate}</span>
                        <CatChip cat={SPEND_CAT_COLOR[selCat]||"other"} label={cat.label}/>
                      </div>
                    </div>
                  ))
                )}
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

const FREQ_CONFIG={
  frequent:  {label:"Frequent",  bg:"rgba(22,163,74,.1)",   text:"#15803d"},
  seasonal:  {label:"Seasonal",  bg:"rgba(154,110,26,.12)", text:"#7a5a12"},
  occasional:{label:"Occasional",bg:"rgba(25,28,30,.07)",   text:"#6b7280"},
};

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
function WalletTab({myCards,setMyCards}){
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
    const annCredits=c.annual.reduce((s,b)=>s+(b.v||0),0);
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
            <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
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
                style={{background:"rgba(255,255,255,.03)",border:"1.5px solid",borderColor:inWallet?"var(--grn)":"var(--br2)",borderRadius:14,padding:12,cursor:"pointer",transition:"all .18s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{width:10,height:10,borderRadius:3,background:card.c1,flexShrink:0,marginTop:2}}/>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    {card.isBiz&&<span className="badge biz-badge">Biz</span>}
                    {card.isNew&&<span className="badge new-badge">New</span>}
                  </div>
                </div>
                <div style={{fontSize:11,fontWeight:700,color:"var(--tx)",marginBottom:2,lineHeight:1.3}}>{card.name}</div>
                <div style={{fontSize:10,color:"var(--tx3)",marginBottom:6}}>{card.issuer}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:card.fee===0?"var(--grn2)":"var(--tx3)",fontWeight:700}}>{card.fee===0?"No fee":"$"+card.fee+"/yr"}</span>
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
        </div>
        <button className="page-action" onClick={()=>setShowAdd(true)}>+ Add New Card</button>
      </div>
      {!myCardObjs.length?(
        <div className="wallet-empty-slot" style={{padding:"64px 20px"}} onClick={()=>setShowAdd(true)}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 1px 6px rgba(0,0,0,.08)',fontSize:24,color:'var(--tx3)'}}>+</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontSize:18,color:'#0f172a'}}>Sync another card</div>
          <div style={{fontSize:13,color:'#6b7280',marginTop:6}}>Unlock more optimizations</div>
        </div>
      ):(
        <div className="wallet-card-grid">{myCardObjs.map(c=>{
          const ic=getIssuerColor(c.issuer);
          const ig=getIssuerGradient(c);
          const tags=getTopEarnCats(c);
          return (
            <div key={c.id} className="wallet-card" onClick={()=>setDetailId(c.id)}>
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
                  {tags.map(t=>(<span key={t} className="wallet-card-tag" style={{background:ic+'1a',color:ic}}>{t}</span>))}
                  {c.isBiz&&<span className="wallet-card-tag" style={{background:'rgba(184,134,11,.1)',color:'var(--acc)'}}>Business</span>}
                </div>
              </div>
            </div>
          );
        })}
          <div className="wallet-empty-slot" onClick={()=>setShowAdd(true)}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,.06)',fontSize:22,color:'var(--tx3)'}}>+</div>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:'#0f172a'}}>Sync another card</div>
            <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>Unlock more optimizations</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TOP NAV ──────────────────────────────────────────────────────────────── */
/* ── QUIZ ─────────────────────────────────────────────────────────────────── */
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

function parseEarnNum(v){const n=parseFloat(String(v||1).replace(/[^0-9.]/g,''));return isNaN(n)?1:n;}

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

function pickQuizStrat(ans){
  const brands=(ans.brand||['none']).filter(b=>b!=='none');
  if(brands.includes('alaska'))return 'atmos-strategy';
  if(ans.exp==='adv'&&ans.spend==='dining')return 'amex-trifecta';
  if(ans.exp==='adv')return 'chase-trifecta';
  if(ans.exp==='some'&&(ans.spend==='travel'||ans.spend==='dining'))return 'chase-trifecta';
  if(ans.spend==='everything'&&ans.exp!=='new')return 'citi-duo';
  return 'c1-duo';
}

function QuizResults({answers,onRetake,myCards}){
  const [openStrat,setOpenStrat]=useState(false);
  const results=useMemo(()=>calcQuizResults(answers),[answers]);
  const strat=useMemo(()=>STRATS[pickQuizStrat(answers)],[answers]);
  return(
    <div style={{padding:"16px 16px 0",maxWidth:560,margin:"0 auto"}}>
      <div className="fu" style={{textAlign:"center",marginBottom:24}}>
        <div style={{marginBottom:8}}><Icon name="target" size={32} color="var(--acc)"/></div>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:"italic",fontSize:24,fontWeight:700,color:"var(--tx)",marginBottom:4}}>Your Top Cards</div>
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
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:"italic",fontSize:22,fontWeight:700,color:"var(--tx)",marginBottom:22,lineHeight:1.35}}>
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
      if(e.code!=='auth/popup-closed-by-user') setError('Google sign-in failed. Try again.');
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
        <h2>Sign in to CardSage</h2>
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
            onClick={async()=>{await fb.signOut(fb.auth);setOpen(false);}}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

const NAV_TABS=[
  {id:"home",   label:"Home",     sub:"Your Overview"},
  {id:"benefits",label:"Benefits",sub:"Track & Redeem"},
  {id:"tips",   label:"Tips",     sub:"Pro Strategies"},
  {id:"usecard",label:"Use Card", sub:"Category Guide"},
  {id:"offers", label:"Offers",   sub:"Explore Deals"},
  {id:"wallet", label:"Wallet",   sub:"My Cards"},
];

function NavIcon({name,size=18}){
  const icons={
    home:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    benefits:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8V21M3 12h18M7.5 8C7.5 8 7.5 3 12 3s4.5 5 4.5 5"/><path d="M16.5 8C16.5 8 16.5 3 12 3"/></svg>,
    tips:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 2a7 7 0 015 11.9V16a1 1 0 01-1 1H8a1 1 0 01-1-1v-2.1A7 7 0 0112 2z"/></svg>,
    usecard:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
    offers:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>,
    wallet:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 6V4a2 2 0 012-2h16a2 2 0 012 2v2"/><circle cx="17" cy="13" r="1.5"/></svg>
  };
  return icons[name]||null;
}

function TopNav({tab,setTab,cardCount,user,onAuthClick,fbReady,pwaPrompt,onInstall}){
  return (
    <div className="top-nav">
      <div className="top-nav-brand">
        <div className="top-nav-brand-left">
        </div>
        <div className="top-nav-brand-title">
          <span className="logo-text">CardSage</span>
        </div>
        <div className="top-nav-brand-right">
          {pwaPrompt&&<button className="install-btn" onClick={onInstall}>⊕ Install</button>}
          <AuthButton user={user} onSignIn={onAuthClick} fbReady={fbReady}/>
        </div>
      </div>
      <div className="top-nav-tabs">
        {NAV_TABS.map(t=>(
          <button key={t.id} className={"nav-tab"+(tab===t.id?" active":"")} onClick={()=>setTab(t.id)}>
            <span className="nav-tab-icon"><NavIcon name={t.id}/></span>
            <span className="nav-tab-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── BENEFIT RESET HELPER ─────────────────────────────────────────────────── */
function benKey(cardId,b,isMonthly){return isMonthly?cardId+"-m-"+b.n:cardId+"-"+b.n;}
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
function App(){
  const [myCards,setMyCards]=useLS(CS_CONFIG.LS_KEYS.cards,[]);
  const [tab,setTab]=useState("home");
  const [checkedArr,setCheckedArr]=useLS(CS_CONFIG.LS_KEYS.checked,[]);
  const [checkDates,setCheckDates]=useLS(CS_CONFIG.LS_KEYS.checkDates,{});
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

  const checkedSet=useMemo(()=>new Set(checkedArr),[checkedArr]);

  useEffect(()=>{
    if(!checkedArr.length) return;
    const now=new Date();
    const newChecked=new Set(checkedArr);
    const newDates={...checkDates};
    const badgeKeys=new Set();

    // Build flat benefit map for wallet cards
    const benefitMap={};
    myCards.forEach(cardId=>{
      const card=CARDS.find(c=>c.id===cardId);
      if(!card) return;
      card.annual.forEach(b=>{benefitMap[benKey(cardId,b,false)]={...b,isMonthly:false};});
      card.monthly.forEach(b=>{benefitMap[benKey(cardId,b,true)]={...b,isMonthly:true};});
    });

    checkedArr.forEach(key=>{
      const b=benefitMap[key];
      const dateStr=checkDates[key];
      if(!b||!dateStr||!b.reset) return;
      if(needsReset(b.reset,new Date(dateStr),now)){
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
    const newSet=updateFn(checkedSet);
    setCheckedArr([...newSet]);
  }

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
      if(!u){ mountedRef.current=true; return; }
      // Load cloud data and merge with whatever's in localStorage
      try{
        const snap=await fb.getDoc(fb.doc(fb.db,'users',u.uid));
        if(snap.exists()){
          // Firestore wins — cloud data takes precedence over localStorage
          const cloud=snap.data();
          setMyCards(cloud.cs_cards||[]);
          setCheckedArr(cloud.cs_checked||[]);
        } else {
          // New user — upload current localStorage data to cloud
          await fb.setDoc(fb.doc(fb.db,'users',u.uid),{
            cs_cards:cardsRef.current, cs_checked:checkedRef.current
          });
        }
      }catch(e){ console.warn('Firestore load failed:',e.message); }
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
      mountedRef.current=true;
    });
    return unsub;
  },[fbReady]);

  // ── Write to Firestore on every change (when signed in) ───────────────────
  useEffect(()=>{
    if(!mountedRef.current) return; // skip until after first auth check
    const fb=window.CS_FB;
    const u=userRef.current;
    if(!fb||!u) return;
    fb.setDoc(fb.doc(fb.db,'users',u.uid),
      {cs_cards:myCards, cs_checked:checkedArr},
      {merge:true}
    ).catch(e=>console.warn('Firestore write failed:',e.message));
  },[myCards,checkedArr]);

  useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"});},[tab]);

  return (
    <div style={{minHeight:"100vh",paddingBottom:iosBanner?116:48}}>
      {authModal&&<AuthModal onClose={()=>setAuthModal(false)}/>}
      <TopNav tab={tab} setTab={setTab} cardCount={myCards.length} user={user} onAuthClick={()=>setAuthModal(true)} fbReady={fbReady} pwaPrompt={pwaPrompt} onInstall={handleInstall}/>
      {iosBanner&&(
        <div className="ios-install-banner">
          {iosBanner==='android'
            ? <>
                <span>Install CardSage for quick access</span>
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
        {tab==="home"&&    <HomeTab myCards={myCards} setMyCards={setMyCards} checkedSet={checkedSet} setTab={setTab} setStratModal={setStratModal}/>}
        {tab==="benefits"&&<BenefitsTab myCards={myCards} checkedSet={checkedSet} setCheckedBenefits={setCheckedBenefits} checkDates={checkDates} setCheckDates={setCheckDates} resetBadges={resetBadges}/>}
        {tab==="tips"&&    <TipsTab myCards={myCards}/>}
        {tab==="usecard"&& <UsecardTab myCards={myCards}/>}
        {tab==="offers"&&  <OffersTab myCards={myCards}/>}
        {tab==="quiz"&&    <QuizTab myCards={myCards}/>}
        {tab==="wallet"&&  <WalletTab myCards={myCards} setMyCards={setMyCards}/>}
      </div>
      {stratModal&&<StratModal stratId={stratModal} myCards={myCards} onClose={()=>setStratModal(null)}/>}
      <NewsletterSubscribe/>
      <div style={{padding:"32px 24px 28px",background:"var(--s3)",marginTop:24}}>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between",gap:"6px 16px",marginBottom:10,maxWidth:1000,margin:"0 auto 10px"}}>
          <a href={"mailto:"+CS_CONFIG.CONTACT_EMAIL+"?subject=CardSage%20Data%20Error%20Report&body=Card%20name%3A%20%0AWhat%27s%20wrong%3A%20%0AWhat%20it%20should%20say%3A%20"}
             style={{fontSize:11,color:"var(--tx3)",textDecoration:"none"}}
             onMouseEnter={e=>e.currentTarget.style.color="var(--acc)"}
             onMouseLeave={e=>e.currentTarget.style.color="var(--tx3)"}>
            See outdated info? Let us know →
          </a>
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
        <div style={{fontSize:11,color:"var(--tx3)",lineHeight:1.5,maxWidth:1000,margin:"0 auto"}}>
          CardSage may earn a commission from card applications. This does not influence our recommendations.
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
