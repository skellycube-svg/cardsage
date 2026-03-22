// config.js — FeeWorth central configuration
//
// This is the single source of truth for every setting in FeeWorth.
// Change any value here and it automatically flows to every file that needs it.
// Never hardcode these values in other files — always read them from CS_CONFIG.
//
// IMPORTANT: After changing CACHE_VERSION, also update version.json to match.
// version.json is fetched by the client to detect new deployments.

const CS_CONFIG = {

  // ── Versioning ──────────────────────────────────────────────────────────────
  // The current app version. Incrementing this forces all users' browsers to
  // download fresh files instead of using old cached copies.
  CACHE_VERSION: 'v108',

  // ── Site Metadata ───────────────────────────────────────────────────────────
  // Basic info about the site — name, URL, contact email, and descriptions
  // used in the browser tab, search engine results, and social media previews.
  SITE_NAME: 'FeeWorth',
  SITE_URL: 'https://feeworth.com',
  CONTACT_EMAIL: 'cardsage.co@gmail.com',
  SITE_TAGLINE: 'Is the fee worth it?',
  SITE_DESCRIPTION: 'FeeWorth tells you which credit cards are worth keeping and which to cancel. Renewal countdowns, ROI tracking, and household optimization for couples.',

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
    primary:   '#0d7377',
    accent:    '#0d7377',
    accentLight: '#e6f5f5',
    accentDark:'#0a5c5f',
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
    tx: '#1a1a2e', tx2: '#6b7280', tx3: '#78838f', tx4: '#9ca3af',
    acc: '#0d7377', acc2: '#0a5c5f', pur: '#0f172a', pur2: '#1e293b',
    gold: '#0d7377', gld2: '#14b8b8', gld3: '#e6f5f5',
    grn: '#166534', grn2: '#16a34a', grn3: '#22c55e',
    red: '#991b1b', red2: '#dc2626',
    sky: '#004c97', pnk: '#db2777', teal: '#0d9488',
    chase: '#112e51', amex: '#006fcf', citi: '#004c97', capone: '#003a70'
  },

  // ── Issuer Colors ──────────────────────────────────────────────────────────
  // Each card issuer (bank) gets a distinct color palette: a gradient pair for
  // card faces, a light tint for backgrounds/badges, and a text color for labels.
  // These are deep/muted tones that feel luxurious against the white background.
  ISSUER_COLORS: {
    'Chase':            { grad: ['#0a2540','#1a4a7a'], tint: '#e8f0fb', text: '#0a2540' },
    'American Express': { grad: ['#2c6e49','#52b788'], tint: '#e8f5ee', text: '#2c6e49' },
    'Citi':             { grad: ['#003087','#4169b8'], tint: '#e8eef8', text: '#003087' },
    'Capital One':      { grad: ['#8b0000','#c0392b'], tint: '#fde8e8', text: '#8b0000' },
    'Discover':         { grad: ['#d97706','#f59e0b'], tint: '#fef3cd', text: '#92400e' },
    'Wells Fargo':      { grad: ['#7c3a00','#c05f00'], tint: '#fdf0e4', text: '#7c3a00' },
    'Bank of America':  { grad: ['#cc0000','#8b0000'], tint: '#fde8e8', text: '#cc0000' },
    'Barclays':         { grad: ['#00395d','#005f8e'], tint: '#e4f0f8', text: '#00395d' },
    'Bilt':             { grad: ['#1a1a2e','#4a4a6a'], tint: '#ececf4', text: '#1a1a2e' },
    'Bilt / Column N.A.':{ grad: ['#1a1a2e','#4a4a6a'], tint: '#ececf4', text: '#1a1a2e' },
    'Cardless':         { grad: ['#1a1a2e','#4a4a6a'], tint: '#ececf4', text: '#1a1a2e' },
    'U.S. Bank':        { grad: ['#6b0f1a','#a91b2e'], tint: '#fce8eb', text: '#6b0f1a' },
    'Goldman Sachs':    { grad: ['#1a1a2e','#3d3d50'], tint: '#ededf2', text: '#1a1a2e' },
    'Elan Financial':   { grad: ['#1a4a2e','#2d7a4a'], tint: '#e8f3ec', text: '#1a4a2e' },
    'Coastal Community Bank':{ grad: ['#006b2d','#00a846'], tint: '#e5f5eb', text: '#006b2d' },
    'Synchrony':        { grad: ['#2a2a5a','#4a4a8a'], tint: '#ebebf5', text: '#2a2a5a' },
    'Navy Federal CU':  { grad: ['#002b5c','#004a8a'], tint: '#e5ecf5', text: '#002b5c' },
    'PenFed CU':        { grad: ['#1a3a6e','#2d5a9e'], tint: '#e8eef8', text: '#1a3a6e' },
    'default':          { grad: ['#374151','#6b7280'], tint: '#f3f4f6', text: '#374151' }
  },

  // ── localStorage Keys ───────────────────────────────────────────────────────
  // Names for the browser storage slots where FeeWorth saves your data locally.
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
    iosDismissed: 'cs_ios_dismissed',
    skipped: 'cs_skipped',
    savedTrips: 'cs_saved_trips',
    popupDismissed: 'cs_popup_dismissed',
    p2Cards: 'cs_p2_cards',
    p2Name: 'cs_p2_name',
    householdSetup: 'cs_household_setup',
    anniversaryDates: 'cs_anniversary_dates',
    firstYearCards: 'cs_first_year_cards'
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
