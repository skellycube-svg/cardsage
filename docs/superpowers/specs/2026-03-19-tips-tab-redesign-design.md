# Tips Tab Redesign — Design Spec
**Date:** 2026-03-19
**Project:** CardSage (`/Users/Brittany/Desktop/CardSage`)
**Status:** Approved

---

## Overview

Redesign the Tips tab to be more beginner-friendly and better organized. Five changes: a Beginner/Advanced mode toggle, plain-English `beginnerTip` explanations on every tip, new category organization, updated filter pills, and a "Ready for you" badge replacing the Playbook/Unlock section split.

---

## Data Model Changes (`cards-data.js`)

### Replace `cat` values — assignment table is the sole source of truth

The table below is the definitive category assignment for all 25 tips. No mechanical mapping rule applies — each tip is assigned individually.

| ID | Title (short) | New `cat` | `startHere` |
|----|---------------|-----------|-------------|
| t1 | Park Hyatt Maldives | `redeeming` | |
| t2 | ANA First Class | `redeeming` | |
| t3 | Qatar Q-Suite | `redeeming` | |
| t4 | Cathay Pacific Business | `redeeming` | |
| t5 | JAL Business Class | `travel` | |
| t6 | Aer Lingus Business | `travel` | |
| t7 | Atmos Free Stopover | `travel` | |
| t8 | Double Stopover | `travel` | |
| t9 | Aeroplan Open-Jaw | `travel` | |
| t10 | LifeMiles United Polaris | `redeeming` | |
| t11 | Triple Dip 20%+ back | `earning` | |
| t12 | Freedom Flex 7.5% stack | `earning` | ✓ |
| t13 | Bilt Rent Day 6x | `earning` | ✓ |
| t14 | Hotel Portal 10x double earn | `earning` | |
| t15 | Flying Blue Promo Awards | `redeeming` | |
| t16 | Transfer Bonus Waiting | `managing` | |
| t17 | Freedom Flex activation | `managing` | ✓ |
| t18 | Companion Pass strategy | `travel` | |
| t19 | Amex Platinum break-even | `managing` | ✓ |
| t20 | Rent-to-Hyatt pipeline | `redeeming` | ✓ |
| t21 | Citi Double Cash upgrade | `earning` | ✓ |
| t22 | Multiple Custom Cash play | `earning` | |
| t23 | Chase 5/24 rule | `managing` | ✓ |
| t24 | P2 strategy | `managing` | |
| t25 | Amex once-per-lifetime | `managing` | ✓ |

### New fields per tip

- `beginnerTip: string` — plain-English explanation, 1–3 sentences, no jargon, ~100–250 characters. Must be written for all 25 tips. No tip may omit this field. Tone: "Here's what this means and why it matters to you."
- `startHere: true` — added only to the 8 tips marked ✓ above. Omit the field entirely on tips that are not Start Here (do not set `startHere: false`).

### `TIP_CAT_LIST` — stays in `index.html`, updated in place

`TIP_CAT_LIST` currently lives in `index.html` (line ~948). It is **not** moved to `cards-data.js`. Update it in place to:

```js
const TIP_CAT_LIST = [
  {id:"all",       icon:"✦", label:"All"},
  {id:"earning",   icon:"⬆", label:"Earning More Points"},
  {id:"redeeming", icon:"✈", label:"Redeeming Smartly"},
  {id:"managing",  icon:"⚙", label:"Managing Your Cards"},
  {id:"travel",    icon:"🌍", label:"Travel Strategies"},
];
```

"Start Here" is a section, not a filter pill.

---

## Filter & Organization Logic

### "All" view

1. **Start Here section** — always first, renders all 8 `startHere` tips, unconditional (not wallet-gated)
2. **4 topic category sections** in order: Earning More Points → Redeeming Smartly → Managing Your Cards → Travel Strategies
3. Start Here tips **also render in their topic category** — duplication is intentional. Explicit rendering rule: in the All view, render a tip card once in Start Here and once in its assigned category section. There is no deduplication. The same tip ID renders twice with the same component.
4. Because a `startHere` tip renders twice, `openTip` state is a single tip ID shared across both instances. When a tip is open in Start Here, its instance in the category section will also appear open. This is acceptable and intentional — do not add per-section open state.
5. Category headers styled like current section dividers: centered label with horizontal rules, with tip count: e.g. `Earning More Points (6)`. The count is the total number of tips with that `cat` value — including any that also have `startHere: true` (since those tips still render in their category section).

### Category filter view (any pill except "All")

- Start Here section hidden entirely
- Flat list of tips from selected category only
- No section headers needed
- If a future data change produces zero tips in a category, show: `<div style="text-align:center; padding:20px; color:var(--tx3); font-size:13px">No tips in this category yet. Try "All".</div>`

### "Ready for you" badge

- Shown when user owns **all** required cards for a tip
- `⬆ Almost There` badge when user owns at least one but not all required cards. For tips where `tip.cards.length === 1`, this badge can never fire — you either own it (Ready) or you don't. Suppress it silently; do not show Almost There for single-card tips with zero owned cards.
- Visible in both collapsed and expanded states, across all views
- Replaces the "Your Playbook" / "Unlock With One More Card" section split entirely

### Empty wallet

- No special gating or prompt. The Start Here section always shows its 8 tips regardless.
- Tips will show no "Ready for you" or "Almost There" badges — this is correct and expected.
- Remove the existing "Add cards to see your playbook" empty-wallet prompt from TipsTab.

---

## Component Changes (`TipsTab`)

### New state

| State | Type | Default | Persisted |
|-------|------|---------|-----------|
| `mode` | `'beginner'` \| `'advanced'` | `'beginner'` | `useLS('cs_tips_mode', 'beginner')` |
| `filterCat` | string | `'all'` | No |
| `openTip` | string \| null | null | No |
| `showFullBody` | Set of tip IDs | `new Set()` | No |

Use the existing `useLS` hook for `mode`: `const [mode, setMode] = useLS('cs_tips_mode', 'beginner')`.

### `showFullBody` state management — complete rules

- **Cleared entirely** when `mode` switches to `'beginner'` (on both Advanced→Beginner and the initial Beginner→Advanced→Beginner round-trip)
- **Not cleared** when switching from `'beginner'` to `'advanced'` — the set is retained but unused during advanced mode rendering
- **Not cleared** when `filterCat` changes
- **Not cleared** when `openTip` changes (collapsing a tip does not remove it from `showFullBody`)
- **A tip ID is added** when user taps "Show full details →" inside an expanded tip in beginner mode
- Since `showFullBody` is a Set (not useState-compatible directly), use `useState` with a new Set on each update: `setShowFullBody(prev => new Set(prev).add(tipId))`

### Beginner/Advanced toggle

- Two-segment pill toggle, right-aligned, sits above the filter pills in the tab header area
- Switching to Advanced: `setMode('advanced')`
- Switching to Beginner: `setMode('beginner')`, `setShowFullBody(new Set())`

### Layout (All view)

```
[Beginner ●] [Advanced]           ← toggle, right-aligned

[✦ All] [⬆ Earning] [✈ Redeem]   ← filter pills, hscroll
[⚙ Managing] [🌍 Travel]

── Start Here ────────────────────
  tip card × 8

── Earning More Points (N) ───────
  tip card × N

── Redeeming Smartly (N) ─────────
  ...
```

### `renderTip` — collapsed state

- Badge row: category label pill + `✓ Ready for you` (green, if all cards owned) or `⬆ Almost There` (gold, if ≥1 card owned but not all) + difficulty label
- Title
- Chevron ▸ (rotates 90° when open)

(Badge row renders above title — consistent with original code and standard mobile card metadata pattern.)

### `renderTip(tip)` — expanded state

**Beginner mode (`mode === 'beginner'`):**
- `tip.beginnerTip` text
- If `showFullBody` does NOT contain `tip.id`: render `Show full details →` link
- If `showFullBody` CONTAINS `tip.id`: render full `tip.body` text inline (no link)
- USE WITH card chips (same as today)
- Transfer partners (same as today)
- Unlock CTA if user doesn't own all required cards (same as today)

**Advanced mode (`mode === 'advanced'`):**
- Full `tip.body` text directly (same as today)
- USE WITH card chips
- Transfer partners
- Unlock CTA

### No changes to

`ValueMeter`, `CardArt`, `AuthModal`, `TopNav`, any other component outside `TipsTab`.

---

## Files Changed

1. `cards-data.js` — update all 25 tip objects: new `cat` value, add `beginnerTip` string, add `startHere: true` where applicable
2. `index.html` — update `TIP_CAT_LIST` in place; rewrite `TipsTab` component only
3. `CLAUDE.md` — add `cs_tips_mode` to the localStorage key table: `cs_tips_mode | string ('beginner'|'advanced') | Tips tab mode preference`

## Files Unchanged

`manifest.json`, all legal pages, all other React components

> Note: `sw.js` requires a `CACHE_VERSION` bump per project deployment rules (CLAUDE.md) whenever `index.html` or `cards-data.js` change. This is handled in the implementation plan.
