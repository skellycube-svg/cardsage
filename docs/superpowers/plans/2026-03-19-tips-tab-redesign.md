# Tips Tab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the CardSage Tips tab with a Beginner/Advanced mode toggle, plain-English tip explanations, category-grouped layout with a "Start Here" section, and a "Ready for you" badge replacing the Playbook/Unlock split.

**Architecture:** Two files change — `cards-data.js` gets updated tip data (new `cat` values, `beginnerTip` strings, `startHere` flags), and `index.html` gets an updated `TIP_CAT_LIST` and a fully rewritten `TipsTab` component. No new files, no new dependencies.

**Tech Stack:** React 18 + Babel Standalone (CDN, no build system), plain localStorage via existing `useLS(key, default)` hook, vanilla CSS via inline styles. Verify in browser — no test runner.

---

## Spec Reference

`docs/superpowers/specs/2026-03-19-tips-tab-redesign-design.md`

---

## Task 1: Update TIPS_DB — new `cat`, `beginnerTip`, `startHere`

**Files:**
- Modify: `cards-data.js` — replace all 25 tip objects in the `TIPS_DB` array

**Context:** `TIPS_DB` starts around line 621 in `cards-data.js`. It is a `const` array of 25 objects. Replace the entire array with the version below. The only structural additions are the `beginnerTip` string field and `startHere: true` on 8 tips. The `cat` field is also updated per the spec assignment table.

- [ ] **Step 1: Open `cards-data.js` and locate `TIPS_DB`**

Search for `const TIPS_DB=[` — it starts around line 621. Read the full array to confirm you have the right section.

- [ ] **Step 2: Replace the entire `TIPS_DB` array**

Replace everything from `const TIPS_DB=[` through the closing `];` with:

```js
const TIPS_DB=[
// ── REDEEMING SMARTLY ──────────────────────────────────────────────────────────
{id:"t1",cat:"redeeming",title:"Park Hyatt Maldives: 40k points vs $1,500/night",cards:["csr","csp","hyatt"],
 beginnerTip:"Your Chase points can be transferred to World of Hyatt and used to book a luxury overwater villa that normally costs $1,500/night. This is one of the best ways to use Chase points.",
 body:"Transfer 40,000 Chase Ultimate Rewards points to World of Hyatt (1:1 ratio) and book one night at the Park Hyatt Maldives Hadahaa. Cash rate: $1,200–1,800/night for an overwater villa. Your cost: $0 beyond the points. At standard cash-out value (1.5¢/pt), those 40k points are 'worth' $600 — but you're getting $1,500+ in actual value. This is the Chase Trifecta's headline redemption.",
 value:3,difficulty:"intermediate"},
{id:"t2",cat:"redeeming",title:"ANA First Class via Virgin Atlantic — $25k experience for 75k points",cards:["amex-plat","amex-gold"],
 beginnerTip:"Amex points transfer to Virgin Atlantic, which lets you book ANA's top-tier first class cabin to Japan for far fewer points than you'd think. This cabin costs $25k cash but only 75k points.",
 body:"Transfer 75,000 Amex Membership Rewards to Virgin Atlantic Flying Club (1:1). Book ANA 'The Suite' First Class from the U.S. to Japan with those miles. Cash price: $15,000–25,000 one-way. No fuel surcharges. ANA's 'The Suite' is a private first-class suite with sliding doors — widely considered the best first-class product flying. You cannot book it this cheaply through any other program.",
 value:3,difficulty:"advanced"},
{id:"t3",cat:"redeeming",title:"Qatar Q-Suite via Citi — world's best business class, Citi-exclusive",cards:["citi-premier","citi-dc"],
 beginnerTip:"Citi points can be transferred to Qatar Airways to book a private business class suite with closing doors — widely considered the best business class in the world — for a fraction of the cash price.",
 body:"Transfer ~70,000 Citi ThankYou Points to Qatar Airways Avios (1:1, Citi exclusive). Book Qatar Q-Suite Business Class transatlantic. Cash price: $5,000–8,000. Qatar Q-Suite features a full private suite with doors, a double bed when flying with a partner, and the best inflight dining in business class. No other major credit card program transfers to Qatar — this is a Citi-only redemption pathway.",
 value:3,difficulty:"intermediate"},
{id:"t4",cat:"redeeming",title:"Cathay Pacific Business via Atmos — zero fuel surcharges",cards:["atmos-ascent","atmos-summit"],
 beginnerTip:"Atmos points book Cathay Pacific's lie-flat business class with no extra fuel fees — saving you $500–1,000 compared to booking the same seat through other programs.",
 body:"Book Cathay Pacific Business Class LAX or SFO to Hong Kong for 75,000 Atmos Rewards points. Cash equivalent: $3,500–5,000. Critically: zero fuel surcharges, which other programs charge $500–1,000 extra for the same flight. Cathay's Business Class (Aria Suite) features a direct-aisle seat with full lie-flat bed. Use the Atmos Summit card's companion award to bring a second person for just the base award.",
 value:3,difficulty:"intermediate"},
{id:"t10",cat:"redeeming",title:"LifeMiles United Polaris Shortcut: 63k vs 140k points",cards:["amex-plat","amex-gold","amex-bbp","citi-premier"],
 beginnerTip:"You can book United business class to Europe for about half the points that United's own program charges, by using Avianca's points program instead. Same seat, much lower cost.",
 body:"Transfer Amex MR or Citi TYP to Avianca LifeMiles (1:1). Book United Polaris Business Class to Europe for 63,000 LifeMiles one-way. The same flight through United's own program costs 140,000 miles — more than twice as many points. LifeMiles also charges no fuel surcharges on United. This is the fastest route to transatlantic business class using Amex or Citi points.",
 value:3,difficulty:"intermediate"},
{id:"t15",cat:"redeeming",title:"Flying Blue Promo Awards: Check Every 1st of the Month",cards:["amex-plat","amex-gold","amex-bbp","citi-premier","csp","csr"],
 beginnerTip:"Air France/KLM releases discounted award flights every month — sometimes 50% off. Check on the 1st of each month, then transfer your points only when you spot a specific deal you want.",
 body:"Air France/KLM Flying Blue releases 'Promo Awards' every month — specific routes at 25–50% off the normal price. Transatlantic business class often drops to 38,000–55,000 points (normally 87,000). Check flyingblue.com on the 1st of each month. Transfer Amex MR or Citi TYP to Flying Blue (1:1) ONLY when you have a specific Promo Award booking ready. Never transfer speculatively.",
 value:3,difficulty:"intermediate"},
{id:"t20",cat:"redeeming",startHere:true,title:"The Rent-to-Hyatt Pipeline: Bilt's Hidden Power",cards:["bilt"],
 beginnerTip:"The Bilt card lets you earn points on rent with no transaction fee. Transfer those points to Hyatt at 1:1 and you can cover free hotel nights — turning a monthly bill into a luxury stay.",
 body:"Bilt earns 1x on rent with no transaction fee. Average renter: $2,000/month = 24,000 Bilt points/year. Transfer to World of Hyatt at 1:1. 24,000 Hyatt points can cover 1 night at a Category 4 Hyatt (Park Hyatt or Andaz) worth $300–400. You're converting mandatory rent payments into luxury hotel nights — no other card does this without a fee. On a $2k/month rent, that's $300–400 in hotel value from spending you'd do anyway.",
 value:2,difficulty:"beginner"},
// ── EARNING MORE POINTS ────────────────────────────────────────────────────────
{id:"t11",cat:"earning",title:"The Triple Dip: 20%+ back on a single purchase",cards:["amex-plat","amex-gold"],
 beginnerTip:"You can stack an Amex Offer discount, a cashback portal, and your card's earn rate all on one purchase — sometimes getting 15–25% total value back from a single transaction.",
 body:"Stack three layers simultaneously: 1) Activate an Amex Offer (e.g., '$25 back at Nike'). 2) Click through a cashback portal (e.g., Rakuten, which earns Amex MR at 3–10%). 3) Pay with your Amex Gold (1x). Result: Amex Offer savings + portal cashback + card points = often 15–25% effective return. Best categories: department stores, tech, and clothing during Amex Offer campaigns.",
 value:2,difficulty:"intermediate"},
{id:"t12",cat:"earning",startHere:true,title:"Chase Freedom Flex 7.5% Return Stack",cards:["cff","csr"],
 beginnerTip:"Earn 5x points on quarterly categories with your Freedom Flex, then transfer those points to your Sapphire Reserve. Using them for travel through Chase boosts them to 7.5% back in total value.",
 body:"Earn 5x UR with Freedom Flex on rotating categories. Transfer those points to a Chase Sapphire Reserve. Redeem through Chase Travel portal at 1.5¢/point. Effective return: 5 × 1.5¢ = 7.5% back. On a $500 grocery spend during Q1 (when groceries are often a 5x category), that's $37.50 in effective travel value from one card purchase. No travel card with an annual fee consistently beats this on a per-dollar basis.",
 value:2,difficulty:"beginner"},
{id:"t13",cat:"earning",startHere:true,title:"Bilt Rent Day: 6x Dining on the 1st of Every Month",cards:["bilt"],
 beginnerTip:"Every 1st of the month, Bilt doubles all earn rates. Use your Bilt card for dining on the 1st to earn 6x points instead of the usual 3x — set a phone reminder so you don't forget.",
 body:"Every 1st of the month ('Rent Day'), Bilt runs double point promotions: 6x on dining, 4x on travel, 2x on everything else (including rent). If you pay $2,000/month in rent (normal on Bilt = 2,000 pts), on Rent Day it becomes 4,000 pts. Put your most expensive restaurant bill of the month on Rent Day for 6x vs 3x normally. Set a phone reminder — this bonus applies only on the 1st.",
 value:2,difficulty:"beginner"},
{id:"t14",cat:"earning",title:"Hotel Portal 10x + Loyalty Points: The Double Earn",cards:["venture-x"],
 beginnerTip:"Book hotels through Capital One Travel to earn 10x miles, and still enter your hotel loyalty number to earn hotel points on the same stay. You're getting paid twice for one booking.",
 body:"Book a hotel through Capital One Travel with Venture X (10x miles). When booking, enter your hotel loyalty number. Most hotels still credit loyalty points even on portal bookings. Result: 10x C1 miles + hotel loyalty points simultaneously. On a $300 hotel night: 3,000 C1 miles ($45 value) + hotel points ($15–30 value) = effectively 20% return on hotel spend.",
 value:2,difficulty:"intermediate"},
{id:"t21",cat:"earning",startHere:true,title:"The Citi Double Cash Upgrade: Free Card to Transferable Points",cards:["citi-dc","citi-premier"],
 beginnerTip:"If you add the Citi Strata Premier card, your Double Cash's 2% cash back automatically becomes 2x transferable points instead — same spending, much more valuable rewards, no extra effort.",
 body:"The Citi Double Cash earns 2% cash back everywhere for free. When you also hold the Citi Strata Premier ($95), your Double Cash rewards automatically convert to ThankYou Points instead of cash — unlocking access to Qatar Airways, Air France, and other premium airline partners. Your no-fee flat-rate card becomes 2x transferable points on every purchase. Most people don't realize this conversion happens automatically.",
 value:2,difficulty:"beginner"},
{id:"t22",cat:"earning",title:"The Multiple Custom Cash Play: Auto-Optimize Multiple Categories",cards:["citi-custom"],
 beginnerTip:"You can get multiple Citi Custom Cash cards. Each one automatically earns 5% on whichever category you spend the most in — so two cards cover two categories, three cards cover three, with zero tracking.",
 body:"Citi allows multiple Custom Cash cards. Each card automatically earns 5% on whichever single category you spend the most in that billing cycle (up to $500/month per card). Get two cards: one self-selects 5% on dining, the other on gas — with zero management required. Add a third and cover streaming. This is the most automated cash back optimization strategy available — no category activation, no tracking.",
 value:2,difficulty:"intermediate"},
// ── MANAGING YOUR CARDS ────────────────────────────────────────────────────────
{id:"t16",cat:"managing",title:"Transfer Bonus Waiting: Never Transfer Until You Have to",cards:["amex-plat","amex-gold","csp","csr","venture-x"],
 beginnerTip:"Amex, Chase, and Capital One sometimes offer 30–40% bonus miles when transferring to specific airlines. If you wait for these bonuses instead of transferring today, you can get significantly more miles for free.",
 body:"Amex, Chase, and Capital One periodically run 30–40% transfer bonuses to specific partners (e.g., 'Transfer to Singapore Airlines and get 40% more miles'). If you transfer points speculatively now and a bonus appears next month, you miss the extra 40%. Keep points in your bank until you have a specific redemption booked, then transfer. If a bonus is active for your target partner, it's free money — always check before transferring.",
 value:2,difficulty:"intermediate"},
{id:"t17",cat:"managing",startHere:true,title:"Freedom Flex Quarterly Activation: Never Miss the Deadline",cards:["cff"],
 beginnerTip:"Your Chase Freedom Flex earns 5x on rotating categories each quarter — but only if you manually activate. Takes 30 seconds. Missing one quarter can cost you $120+ in points value. Set four calendar reminders.",
 body:"Chase Freedom Flex and Freedom (older version) earn 5x on rotating categories that change each quarter — but you MUST manually activate. If you don't activate, you earn only 1x. Missing one quarter on a $2,000 category spend costs you 8,000 points (~$120 in value). Activate at chase.com/freedom or Chase app. Set four annual calendar reminders: January 1, April 1, July 1, October 1. Takes 30 seconds.",
 value:2,difficulty:"beginner"},
{id:"t19",cat:"managing",startHere:true,title:"Amex Platinum Break-Even Math: The Card Pays You $300",cards:["amex-plat"],
 beginnerTip:"The Amex Platinum's $695 fee is offset by over $895 in annual credits — meaning the card effectively pays you ~$200 before you earn a single point. You just have to use all the credits.",
 body:"Most people see the $695 Amex Platinum fee and stop. The math: $200 airline credit + $200 hotel credit + $240 streaming credit + $155 Walmart+ + $100 Saks = $895 in credits. Subtract the $695 fee = +$200 net positive before counting a single point. Add Priority Pass, Centurion Lounges, and 5x on flights, and the card becomes one of the best value propositions in travel credit cards — for people who actually use the credits.",
 value:2,difficulty:"beginner"},
{id:"t23",cat:"managing",startHere:true,title:"Chase 5/24: The Rule That Costs Most People $1,000+",cards:["csr","csp","cff","cfu","ink-preferred","ink-cash","ink-unlimited"],
 beginnerTip:"Chase won't approve you for most of their cards if you've opened 5+ credit cards from any bank in the last 24 months. Get all your Chase cards first — before applying elsewhere — or you could lose access permanently.",
 body:"Chase automatically denies most applications if you've opened 5+ credit cards from ANY bank in the past 24 months. Amex, Capital One, Citi cards all count. Chase's best cards (Sapphire Reserve, Sapphire Preferred, all Ink cards) require you to be under 5/24. Strategy: Get ALL Chase cards you want first, then diversify to other issuers. Most people do this backwards and lose access to Chase's best products permanently.",
 value:3,difficulty:"beginner"},
{id:"t24",cat:"managing",title:"The P2 Strategy: Double Your Points Without Doubling Spend",cards:["csr","csp","amex-plat","amex-gold","venture-x"],
 beginnerTip:"Your spouse or partner can apply for the same cards independently, earning two signup bonuses from the same spend. Couples who do this routinely earn 400,000–600,000 points per year.",
 body:"'Player 2' (P2) refers to a spouse or domestic partner. When P2 applies for the same cards independently, your household earns two signup bonuses — often 120,000–160,000 points combined — without any additional total spending. P2 gets their own card, earns their own bonus. Both transfer to the same loyalty accounts (most programs allow household pooling). Couples who maximize P2 strategy often earn 400,000–600,000 points/year.",
 value:3,difficulty:"intermediate"},
{id:"t25",cat:"managing",startHere:true,title:"Amex Once-Per-Lifetime: Apply at the Highest Bonus",cards:["amex-plat","amex-gold"],
 beginnerTip:"Amex signup bonuses are only available once per card, ever. Check CardMatch.com for elevated targeted offers before applying — applying at the baseline offer forfeits your chance at a better one later.",
 body:"Amex welcome bonuses are typically only available once per card per lifetime. If you apply for the Platinum at the baseline 80,000 offer, you forfeit the ability to earn 150,000+ points when a higher offer appears. Strategy: Use CardMatch.com (free tool) to check for targeted elevated offers before applying. Also check during Q4 (October–December) when Amex historically runs the highest new card promotions.",
 value:3,difficulty:"beginner"},
// ── TRAVEL STRATEGIES ──────────────────────────────────────────────────────────
{id:"t5",cat:"travel",title:"Japan Airlines Business Class: 60k Atmos pts from West Coast",cards:["atmos-ascent","atmos-summit"],
 beginnerTip:"Atmos points can book JAL's fully flat business class from LA or San Francisco to Tokyo at one of the lowest point costs of any program — no fuel surcharges and consistently top-rated service.",
 body:"Book JAL Business Class from LAX/SFO to Tokyo (Narita or Haneda) for 60,000 Atmos points one-way. East Coast (JFK) costs 75,000 pts. JAL's 'Sky Suite' features a fully flat bed, direct aisle access from every seat, and exceptional Japanese hospitality. Cash price: $3,500–6,000. Zero fuel surcharges. This is consistently one of the top-rated business class products in the world.",
 value:3,difficulty:"beginner"},
{id:"t6",cat:"travel",title:"Aer Lingus Business Class — 45k Avios transatlantic lie-flat",cards:["csp","csr"],
 beginnerTip:"Transfer 45,000 Chase points to book Aer Lingus lie-flat business class from New York to Dublin — a flight that normally costs $1,500–2,500 in cash.",
 body:"Transfer 45,000 Chase UR to Avios (British Airways/Aer Lingus shared program). Book Aer Lingus Transatlantic Business Class New York to Dublin. Full lie-flat seat, proper meal service, $1,500–2,500 cash value. Aer Lingus is a Oneworld partner that often prices its own metal more cheaply than British Airways does. Dublin as a city is also a great stop before connecting to Europe.",
 value:2,difficulty:"intermediate"},
{id:"t7",cat:"travel",title:"The Atmos Free Stopover: Two Cities, One Award Price",cards:["atmos-ascent","atmos-summit"],
 beginnerTip:"When booking a one-way international flight with Atmos points, you can stop in an extra city for free for up to 14 days. Book LA to Sydney and stop in Tokyo on the way — at no extra cost.",
 body:"Atmos Rewards allows a FREE stopover of up to 14 days on one-way international awards. Book LAX to Sydney, but add a stopover in Tokyo. You pay the award price for LAX→Sydney, and the Tokyo leg is free. Stay in Tokyo for up to 14 days, then fly Tokyo→Sydney. Cash value of doing this separately: $2,000+. Atmos is one of the few programs still allowing free stopovers — most eliminated this years ago.",
 value:3,difficulty:"beginner"},
{id:"t8",cat:"travel",title:"The Double Stopover: Four Cities on One Roundtrip",cards:["atmos-ascent","atmos-summit"],
 beginnerTip:"On a round-trip Atmos award, you get two free stopovers — one in each direction. This lets you visit four cities for the price of a single round-trip award ticket.",
 body:"On Atmos roundtrip international awards, you get two free stopovers (one per direction). Book NYC→Seoul (stopover)→Tokyo→NYC with a return stopover in Hong Kong. Four cities. One award ticket price. With Japan Airlines and Cathay Pacific as Atmos partners, this routing is entirely bookable. Cash equivalent of visiting all four cities separately: $3,000–6,000 in flights.",
 value:3,difficulty:"advanced"},
{id:"t9",cat:"travel",title:"Aeroplan Open-Jaw Stopover: London + Paris on One Ticket",cards:["aeroplan"],
 beginnerTip:"Air Canada's points program lets you fly into one European city and out of another as one award. Fly into London, train to Paris, fly home — all for the price of a single transatlantic award.",
 body:"Aeroplan (Air Canada) allows open-jaw awards with a free stopover. Book NYC→London (stopover) then Paris→NYC as one award. Fly into London, spend time, train to Paris, fly home. All for the price of one transatlantic award. Air Canada and Star Alliance partners can handle this routing. Cash value of separate tickets: $400–800 more than the single award.",
 value:2,difficulty:"advanced"},
{id:"t18",cat:"travel",title:"Companion Pass Strategy: Earn in January, Use All Year",cards:["sw-priority"],
 beginnerTip:"Southwest's Companion Pass lets a designated person fly free with you on every flight for up to two years. Apply for a Southwest card in January to maximize how long the pass lasts.",
 body:"Southwest's Companion Pass lets your designated companion fly free (just taxes) on all Southwest flights for the rest of the calendar year AND all of next year. You need 135,000 Rapid Rewards points in one calendar year. Strategy: Apply for a SW card in January when a 70,000–80,000 point bonus is available. Spend toward the signup bonus in January/February. You'll hit 135k early in the year and get 23 months of free companion travel.",
 value:3,difficulty:"intermediate"},
];
```

- [ ] **Step 3: Verify tip count**

Open `cards-data.js` and count tip objects in the new array. There should be exactly 25 (t1–t25, all IDs present, no duplicates). Also verify `startHere: true` appears on exactly 8 tips: t12, t13, t17, t19, t20, t21, t23, t25.

- [ ] **Step 4: Commit**

```bash
cd /Users/Brittany/Desktop/CardSage
git add cards-data.js
git commit -m "data: update TIPS_DB with new categories, beginnerTip, startHere flags"
```

---

## Task 2: Update `TIP_CAT_LIST` in `index.html`

**Files:**
- Modify: `index.html` — find and replace `TIP_CAT_LIST` constant (around line 948)

**Context:** `TIP_CAT_LIST` is a `const` array defined inside the `<script type="text/babel">` block in `index.html`. The old version has 7 entries (all + 6 old category names). Replace it entirely.

- [ ] **Step 1: Find `TIP_CAT_LIST` in `index.html`**

Search for `const TIP_CAT_LIST`. It should be a short array definition near the top of the Babel script block.

- [ ] **Step 2: Replace the array**

Replace whatever is there with:

```js
const TIP_CAT_LIST=[
  {id:"all",       icon:"✦", label:"All"},
  {id:"earning",   icon:"⬆", label:"Earning More Points"},
  {id:"redeeming", icon:"✈", label:"Redeeming Smartly"},
  {id:"managing",  icon:"⚙", label:"Managing Your Cards"},
  {id:"travel",    icon:"🌍", label:"Travel Strategies"},
];
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "data: update TIP_CAT_LIST to new 4-category structure"
```

---

## Task 3: Rewrite `TipsTab` component

**Files:**
- Modify: `index.html` — replace the entire `TipsTab` function (currently ~lines 958–1101)

**Context:** Find `function TipsTab({myCards})` in `index.html`. Replace everything from that line through the closing `}` of the function with the code below. The `ValueMeter` component, `CARDS`, `APPLY_URLS`, and `useLS` hook are all available in scope — do not redefine them.

- [ ] **Step 1: Find the current `TipsTab` function bounds**

Search for `function TipsTab({myCards})`. Note the opening line number. Then find the matching closing `}` — it's the one that closes the function, around line 1101. The entire function including both braces must be replaced.

- [ ] **Step 2: Replace the entire `TipsTab` function**

```jsx
function TipsTab({myCards}){
  const [mode,setMode]=useLS('cs_tips_mode','beginner');
  const [filterCat,setFilterCat]=useState("all");
  const [openTip,setOpenTip]=useState(null);
  const [showFullBody,setShowFullBody]=useState(new Set());

  const DIFF_COLOR={beginner:"var(--grn2)",intermediate:"var(--gld2)",advanced:"var(--red2)"};
  const CAT_META={
    earning: {icon:"⬆",label:"Earning"},
    redeeming:{icon:"✈",label:"Redeeming"},
    managing: {icon:"⚙",label:"Managing"},
    travel:   {icon:"🌍",label:"Travel"},
  };
  const CAT_FULL={
    earning:"Earning More Points",
    redeeming:"Redeeming Smartly",
    managing:"Managing Your Cards",
    travel:"Travel Strategies",
  };

  const getBadge=tip=>{
    const owned=tip.cards.filter(id=>myCards.includes(id)).length;
    if(owned===tip.cards.length) return 'ready';
    if(owned>0&&tip.cards.length>1) return 'almost';
    return null;
  };

  const getPartners=tip=>{
    const s=new Set();
    tip.cards.forEach(id=>{const c=CARDS.find(x=>x.id===id);if(c&&c.partners)c.partners.forEach(p=>s.add(p));});
    return [...s];
  };

  const handleModeToggle=m=>{
    setMode(m);
    if(m==='beginner') setShowFullBody(new Set());
  };

  const SectionHeader=({label,count})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"20px 0 10px"}}>
      <div style={{flex:1,height:1,background:"var(--br)"}}/>
      <div style={{fontSize:11,fontWeight:800,color:"var(--acc)",textTransform:"uppercase",letterSpacing:1.5,whiteSpace:"nowrap"}}>
        {label}{count!==undefined?` (${count})`:''}
      </div>
      <div style={{flex:1,height:1,background:"var(--br)"}}/>
    </div>
  );

  const renderTip=tip=>{
    const isOpen=openTip===tip.id;
    const tipCards=tip.cards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean);
    const partners=isOpen?getPartners(tip):[];
    const badge=getBadge(tip);
    const catMeta=CAT_META[tip.cat]||{};
    const ownedCount=tip.cards.filter(id=>myCards.includes(id)).length;
    const showUnlock=ownedCount===0;
    const unlockCard=showUnlock?tipCards[0]:null;

    return (
      <div key={tip.id} className={"tip-card"+(isOpen?" open":"")}
           onClick={()=>setOpenTip(isOpen?null:tip.id)}>
        {/* Collapsed header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:700,color:"var(--tx3)",background:"var(--s2)",border:"1px solid var(--br)",padding:"1px 7px",borderRadius:99}}>
                {catMeta.icon} {catMeta.label}
              </span>
              {badge==='ready'&&(
                <span style={{fontSize:10,fontWeight:700,color:"var(--grn2)",background:"rgba(16,185,129,.12)",padding:"1px 7px",borderRadius:99}}>✓ Ready for you</span>
              )}
              {badge==='almost'&&(
                <span style={{fontSize:10,fontWeight:700,color:"var(--gld2)",background:"rgba(202,138,4,.12)",padding:"1px 7px",borderRadius:99}}>⬆ Almost There</span>
              )}
              <span style={{fontSize:10,fontWeight:800,color:DIFF_COLOR[tip.difficulty]||"var(--tx3)",textTransform:"uppercase",letterSpacing:.5}}>{tip.difficulty}</span>
              <ValueMeter v={tip.value}/>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",lineHeight:1.4}}>{tip.title}</div>
          </div>
          <span style={{color:"var(--tx3)",fontSize:14,transition:"transform .2s",transform:isOpen?"rotate(90deg)":"none",flexShrink:0,marginTop:2}}>▸</span>
        </div>

        {/* Expanded content */}
        {isOpen&&(
          <div style={{marginTop:12,borderTop:"1px solid var(--br)",paddingTop:12}}>
            {mode==='beginner'?(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.75,marginBottom:8}}>{tip.beginnerTip}</div>
                {!showFullBody.has(tip.id)?(
                  <button
                    onClick={e=>{e.stopPropagation();setShowFullBody(prev=>new Set(prev).add(tip.id));}}
                    style={{fontSize:12,color:"var(--acc)",background:"none",border:"none",cursor:"pointer",padding:0,fontWeight:600,textDecoration:"underline",display:"block"}}>
                    Show full details →
                  </button>
                ):(
                  <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.75,paddingTop:10,borderTop:"1px solid var(--br)"}}>{tip.body}</div>
                )}
              </div>
            ):(
              <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.75,marginBottom:12}}>{tip.body}</div>
            )}
            <div style={{marginBottom:partners.length>0?12:0}}>
              <div style={{fontSize:10,color:"var(--tx4)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>USE WITH</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {tipCards.map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(255,255,255,.05)",borderRadius:8,border:"1px solid var(--br)"}}>
                    <div style={{width:8,height:8,borderRadius:2,background:c.c1}}/>
                    <span style={{fontSize:11,fontWeight:600,color:myCards.includes(c.id)?"var(--tx)":"var(--tx3)"}}>{c.short}</span>
                    {myCards.includes(c.id)&&<span style={{fontSize:10,color:"var(--grn2)"}}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
            {partners.length>0&&(
              <div style={{marginBottom:unlockCard?12:0}}>
                <div style={{fontSize:10,color:"var(--tx4)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>TRANSFER PARTNERS</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {partners.map(p=>(
                    <span key={p} style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:99,background:"rgba(55,48,163,.1)",color:"var(--acc)",border:"1px solid rgba(55,48,163,.2)"}}>{p}</span>
                  ))}
                </div>
              </div>
            )}
            {unlockCard&&(
              <div style={{padding:"10px 12px",background:"rgba(55,48,163,.06)",borderRadius:10,border:"1px dashed rgba(55,48,163,.2)"}}>
                <div style={{fontSize:11,color:"var(--tx2)",marginBottom:8}}>Add <strong style={{color:"var(--tx)"}}>{unlockCard.name}</strong> to unlock this play</div>
                <a href={APPLY_URLS[unlockCard.id]||"#apply-"+unlockCard.id} target="_blank"
                   onClick={e=>e.stopPropagation()}
                   style={{display:"inline-block",fontSize:11,fontWeight:700,color:"var(--acc)",background:"rgba(55,48,163,.1)",padding:"5px 12px",borderRadius:8,border:"1px solid rgba(55,48,163,.25)",textDecoration:"none"}}>
                  Apply for {unlockCard.short} →
                </a>
                <div className="apply-disclose">Affiliate link — we may earn a commission at no cost to you.</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const startHereTips=TIPS_DB.filter(t=>t.startHere);
  const CAT_ORDER=['earning','redeeming','managing','travel'];

  const renderAll=()=>(
    <>
      <SectionHeader label="Start Here"/>
      <div className="tips-list">{startHereTips.map(t=>renderTip(t))}</div>
      {CAT_ORDER.map(cat=>{
        const tips=TIPS_DB.filter(t=>t.cat===cat);
        return (
          <div key={cat}>
            <SectionHeader label={CAT_FULL[cat]} count={tips.length}/>
            <div className="tips-list">{tips.map(t=>renderTip(t))}</div>
          </div>
        );
      })}
    </>
  );

  const renderFiltered=()=>{
    const tips=TIPS_DB.filter(t=>t.cat===filterCat);
    if(!tips.length) return(
      <div style={{textAlign:"center",padding:"20px",color:"var(--tx3)",fontSize:13}}>
        No tips in this category yet. Try "All".
      </div>
    );
    return <div className="tips-list">{tips.map(t=>renderTip(t))}</div>;
  };

  return (
    <div style={{padding:"16px 16px 0"}}>
      {/* Beginner / Advanced toggle */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <div style={{display:"flex",background:"var(--s2)",border:"1px solid var(--br)",borderRadius:99,padding:2,gap:2}}>
          {['beginner','advanced'].map(m=>(
            <button key={m}
              onClick={()=>handleModeToggle(m)}
              style={{
                fontSize:11,fontWeight:700,padding:"4px 14px",borderRadius:99,
                border:"none",cursor:"pointer",textTransform:"capitalize",
                background:mode===m?"var(--acc)":"transparent",
                color:mode===m?"#fff":"var(--tx3)",
                transition:"background .15s,color .15s",
              }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="hscroll" style={{marginBottom:16,gap:6}}>
        {TIP_CAT_LIST.map(c=>(
          <button key={c.id} className={"pill "+(filterCat===c.id?"pill-a":"pill-i")} onClick={()=>setFilterCat(c.id)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {filterCat==='all'?renderAll():renderFiltered()}
    </div>
  );
}
```

- [ ] **Step 3: Open the app in a browser and verify**

Open `index.html` locally (or via Netlify preview). Go to the Tips tab. Check:

1. Beginner/Advanced toggle appears top-right, Beginner active by default
2. Filter pills show: All, Earning More Points, Redeeming Smartly, Managing Your Cards, Travel Strategies
3. In "All" view: "Start Here" section appears first with 8 tips
4. Below Start Here: 4 category sections each with a tip count
5. Tap a tip → it expands showing `beginnerTip` text + "Show full details →" link
6. Tap "Show full details →" → full body text appears inline
7. Switch to Advanced mode → expanded tip shows full `body` only, no beginnerTip
8. Switch back to Beginner → "Show full details →" reappears (showFullBody cleared)
9. Filter to "Earning More Points" → Start Here section hidden, flat list of earning tips only
10. Add a card in Wallet → return to Tips → "✓ Ready for you" badge appears on tips using that card

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: rewrite TipsTab with Beginner/Advanced mode, Start Here section, category grouping, Ready badge"
```

---

## Task 4: Update `CLAUDE.md` localStorage key table

**Files:**
- Modify: `CLAUDE.md` — add `cs_tips_mode` row to the localStorage keys table

**Context:** `CLAUDE.md` contains a table of all localStorage keys used by the app. A new key was added in Task 3. Keep the table accurate.

- [ ] **Step 1: Find the localStorage keys table in `CLAUDE.md`**

Search for `cs_cards` — it's in the localStorage keys section.

- [ ] **Step 2: Add the new key row**

Add this row to the table (after `cs_quiz` or at the end of the table):

```markdown
| `cs_tips_mode` | `string` | Tips tab mode preference (`'beginner'` or `'advanced'`) |
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add cs_tips_mode to localStorage key table"
```

---

## Task 5: Bump service worker and deploy

**Files:**
- Modify: `sw.js` — increment `CACHE_VERSION`

**Context:** Any change to HTML or JS requires bumping the SW cache version so users get the updated files. Current version is `v11`.

- [ ] **Step 1: Increment `CACHE_VERSION` in `sw.js`**

Change:
```js
const CACHE_VERSION = 'v11';
```
To:
```js
const CACHE_VERSION = 'v12';
```

- [ ] **Step 2: Push to GitHub (triggers Netlify deploy)**

```bash
git add sw.js
git commit -m "chore: bump SW cache to v12 for tips tab redesign"
git push
```

Expected output: push succeeds, Netlify auto-deploys within ~30 seconds.

- [ ] **Step 3: Verify production**

Open `https://cardsage.co` in a browser (or incognito for a fresh cache). Navigate to the Tips tab. Confirm the Beginner/Advanced toggle and Start Here section are visible.
