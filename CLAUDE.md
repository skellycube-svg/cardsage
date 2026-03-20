# CLAUDE.md — CardSage

## Project Overview

**CardSage** is a credit card benefit tracking and points optimization Progressive Web App (PWA).

- **URL**: https://cardsage.co
- **Tagline**: Track your card benefits, maximize points, never miss a monthly credit.
- **Audience**: Points & miles enthusiasts and everyday credit card users.
- **Contact**: cardsage.co@gmail.com
- **Revenue model**: Affiliate commissions via Apply Now links (CJ Affiliate / FlexOffers). FTC disclosure required — see Affiliate Links section below.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 (via CDN, `react.development.js`) |
| JSX transpilation | Babel Standalone (via CDN, `@babel/standalone`) |
| Build system | **None** — single-file HTML app, no npm, no bundler |
| Fonts | Google Fonts: Cormorant Garamond (serif display), Barlow (body), Source Code Pro (mono) |
| Analytics | Plausible (`data-domain="YOUR_DOMAIN"` — replace with `cardsage.co`) |
| Hosting | Netlify (auto-deploy from GitHub) |
| PWA | manifest.json + sw.js service worker |

**Key constraint**: Everything runs in the browser. No server, no backend, no database. All state lives in `localStorage`.

---

## File Structure

```
CardSage/
├── CardSage.html          # Main app — all React components + CSS
├── cards-data.js          # All data: CARDS, STRATS, TIPS_DB, APPLY_URLS, etc.
├── sw.js                  # Service worker (cache-first PWA strategy)
├── manifest.json          # PWA manifest
├── icon-192.png           # PWA icon (192×192)
├── icon-512.png           # PWA icon (512×512)
├── privacy-policy.html    # Privacy policy page
├── terms.html             # Terms of service page
├── affiliate-disclosure.html  # FTC affiliate disclosure page
└── .gitignore
```

**Load order in CardSage.html**:
1. CSS styles (inline `<style>` block)
2. `<script src="cards-data.js">` — loads all data as globals
3. `<script type="text/babel">` — React app (can reference all cards-data.js globals)

---

## Key Data Structures (cards-data.js)

### `CARDS` — array of ~100 card objects
```js
{
  id: "csr",                      // unique kebab-case ID
  name: "Chase Sapphire Reserve", // full name
  short: "Sapphire Reserve",      // short display name
  issuer: "Chase",
  isBiz: false,
  fee: 550,                       // annual fee in dollars
  network: "Visa",
  cur: "Chase Ultimate Rewards",  // points currency
  c1: "#1a1a2e", c2: "#4a3728",  // gradient colors for card art
  partners: ["Hyatt", "United"],  // transfer partners
  annual: [{n, v, d, cat}],       // annual benefits {name, value, desc, category}
  monthly: [{n, v, d, cat}],      // monthly benefits
  strat: ["chase-trifecta"],      // strategy IDs this card belongs to
  signup: "60,000 pts after $4k in 3 mo",
  earn: {d, g, gas, t, s, a, tr, p, o} // earn rates by category key
}
```

### `STRATS` — object keyed by strategy ID
```js
{
  "chase-trifecta": {
    id, name, emoji, req: ["csr","csp","cfu"],  // required card IDs
    alt: [["csr","cff","cfu"]],                 // alternative card combos
    req_names, desc, forBeginners, analogy,
    firstStep, value, play: [...], learn
  }
}
```
**6 strategies**: `chase-trifecta`, `amex-trifecta`, `c1-duo`, `citi-duo`, `ink-trio`, `atmos-strategy`

### `TIPS_DB` — array of 25 tip objects
```js
{
  id: "t1",
  cat: "sweetspot",     // sweetspot | routing | stacking | timing | arbitrage | application
  title: "...",
  cards: ["csr","hyatt"],  // card IDs relevant to this tip
  body: "...",
  value: 3,             // 1–3 rating
  difficulty: "beginner" // beginner | intermediate | advanced
}
```

### `BCAT` — benefit category metadata
Keys: `travel`, `dining`, `entertainment`, `status`, `statement`, `awards`, `protection`
Each: `{label, icon, color, bg}`

### `BASIC_CATS` — standard spending categories
9 categories: `d` (dining), `g` (groceries), `gas`, `t` (travel), `s` (streaming), `a` (Amazon), `tr` (rideshare), `p` (pharmacy), `o` (everything else)

### `SPECIAL_CATS` — brand-specific categories
11 categories: Hyatt, Delta, Southwest, United, Hilton, Marriott, Alaska/Atmos, American Airlines, Amazon, Rent, IHG

### `EARN_PRIORITY` — object mapping category key → ordered array of card IDs (best earner first)
```js
{ d: ["amex-gold", "csr", ...], g: ["amex-gold", "amex-bcp", ...], ... }
```

### `ROTATING_Q1` — array of current quarter rotating category cards
```js
{ card, id, q, cats, rate, note, verified }
```

### `APPLY_URLS` — object mapping card ID → affiliate application URL
```js
{ "csr": "https://creditcards.chase.com/...", ... }
```
Cards without approved affiliate links use a `#apply-{cardId}` placeholder (falls back gracefully).

### `daysUntil(dateString)` — helper function
Returns integer days until a given date string. Used for benefit reset countdowns.

---

## React Components

| Component | Description |
|-----------|-------------|
| `App` | Root component — owns `myCards`, `checkedArr` state; renders TopNav + active tab |
| `TopNav` | Sticky frosted-glass nav with centered CardSage wordmark and tab bar |
| `HomeTab` | Dashboard with stats grid, strategy cards, rotating categories, email capture |
| `BenefitsTab` | Filterable benefit tracker — check off redeemed benefits, monthly/annual split |
| `TipsTab` | "Your Playbook" (tips you can use now) + "Unlock With One More Card" sections |
| `UsecardTab` | Category guide — which card to use for each spending category |
| `OffersTab` | Merchant offers browser — personalized to user's wallet with toggle |
| `QuizTab` | 5-question card finder quiz with animated transitions and localStorage persistence |
| `QuizResults` | Quiz output — Top 3 card recommendations + strategy suggestion + Apply Now |
| `WalletTab` | Card browser — add/remove cards from wallet, view card details |
| `StratModal` | Bottom sheet modal for strategy details (description, playbook, required cards) |
| `CardArt` | Visual credit card rendering with gradient from card's `c1`/`c2` colors |
| `ValueMeter` | 1–3 dot visual indicator for tip/strategy value rating |
| `EmailCapture` | Optional email signup component (Home + Benefits tabs); opens mailto on submit |
| `MerchantOfferCard` | Single merchant row in Offers tab — dims if user has no matching card |

---

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `cs_cards` | `string[]` | Array of card IDs in user's wallet |
| `cs_checked` | `string[]` | Array of benefit check keys (`"{cardId}-{benefitName}"`) |
| `cs_email` | `string` | User's email address (optional, from EmailCapture) |
| `cs_quiz` | `object \| null` | Saved quiz answers object |
| `cs_tips_mode` | `string` | Tips tab mode preference (`'beginner'` or `'advanced'`) |

All keys are managed via the `useLS(key, defaultValue)` hook, which wraps `useState` + `localStorage`.

---

## Affiliate Links

**Network**: Currently using direct issuer URLs (CJ Affiliate / FlexOffers approval pending).
**Placeholder format**: Cards not yet in an affiliate program use `#apply-{cardId}` as the href, which renders as a non-functional anchor until replaced with a real URL.

**FTC disclosure is required in 3 locations** (already implemented):
1. Below every "Apply Now" button — `.apply-disclose` class: `"Affiliate link — we may earn a commission at no cost to you."`
2. Above Quiz results card list — inline notice
3. App footer — `"CardSage may earn a commission from card applications. This does not influence our recommendations."`

Full disclosure page: `affiliate-disclosure.html`

---

## PWA Setup

**manifest.json**
```json
{
  "name": "CardSage",
  "short_name": "CardSage",
  "start_url": "./CardSage.html",
  "display": "standalone",
  "theme_color": "#3730a3",
  "background_color": "#f8f7f4"
}
```

**sw.js** — cache-first strategy
- `CACHE_VERSION` constant at top — **increment this on every deploy** (see Deployment Rules)
- `LOCAL_ASSETS` pre-cached on install: CardSage.html, cards-data.js, manifest.json, icons, all legal pages
- CDN origins cached on first fetch: unpkg.com, fonts.googleapis.com, fonts.gstatic.com
- Old caches deleted on activate

---

## Hosting & DNS

| Layer | Details |
|-------|---------|
| Source | GitHub: `https://github.com/skellycube-svg/cardsage` |
| Deploy | Netlify — auto-deploys on every push to `main` (~30 seconds) |
| Domain | `cardsage.co` |
| DNS A record | `75.2.60.5` |
| DNS CNAME (www) | `apex-loadbalancer.netlify.com` |

---

## Design System

**CSS variables (`:root`)**:
- Background: `--bg: #f8f7f4` (warm off-white)
- Accent: `--acc: #3730a3` (indigo)
- Gold: `--gold: #9a6e1a`, `--gld3: #d4a840`
- Text: `--tx: #0f172a`, `--tx2: #475569`, `--tx3: #94a3b8`
- Green: `--grn2: #16a34a` (success states)

**Fonts**:
- Display/brand: Cormorant Garamond (italic, gold gradient shimmer on `.grad-text`)
- Body: Barlow
- Financial values: Source Code Pro (`.mono`, `.stat-val`)

---

## Deployment Rules (follow these after every significant change)

After completing any significant change to CardSage, always do the following automatically without being asked:

1. **BUMP SERVICE WORKER**: If any of these changed — branding, colors, fonts, CSS, HTML structure, or new files added — increment the CACHE_VERSION number in sw.js
2. **UPDATE MANIFEST**: If the app name, theme color, or branding changed, update manifest.json to match.
3. **DEPLOY TO GITHUB**: `git add . && git commit -m "[description]" && git push`
4. **CONFIRM**: After pushing, tell me "Deployed to GitHub — Netlify will update in ~30 seconds"
