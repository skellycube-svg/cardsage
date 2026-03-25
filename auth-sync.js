// auth-sync.js — Authentication and cloud sync for FeeWorth
//
// This file owns ALL logic for:
//   1. Reading/writing user data to localStorage (useLS hook)
//   2. Firebase authentication (sign-in, sign-out detection)
//   3. Loading user data from Firestore on sign-in
//   4. Writing user data to Firestore when the user makes changes
//   5. Isolating data between different user accounts
//
// Loaded as <script type="text/babel"> BEFORE components.js so that
// useLS() and useAuthSync() are available as globals.

// Pull React hooks into globals (components.js uses these too)
const {useState,useEffect,useCallback,useMemo,useRef}=React;

// ─── useLS: localStorage-backed useState ─────────────────────────────
// Reads from localStorage on first mount. Writes on every set call.
// Parameters: k = storage key, d = default value if nothing saved.
function useLS(k,d){
  const[v,sv]=useState(()=>{
    try{const s=localStorage.getItem(k);return s?JSON.parse(s):d}catch{return d}
  });
  const vRef=useRef(v);
  vRef.current=v;
  const set=useCallback(x=>{
    const next=typeof x==='function'?x(vRef.current):x;
    sv(next);
    try{localStorage.setItem(k,JSON.stringify(next))}catch{};
  },[k]);
  return[v,set];
}

// ─── useAuthSync: all Firestore-synced state + auth ──────────────────
// Returns everything the App component needs for user data and auth.
function useAuthSync(){

  // ── State that syncs to Firestore ──────────────────────────────────
  const[myCards,setMyCards]=useLS(CS_CONFIG.LS_KEYS.cards,[]);
  const[checkedArr,setCheckedArr]=useLS(CS_CONFIG.LS_KEYS.checked,[]);
  const[skippedArr,setSkippedArr]=useLS(CS_CONFIG.LS_KEYS.skipped,[]);
  const[p2Cards,setP2Cards]=useLS(CS_CONFIG.LS_KEYS.p2Cards,[]);
  const[p2Name,setP2Name]=useLS(CS_CONFIG.LS_KEYS.p2Name,"");
  const[householdSetup,setHouseholdSetup]=useLS(CS_CONFIG.LS_KEYS.householdSetup,false);
  const[anniversaryDates,setAnniversaryDates]=useLS(CS_CONFIG.LS_KEYS.anniversaryDates,{});

  // ── State that stays in localStorage only (not synced) ─────────────
  const[checkDates,setCheckDates]=useLS(CS_CONFIG.LS_KEYS.checkDates,{});
  const[firstYearCards,setFirstYearCards]=useLS(CS_CONFIG.LS_KEYS.firstYearCards,[]);

  // ── Auth state ─────────────────────────────────────────────────────
  const[user,setUser]=useState(null);
  const[fbReady,setFbReady]=useState(!!window.CS_FB);

  // ── Refs ───────────────────────────────────────────────────────────
  const userRef=useRef(null);
  const dirtyRef=useRef(false);        // true = user changed data, needs Firestore write
  const mountedRef=useRef(false);      // true after cloud data has been loaded
  const cloudLoadedRef=useRef(false);  // true after first getDoc THIS page load

  // ── Derived ────────────────────────────────────────────────────────
  const checkedSet=useMemo(()=>new Set(checkedArr),[checkedArr]);
  const skippedSet=useMemo(()=>new Set(skippedArr),[skippedArr]);

  // ── Dirty setters (mark data as user-modified) ─────────────────────
  // Only these trigger Firestore writes. The auth effect uses the raw
  // setters so cloud-loaded data never triggers a write-back loop.
  function dirtySetMyCards(v){dirtyRef.current=true;setMyCards(typeof v==='function'?v(myCards):v);}
  function dirtySetP2Cards(v){dirtyRef.current=true;setP2Cards(typeof v==='function'?v(p2Cards):v);}
  function dirtySetP2Name(v){dirtyRef.current=true;setP2Name(typeof v==='function'?v(p2Name):v);}
  function dirtySetHouseholdSetup(v){dirtyRef.current=true;setHouseholdSetup(typeof v==='function'?v(householdSetup):v);}
  function dirtySetAnniversaryDates(v){dirtyRef.current=true;setAnniversaryDates(typeof v==='function'?v(anniversaryDates):v);}
  function dirtySetFirstYearCards(v){dirtyRef.current=true;setFirstYearCards(typeof v==='function'?v(firstYearCards):v);}
  function setCheckedBenefits(fn){dirtyRef.current=true;setCheckedArr([...fn(checkedSet)]);}
  function setSkippedBenefits(fn){dirtyRef.current=true;setSkippedArr([...fn(skippedSet)]);}

  // ── Wait for Firebase to load ──────────────────────────────────────
  useEffect(()=>{
    if(window.CS_FB){setFbReady(true);return;}
    const h=()=>setFbReady(true);
    window.addEventListener('cs-firebase-ready',h);
    return()=>window.removeEventListener('cs-firebase-ready',h);
  },[]);

  // ── Auth listener + cloud data load ────────────────────────────────
  useEffect(()=>{
    if(!fbReady) return;
    const fb=window.CS_FB;
    if(!fb) return;

    // Wipe all user state to defaults
    function clearAll(){
      setMyCards([]);setCheckedArr([]);setSkippedArr([]);
      setP2Cards([]);setP2Name("");setHouseholdSetup(false);
      setAnniversaryDates({});setFirstYearCards([]);
    }

    const unsub=fb.onAuthStateChanged(fb.auth,async u=>{
      setUser(u);

      // ── SIGNED OUT ────────────────────────────────────────────────
      // Only clear data when the sign-out button was clicked (explicit
      // flag). On page refresh Firebase may briefly emit null before
      // resolving the stored session — clearing here would erase data.
      if(!u){
        userRef.current=null;
        if(window._csExplicitSignOut){
          window._csExplicitSignOut=false;
          localStorage.removeItem('cs_auth_uid');
          cloudLoadedRef.current=false; // Allow fresh Firestore load on next sign-in
          clearAll();
        }
        mountedRef.current=true;
        window._csAuthDone=true;
        return;
      }

      // ── SIGNED IN ─────────────────────────────────────────────────
      userRef.current=u;

      // If a different user signed in, clear the old user's data first
      const prevUid=localStorage.getItem('cs_auth_uid');
      if(prevUid&&prevUid!==u.uid) clearAll();
      localStorage.setItem('cs_auth_uid',u.uid);

      // Only load from Firestore ONCE per page load. This prevents
      // token-refresh callbacks (which re-fire onAuthStateChanged with
      // the same user) from overwriting data the user just changed.
      if(cloudLoadedRef.current){
        mountedRef.current=true;
        window._csAuthDone=true;
        return;
      }

      // Load cloud data — Firestore is the source of truth
      mountedRef.current=false;
      try{
        const snap=await fb.getDoc(fb.doc(fb.db,'users',u.uid));
        if(snap.exists()){
          const cloud=snap.data();
          dirtyRef.current=false; // Cancel any pending dirty flag
          setMyCards(cloud.cs_cards||[]);
          setCheckedArr(cloud.cs_checked||[]);
          if(cloud.cs_skipped) setSkippedArr(cloud.cs_skipped);
          if(cloud.cs_p2_cards) setP2Cards(cloud.cs_p2_cards);
          if(cloud.cs_p2_name!=null) setP2Name(cloud.cs_p2_name);
          if(cloud.cs_household_setup!=null) setHouseholdSetup(cloud.cs_household_setup);
          if(cloud.cs_anniversary_dates) setAnniversaryDates(cloud.cs_anniversary_dates);
        }else if(!prevUid||prevUid!==u.uid){
          // New user with no cloud doc — clean slate
          clearAll();
        }
        cloudLoadedRef.current=true;
        mountedRef.current=true;
        window._csAuthDone=true;
      }catch(e){
        console.warn('Firestore load failed:',e.message);
        mountedRef.current=true;
        window._csAuthDone=true;
      }

      // Link newsletter subscription to this account
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

  // ── Write to Firestore when user changes data ─────────────────────
  // dirtyRef is reset IMMEDIATELY (not in .then) so that if the auth
  // effect triggers a re-render while this write is in flight, it
  // won't cause a second write with stale data.
  useEffect(()=>{
    if(!dirtyRef.current) return;
    dirtyRef.current=false;
    const fb=window.CS_FB;
    const u=userRef.current;
    if(!fb||!u) return;
    fb.setDoc(fb.doc(fb.db,'users',u.uid),
      {cs_cards:myCards,cs_checked:checkedArr,cs_skipped:skippedArr,
       cs_p2_cards:p2Cards,cs_p2_name:p2Name,cs_household_setup:householdSetup,
       cs_anniversary_dates:anniversaryDates},
      {merge:true}
    ).catch(e=>{dirtyRef.current=true;console.warn('Firestore write failed:',e.message);});
  },[myCards,checkedArr,skippedArr,p2Cards,p2Name,householdSetup,anniversaryDates]);

  // ── Return everything App needs ────────────────────────────────────
  return{
    myCards,checkedArr,skippedArr,p2Cards,p2Name,householdSetup,anniversaryDates,
    checkDates,setCheckDates,firstYearCards,
    dirtySetMyCards,dirtySetP2Cards,dirtySetP2Name,
    dirtySetHouseholdSetup,dirtySetAnniversaryDates,dirtySetFirstYearCards,
    setCheckedBenefits,setSkippedBenefits,
    checkedSet,skippedSet,
    user,fbReady,userRef
  };
}
