// firebase-auth.js — Firebase initialization and authentication setup
// Dynamically imports Firebase SDK modules (Auth + Firestore) from the CDN,
// initializes the Firebase app using config from config.js (CS_CONFIG.FIREBASE),
// and exposes all Firebase utilities on window.CS_FB for use by React components.
// Dispatches a "cs-firebase-ready" custom event when initialization completes.
// Loaded via <script type="module" src="firebase-auth.js"> in index.html.

// ─── FIREBASE INIT (config from config.js → CS_CONFIG.FIREBASE) ─────────────
const firebaseConfig = CS_CONFIG.FIREBASE;
if (firebaseConfig.apiKey) {
  const v = CS_CONFIG.FIREBASE_SDK_VERSION;
  Promise.all([
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`)
  ]).then(([{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,onAuthStateChanged},{getFirestore,doc,getDoc,setDoc,collection,query,where,getDocs,serverTimestamp}])=>{
    const app=initializeApp(firebaseConfig);
    window.CS_FB={
      auth:getAuth(app),db:getFirestore(app),
      GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,
      createUserWithEmailAndPassword,signOut,onAuthStateChanged,
      doc,getDoc,setDoc,collection,query,where,getDocs,serverTimestamp
    };
    window.dispatchEvent(new CustomEvent('cs-firebase-ready'));
  }).catch(e=>console.warn('Firebase init failed:',e.message));
}
