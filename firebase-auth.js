// firebase-auth.js — Firebase initialization and authentication setup
// Dynamically imports Firebase SDK modules (Auth + Firestore) from the CDN,
// initializes the Firebase app using config from config.js (CS_CONFIG.FIREBASE),
// and exposes all Firebase utilities on window.CS_FB for use by React components.
// Dispatches a "cs-firebase-ready" custom event when initialization completes.
// Loaded via <script type="module" src="firebase-auth.js"> in index.html.

// ─── FIREBASE INIT (config from config.js → CS_CONFIG.FIREBASE) ─────────────
// Read the Firebase connection settings from config.js
const firebaseConfig = CS_CONFIG.FIREBASE;

// Only proceed if Firebase is configured (apiKey exists)
if (firebaseConfig.apiKey) {
  const v = CS_CONFIG.FIREBASE_SDK_VERSION;

  // Download three Firebase modules from Google's CDN in parallel:
  //   1. firebase-app    — the core Firebase library
  //   2. firebase-auth   — handles user login (Google sign-in, email/password)
  //   3. firebase-firestore — the database (stores newsletter subscriptions)
  Promise.all([
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`)
  ]).then(([{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,onAuthStateChanged},{initializeFirestore,persistentLocalCache,persistentSingleTabManager,doc,getDoc,setDoc,collection,query,where,getDocs,serverTimestamp}])=>{
    // Start the Firebase app and create auth + database connections
    const app=initializeApp(firebaseConfig);

    // Use Firestore offline persistence (IndexedDB) so writes survive page reload.
    // This means getDoc() reads from local cache immediately, even before the network
    // round-trip completes, preventing the empty-data-on-refresh bug.
    const db=initializeFirestore(app,{
      localCache:persistentLocalCache({tabManager:persistentSingleTabManager()})
    });

    // Expose all Firebase tools on window.CS_FB so React components can use them.
    // This is how the rest of the app accesses login, logout, and database functions.
    window.CS_FB={
      auth:getAuth(app),db:db,
      GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signInWithEmailAndPassword,
      createUserWithEmailAndPassword,signOut,onAuthStateChanged,
      doc,getDoc,setDoc,collection,query,where,getDocs,serverTimestamp
    };

    // Tell the rest of the app that Firebase is ready to use.
    // React components listen for this event before trying to access CS_FB.
    window.dispatchEvent(new CustomEvent('cs-firebase-ready'));
  }).catch(e=>console.warn('Firebase init failed:',e.message));
}
