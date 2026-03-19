# CardSage — Project Briefing

## What This Is
A single-file React app (CardSage.html) for credit card benefit tracking and points optimization. No build system — uses CDN React 18 + Babel standalone. All code lives in one HTML file.

## Current State (v3)
- CardSage.html is a complete, working app (~120KB, 1,579 lines)
- Data layer: 45+ cards including new Atmos Ascent + Summit, 25 expert tips, 6 strategies with beginner-friendly explanations
- UI: sticky top nav with subheadings (Home, Benefits, Tips, Use Card, Offers, Wallet)
- Features: benefit checkoff with categories, strategy modal with beginner explanations, merchant lookup, rotating bonus categories (Q1 2026), One Card Away section

## Tech Stack
- React 18 (CDN unpkg), Babel Standalone, zero npm/webpack/bundler
- CSS variables + glassmorphism + canvas particle background
- localStorage persistence via useLS() hook
- Mobile-first responsive, max-width 700px container

## Key Data Structures
- CARDS[] — array of card objects with id, name, issuer, fee, earn rates, annual/monthly benefits, transfer partners
- STRATS{} — strategy objects with forBeginners, analogy, firstStep, play[], learn fields
- TIPS_DB[] — 25 structured tips with cat, title, body, cards[], value, difficulty fields
- BCAT{} — benefit category definitions (travel, dining, entertainment, status, statement, awards, protection)
- EARN_PRIORITY{} — arrays of card IDs ordered by earn rate per spending category
- ROTATING_Q1[] — quarterly rotating bonus category data

## Affiliate Links
All "Apply Now" buttons currently use placeholder hrefs like #apply-{cardId}.
These need to be replaced with real issuer application URLs.
Key cards: csr, csp, amex-plat, amex-gold, venture-x, atmos-ascent, atmos-summit, etc.

## Post-MVP Priorities (in order)
1. Replace all #apply-{cardId} hrefs with real affiliate/application URLs
2. Expand card library from 45 to 100 cards (top consumer + business)
3. Offers tab — real cashback offer integration (requires issuer OAuth APIs)
4. User accounts and cloud sync

## Rules
- NEVER introduce a build system, npm, or bundler — everything stays in one HTML file
- NEVER split into multiple files
- All React components use CDN React 18 + Babel standalone (type="text/babel")
- Test by opening CardSage.html directly in a browser

## Planning Docs
See cardwise-docs/ folder for full PRD, App Flow, Design Document, Backend Technical spec, and Phase Plan.