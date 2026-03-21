# Benefits Tab Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Benefits tab with expandable benefit rows, a full benefit data model (reset schedule, enrollment, links), web-researched accurate benefit data for all major cards including protections, and an auto-reset system that unchecks expired benefits automatically.

**Architecture:** Four sequential tasks. Tasks 1–2 are data-layer changes to `cards-data.js`. Task 3 is a UI rewrite of `BenefitsTab` in `index.html`. Task 4 adds the auto-reset system to `App` and a reset badge in `BenefitsTab`. No new files created — all changes are in the two existing source files.

**Tech Stack:** React 18 (CDN, Babel Standalone), no build system, `localStorage` for all persistence, `useLS` hook for localStorage state.

---

## Codebase Context

- `cards-data.js` — all card and benefit data as global constants
- `index.html` — entire React app in one file; `BenefitsTab` is at lines 833–945; `App` is at lines ~2530+
- `useLS(key, default)` — custom hook at line 424 that wraps `useState` + `localStorage`
- Benefit objects live in `card.annual[]` and `card.monthly[]` arrays
- Current benefit fields: `n` (name), `v` (value or null), `d` (description), `cat` (BCAT key)
- `checkedArr` in App = `useLS("cs_checked", [])` — array of checked benefit key strings
- Benefit key format: `{cardId}-{b.n}` for annual, `{cardId}-m-{b.n}` for monthly
- `setCheckedBenefits` in App takes an updateFn: `(prev: Set) => Set`
- BCAT already includes `protection` category

---

## Files Changed

| File | Changes |
|------|---------|
| `cards-data.js` | Add `reset`, `enroll`, `enrollUrl`, `useUrl` fields to all benefit objects; add missing benefits and protections for priority cards |
| `index.html` | Rewrite `BenefitsTab` (expandable rows, reset pill); update `App` (add `checkDates`/`resetBadges` state, auto-reset `useEffect`) |
| `sw.js` | Bump `CACHE_VERSION` |
| `version.json` | Bump version to match |

---

## Task 1: Schema Migration — Add New Fields to All Existing Benefits

**Files:**
- Modify: `cards-data.js` (all card entries)

This is a mechanical transformation. Add four new fields to **every** benefit object in every `annual[]` and `monthly[]` array across all cards.

### New field rules

**`reset`** — string, one of: `"monthly"` | `"quarterly"` | `"semi-annual"` | `"annual"` | `"one-time"`

Assignment rules (apply in this order):
1. If the benefit is in a `monthly[]` array → `reset: "monthly"`
2. If `cat === "protection"` → `reset: "one-time"`
3. If the benefit name/description contains "Jan–Jun" or "Jul–Dec" or is a semi-annual credit → `reset: "semi-annual"` (examples: Hilton Aspire's two resort credit entries, Amex Platinum Saks credit)
4. Everything else in `annual[]` → `reset: "annual"`

**`enroll`** — boolean, default `false`. Set `true` if the benefit's `d` field contains any of: "Must enroll", "enroll!", "activate", "Activate", "Must select", "must select"

**`enrollUrl`** — string, default `""`. Leave empty for now — Task 2 will fill in real URLs for researched cards.

**`useUrl`** — string, default `""`. Leave empty for now — Task 2 will fill in real URLs for researched cards.

### Example transformation

Before:
```js
{n:"$300 Travel Credit",v:300,d:"Auto-applied to ANY travel — Uber, parking, tolls, Airbnb, rental cars. Very broad.",cat:"travel"}
```

After:
```js
{n:"$300 Travel Credit",v:300,d:"Auto-applied to ANY travel — Uber, parking, tolls, Airbnb, rental cars. Very broad.",cat:"travel",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}
```

Before (monthly):
```js
{n:"$10 Dining Credit",v:10,d:"At Grubhub, Cheesecake Factory, Goldbelly, Wine.com, Five Guys. Must enroll!",cat:"dining"}
```

After:
```js
{n:"$10 Dining Credit",v:10,d:"At Grubhub, Cheesecake Factory, Goldbelly, Wine.com, Five Guys. Must enroll!",cat:"dining",reset:"monthly",enroll:true,enrollUrl:"",useUrl:""}
```

### Steps

- [ ] **Step 1:** Read all of `cards-data.js` to understand the full scope of benefit objects across all ~100 cards.

- [ ] **Step 2:** Add the four new fields (`reset`, `enroll`, `enrollUrl`, `useUrl`) to every benefit object in every `annual[]` and `monthly[]` array, following the assignment rules above. Work through the file card by card from top to bottom.

- [ ] **Step 3:** Verify no benefit object is missing the new fields by searching for `cat:"travel"` or `cat:"dining"` entries that lack `reset:` — there should be none.

- [ ] **Step 4:** Commit.
```bash
git add cards-data.js
git commit -m "feat: add reset/enroll/enrollUrl/useUrl schema fields to all benefit objects"
```

---

## Task 2: Web Research + Enrich Priority Card Benefits

**Files:**
- Modify: `cards-data.js`

Search the web for current benefit details for each priority card listed below. For each card:
1. Identify **missing benefits** not currently in the data (especially protections)
2. Add them as new benefit objects with all four new fields populated
3. Update `enrollUrl` and `useUrl` on existing benefits where known
4. Correct any stale benefit values you find

### Priority cards to research (in this order)

Use web searches like: `"[card name] benefits 2025 2026 site:thepointsguy.com OR site:nerdwallet.com"`
Also check the issuer's official benefits page.

| Card ID | Card Name | Known gaps |
|---------|-----------|------------|
| `amex-plat` | Amex Platinum | Possibly missing: $300 Equinox credit, $200 prepaid hotel credit structure, Uber One credit, Resy dining credit |
| `csr` | Chase Sapphire Reserve | Possibly missing: IHG Platinum Elite status, Lyft Pink, $300 dining/entertainment credits if added |
| `amex-gold` | Amex Gold | Verify dining credit merchants are current, check for any new credits |
| `venture-x` | Capital One Venture X | Verify lounge access details, check for any new credits |
| `hilton-aspire` | Hilton Aspire | Verify resort credit structure, flight credit details |
| `marriott-brilliant` | Marriott Brilliant | Verify dining credit structure |
| `csp` | Chase Sapphire Preferred | Verify $50 hotel credit, check for any additions |
| `bilt` | Bilt Mastercard | Check for any new benefits under Cardless |
| `sw-priority` | SW Priority | Verify all benefits current |
| `ihg-premier` | IHG Premier | Verify free night, status benefits |
| `hyatt` | World of Hyatt Card | Verify free night, status details |
| `united-explorer` | United Explorer | Verify benefits |
| `delta-gold` | Delta Gold Amex | Verify flight credit, bag benefit |
| `ink-preferred` | Ink Preferred | Verify any benefits |
| `amex-biz-plat` | Amex Business Platinum | Verify credits, lounge benefits |

### Protection benefits to add for each card

Search for each card's protection benefits and add them to the `annual[]` array with `cat:"protection"`, `reset:"one-time"`, `v:null` (protections have no fixed dollar redemption value), `enroll:false`.

Common protections to check for each card:
- Purchase protection (damage/theft for new purchases)
- Extended warranty
- Return protection
- Trip cancellation/interruption insurance
- Trip delay reimbursement
- Baggage delay insurance
- Primary vs secondary car rental insurance
- Cell phone protection
- Travel accident insurance

Example protection benefit objects:
```js
{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $10,000 per claim.",cat:"protection",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}
{n:"Trip Cancellation Insurance",v:null,d:"Up to $10,000 per person/$20,000 per trip if your trip is cancelled for covered reasons.",cat:"protection",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}
{n:"Primary Car Rental Insurance",v:null,d:"Primary CDW coverage when you decline the rental company's insurance and pay with this card.",cat:"protection",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}
```

### URLs to populate

For each major benefit, add the relevant `enrollUrl` and/or `useUrl`:
- Amex enrollment benefits → `enrollUrl: "https://americanexpress.com/en-us/benefits/"`
- Chase DoorDash credit → `useUrl: "https://doordash.com"`
- Amex Uber Cash → `useUrl: "https://uber.com"`
- Priority Pass → `useUrl: "https://prioritypass.com"`
- Centurion Lounge → `useUrl: "https://www.americanexpress.com/en-us/benefits/centurion-lounge/"`
- etc.

### Steps

- [ ] **Step 1:** Search the web for current benefits for `amex-plat` (Amex Platinum). Update its `annual[]` and `monthly[]` arrays in `cards-data.js` — add missing benefits, add protection benefits, update `enrollUrl`/`useUrl` on existing benefits.

- [ ] **Step 2:** Repeat for `csr` (Chase Sapphire Reserve).

- [ ] **Step 3:** Repeat for `amex-gold`, `venture-x`, `hilton-aspire`, `marriott-brilliant`.

- [ ] **Step 4:** Repeat for `csp`, `bilt`, `sw-priority`, `ihg-premier`.

- [ ] **Step 5:** Repeat for `hyatt`, `united-explorer`, `delta-gold`, `ink-preferred`, `amex-biz-plat`.

- [ ] **Step 6:** Commit.
```bash
git add cards-data.js
git commit -m "feat: research + enrich priority card benefits, add protections"
```

---

## Task 3: BenefitsTab — Expandable Rows UI

**Files:**
- Modify: `index.html` lines 833–945 (BenefitsTab component only)

Replace the entire `BenefitsTab` component with this implementation. The component gains three new optional props (`checkDates`, `setCheckDates`, `resetBadges=new Set()`). App does not pass them until Task 4, which is safe because all three have defaults — the component works correctly in Task 3 before Task 4 wires them up. **Do not skip the call-site update in Task 4.**

Key changes:
- Add `openBen` state for which benefit row is expanded
- Benefit rows are now clickable (tap row to expand/collapse)
- Checkbox click still only toggles the check (stop propagation so it doesn't also toggle expand)
- Collapsed row shows: checkbox, name, category pill, reset period pill (if applicable), value
- Expanded section shows: full description, reset schedule, enrollment badge + link, use link
- Reset badge: if `resetBadges.has(b.key)` show a gold "↺ Refreshed" pill (resetBadges comes from App in Task 4 — for Task 3, accept it as a prop and render it, even though App doesn't pass it yet; default to empty Set)

### Reset label helper

```js
const RESET_LABELS = {
  monthly:       "Monthly",
  quarterly:     "Quarterly",
  "semi-annual": "Semi-annual",
  annual:        "Annual",
};
```

### Complete BenefitsTab replacement

Replace lines 833–945 of `index.html` with:

```jsx
function BenefitsTab({myCards,checkedSet,setCheckedBenefits,checkDates,setCheckDates,resetBadges=new Set()}){
  const [filterCat,setFilterCat]=useState("all");
  const [openBen,setOpenBen]=useState(null);

  const RESET_LABELS={monthly:"Monthly",quarterly:"Quarterly","semi-annual":"Semi-annual",annual:"Annual"};

  const cards=useMemo(()=>myCards.map(id=>CARDS.find(c=>c.id===id)).filter(Boolean),[myCards]);

  const allBenefits=useMemo(()=>{
    const list=[];
    cards.forEach(card=>{
      card.annual.forEach(b=>list.push({...b,cardId:card.id,card,key:card.id+"-"+b.n,isMonthly:false}));
      card.monthly.forEach(b=>list.push({...b,cardId:card.id,card,key:card.id+"-m-"+b.n,isMonthly:true}));
    });
    return list;
  },[cards]);

  const filtered=useMemo(()=>{
    if(filterCat==="all")return allBenefits;
    if(filterCat==="unused")return allBenefits.filter(b=>!checkedSet.has(b.key));
    return allBenefits.filter(b=>b.cat===filterCat);
  },[allBenefits,filterCat,checkedSet]);

  const checkedCount=allBenefits.filter(b=>checkedSet.has(b.key)).length;
  const pct=allBenefits.length?Math.round((checkedCount/allBenefits.length)*100):0;
  const usedValue=allBenefits.filter(b=>checkedSet.has(b.key)&&b.v).reduce((s,b)=>s+(b.isMonthly?(b.v*12):b.v),0);
  const totalValue=allBenefits.filter(b=>b.v).reduce((s,b)=>s+(b.isMonthly?(b.v*12):b.v),0);

  function toggle(key,e){
    e.stopPropagation();
    const willCheck=!checkedSet.has(key);
    setCheckedBenefits(prev=>{
      const n=new Set(prev);
      n.has(key)?n.delete(key):n.add(key);
      return n;
    });
    if(setCheckDates){
      if(willCheck){
        setCheckDates(prev=>({...prev,[key]:new Date().toISOString()}));
      }else{
        setCheckDates(prev=>{const n={...prev};delete n[key];return n;});
      }
    }
  }

  function toggleExpand(key){
    setOpenBen(prev=>prev===key?null:key);
  }

  if(!myCards.length){
    return <div style={{padding:40,textAlign:"center",color:"var(--tx3)"}}>Add cards to see your benefits.</div>;
  }

  return (
    <div style={{padding:"16px 16px 0"}}>
      {/* Progress */}
      <div className="surf fu" style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>Benefits Used This Year</div>
            <div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>${usedValue.toLocaleString()} of ${totalValue.toLocaleString()} in credits redeemed</div>
          </div>
          <div style={{fontSize:26,fontWeight:900,color:pct>60?"var(--grn2)":"var(--gld2)",lineHeight:1}}>{pct}%</div>
        </div>
        <div className="prog-track">
          <div className="prog-fill" style={{width:pct+"%",background:"linear-gradient(90deg,var(--acc),var(--pur))"}}/>
        </div>
      </div>

      {/* Category filter */}
      <div className="hscroll" style={{marginBottom:14,gap:6}}>
        {[{id:"all",label:"All",icon:"📋"},{id:"unused",label:"Unused",icon:"⚡"},
          ...Object.entries(BCAT).map(([id,b])=>({id,label:b.label,icon:b.icon}))
        ].map(f=>(
          <button key={f.id} className={"pill "+(filterCat===f.id?"pill-a":"pill-i")} onClick={()=>setFilterCat(f.id)}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <EmailCapture context="benefits"/>

      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"32px 0",color:"var(--tx3)"}}>No benefits in this category.</div>
      ):(
        <div className="benefits-list">{cards.map(card=>{
          const cardBens=filtered.filter(b=>b.cardId===card.id);
          if(!cardBens.length)return null;
          const usedHere=cardBens.filter(b=>checkedSet.has(b.key)).length;
          return (
            <div key={card.id} style={{marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <CardArt card={card}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>{card.short||card.name}</div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{usedHere}/{cardBens.length} benefits used</div>
                  <div className="prog-track" style={{width:80,marginTop:4}}>
                    <div className="prog-fill" style={{width:(cardBens.length?Math.round(usedHere/cardBens.length*100):0)+"%",background:"var(--grn)"}}/>
                  </div>
                </div>
              </div>
              <div className="surf" style={{padding:"0 14px"}}>
                {cardBens.map((b,i)=>{
                  const done=checkedSet.has(b.key);
                  const isOpen=openBen===b.key;
                  const bc=BCAT[b.cat]||BCAT.statement;
                  const rl=RESET_LABELS[b.reset];
                  const wasReset=resetBadges.has(b.key);
                  return (
                    <div key={b.key} onClick={()=>toggleExpand(b.key)}
                      style={{borderBottom:i<cardBens.length-1?"1px solid var(--br)":"none",padding:"10px 0",cursor:"pointer"}}>
                      {/* Collapsed row */}
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button className={"ben-check"+(done?" done":"")} onClick={e=>toggle(b.key,e)}>
                          {done&&<span style={{color:"#fff",fontSize:13,lineHeight:1}}>✓</span>}
                        </button>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                            <span style={{fontSize:13,fontWeight:600,color:done?"var(--tx3)":"var(--tx)",textDecoration:done?"line-through":"none"}}>{b.n}</span>
                            <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,color:bc.color,background:bc.bg}}>{bc.icon} {bc.label}</span>
                            {rl&&<span style={{padding:"1px 6px",borderRadius:99,fontSize:10,background:"rgba(148,163,184,.15)",color:"var(--tx3)",fontWeight:600}}>{rl}</span>}
                            {wasReset&&<span style={{padding:"1px 7px",borderRadius:99,fontSize:10,background:"rgba(212,168,64,.18)",color:"var(--gld3)",fontWeight:700}}>↺ Refreshed</span>}
                          </div>
                          {b.v&&<div style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Up to ${b.isMonthly?b.v+"/mo ("+b.v*12+"/yr)":b.v}</div>}
                        </div>
                        <span style={{fontSize:12,color:"var(--tx3)",flexShrink:0,transform:isOpen?"rotate(90deg)":"none",transition:"transform .15s"}}>{isOpen?"▾":"▸"}</span>
                      </div>
                      {/* Expanded section */}
                      {isOpen&&(
                        <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--br)"}}>
                          {b.d&&<p style={{fontSize:12,color:"var(--tx2)",margin:"0 0 8px",lineHeight:1.6}}>{b.d}</p>}
                          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                            {b.v&&<span style={{fontSize:11,color:"var(--grn2)",fontWeight:700}}>Value: ${b.isMonthly?b.v+"/mo":b.v}</span>}
                            {rl&&<span style={{fontSize:11,color:"var(--tx3)"}}>↺ Resets: {rl}</span>}
                            {b.enroll&&<span style={{fontSize:11,color:"var(--gld3)",fontWeight:600}}>⚡ Activation required</span>}
                          </div>
                          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                            {b.enrollUrl&&<a href={b.enrollUrl} target="_blank" rel="noopener noreferrer"
                              onClick={e=>e.stopPropagation()}
                              style={{fontSize:12,color:"var(--acc)",fontWeight:600,textDecoration:"none"}}>Activate →</a>}
                            {b.useUrl&&<a href={b.useUrl} target="_blank" rel="noopener noreferrer"
                              onClick={e=>e.stopPropagation()}
                              style={{fontSize:12,color:"var(--acc)",fontWeight:600,textDecoration:"none"}}>Use benefit →</a>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}</div>
      )}
    </div>
  );
}
```

### Steps

- [ ] **Step 1:** Replace the full `BenefitsTab` component (lines 833–945) in `index.html` with the code above. Do not change anything outside those lines.

- [ ] **Step 2:** Verify in the browser: open the app, add a card to wallet, go to Benefits tab, tap a benefit row — it should expand showing description + reset schedule + any links. Tap again to collapse. Tapping the checkbox should check/uncheck WITHOUT toggling the expand state.

- [ ] **Step 3:** Commit.
```bash
git add index.html
git commit -m "feat: expandable benefit rows in BenefitsTab with reset labels and detail view"
```

---

## Task 4: Auto-Reset System

**Files:**
- Modify: `index.html` — `App` component (around lines 2530–2570)
- Modify: `index.html` — `BenefitsTab` call site (where `<BenefitsTab ... />` is rendered)

### New state in App

Add two new pieces of state immediately after the existing `checkedArr` line (line 2533):

```js
// After: const [checkedArr,setCheckedArr]=useLS("cs_checked",[]);
const [checkDates,setCheckDates]=useLS("cs_benefit_check_dates",{});
const [resetBadges,setResetBadges]=useState(new Set());
```

### needsReset helper function

Add this pure function somewhere before `App` (e.g., near the other utility functions at the top of the script):

```js
function needsReset(reset,checkDate,now){
  const cy=now.getFullYear(),cm=now.getMonth();
  const ly=checkDate.getFullYear(),lm=checkDate.getMonth();
  switch(reset){
    case'monthly':    return cy>ly||(cy===ly&&cm>lm);
    case'quarterly':  {const q=m=>Math.floor(m/3);return cy>ly||(cy===ly&&q(cm)>q(lm));}
    case'semi-annual':{const h=m=>m<6?0:1;return cy>ly||(cy===ly&&h(cm)>h(lm));}
    case'annual':     return cy>ly;
    default:          return false;
  }
}
```

### Auto-reset useEffect in App

Add this `useEffect` inside `App`, after the `checkedSet` useMemo (around line 2563). It runs once on mount, checks all currently-checked benefits against their reset schedules, and auto-unchecks any that have expired.

```js
useEffect(()=>{
  if(!checkedArr.length) return;
  const now=new Date();
  const newChecked=new Set(checkedArr);
  const newDates={...checkDates};
  const badgeKeys=new Set();

  // Build flat benefit map for wallet cards
  const benefitMap={};
  myCards.forEach(cardId=>{
    const card=CARDS.find(c=>c.id===cardId);
    if(!card) return;
    card.annual.forEach(b=>{benefitMap[cardId+"-"+b.n]={...b,isMonthly:false};});
    card.monthly.forEach(b=>{benefitMap[cardId+"-m-"+b.n]={...b,isMonthly:true};});
  });

  checkedArr.forEach(key=>{
    const b=benefitMap[key];
    const dateStr=checkDates[key];
    if(!b||!dateStr||!b.reset) return;
    if(needsReset(b.reset,new Date(dateStr),now)){
      newChecked.delete(key);
      delete newDates[key];
      badgeKeys.add(key);
    }
  });

  if(badgeKeys.size>0){
    setCheckedArr([...newChecked]);
    setCheckDates(newDates);
    setResetBadges(badgeKeys);
  }
},[]); // intentionally run once on mount
```

**Note:** The `[]` dependency array is intentional — this runs once on mount using the initial values from localStorage. The eslint warning about missing deps can be ignored; stale closures are not a problem here because `useLS` initializes synchronously from localStorage.

### Update BenefitsTab call site

Find the line in `App`'s render that calls `<BenefitsTab ... />` (around line 2667) and add the new props:

```jsx
// Before:
{tab==="benefits"&&<BenefitsTab myCards={myCards} checkedSet={checkedSet} setCheckedBenefits={setCheckedBenefits}/>}

// After:
{tab==="benefits"&&<BenefitsTab myCards={myCards} checkedSet={checkedSet} setCheckedBenefits={setCheckedBenefits} checkDates={checkDates} setCheckDates={setCheckDates} resetBadges={resetBadges}/>}
```

### New localStorage key

Add `cs_benefit_check_dates` to the localStorage key table in `CLAUDE.md`:

```
| `cs_benefit_check_dates` | `object` | Map of benefit key → ISO date string when it was last checked |
```

### Steps

- [ ] **Step 1:** Add `needsReset` function to `index.html` before the `App` component.

- [ ] **Step 2:** Add `checkDates`, `setCheckDates`, and `resetBadges` state to `App`.

- [ ] **Step 3:** Add the auto-reset `useEffect` to `App` after the `checkedSet` useMemo.

- [ ] **Step 4:** Update the `<BenefitsTab ... />` call site to pass the three new props.

- [ ] **Step 5:** Update `CLAUDE.md` localStorage key table.

- [ ] **Step 6:** Verify in browser: check a benefit, then in DevTools manually change `cs_benefit_check_dates` to set that benefit's date to last month (e.g., `"2026-02-01T00:00:00.000Z"`), reload the page — the benefit should be automatically unchecked and show a gold "↺ Refreshed" badge.

- [ ] **Step 7:** Commit.
```bash
git add index.html CLAUDE.md
git commit -m "feat: auto-reset system — uncheck expired benefits on load, show Refreshed badge"
```

---

## Task 5: Bump Version + Deploy

**Files:**
- Modify: `sw.js` — increment `CACHE_VERSION`
- Modify: `version.json` — set `"version"` to match

- [ ] **Step 1:** Increment `CACHE_VERSION` in `sw.js` (currently `v16` → `v17`).

- [ ] **Step 2:** Update `version.json` to `{"version":"v17"}`.

- [ ] **Step 3:** Commit and push.
```bash
git add sw.js version.json
git commit -m "chore: bump CACHE_VERSION to v17 for benefits tab overhaul"
git push
```
