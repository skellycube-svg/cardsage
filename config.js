// config.js — CardSage central configuration
//
// This is the single source of truth for every setting in CardSage.
// Change any value here and it automatically flows to every file that needs it.
// Never hardcode these values in other files — always read them from CS_CONFIG.
//
// IMPORTANT: After changing CACHE_VERSION, also update version.json to match.
// version.json is fetched by the client to detect new deployments.

const CS_CONFIG = {

  // ── Versioning ──────────────────────────────────────────────────────────────
  // The current app version. Incrementing this forces all users' browsers to
  // download fresh files instead of using old cached copies.
  CACHE_VERSION: 'v37',

  // ── Site Metadata ───────────────────────────────────────────────────────────
  // Basic info about the site — name, URL, contact email, and descriptions
  // used in the browser tab, search engine results, and social media previews.
  SITE_NAME: 'CardSage',
  SITE_URL: 'https://cardsage.co',
  CONTACT_EMAIL: 'cardsage.co@gmail.com',
  SITE_TAGLINE: 'Track your card benefits, maximize points, never miss a monthly credit.',
  SITE_DESCRIPTION: 'CardSage helps you track credit card benefits, maximize points, and never miss a monthly credit. Free tool for points & miles enthusiasts.',

  // ── Firebase ────────────────────────────────────────────────────────────────
  // Connection details for Google Firebase, which handles user login and
  // stores newsletter subscriptions. These are public keys (safe to share).
  FIREBASE: {
    apiKey: 'AIzaSyDbUxUYn3Pj6JdIIfwceTeQoNWX0VrqAVw',
    authDomain: 'cardsage-fc437.firebaseapp.com',
    projectId: 'cardsage-fc437',
    storageBucket: 'cardsage-fc437.firebasestorage.app',
    messagingSenderId: '522775842118',
    appId: '1:522775842118:web:3e1003379b008c09262947'
  },
  FIREBASE_SDK_VERSION: '12.0.0',

  // ── Colors (semantic names for JS usage) ────────────────────────────────────
  // Named colors used by JavaScript code (e.g., for card art gradients and charts).
  COLORS: {
    primary:   '#b8860b',
    gold:      '#b8860b',
    goldLight: '#fef9ec',
    text:      '#1a1a2e',
    textMuted: '#6b7280',
    bg:        '#ffffff',
    bgSubtle:  '#f8f8f6',
    border:    '#e5e7eb'
  },

  // ── CSS Custom Properties (applied to :root) ───────────────────────────────
  // These color values are injected as CSS variables (e.g., var(--gold), var(--tx))
  // so that styles.css can reference them. This is the single source of truth
  // for every color used in the app's stylesheet.
  CSS_VARS: {
    bg: '#ffffff', s1: '#ffffff', s2: '#ffffff', s3: '#f8f8f6', s4: '#f0f0ee',
    br: 'rgba(0,0,0,.06)', br2: '#e5e7eb', br3: '#d1d5db',
    tx: '#1a1a2e', tx2: '#6b7280', tx3: '#9ca3af', tx4: '#d1d5db',
    acc: '#b8860b', acc2: '#a07608', pur: '#0f172a', pur2: '#1e293b',
    gold: '#b8860b', gld2: '#d4a840', gld3: '#fef9ec',
    grn: '#166534', grn2: '#16a34a', grn3: '#22c55e',
    red: '#991b1b', red2: '#dc2626',
    sky: '#004c97', pnk: '#db2777', teal: '#0d9488',
    chase: '#112e51', amex: '#006fcf', citi: '#004c97', capone: '#003a70'
  },

  // ── localStorage Keys ───────────────────────────────────────────────────────
  // Names for the browser storage slots where CardSage saves your data locally.
  // Your card wallet, checked-off benefits, quiz answers, and preferences
  // are all stored under these keys so they persist between visits.
  LS_KEYS: {
    cards:      'cs_cards',
    checked:    'cs_checked',
    email:      'cs_email',
    quiz:       'cs_quiz',
    tipsMode:   'cs_tips_mode',
    checkDates: 'cs_benefit_check_dates',
    appVersion: 'cs_app_version',
    iosDismissed: 'cs_ios_dismissed'
  }
};

// ── Inject CSS custom properties into :root ─────────────────────────────────
// This block takes all the color values from CSS_VARS above and writes them
// into the page as CSS variables (like --gold, --tx, --bg) so the stylesheet
// can use them. It only runs in the browser — the service worker skips it.
if (typeof document !== 'undefined') {
  const cssText = ':root{' +
    Object.entries(CS_CONFIG.CSS_VARS).map(([k, v]) => '--' + k + ':' + v).join(';') +
  '}';
  const el = document.createElement('style');
  el.textContent = cssText;
  document.head.appendChild(el);
}
