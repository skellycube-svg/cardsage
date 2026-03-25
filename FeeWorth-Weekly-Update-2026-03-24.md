# FeeWorth Weekly Data Update — March 24, 2026

**Generated:** Tuesday, March 24, 2026
**Baseline file:** `cards-data.js` (read before research)
**Research window:** March 17–24, 2026

---

## SECTION 1: CRITICAL CHANGES

*Items where cards-data.js currently has wrong or outdated values that need fixing.*

---

### 1. Chase Removed Emirates as Transfer Partner (October 16, 2025)
**Priority: HIGH**

Chase ended all Ultimate Rewards transfers to Emirates Skywards effective **October 16, 2025**, yet Emirates is still listed in the partners arrays for both the CSR and CSP.

| Card | Line | Current Value | Should Be |
|------|------|---------------|-----------|
| `csr` | 231 | `partners:[... "Emirates" ...]` | Remove "Emirates" from array |
| `csp` | 242 | `partners:[... "Emirates" ...]` | Remove "Emirates" from array |

Chase now has 10 airline + 3 hotel transfer partners. Emirates was dropped because Chase requires all transfers to remain at 1:1, and Emirates had pushed other programs to devalue to 5:4. Chase chose to drop it entirely rather than break its 1:1 parity rule.

Note: Bilt cards (bilt-blue, bilt-obsidian, bilt-palladium, bilt-rent) still correctly list Emirates — Bilt remains the **only** 1:1 Emirates transfer partner as of this writing. No change needed for Bilt.

Note: Citi cards (citi-premier, line 420) still list Emirates without a ratio — Citi devalued (not removed) its Emirates transfer ratio in July 2025. Consider adding "(5:4)" notation but this is lower priority.

Note: Amex cards already correctly show "Emirates (5:4)" — no change needed there.

Sources:
- https://onemileatatime.com/news/chase-ultimate-rewards-ends-emirates-skywards-transfers/
- https://thepointsguy.com/news/chase-lose-emirates-skywards-transfer-partner/
- https://upgradedpoints.com/news/chase-ending-emirates-transfers/

---

### 2. Capital One Emirates Ratio Changed to 4:3 — Effective January 13, 2026
**Priority: HIGH**

Capital One devalued its Emirates Skywards transfer ratio from 1:1 to **4:3 (1:0.75)**, effective January 13, 2026. Capital One is now the worst remaining Emirates transfer partner (behind even Amex and Citi at 5:4).

Current state: Emirates does NOT appear in `TRANSFER_PARTNER_DATA["Capital One Miles"]` top partners (that part is already fine). However, any Capital One card `partners:[]` array that lists "Emirates" without a ratio notation is now misleading.

Action: grep for "Emirates" across Capital One card definitions (venture-x, venture, venture-one, spark-miles). If Emirates appears, update to "Emirates (4:3)" or remove if deemed too low value to surface.

Sources:
- https://onemileatatime.com/news/capital-one-devalues-emirates-skywards-transfers/
- https://frequentmiler.com/capital-one-transfer-ratio-to-emirates-will-reduce-to-1000750/

---

### 3. Discover it Q2 2026 Rotating Categories — Missing from ROTATING_Q1
**Priority: MEDIUM**

`ROTATING_Q1` already has Chase Freedom Flex Q2 2026 entries but is missing the Discover it Q2 2026 entry. Q2 categories are Restaurants and Home Improvement Stores.

Entry to add:
```
{card:"Discover it Cash Back",id:"discover-it",q:"Q2 2026",cats:"Restaurants, Home Improvement Stores",rate:"5%",note:"Activate at discover.com — activation window is the full quarter (Apr 1–Jun 30). NOT retroactive.",verified:true}
```

Important distinction from Chase: Discover Q2 activation is NOT retroactive to April 1. You earn 5% only from the day you activate forward. Chase Freedom Flex Q2 IS retroactive to April 1 if activated by June 14.

Sources:
- https://www.doctorofcredit.com/discover-q2-2026-5-categories-restaurants-home-improvement-stores/
- https://www.cnbc.com/select/discover-cash-back-calendar/
- https://www.nerdwallet.com/credit-cards/news/discover-5-percent-bonus-categories-Q2-2026

---

## SECTION 2: NEW INFORMATION

*New cards, benefits, or partners not yet reflected in cards-data.js.*

---

### 4. World of Hyatt — Major Award Chart Devaluation Incoming (May 2026)
**Priority: HIGH**

On February 25, 2026, Hyatt announced a sweeping restructuring of its award chart, effective May 2026. This directly impacts cpp valuations used throughout the app.

Key changes:
- Award pricing tiers expand from 3 levels (off-peak/standard/peak) to **5 levels** (Lowest/Low/Moderate/Upper/Top)
- Top-tier nights increase **up to 67%** — Category 8 peak rising from 45,000 to **75,000 points per night**
- Average "Moderate" tier runs roughly **25% higher** than current "Standard" rates
- Price variance within a single category now spans up to **40,000 points per night**
- Rollout is gradual in 2026; broader adoption from 2027 onward

Impact on cards-data.js:
The `TRANSFER_PARTNER_DATA["Chase Ultimate Rewards"]` top partners section notes Hyatt at "2-3cpp" with sweetSpot "Cat 1-4 in expensive cities." After May 2026, top-night value drops substantially for high-demand stays. Cat 1-4 off-peak may still hold, but the blanket "2-3cpp" framing needs a caveat.

`HIDDEN_VALUES["World of Hyatt Card"].intangibleNote` says "most valuable hotel currency at a consistent 2-3 cents per point" — this consistency is breaking in May 2026.

Good news already accurate in data: Free night certificates (Cat 1-4 and Cat 1-7) retain their current value even under the new chart.

Suggested additions:
- Add to Hyatt TRANSFER_PARTNER_DATA entry: "Award chart inflating May 2026 — top nights rising up to 67%. Book before May for best value."
- Add caveat to World of Hyatt Card intangibleNote about the devaluation.

Sources:
- https://frequentmiler.com/mayday-hyatt-to-launch-a-brutal-new-world-of-hyatt-chart-in-may-2026/
- https://10xtravel.com/hyatt-award-chart-changes-2026/
- https://onemileatatime.com/news/world-of-hyatt-updates-award-chart-costs-increase/
- https://newsroom.hyatt.com/awardchartupdates

---

### 5. United MileagePlus — Cardholder Award Discounts Launch April 2, 2026
**Priority: MEDIUM**

Effective April 2, 2026, United is creating a two-tier redemption system that benefits co-branded cardholders:

- United cardholders receive at least **10% off** all award flights
- Premier + cardholder members receive at least **15% off**
- Non-cardholders lose earn rate advantages on revenue flights
- Saver award availability in premium cabins restricted for non-cardholders
- Close-in awards (within 2 weeks of departure) have already quietly increased — domestic flights now showing 20,000+ miles where 15,000 was standard

This is material for the value propositions of `united-explorer`, `united-quest`, and `united-club-inf`. The discount makes points effectively worth more for cardholders. Consider adding a note to these cards' earn descriptions or tips.

Sources:
- https://awardwallet.com/news/united-mileageplus/premier-status-changes-2026/
- https://viewfromthewing.com/united-wont-raise-status-requirements-for-2026-instead-its-devaluing-pluspoints-and-business-class-awards/
- https://liveandletsfly.com/united-close-in-award-devaluation/

---

### 6. Amex Centurion Lounge — New Access Rules Effective July 8, 2026
**Priority: MEDIUM**

Starting July 8, 2026, Centurion Lounges in the U.S., London Heathrow, Tokyo Haneda, Hong Kong, Sydney, and Melbourne add two new restrictions:

1. Same-flight rule: Guests must be traveling on the **same flight** as the cardholder (no more bringing in someone on a different flight)
2. 5-hour window: Access only within 5 hours of your departing flight

Guest pricing (already in effect from 2025):
- $50/adult guest, $30/child (ages 2-17)
- Complimentary guest access (up to 2 guests) only if cardholder spent $75,000+ in prior/current calendar year

New Centurion Lounge locations opening 2026:
- Newark (EWR) — piano lounge + jazz bar concept
- Amsterdam Schiphol (AMS)
- "Sidecar by Centurion Lounge" concept at Las Vegas

Current `amex-plat` HIDDEN_VALUES loungeAccess perk says "Unlimited access to Amex Centurion Lounges" without these caveats. Should be updated to reflect July 2026 restrictions.

Sources:
- https://upgradedpoints.com/news/amex-centurion-lounge-new-entry-rules-2026/
- https://thepointsguy.com/news/amex-centurion-lounge-access-policy-changes/

---

### 7. Robinhood Platinum Card — New $695 Competitor Launched March 4, 2026
**Priority: MEDIUM**

Robinhood launched a new premium Visa Infinite card on March 4, 2026. Not in cards-data.js. Worth adding as a comparison card.

Key specs:
- Annual fee: $695
- Issuer: Coastal Community Bank (same as Robinhood Gold)
- Network: Visa Infinite
- Availability: Invite-only at launch
- No welcome bonus
- No transfer partners (pure cash back)

Earn rates: 10% on hotels via Robinhood travel portal, 5% on flights via portal, 5% on dining (capped at $50k/yr), 1% on everything else

Annual credits totaling $3,000+:
- $300 travel credit (auto-applied, broad definition)
- $500 hotel credit ($250 semi-annual, Robinhood portal bookings only)
- $250 dining credit ($20/month, $30 in December)
- $250 DoorDash credit ($10 off orders $50+, ~25 orders to exhaust)
- $250 autonomous ride credit ($20/month, $30 in December)
- $200 health wearables credit
- $70 Oura ring membership (requires Oura Ring purchase)
- $120 Global Entry/TSA PreCheck (every 4 years)
- Priority Pass Select (1,800+ lounges)

Note: The credits are heavily caveatted — the DoorDash credit requires $50 minimum orders, the hotel credit requires portal bookings. Real-world value is lower than headline $3,000+.

Sources:
- https://finance.yahoo.com/personal-finance/credit-cards/article/robinhood-platinum-card-launch-004511514.html
- https://onemileatatime.com/news/robinhood-platinum-card/
- https://www.cnbc.com/select/robinhood-platinum-vs-amex-platinum/

---

### 8. Disney Inspire Visa — New Chase Card Launched February 3, 2026
**Priority: LOW**

Chase and Disney launched the Disney Inspire Visa Card on February 3, 2026 — the new top-tier Disney card. Not in cards-data.js.

Key specs:
- Annual fee: $149
- Issuer: Chase / JPMorgan
- Network: Visa
- Welcome offer: $300 Disney eGift Card on approval + $300 statement credit after $1,000 spend in 3 months
- Points currency: Disney Rewards Dollars (no airline/hotel transfers)

Earn: 10% at Disney+/Hulu/ESPN+; 3% at U.S. Disney locations; additional earn at gas stations, grocery stores, restaurants (rates not specified in sources reviewed)

Annual credits: $100 toward Disney theme park tickets; 200 Disney Rewards Dollars after $2k spend on resort/cruise; up to $120 on Disney+/Hulu/ESPN+

Niche card — best for Disney loyalists. No travel transfer ecosystem.

Sources:
- https://media.chase.com/news/chase-and-disney-launch-the-disney-inspire-visa-card
- https://thepointsguy.com/credit-cards/disney-inspire-visa-new-premium-card-benefits/

---

### 9. Chase Sapphire Reserve — Hyatt Explorist Status Benefit Coming Mid-2026
**Priority: MEDIUM**

Chase announced that Hyatt Explorist status will be added as a CSR cardholder benefit starting mid-2026. Not yet reflected in cards-data.js.

Hyatt Explorist (mid-tier, normally requires 30 qualifying nights/year) includes: confirmed suite upgrades at select properties, club lounge access at select hotels, enhanced bonus point earning, and 5 qualifying night credits toward Globalist.

Adding this to the CSR's annual benefits would substantially increase the card's hotel value proposition — particularly for users who stay at Hyatt but don't hit 30 nights per year. Consider adding as a pending/upcoming benefit.

Current CSR data at line 232 does not include any Hyatt status benefit.

Sources:
- https://viewfromthewing.com/chase-made-sapphire-reserve-credits-easier-to-use-new-250-hotel-credit-more-dining-cities-no-more-split-year-timing/
- https://thriftytraveler.com/news/credit-card/new-chase-sapphire-reserve-benefits-now-live/

---

## SECTION 3: EXPIRING / TIME-SENSITIVE

*Transfer bonuses and deadlines in the next 14 days. Review immediately.*

| Deadline | Program | Bonus | Notes |
|----------|---------|-------|-------|
| March 28, 2026 (4 DAYS) | Amex MR → Avianca LifeMiles | 15% bonus (1:1.15) | Offered by LifeMiles directly, not Amex. Miles post within 24 hours. |
| March 31, 2026 (7 DAYS) | Chase UR → Aer Lingus / British Airways / Iberia (Avios) | 20% bonus (1:1.2) | Qatar Qsuite business class only needs 59k UR instead of 70k Avios during this bonus. |
| March 31, 2026 (7 DAYS) | Chase UR → Wyndham Rewards | 30% bonus (1:1.3) | |
| March 31, 2026 (7 DAYS) | Rove Miles → JAL Mileage Bank | 50% bonus (1:1.5) | Not in CardSage ecosystem but notable for users |
| March 31, 2026 (7 DAYS) | Accor Live Limitless → Singapore KrisFlyer | 50% bonus (hotel-to-airline, 2:1.5) | |
| April 8, 2026 | Rove Miles → SAS EuroBonus | 20% bonus (1:1.2) | |
| April 18, 2026 | Citi TY → Choice Privileges | Last day at 1:2 ratio (drops to 1:1.5 on April 19) | Already noted in data — user-facing alert would be valuable |

**Already expired this cycle:**
- Discover it Q1 2026 activation deadline (March 14, 2026) — users who did not activate for Grocery/Wholesale Clubs/Streaming 5% are locked out of Q1 bonuses.

**Book before May 2026:**
- Any Hyatt award stays at current pricing, especially Category 6-8 properties. Reservations made before May 2026 retain their original point cost even for stays after the new chart takes effect.

Sources:
- https://thepointsguy.com/loyalty-programs/current-transfer-bonuses/
- https://frequentmiler.com/current-point-transfer-bonuses/
- https://awardwallet.com/news/credit-card-transfer-bonuses/
- https://onemileatatime.com/news/citi-thankyou-devalues-hotel-points-transfers/

---

## SECTION 4: RETENTION OFFERS

*Community data points from FlyerTalk, Doctor of Credit, and Reddit — March 2026.*

| Card | Reported Offer | Spend Context | Source / Date |
|------|---------------|--------------|---------------|
| Chase World of Hyatt | $100 statement credit | $30,000–$40,000/yr annual spend | FlyerTalk, March 2026 |
| Amex Business Platinum | ~150,000 points after $15,000 spend | Best reported data point | Doctor of Credit |
| Chase Sapphire Reserve | $150–$250 statement credit OR 10,000–15,000 UR points | Varies | FlyerTalk thread (already in retentionOffers field) |
| Citi AA Executive | No offer available | 3rd year of card holding | FlyerTalk, February 2026 |
| United Business Card | $100 statement credit | 3rd renewal, ~$6,000 annual spend | FlyerTalk |

Community best practices from forums this week:
- Use the word "retention" with the automated phone system rather than "closing card" — saying "closing" may trigger an automatic closure
- If no offer on first call, wait 1–2 weeks and try again — retention offer pools rotate
- Amex typically runs retention offers every other year on premium cards
- Optimal call window: 30–45 days before annual fee posts

Sources:
- https://www.flyertalk.com/forum/chase-ultimate-rewards/2147554-chase-retention-offers-2024-26-a.html
- https://milestomemories.com/retention-offer-amex-chase-citi/
- https://www.doctorofcredit.com/tag/retention-offers/

---

## SECTION 5: ALREADY ACCURATE

*Items verified against research this week — no changes needed.*

- CSR annual fee $795 — correct
- Amex Platinum annual fee $895 (raised from $695 in Sept 2025) — correct
- Amex Gold annual fee $325 — correct
- Amex Business Platinum annual fee $895 — correct
- CSR full benefit structure ($300 travel, $500 Edit Hotel, $300 StubHub, $120 Lyft monthly, $250 Select Hotels 2026, DoorDash promos, IHG Platinum status) — verified comprehensive and current
- Amex Cathay Pacific 5:4 ratio (Amex Business Platinum and Amex Gold partners) — correct; change effective March 1, 2026
- Amex Emirates 5:4 ratio notation in Amex card partners arrays — correct
- Chase Freedom Flex Q1 2026 categories (Dining, American Heart Association, Norwegian Cruise Line — activate by 3/14/26) — correct
- Chase Freedom Flex Q2 2026 categories (Amazon, Chase Travel, Whole Foods, Feeding America — deadline 6/14/26) — correct; Whole Foods is part of the Amazon category definition per Chase
- Discover it Q1 2026 categories (Grocery Stores, Wholesale Clubs & Select Streaming — deadline 3/14/26) — correct
- Citi Choice Privileges devaluation April 19, 2026 — already noted in TRANSFER_PARTNER_DATA as "1:1.5 (was 1:2, devaluing Apr 19 2026)" — correct
- Bilt cards still list Emirates at 1:1 — verified; Bilt is the last remaining 1:1 Emirates transfer partner as of March 2026
- Bilt Palladium annual fee $495 — correct
- US Bank Altitude Reserve $325 travel/dining credit and note about portal value drop from 1.5c to 1.0c — correct
- World of Hyatt Card free night certificates (Cat 1-4) retain value even post-May 2026 devaluation — correct
- Capital One TRANSFER_PARTNER_DATA does not list Emirates among top partners — appropriate given the devaluation

---

## PRIORITIZED ACTION LIST

| # | Priority | Location | Action |
|---|----------|----------|--------|
| 1 | HIGH | Line 231 (csr.partners) | Remove "Emirates" from partners array |
| 2 | HIGH | Line 242 (csp.partners) | Remove "Emirates" from partners array |
| 3 | HIGH | All Capital One card partners arrays | grep for Emirates; add "(4:3)" notation or remove |
| 4 | MEDIUM | ROTATING_Q1 array | Add Discover it Q2 2026 entry (Restaurants, Home Improvement, non-retroactive activation) |
| 5 | MEDIUM | TRANSFER_PARTNER_DATA.Chase.topPartners Hyatt entry | Add note about May 2026 award chart inflation |
| 6 | MEDIUM | HIDDEN_VALUES["World of Hyatt Card"].intangibleNote | Add devaluation caveat for May 2026 |
| 7 | MEDIUM | amex-plat HIDDEN_VALUES loungeAccess perk | Add July 8, 2026 restriction caveats (same-flight, 5-hour window) |
| 8 | MEDIUM | csr annual benefits (line 232) | Add upcoming Hyatt Explorist status benefit (mid-2026, pending confirmation) |
| 9 | LOW | Line 420 (citi-premier.partners) | Consider adding "(5:4)" ratio notation to Emirates entry |
| 10 | LOW | CARDS array | Add Robinhood Platinum ($695) if coverage of that tier is desired |
| 11 | LOW | CARDS array | Add Disney Inspire Visa ($149) if Disney niche coverage is desired |

---

*This report was generated automatically by the FeeWorth weekly data update scheduled task. No code was modified. All changes listed above require manual developer review and implementation.*
