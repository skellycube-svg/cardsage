/* BENEFIT CATEGORIES */
// These are the benefit categories used to organize and color-code each card perk.
// Each category (like travel, dining, entertainment) has a label, icon, color, and background color
// so the app can display benefits in a visually grouped and recognizable way.
const BCAT={
  travel:{label:"Travel",icon:"✈️",color:"#38bdf8",bg:"rgba(56,189,248,.12)"},
  dining:{label:"Dining & Food",icon:"🍽️",color:"#f97316",bg:"rgba(249,115,22,.12)"},
  entertainment:{label:"Entertainment",icon:"🎬",color:"#8b5cf6",bg:"rgba(139,92,246,.12)"},
  status:{label:"Status & Lounge",icon:"🌟",color:"#f59e0b",bg:"rgba(245,158,11,.12)"},
  statement:{label:"Statement Credits",icon:"💳",color:"#10b981",bg:"rgba(16,185,129,.12)"},
  awards:{label:"Annual Awards",icon:"🎁",color:"#ec4899",bg:"rgba(236,72,153,.12)"},
  protection:{label:"Protections",icon:"🛡️",color:"#6366f1",bg:"rgba(99,102,241,.12)"},
};

/* CARDS */
// This is the master list of every credit card tracked in FeeWorth.
// Each card object contains: id (unique short code), name (full official name), short (display name),
// issuer (the bank), isBiz (true if it is a business card), fee (annual fee in dollars),
// network (Visa/Mastercard/Amex/Discover), cur (the points currency it earns),
// c1 and c2 (two colors used to draw the card art as a gradient),
// partners (airline and hotel transfer partners), annual (list of yearly benefits),
// monthly (list of monthly benefits), strat (which strategies this card belongs to),
// signup (the welcome bonus offer), and earn (reward rates for each spending category).

/* ── HIDDEN VALUE DATA ─────────────────────────────────────────────────────── */

const HIDDEN_VALUE_CATEGORIES={
  transferPartners:{label:"Transfer Partner Access",icon:"🔄",description:"Points can be transferred to airline/hotel partners at ratios that often deliver 2-5x the value of cash back redemptions."},
  insurance:{label:"Built-in Insurance",icon:"🛡️",description:"Coverage you'd otherwise pay for separately — rental car, trip delay, lost luggage, purchase protection, cell phone."},
  eliteStatus:{label:"Hotel/Airline Elite Status",icon:"⭐",description:"Complimentary elite status means room upgrades, late checkout, bonus points, and priority service."},
  loungeAccess:{label:"Airport Lounge Access",icon:"✈️",description:"Free food, drinks, WiFi, and quiet space at the airport. A single lounge visit is worth $30-50."},
  concierge:{label:"Concierge & Experiences",icon:"🎩",description:"24/7 concierge service, exclusive event access, and restaurant reservations at hard-to-book spots."},
  purchaseProtection:{label:"Purchase & Return Protection",icon:"🔒",description:"Items bought with the card are protected against damage, theft, and sometimes price drops."},
  creditScore:{label:"Credit Profile Benefits",icon:"📊",description:"Keeping old cards open maintains credit history length and available credit, both boosting your score."}
};

const TRANSFER_PARTNER_DATA={
  "Chase Ultimate Rewards":{cashValue:1.0,portalValue:1.25,transferValue:2.05,bestCase:5.0,topPartners:[
    {name:"World of Hyatt",ratio:"1:1",cpp:"2-3cpp",sweetSpot:"Cat 1-4 in expensive cities",note:"Award chart inflating May 2026 — top nights rising up to 67%. Book before May for best value."},
    {name:"United",ratio:"1:1",cpp:"1.5-2cpp",sweetSpot:"Saver awards long-haul"},
    {name:"Southwest",ratio:"1:1",cpp:"1.3-1.5cpp",sweetSpot:"Companion Pass stacking"},
    {name:"Virgin Atlantic",ratio:"1:1",cpp:"2-4cpp",sweetSpot:"ANA first class via Virgin"},
    {name:"Air France/KLM",ratio:"1:1",cpp:"1.5-2.5cpp",sweetSpot:"Promo awards to Europe"},
    {name:"British Airways",ratio:"1:1",cpp:"1.5-3cpp",sweetSpot:"Short-haul domestic, Qatar Qsuite"},
    {name:"IHG",ratio:"1:1",cpp:"0.5-0.7cpp",sweetSpot:"4th night free"},
    {name:"Marriott",ratio:"1:1",cpp:"0.7-1cpp",sweetSpot:"5th night free, off-peak"},
    {name:"Wyndham Rewards",ratio:"1:1",cpp:"~1.1cpp",sweetSpot:"Flat-rate redemptions at higher-end Wyndham brands"}
  ]},
  "Amex Membership Rewards":{cashValue:0.6,portalValue:1.0,transferValue:2.2,bestCase:6.0,topPartners:[
    {name:"ANA",ratio:"1:1",cpp:"3-6cpp",sweetSpot:"RT first/biz to Japan"},
    {name:"Virgin Atlantic",ratio:"1:1",cpp:"2-4cpp",sweetSpot:"ANA first, Delta domestic"},
    {name:"Air France/KLM",ratio:"1:1",cpp:"1.5-2.5cpp",sweetSpot:"Promo Europe"},
    {name:"Singapore KrisFlyer",ratio:"1:1",cpp:"2-3cpp",sweetSpot:"Suites, partner awards"},
    {name:"British Airways",ratio:"1:1",cpp:"1.5-3cpp",sweetSpot:"Short-haul, Qatar Qsuite"},
    {name:"Hilton",ratio:"1:2",cpp:"1.2-1.4cpp",sweetSpot:"Aspirational, 5th night free"},
    {name:"Marriott",ratio:"1:1",cpp:"0.7-1cpp",sweetSpot:"5th night free"}
  ]},
  "Capital One Miles":{cashValue:1.0,portalValue:1.0,transferValue:1.85,bestCase:5.0,topPartners:[
    {name:"Turkish Miles&Smiles",ratio:"1:1",cpp:"3-6.6cpp",sweetSpot:"United domestic 7,500mi, Star Alliance biz"},
    {name:"Air Canada Aeroplan",ratio:"1:1",cpp:"1.5-2.5cpp",sweetSpot:"Mixed-cabin, stopover rules"},
    {name:"British Airways",ratio:"1:1",cpp:"1.5-3cpp",sweetSpot:"Short-haul, Qatar Qsuite"},
    {name:"Avianca LifeMiles",ratio:"1:1",cpp:"1.5-2cpp",sweetSpot:"Star Alliance awards"},
    {name:"Wyndham",ratio:"1:1",cpp:"1.1cpp",sweetSpot:"Flat-rate higher-end brands"},
    {name:"Japan Airlines (JAL)",ratio:"1:1",cpp:"1.5-2cpp",sweetSpot:"JAL business class awards to Asia"}
  ]},
  "Citi ThankYou Points":{cashValue:1.0,portalValue:1.0,transferValue:1.9,bestCase:6.6,topPartners:[
    {name:"Turkish",ratio:"1:1",cpp:"3-6.6cpp",sweetSpot:"United domestic 7,500mi"},
    {name:"Air France/KLM",ratio:"1:1",cpp:"1.5-2.5cpp",sweetSpot:"Promo Europe"},
    {name:"Avianca",ratio:"1:1",cpp:"1.5-2cpp",sweetSpot:"Star Alliance, no fuel surcharges"},
    {name:"Virgin Atlantic",ratio:"1:1",cpp:"2-4cpp",sweetSpot:"ANA first, Delta"},
    {name:"Choice Privileges",ratio:"1:1.5 (was 1:2, devaluing Apr 19 2026)",cpp:"0.8-1.3cpp",sweetSpot:"Tokyo Comfort Hotels — value drops Apr 2026"},
    {name:"Wyndham",ratio:"1:1",cpp:"1.1cpp",sweetSpot:"Flat-rate"}
  ]},
  "Bilt Points":{cashValue:1.0,portalValue:1.25,transferValue:2.0,bestCase:5.0,topPartners:[
    {name:"World of Hyatt",ratio:"1:1",cpp:"2-3cpp",sweetSpot:"Cat 1-4 expensive cities"},
    {name:"Turkish",ratio:"1:1",cpp:"3-6.6cpp",sweetSpot:"United domestic 7,500mi"},
    {name:"AA AAdvantage",ratio:"1:1",cpp:"1.5-2cpp",sweetSpot:"Web specials, off-peak"},
    {name:"Air France/KLM",ratio:"1:1",cpp:"1.5-2.5cpp",sweetSpot:"Promo awards"},
    {name:"Virgin Atlantic",ratio:"1:1",cpp:"2-4cpp",sweetSpot:"ANA first"},
    {name:"IHG",ratio:"1:1",cpp:"0.5-0.7cpp",sweetSpot:"4th night free"}
  ]}
};

const INSURANCE_VALUES={
  primaryRentalCar:{label:"Primary Rental Car Insurance",description:"Primary CDW coverage — pays first, before your personal auto insurance. Saves you $15-30/day on rental company insurance.",estimatedAnnualValue:"$150-500/yr",valueNote:"Primary coverage is significantly more valuable than secondary since you don't need to file through your own insurer first."},
  secondaryRentalCar:{label:"Secondary Rental Car Insurance",description:"Secondary CDW coverage — pays after your personal auto insurance. Still saves you from rental company insurance charges.",estimatedAnnualValue:"$100-300/yr",valueNote:"Less valuable than primary since it only kicks in after your own policy, but still saves on rental company CDW."},
  tripDelay:{label:"Trip Delay Reimbursement",description:"Covers meals, lodging, and essentials when your flight is delayed. Trigger times range from 3 hours (Citi, best) to 12 hours.",estimatedAnnualValue:"$0-500/yr",valueNote:"One significant delay can return an entire year's annual fee. Citi's 3-hour trigger is the best in the industry."},
  tripCancellation:{label:"Trip Cancellation/Interruption",description:"Reimburses non-refundable travel expenses when trips are canceled for covered reasons like illness, severe weather, or jury duty.",estimatedAnnualValue:"$0-5,000/yr",valueNote:"A single canceled international trip can easily recoup years of annual fees."},
  lostLuggage:{label:"Lost Luggage Reimbursement",description:"Covers the value of lost, damaged, or stolen baggage and contents beyond airline liability limits.",estimatedAnnualValue:"$0-500/yr",valueNote:"Airlines' own liability maxes out quickly. This coverage fills the gap."},
  cellPhoneProtection:{label:"Cell Phone Protection",description:"Covers damage or theft of your cell phone (up to $800/claim) when you pay your monthly phone bill with the card. $25-50 deductible.",estimatedAnnualValue:"$0-800/yr",valueNote:"One cracked screen claim can save $200-400. Replaces AppleCare or carrier insurance."},
  purchaseProtection:{label:"Purchase Protection",description:"Covers eligible new purchases against damage or theft for 90-120 days from the purchase date.",estimatedAnnualValue:"$0-1,000/yr",valueNote:"Covers items your homeowner's/renter's insurance might not, often with no deductible."},
  extendedWarranty:{label:"Extended Warranty Protection",description:"Extends manufacturer warranties by 1-2 additional years. Stop buying extended warranties at checkout.",estimatedAnnualValue:"$50-300/yr",valueNote:"Every time you decline an extended warranty at checkout, this benefit has you covered for free."},
  returnProtection:{label:"Return Protection",description:"Allows you to return items the merchant won't take back, typically within 90 days. Amex offers the best version.",estimatedAnnualValue:"$0-500/yr",valueNote:"Amex will refund up to $300 per item when a merchant won't accept a return. Most valuable for online shopping."}
};

const HIDDEN_VALUES={
  "Chase Sapphire Reserve":{
    transferEcosystem:"Chase Ultimate Rewards",
    intangibleNote:"The Reserve's real value is almost never captured by a benefits checklist. Primary rental car insurance alone saves $15-30/day on every rental. Hyatt transfers at 2-3cpp turn 25,000 points into a $500-750 hotel stay. Priority Pass visits are worth $30-50 each. Trip delay coverage kicks in after 6 hours. With 14 transfer partners, active travelers regularly extract $1,500-2,000+ in annual value — well beyond the stated credits.",
    hiddenPerks:[
      {category:"insurance",perk:"Primary Rental Car Insurance",estimatedValue:"$150-500/yr",details:"Primary CDW coverage up to $75,000. Pays first — skip the rental counter insurance."},
      {category:"insurance",perk:"Trip Delay Reimbursement",estimatedValue:"$0-500/yr",details:"$500 per traveler after 6-hour delay for meals, lodging, and essentials."},
      {category:"insurance",perk:"Trip Cancellation/Interruption",estimatedValue:"$0-5,000/yr",details:"Up to $10,000 per person for non-refundable travel expenses."},
      {category:"insurance",perk:"Lost Luggage Reimbursement",estimatedValue:"$0-500/yr",details:"Up to $3,000 per traveler for lost, damaged, or stolen baggage."},
      {category:"purchaseProtection",perk:"Purchase Protection (120 days)",estimatedValue:"$0-500/yr",details:"Covers new purchases against damage or theft for 120 days, up to $10,000/claim."},
      {category:"purchaseProtection",perk:"Extended Warranty +1 Year",estimatedValue:"$50-200/yr",details:"Adds 1 year to manufacturer warranties of 3 years or less. Stop buying extended warranties."},
      {category:"transferPartners",perk:"14 Transfer Partners (2-5x Value)",estimatedValue:"$500-2,000+/yr",details:"Hyatt at 2-3cpp, Virgin Atlantic for ANA first at 5cpp, United saver awards. Transforms cashback into premium travel."},
      {category:"loungeAccess",perk:"Priority Pass + Chase Sapphire Lounges",estimatedValue:"$120-500/yr",details:"1,500+ lounges worldwide. Each visit worth $30-50 in food, drinks, and WiFi."},
      {category:"concierge",perk:"Visa Infinite Concierge",estimatedValue:"$0-200/yr",details:"24/7 concierge for restaurant reservations, travel planning, and event tickets."},
      {category:"creditScore",perk:"High Credit Limit",estimatedValue:"Significant",details:"Premium cards typically carry high limits, lowering overall utilization ratio."}
    ]
  },
  "Chase Sapphire Preferred":{
    transferEcosystem:"Chase Ultimate Rewards",
    intangibleNote:"The Preferred is the cheapest way ($95/yr) to unlock Chase's 14 transfer partners. Without a Sapphire or Ink Preferred card, all your Freedom/Freedom Unlimited points are stuck at 1 cent each. With the CSP, 100,000 Ultimate Rewards points transform from $1,000 in cash back to $2,000-3,000 in travel value through Hyatt, United, and other partners. This single unlock often justifies the fee by itself.",
    hiddenPerks:[
      {category:"transferPartners",perk:"Unlocks Transfers for ALL Chase UR Points",estimatedValue:"$500-2,000+/yr",details:"Every Freedom, Freedom Unlimited, and Ink point in your household becomes transferable. This is the #1 reason to keep this card."},
      {category:"insurance",perk:"Primary Rental Car Insurance",estimatedValue:"$150-500/yr",details:"Primary CDW up to $60,000 — same primary coverage as the Reserve."},
      {category:"insurance",perk:"Trip Delay Reimbursement",estimatedValue:"$0-500/yr",details:"$500 per traveler after 12-hour delay."},
      {category:"insurance",perk:"Trip Cancellation/Interruption",estimatedValue:"$0-5,000/yr",details:"Up to $10,000 per person for non-refundable travel expenses."},
      {category:"purchaseProtection",perk:"Purchase Protection (120 days)",estimatedValue:"$0-500/yr",details:"Covers new purchases against damage or theft for 120 days, up to $500/claim."},
      {category:"purchaseProtection",perk:"Extended Warranty +1 Year",estimatedValue:"$50-200/yr",details:"Adds 1 year to manufacturer warranties of 3 years or less."},
      {category:"creditScore",perk:"Chase Relationship Keeper",estimatedValue:"Significant",details:"Maintains your Chase credit relationship and keeps the door open for future premium card upgrades."}
    ]
  },
  "The Platinum Card® from American Express":{
    transferEcosystem:"Amex Membership Rewards",
    intangibleNote:"The Platinum's stated credits only tell half the story. ANA first class round-trip to Tokyo costs 150,000 MR points for a ticket worth $20,000+ — that's 13+ cents per point. Centurion Lounges, Priority Pass, and Delta Sky Club access can save $300-1,000/year for frequent flyers. Hilton Gold ($200-800 value) and Marriott Gold ($100-500) come free. Fine Hotels & Resorts adds $550+/booking in value. The 20+ transfer partners make this the most versatile premium ecosystem.",
    hiddenPerks:[
      {category:"transferPartners",perk:"20+ Transfer Partners (2-6x Value)",estimatedValue:"$500-3,000+/yr",details:"ANA first at 6cpp, Virgin Atlantic for Delta/ANA, Singapore Suites, Air France promos. The deepest transfer partner network."},
      {category:"loungeAccess",perk:"Centurion + Priority Pass + Delta Sky Clubs",estimatedValue:"$300-1,000/yr",details:"Centurion Lounges (premium food/drink), 1,500+ Priority Pass lounges, Delta Sky Clubs when flying Delta. Starting July 8, 2026: guests must be on same flight as cardholder, access limited to 5 hours before departure. Guests $50/adult, $30/child unless $75k+ annual spend."},
      {category:"eliteStatus",perk:"Hilton Gold Elite",estimatedValue:"$200-800/yr",details:"Room upgrades, daily F&B credit at select properties, 5th night free on rewards, 80% bonus points."},
      {category:"eliteStatus",perk:"Marriott Gold Elite",estimatedValue:"$100-500/yr",details:"Room upgrades when available, late checkout, 25% bonus points, enhanced WiFi."},
      {category:"concierge",perk:"Concierge + By Invitation Only Events",estimatedValue:"$0-500/yr",details:"24/7 Platinum Concierge, exclusive event access, Fine Hotels & Resorts adding $550+/booking."},
      {category:"insurance",perk:"Secondary Rental Car Insurance",estimatedValue:"$100-300/yr",details:"Secondary CDW coverage worldwide."},
      {category:"insurance",perk:"Trip/Cancel/Baggage Insurance Suite",estimatedValue:"$0-2,000/yr",details:"Trip delay, trip cancellation, baggage delay, and lost luggage coverage."},
      {category:"purchaseProtection",perk:"Purchase + Return Protection",estimatedValue:"$0-1,000/yr",details:"Purchase protection 90 days + Amex return protection up to $300/item."},
      {category:"purchaseProtection",perk:"Extended Warranty +2 Years",estimatedValue:"$100-300/yr",details:"Amex extends warranties by up to 2 additional years — best in the industry."},
      {category:"creditScore",perk:"MR Ecosystem Preservation",estimatedValue:"Critical",details:"If this is your only MR-earning card, canceling strands all your Membership Rewards points. Downgrade to Green or keep BBP."}
    ]
  },
  "American Express® Gold Card":{
    transferEcosystem:"Amex Membership Rewards",
    intangibleNote:"The Gold Card's 4x on dining and groceries can easily earn 50,000+ MR points per year. At cash value, that's $500 — but transferred to ANA or Virgin Atlantic, those same points become $1,100-3,000 in premium flights. That $600+ gap is hidden value the ROI bar can't capture. Same 20+ transfer partners as the Platinum at a much lower fee.",
    hiddenPerks:[
      {category:"transferPartners",perk:"20+ Transfer Partners (2-6x Value)",estimatedValue:"$600-2,000+/yr",details:"Same partner list as Platinum. 50k MR from dining/groceries = $500 cash or $1,100+ via transfers."},
      {category:"purchaseProtection",perk:"Purchase Protection",estimatedValue:"$0-1,000/yr",details:"Covers purchases against damage or theft for 90 days."},
      {category:"purchaseProtection",perk:"Return Protection",estimatedValue:"$0-500/yr",details:"Amex return protection up to $300/item when merchant won't accept returns."},
      {category:"purchaseProtection",perk:"Extended Warranty +1 Year",estimatedValue:"$50-200/yr",details:"Adds 1 year to manufacturer warranties."},
      {category:"concierge",perk:"Global Dining Access by Resy",estimatedValue:"$0-200/yr",details:"Priority reservations and exclusive dining experiences at top restaurants."},
      {category:"creditScore",perk:"MR Ecosystem Preservation",estimatedValue:"Critical",details:"Keeps your Membership Rewards points transferable. Without an MR card, points may be stranded."}
    ]
  },
  "Capital One Venture X Rewards Credit Card":{
    transferEcosystem:"Capital One Miles",
    intangibleNote:"After the $300 travel credit and 10,000 anniversary miles ($100 value), the Venture X effectively costs $0/year. Everything beyond that is pure upside: Turkish Miles&Smiles transfers turn 7,500 miles into $300-500 United flights (4-6.6cpp). Capital One's own lounges in DFW, DEN, and IAD rival Centurion quality. No ecosystem lock-in means your miles work across 15+ partners.",
    hiddenPerks:[
      {category:"transferPartners",perk:"15+ Transfer Partners (2-5x Value)",estimatedValue:"$500-2,000+/yr",details:"Turkish at 3-6.6cpp, Air Canada stopover rules, British Airways short-haul. No lock-in to one alliance."},
      {category:"loungeAccess",perk:"Capital One + Priority Pass + Plaza Premium",estimatedValue:"$200-600/yr",details:"Capital One's own premium lounges + 1,300+ Priority Pass + Plaza Premium network."},
      {category:"insurance",perk:"Primary Rental Car Insurance",estimatedValue:"$150-500/yr",details:"Primary CDW coverage. Same primary status as Chase Sapphire Reserve."},
      {category:"insurance",perk:"Trip Delay/Cancel/Baggage Suite",estimatedValue:"$0-1,500/yr",details:"Trip delay, trip cancellation, and lost baggage coverage."},
      {category:"purchaseProtection",perk:"Extended Warranty +1 Year",estimatedValue:"$50-200/yr",details:"Adds 1 year to manufacturer warranties."},
      {category:"concierge",perk:"Visa Infinite Concierge",estimatedValue:"$0-200/yr",details:"24/7 concierge for travel, dining, and event planning."}
    ]
  },
  "Citi Strata Premier℠ Card":{
    transferEcosystem:"Citi ThankYou Points",
    intangibleNote:"The Strata Premier unlocks Citi's transfer partners for all your ThankYou points. Turkish Miles&Smiles at 1:1 means 7,500 points gets you a $300-500 United domestic flight — over 4cpp. Choice Privileges at 1:2 ratio unlocks Tokyo Comfort Hotels at just 6,000 points/night. The 3-hour trip delay trigger is the best in the industry — most cards require 6-12 hours.",
    hiddenPerks:[
      {category:"transferPartners",perk:"Unlocks Transfers for All TY Points",estimatedValue:"$500-2,000+/yr",details:"Turkish 7,500mi for United domestics, Choice for Tokyo hotels, Air France promos. This is why you keep this card."},
      {category:"insurance",perk:"Trip Delay — 3hr Trigger (Best in Industry)",estimatedValue:"$0-500/yr",details:"$500 reimbursement kicks in after just 3 hours. Most competitors require 6-12 hours."},
      {category:"insurance",perk:"Trip Cancellation/Interruption",estimatedValue:"$0-2,500/yr",details:"Covers non-refundable travel expenses for covered cancellation reasons."},
      {category:"insurance",perk:"Rental Car Insurance (Worldwide)",estimatedValue:"$100-300/yr",details:"CDW coverage on rental cars worldwide."},
      {category:"purchaseProtection",perk:"Purchase Protection + Warranty",estimatedValue:"$50-500/yr",details:"Damage/theft protection plus extended warranty coverage."},
      {category:"creditScore",perk:"TY Transfer Access Preservation",estimatedValue:"Critical",details:"If this is your only Premier/Prestige card, canceling locks your ThankYou points to cash-back only."}
    ]
  },
  "Marriott Bonvoy Boundless®":{
    transferEcosystem:null,
    intangibleNote:"The Boundless gives you automatic Gold Elite status — worth $100-500/year in room upgrades, late checkouts, and 25% bonus points. The 15 elite night credits each year put you nearly halfway to Platinum (50 nights). If you stay 35 more nights, Platinum unlocks suite upgrades, lounge access, and breakfast.",
    hiddenPerks:[
      {category:"eliteStatus",perk:"Marriott Gold Elite Status",estimatedValue:"$100-500/yr",details:"25% bonus points, room upgrades when available, 2pm late checkout, enhanced WiFi."},
      {category:"eliteStatus",perk:"15 Elite Night Credits Toward Platinum",estimatedValue:"$0-500/yr",details:"Start each year 15 nights closer to Platinum (50 nights). Platinum = suite upgrades, lounge, breakfast."},
      {category:"purchaseProtection",perk:"Purchase Protection",estimatedValue:"$50-300/yr",details:"Visa Signature purchase protection on eligible items."}
    ]
  },
  "Hilton Honors American Express Aspire Card":{
    transferEcosystem:null,
    intangibleNote:"Diamond status is the real prize here. Suite upgrades, daily food & beverage credits of $15-25/night at most properties, executive lounge access, and 100% bonus points add up to $500-2,000/year for regular Hilton guests. The 5th night free on ALL award stays is a flat 20% discount on points redemptions. Priority Pass and Amex's insurance suite round it out.",
    hiddenPerks:[
      {category:"eliteStatus",perk:"Hilton Diamond Status",estimatedValue:"$500-2,000/yr",details:"Suite upgrades, daily F&B credit $15-25/night, executive lounge access, 100% bonus points. The most valuable hotel status you can get from a credit card."},
      {category:"eliteStatus",perk:"5th Night Free on ALL Award Stays",estimatedValue:"$100-500/yr",details:"Book 5 nights on points, get the 5th free. Flat 20% discount on every award stay."},
      {category:"loungeAccess",perk:"Priority Pass Select",estimatedValue:"$120-500/yr",details:"1,300+ airport lounges worldwide. Each visit worth $30-50."},
      {category:"insurance",perk:"Secondary Rental Car + Trip Delay",estimatedValue:"$0-500/yr",details:"Secondary CDW, trip delay, and baggage coverage."},
      {category:"purchaseProtection",perk:"Purchase + Return Protection",estimatedValue:"$0-500/yr",details:"Amex purchase protection and return protection up to $300/item."}
    ]
  },
  "World of Hyatt Card":{
    transferEcosystem:null,
    intangibleNote:"Hyatt points are the most valuable hotel currency at 2-3 cents per point, though a May 2026 award chart restructuring is expanding tiers and raising top-night costs up to 67%. Cat 1-4 off-peak stays and free night certificates retain strong value. This card gives you Discoverist status plus 2 qualifying night credits toward Globalist — the holy grail of hotel status. If you achieve Globalist (60 nights), you unlock suite upgrades, club lounge access, and free breakfast worth $2,000-5,000/year.",
    hiddenPerks:[
      {category:"eliteStatus",perk:"Discoverist Status + 2 Qualifying Nights",estimatedValue:"$50-200/yr",details:"Discoverist gets you preferred rooms, late checkout, and bottled water. The 2 qualifying nights count toward Globalist."},
      {category:"eliteStatus",perk:"Path to Globalist (If Achieved)",estimatedValue:"$2,000-5,000/yr if achieved",details:"Globalist = confirmed suite upgrades, club lounge, free breakfast, guest of honor. The most valuable hotel status in the industry."},
      {category:"purchaseProtection",perk:"Purchase Protection",estimatedValue:"$50-300/yr",details:"Visa Signature purchase protection on eligible items."}
    ]
  },
  "Bilt Mastercard®":{
    transferEcosystem:"Bilt Points",
    intangibleNote:"Bilt cards earn points on rent and mortgage with no transaction fee — unique in the industry. The 2.0 lineup (Blue/Obsidian/Palladium) uses a two-mode housing system: either earn tiered points based on your non-housing spend ratio (up to 1.25x), or earn 4% Bilt Cash on everyday purchases and convert $30 Bilt Cash into 1,000 housing points. Rent Day (1st of every month) offers boosted earn rates. Transfer to Hyatt at 2-3cpp or Turkish at 3-6.6cpp to turn housing payments into premium travel.",
    hiddenPerks:[
      {category:"transferPartners",perk:"Premium Transfer Partners (2-5x Value)",estimatedValue:"$500-2,000+/yr",details:"Hyatt 1:1 (2-3cpp), Turkish 1:1 (3-6.6cpp), AA, Virgin Atlantic. Rent payments become premium travel."},
      {category:"insurance",perk:"Cell Phone Protection ($800/claim)",estimatedValue:"$0-800/yr",details:"Covers damage or theft when you pay your phone bill with Bilt. $25 deductible. Replaces AppleCare."},
      {category:"insurance",perk:"Trip Delay + Purchase + Rental Car",estimatedValue:"$0-500/yr",details:"Trip delay reimbursement, purchase protection, and rental car coverage."},
      {category:"purchaseProtection",perk:"Mastercard World Elite Protections",estimatedValue:"$0-500/yr",details:"Extended warranty, price protection, and ID theft protection."},
      {category:"creditScore",perk:"Rent Reported to Credit Bureaus",estimatedValue:"Significant",details:"Bilt reports rent payments to Equifax, Experian, and TransUnion. Builds credit from your largest monthly expense."}
    ]
  }
};

const UNIVERSAL_HIDDEN_VALUES=[
  {title:"Credit History Length",description:"Canceling your oldest card shortens your average credit age, which may drop your score 10-30 points. If you're on the fence, downgrading to a no-fee version keeps the account open.",applies:"All cards"},
  {title:"Credit Utilization Impact",description:"Closing a card reduces your total available credit, which raises your utilization ratio. A $20,000 limit represents significant headroom that keeps your score healthy.",applies:"All cards"},
  {title:"Transfer Partner Ecosystem Lock-in",description:"If this is your only card in the UR/MR/TY/Bilt ecosystem, canceling may strand or devalue ALL your points. They might lose transfer partner access or become cash-back only.",applies:"Transferable points ecosystem cards"},
  {title:"Insurance You Didn't Know You Had",description:"Most premium cards include trip delay, rental car, purchase protection, and extended warranty coverage. A single claim can return an entire year's worth of annual fees.",applies:"Most cards with annual fees"},
  {title:"Extended Warranty Savings",description:"Stop buying extended warranties at checkout — your card likely extends manufacturer warranties by 1-2 years automatically. This saves $50-300/year for frequent shoppers.",applies:"Most Visa Signature, World Elite Mastercard, and Amex cards"}
];

const CARDS=[
// ── CHASE ──────────────────────────────────────────────────────────────────────
{id:"csr",name:"Chase Sapphire Reserve",short:"Sapphire Reserve",issuer:"Chase",isBiz:false,fee:795,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a1a2e",c2:"#4a3728",hiddenValue:HIDDEN_VALUES["Chase Sapphire Reserve"],
 partners:["Hyatt","United","Southwest","Singapore Airlines","Air France/KLM","British Airways","Virgin Atlantic","Marriott","Iberia","Air Canada"],
 annual:[{n:"$300 Travel Credit",v:300,d:"Auto-applied to ANY travel — Uber, parking, tolls, Airbnb, rental cars. Very broad.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$500 The Edit Hotel Credit",v:500,d:"$500 annually for prepaid bookings at The Edit by Chase Travel luxury hotels (2-night minimum).",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.chase.com/personal/sapphire-travel"},{n:"$150 Dining Credit",v:150,d:"$150 Jan–Jun + $150 Jul–Dec at Sapphire Reserve Exclusive Tables restaurants.",cat:"dining",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$150 StubHub Credit",v:150,d:"$150 Jan–Jun + $150 Jul–Dec for purchases on StubHub.com and viagogo.com.",cat:"entertainment",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:"https://www.stubhub.com"},{n:"$288 Apple TV+ & Music",v:288,d:"Complimentary Apple TV+ and Apple Music subscriptions (through 6/22/2027).",cat:"entertainment",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"IHG Platinum Elite Status",v:null,d:"Complimentary IHG One Rewards Platinum Elite status through December 31, 2027. Activate by linking your IHG membership in your Chase account.",cat:"status",type:"perk",reset:"annual",enroll:true,enrollUrl:"https://account.chase.com/sapphire/reserve/benefits",useUrl:"https://www.ihg.com"},{n:"Hyatt Explorist Status (Coming Mid-2026)",v:null,d:"Complimentary World of Hyatt Explorist status starting mid-2026. Includes confirmed suite upgrades at select properties, club lounge access, enhanced bonus points, and 5 qualifying night credits toward Globalist. Normally requires 30 qualifying nights/year.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.hyatt.com"},{n:"$250 Hotel Credit",v:250,d:"Up to $250 in statement credits (through 12/31/2026) on prepaid Chase Travel hotel stays at IHG, Montage, Pendry, Omni, Virgin Hotels, Minor Hotels, and Pan Pacific. 2-night minimum.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.chase.com/personal/sapphire-travel"},{n:"$120 Peloton Credit",v:120,d:"Up to $120 in annual statement credits toward Peloton memberships.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.onepeloton.com"},{n:"Global Entry/TSA PreCheck",v:120,d:"Up to $120 reimbursement for Global Entry, TSA PreCheck, or NEXUS every 4 years.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"https://ttp.cbp.dhs.gov",useUrl:""},{n:"Priority Pass Lounge",v:null,d:"Unlimited visits at 1,300+ Priority Pass lounges + Chase Sapphire Lounge network. Guests $35 each.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.prioritypass.com"},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $10,000 per person, $20,000 per trip for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $500 per traveler after 6-hour delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Delay Insurance",v:null,d:"Up to $100/day for 5 days for essentials when baggage is delayed 6+ hours.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per traveler for lost, damaged, or stolen baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Primary Car Rental Insurance",v:null,d:"Primary CDW coverage up to $75,000 for theft/collision on rental vehicles.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Travel Accident Insurance",v:null,d:"Up to $1,000,000 in accidental death/dismemberment coverage on common carriers.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"DoorDash Credit",v:25,d:"$25/month in DoorDash promos: $5 on restaurant orders + two $10 on groceries/retail ($300/year). Includes complimentary DashPass ($120 value). Credits expire monthly — use them or lose them!",cat:"dining",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:"https://www.doordash.com"},{n:"$10 Lyft Credit",v:10,d:"$10/month in Lyft in-app credits ($120/year) + 5x points on Lyft rides.",cat:"travel",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:"https://www.lyft.com"}],
 strat:["chase-trifecta"],signup:"125,000 pts after $6k in 3 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"3x",p:"1x",o:"1x"},
 retentionOffers:["$150–$250 statement credit","10,000–15,000 bonus Ultimate Rewards points","Statement credit + points combo"],
 downgradePaths:[{"cardName":"Chase Sapphire Preferred","annualFee":95,"whatYouKeep":"Transfer partners, 1.25x portal multiplier, primary rental car insurance, trip delay/cancellation coverage, 3x dining, 2x travel","whatYouLose":"Priority Pass lounge access, $300 travel credit, $500 Edit Hotel credit, DoorDash credits, Lyft Pink, StubHub credits, 1.5x portal multiplier drops to 1.25x","affiliateKey":"csp","note":"Best if you want to keep transfer partners at the lowest cost"},{"cardName":"Chase Freedom Flex","annualFee":0,"whatYouKeep":"5x rotating quarterly categories (up to $1,500/quarter), 3x dining, 3x drugstores, purchase protection, no annual fee","whatYouLose":"Transfer partners (unless you have another Sapphire/Ink), lounge access, all travel credits, primary rental car insurance, trip delay/cancellation, portal multiplier","affiliateKey":"cff","note":"Best if you actively manage rotating 5x categories each quarter"},{"cardName":"Chase Freedom Unlimited","annualFee":0,"whatYouKeep":"1.5x flat rate on everything, 3x dining, 3x drugstores, purchase protection, no annual fee","whatYouLose":"Transfer partners (unless you have another Sapphire/Ink), lounge access, all travel credits, primary rental car insurance, trip delay/cancellation, portal multiplier","affiliateKey":"cfu","note":"Best if you want a simple flat 1.5x on all spending without managing categories"}],
 ifYouCancel:{"pointsFate":"Points don't expire but you lose ability to transfer to airline/hotel partners unless you have another Sapphire or Ink Preferred card. Redeem or transfer before canceling.","loseAccess":["Priority Pass lounge access","$300 annual travel credit","DoorDash DashPass + credits","Lyft Pink membership","10x on hotels via Chase Travel","Trip cancellation/delay insurance","Primary rental car insurance"]},
 portalEarn:{portal:"Chase Travel",portalUrl:"https://ultimaterewardspoints.chase.com",rates:{f:"5x",h:"10x",car:"10x",t:"3x"},note:"10x on hotels & car rentals, 5x on flights booked through Chase Travel portal. 3x on all other travel booked directly."},
 confidence:"verified"},
{id:"csp",name:"Chase Sapphire Preferred",short:"Sapphire Preferred",issuer:"Chase",isBiz:false,fee:95,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a3a5c",c2:"#0f2236",hiddenValue:HIDDEN_VALUES["Chase Sapphire Preferred"],
 partners:["Hyatt","United","Southwest","Singapore Airlines","Air France/KLM","British Airways","Virgin Atlantic","Marriott","Iberia","Air Canada"],
 annual:[{n:"$50 Hotel Credit",v:50,d:"$50 on hotel stays via Chase Travel portal annually.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.chase.com/personal/sapphire-travel"},{n:"Anniversary Points Bonus",v:null,d:"10% of your total Chase Travel purchases back as bonus points each card anniversary.",cat:"awards",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:"",requiresRenewal:true},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $500 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $10,000 per person, $20,000 per trip for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $500 per traveler after 12-hour delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Delay Insurance",v:null,d:"Up to $100/day for 5 days for essentials when baggage is delayed 6+ hours.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per traveler for lost, damaged, or stolen baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Primary Car Rental Insurance",v:null,d:"Primary CDW coverage up to $60,000 for theft/collision on rental vehicles.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Travel Accident Insurance",v:null,d:"Up to $500,000 in accidental death/dismemberment coverage on common carriers.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:["chase-trifecta"],signup:"75,000 pts after $5k in 3 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"2x",s:"3x",a:"1x",tr:"1x",p:"1x",o:"1x"},earnNotes:{g:"3x on online grocery orders only (excludes Target, Walmart, wholesale clubs). In-store grocery is 1x."},
 retentionOffers:["$50–$150 statement credit","5,000–10,000 bonus points"],
 downgradePaths:[{"cardName":"Chase Freedom Flex","annualFee":0,"whatYouKeep":"5x on rotating quarterly categories (up to $1,500/quarter), 3x dining, 3x drugstores, 1x everything else, no annual fee, all purchase protections","whatYouLose":"Transfer partner access (unless you have Reserve or Ink Preferred), 1.25x portal multiplier, travel credits, primary rental car insurance, trip delay/cancellation coverage","affiliateKey":"cff","note":"Best if you actively manage rotating 5x categories each quarter"},{"cardName":"Chase Freedom Unlimited","annualFee":0,"whatYouKeep":"1.5x flat rate on everything, 3x dining, 3x drugstores, no annual fee, all purchase protections","whatYouLose":"Transfer partner access (unless you have Reserve or Ink Preferred), 1.25x portal multiplier, travel credits, primary rental car insurance, trip delay/cancellation coverage","affiliateKey":"cfu","note":"Best if you want a simple flat 1.5x on all spending without managing categories"}],
 ifYouCancel:{"pointsFate":"Same as Reserve — transfer or redeem points first if this is your only Sapphire/Ink card.","loseAccess":["Transfer partners (Hyatt, United, Southwest, etc.)","$50 annual hotel credit","5x on travel via Chase portal","Trip cancellation insurance","Primary rental car coverage (outside US)"]},
 portalEarn:{portal:"Chase Travel",portalUrl:"https://ultimaterewardspoints.chase.com",rates:{f:"3x",h:"5x",car:"5x",t:"2x"},note:"5x on hotels & car rentals, 3x on flights booked through Chase Travel portal. 2x on all other travel booked directly."},
 confidence:"verified"},
{id:"cfu",name:"Chase Freedom Unlimited",short:"Freedom Unlimited",issuer:"Chase",isBiz:false,fee:0,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a5c3a",c2:"#0f3622",
 partners:[],annual:[],monthly:[],strat:["chase-trifecta"],signup:"$200 after $500 in 3 mo",
 earn:{d:"3x",g:"1.5x",gas:"1.5x",t:"5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"3x",o:"1.5x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"cff",name:"Chase Freedom Flex",short:"Freedom Flex",issuer:"Chase",isBiz:false,fee:0,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a4a5c",c2:"#0f2a38",
 partners:[],annual:[],monthly:[],strat:["chase-trifecta"],isRotating:true,signup:"$200 after $500 in 3 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"5x",s:"1x",a:"1x",tr:"1x",p:"3x",o:"1x"},earnNotes:{g:"5x only during quarterly bonus activation (not permanent). Base rate is 1x.",gas:"5x only during quarterly bonus activation (not permanent). Base rate is 1x.",a:"5x only during quarterly bonus activation (not permanent). Base rate is 1x."},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"hyatt",name:"World of Hyatt Card",short:"Hyatt Card",issuer:"Chase",isBiz:false,fee:95,network:"Visa",cur:"Hyatt Points",c1:"#1a1a1a",c2:"#2d1a3a",hiddenValue:HIDDEN_VALUES["World of Hyatt Card"],
 partners:["World of Hyatt"],
 annual:[{n:"Free Night Award",v:150,d:"1 free night at any Category 1–4 Hyatt property each year.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.hyatt.com",requiresRenewal:true},{n:"Discoverist Status",v:null,d:"Automatic Discoverist — early check-in, late checkout, bonus points.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $500 per claim.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $5,000 per person, $10,000 per trip for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Delay Insurance",v:null,d:"Up to $100/day for 3 days for essentials when baggage is delayed 6+ hours.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per traveler for lost, damaged, or stolen baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"30,000 pts after $3k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:["$50–$100 statement credit","5,000–10,000 bonus Hyatt points","Qualifying night credits"],
 downgradePaths:[],
 ifYouCancel:{"pointsFate":"Hyatt points stay in your World of Hyatt account. Points don't expire as long as you have account activity every 24 months.","loseAccess":["Annual free night (up to Category 4)","Automatic Discoverist status","2 qualifying night credits toward elite status","Extra guest bonus on spend"]}},
{id:"sw-priority",name:"Southwest Rapid Rewards® Priority",short:"SW Priority",issuer:"Chase",isBiz:false,fee:229,network:"Visa",cur:"Southwest Rapid Rewards",c1:"#304CB2",c2:"#cc0000",
 annual:[{n:"$75 Annual Travel Credit",v:75,d:"$75 in Southwest travel credits automatically applied.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.southwest.com"},{n:"Free Checked Bag",v:35,d:"First checked bag free for cardholder + up to 8 companions in the same reservation.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.southwest.com"},{n:"Free Seat Selection",v:null,d:"Free seat selection including preferred seats and access to extra legroom seats.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.southwest.com"},{n:"4 Upgraded Boardings",v:40,d:"4 A1–A15 upgraded boarding positions per year.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.southwest.com"},{n:"7,500 Anniversary Points",v:112,d:"7,500 points each anniversary worth ~$112 in SW flights.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $500 per claim.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Delay Insurance",v:null,d:"Up to $100/day for 3 days for essentials when baggage is delayed 6+ hours.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per traveler for lost, damaged, or stolen baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 pts after $2k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"2x",t:"4x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:["$50–$100 statement credit","3,000–5,000 bonus Rapid Rewards points"],
 downgradePaths:[{"cardName":"Southwest Rapid Rewards Plus","annualFee":69,"whatYouKeep":"Rapid Rewards points, anniversary bonus (reduced to 3,000)","whatYouLose":"$75 Southwest credit, 4 upgraded boardings, reduced anniversary bonus (7,500→3,000)","affiliateKey":null}],
 ifYouCancel:{"pointsFate":"Southwest points don't expire as long as you have earning/redeeming activity every 24 months.","loseAccess":["7,500 anniversary points","$75 annual Southwest credit","4 upgraded boardings per year","25% back on inflight purchases"]}},
{id:"marriott-boundless",name:"Marriott Bonvoy Boundless®",short:"Marriott Boundless",issuer:"Chase",isBiz:false,fee:95,network:"Visa",cur:"Marriott Bonvoy Points",c1:"#8B1A1A",c2:"#5c0f0f",hiddenValue:HIDDEN_VALUES["Marriott Bonvoy Boundless®"],
 annual:[{n:"Free Night Award",v:150,d:"1 free night at hotels up to 35,000 points annually.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"",requiresRenewal:true},{n:"Silver Elite Status",v:null,d:"Automatic Silver Elite status.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"5 Free Nights after $5k in 3 mo",
 earn:{d:"3x",g:"3x",gas:"3x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"2x"},confidence:"verified",
 retentionOffers:["$50–$100 statement credit","Free night certificate (usually 35k)","5,000–10,000 bonus Marriott points"],
 downgradePaths:[{"cardName":"Marriott Bonvoy Bold","annualFee":0,"whatYouKeep":"Marriott points, Silver Elite status","whatYouLose":"Free night certificate, Gold Elite status (drops to Silver), 3x at Marriott (drops to 2x)","affiliateKey":"marriott-bold"}],
 ifYouCancel:{"pointsFate":"Marriott points stay in your Marriott account — they don't expire as long as you have any activity every 24 months.","loseAccess":["Annual free night certificate (up to 35k points value)","Gold Elite status","3x points at Marriott properties"]}},
{id:"united-explorer",name:"United℠ Explorer Card",short:"United Explorer",issuer:"Chase",isBiz:false,fee:150,network:"Visa",cur:"United MileagePlus",c1:"#002244",c2:"#001133",
 annual:[{n:"Free Checked Bag",v:35,d:"First bag free for cardholder + up to 8 companions on United flights.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.united.com"},{n:"$150 Renowned Hotels Credit",v:150,d:"Up to $150 in credits for Renowned Hotels and Resorts bookings.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$100 Rideshare Credit",v:100,d:"Up to $100 annually in rideshare statement credits.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$180 Instacart Credit",v:180,d:"Up to $180 in annual Instacart credits plus complimentary 3-month Instacart+ membership.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$80 United TravelBank Credit",v:80,d:"Up to $80 in United TravelBank credits from Avis or Budget spending.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$150 JSX Credit",v:150,d:"Up to $150 in JSX flight credits annually.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $500 per claim.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $1,500 per person, $6,000 per trip for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $500 per traveler after 12-hour delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Delay Insurance",v:null,d:"Up to $100/day for 3 days for essentials when baggage is delayed 6+ hours.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per traveler for lost, damaged, or stolen baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 miles after $3k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:["$50–$150 statement credit","Bonus miles","United Club passes"],
 downgradePaths:[{"cardName":"United Gateway","annualFee":0,"whatYouKeep":"MileagePlus miles, United purchase earning","whatYouLose":"Free checked bag, priority boarding, 2 United Club passes, Global Entry credit, 2x on United/dining/hotels","affiliateKey":null}],
 ifYouCancel:{"pointsFate":"United MileagePlus miles stay in your United account. Miles don't expire.","loseAccess":["Free checked bag for you + companion","Priority boarding","2 United Club one-time passes per year","Global Entry/TSA PreCheck credit","25% back on inflight purchases"]}},
{id:"aeroplan",name:"Aeroplan® Credit Card",short:"Aeroplan",issuer:"Chase",isBiz:false,fee:95,network:"Visa",cur:"Air Canada Aeroplan",c1:"#8B0000",c2:"#600000",
 partners:["Air Canada","Star Alliance (40+ airlines)"],
 annual:[{n:"Free Checked Bag",v:35,d:"First bag free on Air Canada for you + up to 8 companions.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 pts after $3k in 3 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"ihg-premier",name:"IHG One Rewards Premier",short:"IHG Premier",issuer:"Chase",isBiz:false,fee:99,network:"Visa",cur:"IHG One Rewards Points",c1:"#006747",c2:"#004d35",
 annual:[{n:"Annual Free Night",v:100,d:"Free night at IHG properties annually — up to 40,000 pts value.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.ihg.com",requiresRenewal:true},{n:"IHG Platinum Elite",v:null,d:"Automatic Platinum Elite status — 60% bonus points.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $500 per claim.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $5,000 per person, $10,000 per trip for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Delay Insurance",v:null,d:"Up to $100/day for 3 days for essentials when baggage is delayed 6+ hours.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per traveler for lost, damaged, or stolen baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"140,000 pts after $3k in 3 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"3x"},confidence:"verified",
 retentionOffers:["$50 statement credit","Free night certificate","Bonus IHG points"],
 downgradePaths:[{"cardName":"IHG One Rewards Traveler","annualFee":0,"whatYouKeep":"IHG points, basic member benefits","whatYouLose":"Platinum Elite status, free night certificate, 4th night free benefit, Global Entry/TSA credit","affiliateKey":null}],
 ifYouCancel:{"pointsFate":"IHG points remain in your IHG account. They expire after 12 months of inactivity.","loseAccess":["Annual free night certificate","Platinum Elite status","4th night free on award stays","Global Entry/TSA PreCheck credit"]}},
{id:"amazon-prime",name:"Amazon Prime Rewards Visa",short:"Amazon Prime Visa",issuer:"Chase",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#1a1a1a",c2:"#333",
 annual:[],monthly:[],strat:[],signup:"$200 gift card on approval",
 earn:{d:"2x",g:"1x",gas:"2x",t:"1x",s:"1x",a:"5x",tr:"2x",p:"1x",o:"1x"},earnNotes:{a:"5% at Amazon.com, Amazon Fresh, and Whole Foods Market only.",g:"General grocery stores earn 1%. 5% is Whole Foods only (counted under Amazon).",tr:"2% on local transit and commuting (includes rideshare)."},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"disney-inspire",name:"Disney Inspire Visa Card",short:"Disney Inspire",issuer:"Chase",isBiz:false,fee:149,network:"Visa",cur:"Disney Rewards Dollars",c1:"#1b3a6b",c2:"#0a1f3a",
 partners:[],
 annual:[{n:"$100 Theme Park Credit",v:100,d:"$100 annual credit toward Disney theme park ticket purchases.",cat:"entertainment",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"200 Disney Rewards Dollars",v:200,d:"200 Disney Rewards Dollars after $2,000 spend on Disney resort or cruise bookings.",cat:"entertainment",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$120 Disney+/Hulu/ESPN+ Credit",v:120,d:"Up to $120 annual statement credit toward Disney+, Hulu, and ESPN+ subscriptions.",cat:"entertainment",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"$300 Disney eGift Card on approval + $300 credit after $1k in 3 mo",
 earn:{d:"3x",g:"3x",gas:"3x",t:"1x",s:"10x",a:"1x",tr:"1x",p:"1x",o:"1x"},earnNotes:{s:"10% on Disney+, Hulu, and ESPN+ subscriptions. 3x at U.S. Disney locations, gas stations, grocery stores, and restaurants."},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── AMEX ───────────────────────────────────────────────────────────────────────
{id:"amex-plat",name:"The Platinum Card® from American Express",short:"Amex Platinum",issuer:"American Express",isBiz:false,fee:895,network:"Amex",cur:"Amex Membership Rewards",c1:"#1c1c1c",c2:"#4a4a4a",hiddenValue:HIDDEN_VALUES["The Platinum Card® from American Express"],
 partners:["Air France/KLM Flying Blue","ANA","British Airways","Avianca LifeMiles","Cathay Pacific (5:4)","Delta","Emirates (5:4)","Singapore Airlines","Virgin Atlantic","Hilton","Marriott"],
 annual:[
  {n:"$200 Airline Fee Credit",v:200,d:"Select ONE airline. Covers incidental fees (bags, upgrades). Must select your airline!",cat:"travel",type:"credit",reset:"annual",enroll:true,enrollUrl:"https://www.americanexpress.com/en-us/benefits/",useUrl:""},
  {n:"$300 Hotel Credit",v:300,d:"$300 Jan–Jun + $300 Jul–Dec on prepaid Fine Hotels+Resorts or Hotel Collection stays via Amex Travel.",cat:"travel",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:"https://www.americanexpress.com/en-us/travel/"},
  {n:"$100 Resy Credit",v:100,d:"$100/quarter at 10,000+ Resy restaurants. Must enroll!",cat:"dining",type:"credit",reset:"quarterly",enroll:true,enrollUrl:"https://www.americanexpress.com/en-us/benefits/",useUrl:"https://www.resy.com"},
  {n:"$75 Lululemon Credit",v:75,d:"$75/quarter at lululemon stores and lululemon.com.",cat:"statement",type:"credit",reset:"quarterly",enroll:false,enrollUrl:"",useUrl:"https://www.lululemon.com"},
  {n:"$300 Equinox Credit",v:300,d:"Up to $300/year toward Equinox+ digital fitness memberships.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},
  {n:"$200 Uber Cash",v:200,d:"Uber Cash distributed monthly. Use for Uber rides or Uber Eats.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.uber.com"},
  {n:"$209 CLEAR+ Credit",v:209,d:"Up to $209/year for a CLEAR+ membership for expedited airport security.",cat:"travel",type:"credit",reset:"annual",enroll:true,enrollUrl:"https://www.clearme.com",useUrl:""},
  {n:"$200 Oura Ring Credit",v:200,d:"Up to $200/year toward an Oura Ring or Oura membership.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.ouraring.com"},
  {n:"$155 Walmart+ Credit",v:155,d:"$12.95/month — covers the full Walmart+ membership.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.walmart.com/plus"},
  {n:"$120 Uber One Credit",v:120,d:"Up to $120/year in statement credits for Uber One membership.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.uber.com"},
  {n:"$50 Saks Credit",v:50,d:"$50 Jan–Jun, $50 Jul–Dec at Saks Fifth Avenue or Saks OFF 5TH.",cat:"statement",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:"https://www.saks.com"},
  {n:"Global Entry/TSA PreCheck",v:120,d:"Up to $120 reimbursed for Global Entry or TSA PreCheck every 4–4.5 years.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"https://ttp.cbp.dhs.gov",useUrl:""},
  {n:"Centurion Lounge Access",v:null,d:"Unlimited access to Amex Centurion Lounges + Priority Pass + Delta Sky Club (when flying Delta).",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.americanexpress.com/en-us/travel/centurion-lounge/"},
  {n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 90 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 5 years or less, up to $10,000 per item.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Return Protection",v:null,d:"Returns eligible items within 90 days if retailer won't accept, up to $300/item ($1,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $10,000 per trip, $20,000 per card per 12 months for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $500 per trip after 6-hour delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Secondary Car Rental Insurance",v:null,d:"Secondary coverage for theft/damage to rental vehicles when you decline the CDW.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Insurance",v:null,d:"Up to $3,000 for carry-on, $2,000 for checked bags per person for lost/damaged/stolen luggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
 ],
 monthly:[{n:"$25 Digital Entertainment",v:25,d:"$25/month for eligible streaming (Disney+, Hulu, Peacock, NYT, Paramount+, YouTube Premium, etc.).",cat:"entertainment",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:["amex-trifecta"],signup:"175,000 pts after $12k in 6 mo",
 earn:{d:"1x",g:"1x",gas:"1x",t:"5x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},earnNotes:{t:"5x on flights booked directly with airlines or via Amex Travel, and 5x on prepaid hotels via Amex Travel. Other travel is 1x."},
 retentionOffers:["$200–$550 statement credit","25,000–40,000 bonus MR points","$200 credit + 20,000 points combo"],
 downgradePaths:[{"cardName":"Amex Gold Card","annualFee":325,"whatYouKeep":"MR points, transfer partners, 4x dining, 4x supermarkets, $120 Uber Cash, $120 dining credit, $100 Dunkin/Cheesecake Factory credit","whatYouLose":"Centurion/Priority Pass lounges, 5x flights, $200 airline credit, $200 hotel credit, $155 Walmart+ credit, Clear Plus, Global Entry/TSA, Hilton/Marriott Gold, FHR","affiliateKey":"amex-gold","note":"Best if dining and groceries are your biggest spend categories"},{"cardName":"Amex Green Card","annualFee":150,"whatYouKeep":"MR points, transfer partners, 3x travel/transit, 3x dining, $189 CLEAR Plus credit, LoungeBuddy access","whatYouLose":"All Platinum credits, Centurion/Priority Pass lounges, 5x flights, 4x dining/groceries, Hilton/Marriott Gold, FHR, concierge","affiliateKey":"amex-green","note":"Best if you mainly spend on travel and dining at a lower fee"},{"cardName":"Amex EveryDay","annualFee":0,"whatYouKeep":"MR points, transfer partners preserved, 2x on groceries at U.S. supermarkets (up to $6k/yr), 1x on everything else, 20% earn bonus when you hit 20 transactions/month","whatYouLose":"All credits, all lounge access, all elite statuses, all bonus categories above 2x, travel protections","affiliateKey":null,"note":"Best if you just need to keep MR points alive at zero cost"}],
 ifYouCancel:{"pointsFate":"If this is your ONLY MR-earning card, you lose ALL Membership Rewards points. Transfer or downgrade to EveryDay/Green first to preserve points.","loseAccess":["$200 airline incidental credit","$200 hotel credit (FHR/THC)","$200 Uber credit","$155 Walmart+ credit","Priority Pass + Centurion Lounge access","$100 Saks credit","Clear Plus membership","Global Entry/TSA PreCheck credit","5x on flights booked direct","Cell phone protection","Extensive travel insurance"]},
 portalEarn:{portal:"Amex Travel",portalUrl:"https://travel.amex.com",rates:{f:"5x",h:"5x",t:"1x"},note:"5x on flights and prepaid hotels booked through Amex Travel. Only 1x on travel booked directly outside the portal."},
 confidence:"verified"},
{id:"amex-gold",name:"American Express® Gold Card",short:"Amex Gold",issuer:"American Express",isBiz:false,fee:325,network:"Amex",cur:"Amex Membership Rewards",c1:"#8B6914",c2:"#5c4411",hiddenValue:HIDDEN_VALUES["American Express® Gold Card"],
 partners:["Air France/KLM Flying Blue","ANA","British Airways","Avianca LifeMiles","Cathay Pacific (5:4)","Delta","Emirates (5:4)","Singapore Airlines","Virgin Atlantic","Hilton","Marriott"],
 annual:[{n:"$50 Resy Credit",v:50,d:"$50 Jan–Jun + $50 Jul–Dec for in-person dining at U.S. Resy restaurants. Must enroll!",cat:"dining",type:"credit",reset:"semi-annual",enroll:true,enrollUrl:"https://www.americanexpress.com/en-us/benefits/",useUrl:"https://www.resy.com"},{n:"$84 Dunkin' Credit",v:84,d:"Up to $7/month at Dunkin' locations. Must enroll!",cat:"dining",type:"credit",reset:"annual",enroll:true,enrollUrl:"https://www.americanexpress.com/en-us/benefits/",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 90 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 5 years or less, up to $10,000 per item.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Return Protection",v:null,d:"Returns eligible items within 90 days if retailer won't accept, up to $300/item ($1,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $300 per trip after 12-hour delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Secondary Car Rental Insurance",v:null,d:"Secondary coverage up to $50,000 for theft/damage to rental vehicles when you decline the CDW.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Insurance",v:null,d:"Up to $1,250 for carry-on, $500 for checked bags per person for lost/damaged/stolen luggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"$10 Dining Credit",v:10,d:"At Grubhub, Cheesecake Factory, Goldbelly, Wine.com, Five Guys. Must enroll!",cat:"dining",type:"credit",reset:"monthly",enroll:true,enrollUrl:"https://www.americanexpress.com/en-us/benefits/",useUrl:""},{n:"$10 Uber Cash",v:10,d:"For Uber rides or Uber Eats. Expires monthly!",cat:"statement",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:"https://www.uber.com"},{n:"$7 Dunkin' Credit",v:7,d:"$7/month at Dunkin' locations. Must enroll!",cat:"dining",type:"credit",reset:"monthly",enroll:true,enrollUrl:"https://www.americanexpress.com/en-us/benefits/",useUrl:""}],
 strat:["amex-trifecta"],signup:"100,000 pts after $6k in 6 mo",
 earn:{d:"4x",g:"4x",gas:"1x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},earnNotes:{g:"4x U.S. supermarkets capped at $25,000/year (then 1x). Dining is uncapped."},
 retentionOffers:["$75–$150 statement credit","10,000–20,000 bonus MR points","$100 dining credit"],
 downgradePaths:[{"cardName":"Amex Green Card","annualFee":150,"whatYouKeep":"MR points, transfer partners, 3x travel/transit, 3x dining, $189 CLEAR Plus credit, LoungeBuddy access","whatYouLose":"4x dining (drops to 3x), 4x supermarkets (drops to 0x), $120 Uber Cash, $120 dining credit, $100 Dunkin/Cheesecake Factory credit","affiliateKey":"amex-green","note":"Best if you spend more on travel/transit than groceries"},{"cardName":"Amex EveryDay","annualFee":0,"whatYouKeep":"MR points, transfer partners preserved, 2x at U.S. supermarkets (up to $6k/yr), 1x everything else, 20% earn bonus at 20+ transactions/month","whatYouLose":"All credits ($340+/yr), 4x dining, 4x supermarkets, 3x flights, travel protections","affiliateKey":null,"note":"Best if you just need to keep MR points alive at zero cost — critical if this is your only MR card"}],
 ifYouCancel:{"pointsFate":"Same warning as Platinum — if only MR card, transfer points first or downgrade to preserve.","loseAccess":["$120 Uber Cash credit","$120 dining credit","$100 Dunkin'/Cheesecake Factory/Grubhub credit","4x dining worldwide","4x US supermarkets (up to $25k/yr)","3x flights booked directly"]},
 portalEarn:{portal:"Amex Travel",portalUrl:"https://travel.amex.com",rates:{f:"3x",h:"1x",t:"1x"},note:"3x on flights booked through Amex Travel. Only 1x on flights booked directly and all other travel."},
 confidence:"verified"},
{id:"amex-bcp",name:"Blue Cash Preferred® from American Express",short:"Amex Blue Cash Preferred",issuer:"American Express",isBiz:false,fee:95,network:"Amex",cur:"Cash Back",c1:"#003087",c2:"#001a52",
 annual:[],monthly:[{n:"$7 Disney Bundle Credit",v:7,d:"$7/month toward The Disney Bundle (Disney+, Hulu, ESPN+).",cat:"entertainment",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"$250 back after $3k in 6 mo",
 earn:{d:"1x",g:"6x",gas:"3x",t:"1x",s:"6x",a:"1x",tr:"3x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"hilton-aspire",name:"Hilton Honors American Express Aspire Card",short:"Hilton Aspire",issuer:"American Express",isBiz:false,fee:550,network:"Amex",cur:"Hilton Honors Points",c1:"#1a3a6e",c2:"#0f2244",hiddenValue:HIDDEN_VALUES["Hilton Honors American Express Aspire Card"],
 annual:[{n:"Hilton Resort Credit",v:200,d:"$200 semi-annual credit on qualifying hotel charges at Hilton Resorts. Use by June 30 (H1) and December 31 (H2).",cat:"travel",type:"credit",reset:"semi-annual",label:"per 6 months",enrollUrl:"",useUrl:"https://www.hilton.com"},{n:"$50 Flight Credit",v:50,d:"Up to $50/quarter ($200/year) toward flights booked directly with airlines or via amextravel.com.",cat:"travel",type:"credit",reset:"quarterly",enroll:false,enrollUrl:"",useUrl:""},{n:"$100 Waldorf/Conrad Credit",v:100,d:"$100 credit on qualifying stays at Waldorf Astoria and Conrad hotels (2-night minimum).",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.hilton.com"},{n:"Free Weekend Night",v:200,d:"1 free weekend night award each year at any Hilton.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.hilton.com",requiresRenewal:true},{n:"Diamond Status",v:null,d:"Automatic Diamond — complimentary breakfast, lounge access, upgrades.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$209 CLEAR+ Credit",v:209,d:"Up to $209/year for a CLEAR+ membership (enrollment required).",cat:"travel",type:"credit",reset:"annual",enroll:true,enrollUrl:"https://www.clearme.com",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 90 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 5 years or less, up to $10,000 per item.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Return Protection",v:null,d:"Returns eligible items within 90 days if retailer won't accept, up to $300/item ($1,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $10,000 per trip, $20,000 per card per 12 months for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Secondary Car Rental Insurance",v:null,d:"Secondary coverage up to $75,000 for theft/damage to rental vehicles when you decline the CDW.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"175,000 pts after $6k in 6 mo",
 earn:{d:"7x",g:"3x",gas:"3x",t:"3x",s:"3x",a:"3x",tr:"3x",p:"3x",o:"3x"},earnNotes:{t:"7x on flights booked directly with airlines or via amextravel.com and car rentals booked directly. Other travel is 3x."},confidence:"verified",
 retentionOffers:["$100–$150 statement credit","Bonus Hilton points","Free weekend night certificate"],
 downgradePaths:[{"cardName":"Hilton Surpass","annualFee":150,"whatYouKeep":"Hilton points, Gold status","whatYouLose":"Diamond status (drops to Gold), free weekend night, $400 Hilton resort credit (drops to $0), airline credit, Priority Pass","affiliateKey":"hilton-surpass"},{"cardName":"Hilton Honors (no fee)","annualFee":0,"whatYouKeep":"Hilton points, basic earning","whatYouLose":"All elite status, all credits, free nights, Priority Pass","affiliateKey":"hilton-honors-amex"}],
 ifYouCancel:{"pointsFate":"Hilton points stay in your Hilton account. Points don't expire as long as you have account activity every 15 months.","loseAccess":["Diamond status","Annual free weekend night certificate","$400 Hilton resort credit","$250 airline incidental credit","Priority Pass lounge access","14x at Hilton properties"]}},
{id:"amex-green",name:"American Express® Green Card",short:"Amex Green",issuer:"American Express",isBiz:false,fee:150,network:"Amex",cur:"Amex Membership Rewards",c1:"#1a6b3a",c2:"#0f4025",
 annual:[{n:"$100 LoungeBuddy Credit",v:100,d:"Access 1,300+ airport lounges via LoungeBuddy app.",cat:"status",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$100 CLEAR Plus Credit",v:100,d:"CLEAR Plus membership for expedited security.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"40,000 pts after $3k in 6 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"3x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"delta-gold",name:"Delta SkyMiles® Gold American Express Card",short:"Delta Gold",issuer:"American Express",isBiz:false,fee:150,network:"Amex",cur:"Delta SkyMiles",c1:"#c8000a",c2:"#8B0006",
 annual:[{n:"$200 Delta Flight Credit",v:200,d:"$200 Delta flight credit after $10k annual spend.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.delta.com"},{n:"Free Checked Bag",v:35,d:"First checked bag free for you + up to 8 companions.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.delta.com"},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 90 days, up to $1,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 5 years or less, up to $10,000 per item.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Secondary Car Rental Insurance",v:null,d:"Secondary coverage for theft/damage to rental vehicles when you decline the CDW.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Insurance",v:null,d:"Up to $1,250 for carry-on, $500 for checked bags per person for lost/damaged/stolen luggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"40,000 miles after $2k in 6 mo",
 earn:{d:"2x",g:"2x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},earnNotes:{g:"2x at U.S. supermarkets."},confidence:"verified",
 retentionOffers:["$50–$100 statement credit","5,000–10,000 bonus SkyMiles"],
 downgradePaths:[{"cardName":"Delta Blue","annualFee":0,"whatYouKeep":"SkyMiles earning (reduced)","whatYouLose":"Free checked bag, priority boarding, $200 companion certificate, 2x dining/groceries","affiliateKey":null}],
 ifYouCancel:{"pointsFate":"Delta SkyMiles never expire — they stay in your Delta account.","loseAccess":["Free first checked bag for you + up to 8 companions","Priority boarding","$200 companion certificate (after $10k spend)","2x at restaurants and US supermarkets"]}},
{id:"amex-bbp",name:"American Express® Blue Business Plus",short:"Blue Business Plus",issuer:"American Express",isBiz:true,fee:0,network:"Amex",cur:"Amex Membership Rewards",c1:"#1a4a8b",c2:"#0f2d5c",
 partners:["Air France/KLM Flying Blue","ANA","British Airways","Avianca LifeMiles","Cathay Pacific (5:4)","Delta","Emirates (5:4)","Singapore Airlines","Virgin Atlantic","Hilton","Marriott"],
 annual:[],monthly:[],strat:["amex-trifecta"],signup:"15,000 pts after $3k in 3 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CAPITAL ONE ────────────────────────────────────────────────────────────────
{id:"venture-x",name:"Capital One Venture X Rewards Credit Card",short:"Venture X",issuer:"Capital One",isBiz:false,fee:395,network:"Visa",cur:"Capital One Miles",c1:"#8B1010",c2:"#5c0808",hiddenValue:HIDDEN_VALUES["Capital One Venture X Rewards Credit Card"],
 partners:["Air France/KLM Flying Blue","Turkish Miles&Smiles","Avianca LifeMiles","Singapore Airlines","British Airways","Wyndham","Choice Hotels"],
 annual:[{n:"$300 Travel Credit",v:300,d:"$300 annual credit on Capital One Travel portal bookings.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://travel.capitalone.com"},{n:"10,000 Anniversary Miles",v:100,d:"10,000 bonus miles each account anniversary — worth $100 in travel.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Capital One Lounge Access",v:null,d:"Access to Capital One Lounges + 1,300+ Priority Pass lounges. C1 Lounge guests: $45/adult, $25/child. Priority Pass guests: $35 each. AU lounge access: $125/year. Free guest access at $75k+ annual spend.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.prioritypass.com"},{n:"Cell Phone Protection",v:null,d:"Up to $800 coverage ($50 deductible) when you pay phone bill with card. 2 claims per 12 months.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Return Protection",v:null,d:"90-day return protection on qualifying purchases if retailer won't accept the return.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less, up to $10,000 per claim.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $2,000 per person for prepaid, non-refundable travel expenses due to covered reasons.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $500 per person after 6-hour delay or required overnight stay for meals, lodging.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per trip for lost or damaged checked baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Primary Car Rental Insurance",v:null,d:"Primary CDW coverage up to $75,000 for theft/collision on rental vehicles.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Travel Accident Insurance",v:null,d:"Up to $1,000,000 in accidental death/dismemberment coverage on common carriers.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:["c1-duo"],signup:"75,000 miles after $4k in 3 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},
 retentionOffers:["$100–$200 statement credit","Bonus miles"],
 downgradePaths:[{"cardName":"Capital One Venture","annualFee":95,"whatYouKeep":"Capital One miles, transfer partners, 2x on everything, Global Entry/TSA credit, travel accident insurance","whatYouLose":"Capital One/Priority Pass/Plaza Premium lounges, $300 travel portal credit, 10x on hotels/rental cars via portal, 10,000 anniversary miles, cell phone protection, primary rental car insurance","affiliateKey":"venture","note":"Best if you want to keep transfer partners and 2x earning at a lower fee"},{"cardName":"Capital One VentureOne","annualFee":0,"whatYouKeep":"Capital One miles, transfer partners, 1.25x on everything, no annual fee","whatYouLose":"All lounge access, $300 travel credit, 10x portal rates, anniversary miles, 2x drops to 1.25x, cell phone protection, primary rental car insurance, Global Entry credit","affiliateKey":null,"note":"Best if you rarely travel but want to keep transfer partner access at zero cost"}],
 ifYouCancel:{"pointsFate":"Capital One miles don't expire. They stay in your account.","loseAccess":["$300 annual travel credit (via Capital One Travel)","10,000 anniversary miles ($100 value)","Priority Pass + Capital One Lounges","10x on hotels/rental cars via portal","Global Entry/TSA PreCheck credit"]},
 portalEarn:{portal:"Capital One Travel",portalUrl:"https://travel.capitalone.com",rates:{f:"5x",h:"10x",car:"10x",t:"2x"},note:"10x on hotels & rental cars, 5x on flights booked through Capital One Travel. 2x on all travel booked directly."},
 confidence:"verified"},
{id:"venture",name:"Capital One Venture Rewards",short:"Venture",issuer:"Capital One",isBiz:false,fee:95,network:"Visa",cur:"Capital One Miles",c1:"#b91c1c",c2:"#7f1d1d",
 partners:["Air France/KLM Flying Blue","Turkish Miles&Smiles","Avianca LifeMiles","Singapore Airlines","British Airways","Wyndham"],
 annual:[],monthly:[],strat:["c1-duo"],signup:"75,000 miles after $4k in 3 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null,
 portalEarn:{portal:"Capital One Travel",portalUrl:"https://travel.capitalone.com",rates:{f:"5x",h:"5x",car:"5x",t:"2x"},note:"5x on flights, hotels & rental cars booked through Capital One Travel. 2x on all travel booked directly."},
 confidence:"verified"},
{id:"savorone",name:"Capital One SavorOne Cash Rewards",short:"SavorOne",issuer:"Capital One",isBiz:false,fee:0,network:"Discover",cur:"Cash Back",c1:"#7c3aed",c2:"#4c1d95",
 annual:[],monthly:[],strat:[],signup:"$200 after $500 in 3 mo",
 earn:{d:"3x",g:"3x",gas:"1x",t:"1x",s:"3x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"quicksilver",name:"Capital One Quicksilver",short:"Quicksilver",issuer:"Capital One",isBiz:false,fee:0,network:"Discover",cur:"Cash Back",c1:"#374151",c2:"#1f2937",
 annual:[],monthly:[],strat:[],signup:"$200 after $500 in 3 mo",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CITI ───────────────────────────────────────────────────────────────────────
{id:"citi-premier",name:"Citi Strata Premier℠ Card",short:"Citi Strata Premier",issuer:"Citi",isBiz:false,fee:95,network:"Mastercard",cur:"Citi ThankYou Points",c1:"#003087",c2:"#001a52",hiddenValue:HIDDEN_VALUES["Citi Strata Premier℠ Card"],
 partners:["Air France/KLM Flying Blue","Avianca LifeMiles","Turkish Miles&Smiles","Singapore Airlines","Cathay Pacific","Qatar Airways","Emirates (5:4)","Virgin Atlantic"],
 annual:[{n:"$100 Hotel Savings",v:100,d:"$100 off hotel stay of $500+ via Citi Travel annually.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:["citi-duo"],signup:"60,000 pts after $4k in 3 mo",
 earn:{d:"3x",g:"3x",gas:"3x",t:"3x",s:"3x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:["$50–$100 statement credit","5,000–10,000 bonus ThankYou points"],
 downgradePaths:[{"cardName":"Citi Double Cash","annualFee":0,"whatYouKeep":"ThankYou points, 2x on everything (1x at purchase + 1x when you pay), no annual fee, Mastercard World Elite protections","whatYouLose":"Transfer partners (unless you have another Premier/Prestige), $100 hotel credit, 3x on flights/hotels/restaurants/supermarkets/gas, trip delay (3hr trigger), trip cancellation, rental car coverage","affiliateKey":"citi-dc","note":"Best if you want a flat 2x on all spending — add Strata Premier later to re-unlock transfers"},{"cardName":"Citi Custom Cash","annualFee":0,"whatYouKeep":"ThankYou points, 5x on your top spending category (up to $500/mo), 1x everything else, no annual fee","whatYouLose":"Transfer partners (unless you have another Premier/Prestige), $100 hotel credit, 3x broad categories, trip delay (3hr trigger), trip cancellation, rental car coverage","affiliateKey":null,"note":"Best if you have one dominant spending category — auto-detects your highest category each cycle"}],
 ifYouCancel:{"pointsFate":"If this is your only Premier/Prestige card, you lose transfer partner access. Points stay but become cash-back only. Downgrade to Double Cash to keep points alive.","loseAccess":["Transfer partners (Turkish Miles&Smiles, Flying Blue, etc.)","$100 annual hotel credit","3x on flights, hotels, restaurants, supermarkets, gas","Trip delay/cancellation insurance"]}},
{id:"citi-dc",name:"Citi Double Cash® Card",short:"Citi Double Cash",issuer:"Citi",isBiz:false,fee:0,network:"Mastercard",cur:"Cash Back",c1:"#1a365d",c2:"#0f2040",
 annual:[],monthly:[],strat:["citi-duo"],signup:"$200 after $1.5k in 6 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"citi-custom",name:"Citi Custom Cash® Card",short:"Citi Custom Cash",issuer:"Citi",isBiz:false,fee:0,network:"Mastercard",cur:"Cash Back",c1:"#0f4c75",c2:"#093648",
 annual:[],monthly:[],strat:[],signup:"$200 after $1.5k in 6 mo",
 earn:{d:"5x*",g:"5x*",gas:"5x*",t:"5x*",s:"5x*",a:"5x*",tr:"5x*",p:"5x*",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── BILT ───────────────────────────────────────────────────────────────────────
{id:"bilt",name:"Bilt Mastercard® (Legacy)",short:"Bilt (Legacy)",issuer:"Cardless",isBiz:false,fee:0,network:"Mastercard",cur:"Bilt Points",c1:"#0f0f0f",c2:"#2d2d2d",hiddenValue:HIDDEN_VALUES["Bilt Mastercard®"],isLegacy:true,
 partners:["Air France/KLM Flying Blue","American Airlines","British Airways","Emirates","Singapore Airlines","Turkish","United","Hyatt","IHG"],
 annual:[{n:"Cell Phone Protection",v:null,d:"Up to $800 coverage ($25 deductible) when you pay phone bill with card. 2 claims per 12 months.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 90 days, up to $1,000 per claim ($10,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less, up to $1,000 per claim.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $5,000 per person for non-refundable common carrier tickets due to covered reasons.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Auto Rental CDW",v:null,d:"Coverage up to $50,000 for theft/collision damage on rental vehicles up to 31 days.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],monthly:[],strat:[],signup:"No signup bonus",
 earn:{d:"3x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:["bilt-blue"],
 ifYouCancel:{"pointsFate":"Bilt points stay in your Bilt account. However, you must have a qualifying transaction at least once per billing cycle to earn points.","loseAccess":["1x on rent (unique — no other card does this)","Transfer partners (Hyatt, Turkish, AA, etc.)","Bilt Dining and travel portal access"]}},
{id:"bilt-blue",name:"Bilt Blue Card",short:"Bilt Blue",issuer:"Bilt / Column N.A.",isBiz:false,fee:0,network:"Mastercard",cur:"Bilt Points",c1:"#1e3a5f",c2:"#142a45",
 partners:["Air France/KLM Flying Blue","American Airlines","British Airways","Emirates","Singapore Airlines","Turkish","United","Hyatt","IHG"],
 annual:[
  {n:"Rent/Mortgage Points (No Fee)",v:null,d:"Earn points on rent or mortgage with no transaction fee. Two modes (choose one per month): MODE 1 — Tiered Points: earn points on housing based on how much non-housing spend you put on the card that month. Spend 25% of housing amount → 0.5x, 50% → 0.75x, 75% → 1x, 100%+ → 1.25x. In this mode you do NOT earn Bilt Cash. MODE 2 — Bilt Cash: earn 4% Bilt Cash on everyday purchases (instead of the tiered points). Every $30 of Bilt Cash earned unlocks 1,000 Bilt Points on your housing payment. Example: $2,000 rent needs $60 Bilt Cash ($1,500 in spending at 4%). You can switch modes monthly.",cat:"statement",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Cell Phone Protection",v:null,d:"Up to $800 coverage ($25 deductible) when you pay phone bill with card. 2 claims per 12 months.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"No Foreign Transaction Fees",v:null,d:"No fees on purchases made outside the U.S.",cat:"travel",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}
 ],
 monthly:[],strat:[],signup:"$100 Bilt Cash on approval",
 earn:{d:"1x",g:"1x",gas:"1x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:{pointsFate:"Bilt points stay in your Bilt account.",loseAccess:["Earn points on rent/mortgage (no other no-fee card does this)","Bilt transfer partners (Hyatt, Turkish, AA, etc.)","Bilt Travel portal access"]}},
{id:"bilt-obsidian",name:"Bilt Obsidian Card",short:"Bilt Obsidian",issuer:"Bilt / Column N.A.",isBiz:false,fee:95,network:"Mastercard",cur:"Bilt Points",c1:"#1a1a1a",c2:"#0a0a0a",
 partners:["Air France/KLM Flying Blue","American Airlines","British Airways","Emirates","Singapore Airlines","Turkish","United","Hyatt","IHG"],
 annual:[
  {n:"$100 Bilt Travel Hotel Credit",v:100,d:"$100 annual hotel credit via Bilt Travel Portal, distributed as $50 semi-annually. Requires minimum 2-night stay.",cat:"travel",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:""},
  {n:"$200 Annual Bilt Cash",v:200,d:"$200 in Bilt Cash credited to your account on January 1 each year (or on approval for first year).",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Choose 3x Category: Dining or Groceries",v:null,d:"Pick one bonus category annually: 3x on dining OR 3x on groceries (grocery cap: $25,000/year). Choose based on what your other cards already cover.",cat:"dining",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Rent/Mortgage Points (No Fee)",v:null,d:"Earn up to 1.25x on rent/mortgage with no transaction fee. Two modes (choose one per month): MODE 1 — Tiered Points: 25% of housing in non-housing spend → 0.5x, 50% → 0.75x, 75% → 1x, 100% → 1.25x. MODE 2 — Bilt Cash: 4% Bilt Cash on everyday purchases, $30 Bilt Cash → 1,000 housing points. Authorized user fee: $50.",cat:"statement",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Cell Phone Protection",v:null,d:"Up to $800 coverage ($25 deductible) when you pay phone bill with card. 2 claims per 12 months.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"No Foreign Transaction Fees",v:null,d:"No fees on purchases made outside the U.S.",cat:"travel",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}
 ],
 monthly:[],strat:[],signup:"$200 Bilt Cash on approval",
 earn:{d:"1x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:["bilt-blue"],
 ifYouCancel:{pointsFate:"Bilt points stay in your Bilt account.",loseAccess:["3x on dining or groceries (your chosen category)","$100 Bilt Travel Hotel Credit","$200 annual Bilt Cash","2x on travel","Transfer partners (Hyatt, Turkish, AA, etc.)"]}},
{id:"bilt-palladium",name:"Bilt Palladium Card",short:"Bilt Palladium",issuer:"Bilt / Column N.A.",isBiz:false,fee:495,network:"Mastercard",cur:"Bilt Points",c1:"#8e8e8e",c2:"#6e6e6e",
 partners:["Air France/KLM Flying Blue","American Airlines","British Airways","Emirates","Singapore Airlines","Turkish","United","Hyatt","IHG"],
 annual:[
  {n:"$400 Bilt Travel Hotel Credit",v:400,d:"$400 annual hotel credit via Bilt Travel Portal ($200 distributed semi-annually). Requires minimum 2-night stay.",cat:"travel",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:""},
  {n:"$200 Annual Bilt Cash",v:200,d:"$200 in Bilt Cash credited to your account on January 1 each year (or on approval for first year).",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Priority Pass Lounge Access",v:null,d:"Access to 1,300+ airport lounges worldwide via Priority Pass. Includes 1 guest per visit.",cat:"travel",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Rent/Mortgage Points (No Fee)",v:null,d:"Earn up to 1.25x on rent/mortgage with no transaction fee. Two modes (choose one per month): MODE 1 — Tiered Points: 25% of housing in non-housing spend → 0.5x, 50% → 0.75x, 75% → 1x, 100% → 1.25x. MODE 2 — Bilt Cash: 4% Bilt Cash on everyday purchases, $30 Bilt Cash → 1,000 housing points. Authorized user fee: $95.",cat:"statement",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Cell Phone Protection",v:null,d:"Up to $800 coverage ($25 deductible) when you pay phone bill with card. 2 claims per 12 months.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Auto Rental CDW",v:null,d:"Coverage up to $50,000 for theft/collision damage on rental vehicles up to 31 days.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"Trip Cancellation/Interruption",v:null,d:"Up to $5,000 per person for non-refundable common carrier tickets due to covered reasons.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},
  {n:"No Foreign Transaction Fees",v:null,d:"No fees on purchases made outside the U.S.",cat:"travel",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}
 ],
 monthly:[],strat:[],signup:"50,000 pts + Gold status after $4k in 90 days + $300 Bilt Cash on approval",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:["bilt-obsidian","bilt-blue"],
 ifYouCancel:{pointsFate:"Bilt points stay in your Bilt account.",loseAccess:["$400 Bilt Travel Hotel Credit","$200 annual Bilt Cash","Priority Pass lounge access","2x on all everyday purchases","Transfer partners (Hyatt, Turkish, AA, etc.)"]}},
// ── ATMOS ─────────────────────────────────────────────────────────────────────
{id:"atmos-ascent",name:"Atmos™ Rewards Ascent Visa Signature®",short:"Atmos Ascent",issuer:"Bank of America",isBiz:false,fee:95,network:"Visa",cur:"Atmos Rewards Points",c1:"#0d3d6e",c2:"#0a2a4d",
 partners:["Alaska Airlines","Hawaiian Airlines","Japan Airlines","Cathay Pacific","Aer Lingus","Qatar Airways","British Airways","American Airlines","Finnair","Icelandair"],
 annual:[{n:"Companion Fare",v:200,d:"Annual companion fare after $6k annual spend — a second person flies for ~$99.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Free Checked Bag",v:35,d:"First checked bag free for you + up to 6 companions on Alaska/Hawaiian flights.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:["atmos-strategy"],isNew:true,signup:"70,000 pts + $99 companion fare after $3k in 90 days",
 earn:{d:"2x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"atmos-summit",name:"Atmos™ Rewards Summit Visa Infinite®",short:"Atmos Summit",issuer:"Bank of America",isBiz:false,fee:395,network:"Visa",cur:"Atmos Rewards Points",c1:"#0a1f3d",c2:"#07142a",
 partners:["Alaska Airlines","Hawaiian Airlines","Japan Airlines","Cathay Pacific","Aer Lingus","Qatar Airways","British Airways","American Airlines","Finnair","Icelandair"],
 annual:[{n:"25,000-Point Companion Award",v:375,d:"Annual 25,000-point Global Companion Award (earn 100,000-pt award at $60k spend).",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Alaska Lounge Passes",v:100,d:"2 complimentary lounge passes per quarter (8/year).",cat:"status",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:["atmos-strategy"],isNew:true,signup:"80,000 pts + 25,000-pt Companion Award after $5k in 90 days",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── MORE CONSUMER ──────────────────────────────────────────────────────────────
{id:"wf-autograph",name:"Wells Fargo Autograph℠ Card",short:"WF Autograph",issuer:"Wells Fargo",isBiz:false,fee:0,network:"Visa",cur:"Wells Fargo Rewards",c1:"#c8222c",c2:"#8b1219",
 annual:[],monthly:[],strat:[],signup:"20,000 pts ($200) after $1k in 3 mo",
 earn:{d:"3x",g:"1x",gas:"3x",t:"3x",s:"3x",a:"1x",tr:"3x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"boa-premium",name:"Bank of America® Premium Rewards®",short:"BofA Premium Rewards",issuer:"Bank of America",isBiz:false,fee:95,network:"Visa",cur:"Points",c1:"#c01230",c2:"#8b0d22",
 annual:[{n:"$100 Airline Incidental Credit",v:100,d:"$100 credit for airline incidentals.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Global Entry/TSA PreCheck",v:100,d:"Reimburses application fee.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 pts ($600) after $4k in 90 days",
 earn:{d:"2x",g:"2x",gas:"1.5x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"usb-altitude-reserve",name:"U.S. Bank Altitude® Reserve Visa Infinite®",short:"US Bank Altitude Reserve",issuer:"U.S. Bank",isBiz:false,fee:400,network:"Visa",cur:"Points",c1:"#cc0000",c2:"#8b0000",
 annual:[{n:"$325 Travel/Dining Credit",v:325,d:"$325 annually on travel and dining — extremely broad definition. Note: portal redemption value dropped from 1.5¢/pt to 1.0¢/pt. 3x mobile wallet earning capped at $5,000/billing cycle.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 pts ($750) after $4.5k in 90 days",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"3x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"usb-cash-plus",name:"U.S. Bank Cash+® Visa Signature®",short:"US Bank Cash+",issuer:"U.S. Bank",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#b91c1c",c2:"#7f1d1d",
 annual:[],monthly:[],strat:[],isRotating:true,signup:"$200 after $1k in 90 days",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"5x*",a:"1x",tr:"2x",p:"5x*",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"apple-card",name:"Apple Card",short:"Apple Card",issuer:"Goldman Sachs",isBiz:false,fee:0,network:"Mastercard",cur:"Daily Cash",c1:"#1c1c1e",c2:"#2c2c2e",
 annual:[],monthly:[],strat:[],signup:"No signup bonus",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"discover-it",name:"Discover it® Cash Back",short:"Discover it",issuer:"Discover",isBiz:false,fee:0,network:"Discover",cur:"Cash Back",c1:"#dc6500",c2:"#9a4500",
 annual:[],monthly:[],strat:[],isRotating:true,signup:"Cash back match in year 1",
 earn:{d:"5x*",g:"5x*",gas:"5x*",t:"1x",s:"1x",a:"5x*",tr:"1x",p:"5x*",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"bilt-rent",name:"Bilt Mastercard® (Rent Focus, Legacy)",short:"Bilt Rent (Legacy)",issuer:"Cardless",isBiz:false,fee:0,network:"Mastercard",cur:"Bilt Points",c1:"#111111",c2:"#222222",isLegacy:true,
 annual:[],monthly:[],strat:[],signup:"No signup bonus",
 earn:{d:"3x",g:"2x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"3x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:["bilt-blue"],
 ifYouCancel:null},
{id:"citi-aa",name:"Citi® / AAdvantage® Platinum Select®",short:"Citi AAdvantage",issuer:"Citi",isBiz:false,fee:99,network:"Mastercard",cur:"American Airlines AAdvantage",c1:"#0078d2",c2:"#004f8c",
 annual:[{n:"$125 AA Flight Discount",v:125,d:"$125 AA flight discount after $20k annual spend.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"First Checked Bag Free",v:30,d:"Free first bag for you + 4 companions on AA flights.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 miles after $2.5k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"fidelity",name:"Fidelity® Rewards Visa Signature®",short:"Fidelity Rewards",issuer:"Elan Financial",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#006800",c2:"#004400",
 annual:[],monthly:[],strat:[],signup:"No sign-up bonus",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"robinhood",name:"Robinhood Gold Card",short:"Robinhood Gold",issuer:"Coastal Community Bank",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#00c805",c2:"#007a03",
 annual:[],monthly:[],strat:[],signup:"3% cash back in year 1",
 earn:{d:"3x",g:"3x",gas:"3x",t:"3x",s:"3x",a:"3x",tr:"3x",p:"3x",o:"3x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"robinhood-plat",name:"Robinhood Platinum Card",short:"Robinhood Platinum",issuer:"Coastal Community Bank",isBiz:false,fee:695,network:"Visa",cur:"Cash Back",c1:"#1a1a1a",c2:"#333333",
 annual:[{n:"$300 Travel Credit",v:300,d:"$300 annual travel credit, auto-applied to broad travel purchases.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$500 Hotel Credit",v:500,d:"$250 semi-annual hotel credit for bookings through Robinhood travel portal only (2 x $250).",cat:"travel",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$200 Health Wearables Credit",v:200,d:"$200 annual credit toward health wearable devices.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$120 Global Entry/TSA PreCheck",v:120,d:"Up to $120 reimbursement for Global Entry or TSA PreCheck every 4 years.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$70 Oura Ring Membership",v:70,d:"$70 annual Oura Ring membership credit (requires Oura Ring purchase).",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Priority Pass Select",v:null,d:"Access to 1,800+ Priority Pass lounges worldwide.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.prioritypass.com"}],
 monthly:[{n:"$20 Dining Credit",v:20,d:"$20/month dining credit ($30 in December). $250/year total.",cat:"dining",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""},{n:"$20 DoorDash Credit",v:20,d:"$10 off orders $50+ (~25 orders to exhaust $250/year). Requires $50 minimum order.",cat:"dining",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:"https://www.doordash.com"},{n:"$20 Autonomous Ride Credit",v:20,d:"$20/month autonomous ride credit ($30 in December). $250/year total.",cat:"travel",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"No welcome bonus",
 earn:{d:"5x",g:"1x",gas:"1x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},earnNotes:{d:"5% on dining capped at $50k/year. 10% on hotels and 5% on flights booked via Robinhood travel portal."},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"hilton-surpass",name:"Hilton Honors American Express Surpass®",short:"Hilton Surpass",issuer:"American Express",isBiz:false,fee:150,network:"Amex",cur:"Hilton Honors Points",c1:"#1a3a6e",c2:"#162d54",
 annual:[{n:"Free Weekend Night",v:150,d:"1 free weekend night certificate at most Hilton properties on card anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.hilton.com",requiresRenewal:true}],monthly:[{n:"$15 Dining/Hotel Credit",v:15,d:"$15/month for eligible dining or Hilton hotel purchases.",cat:"dining",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],strat:[],signup:"130,000 pts after $3k in 3 mo",
 earn:{d:"6x",g:"6x",gas:"6x",t:"3x",s:"3x",a:"3x",tr:"3x",p:"3x",o:"3x"},earnNotes:{t:"6x on flights booked directly with airlines or via amextravel.com. Other travel is 3x.",g:"6x at U.S. supermarkets.",gas:"6x at U.S. gas stations."},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"aviator-red",name:"AAdvantage® Aviator® Red World Elite Mastercard®",short:"Aviator Red",issuer:"Barclays",isBiz:false,fee:99,network:"Mastercard",cur:"American Airlines AAdvantage",c1:"#0078d2",c2:"#004a8b",
 annual:[{n:"Annual Companion Certificate",v:150,d:"Companion cert after $20k spend.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"First Checked Bag Free",v:30,d:"Free first bag for you + up to 4 companions.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 miles after first purchase",
 earn:{d:"2x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── BUSINESS CARDS ─────────────────────────────────────────────────────────────
{id:"ink-preferred",name:"Ink Business Preferred® Credit Card",short:"Ink Preferred",issuer:"Chase",isBiz:true,fee:95,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a3a6e",c2:"#0f2244",
 partners:["Hyatt","United","Southwest","Singapore Airlines","Air France/KLM","British Airways","Virgin Atlantic","Marriott"],
 annual:[{n:"Cell Phone Protection",v:null,d:"Up to $1,000 per claim ($100 deductible) when you pay phone bill with card. 3 claims per 12 months.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 120 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less, up to $10,000 per claim.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $5,000 per person annually for non-refundable travel expenses due to covered reasons.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $500 per ticket after 12-hour delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Delay Insurance",v:null,d:"Up to $100/day for 5 days for essentials when baggage is delayed 6+ hours.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Lost Luggage Reimbursement",v:null,d:"Up to $3,000 per passenger for lost, damaged, or stolen baggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Primary Car Rental Insurance",v:null,d:"Primary CDW for business rentals; secondary for personal. Coverage for theft/collision damage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],monthly:[],strat:["ink-trio"],signup:"100,000 pts after $8k in 3 mo",
 earn:{d:"1x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"3x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"ink-cash",name:"Ink Business Cash® Credit Card",short:"Ink Cash",issuer:"Chase",isBiz:true,fee:0,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a5c3a",c2:"#0f3622",
 annual:[],monthly:[],strat:["ink-trio"],signup:"$350 after $3k, +$400 after $6k in 6 mo",
 earn:{d:"2x",g:"1x",gas:"2x",t:"1x",s:"5x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"ink-unlimited",name:"Ink Business Unlimited® Credit Card",short:"Ink Unlimited",issuer:"Chase",isBiz:true,fee:0,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a5c3a",c2:"#102e1a",
 annual:[],monthly:[],strat:["ink-trio"],signup:"$750 after $6k in 3 mo",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"1.5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"amex-biz-plat",name:"The Business Platinum Card® from American Express",short:"Amex Business Platinum",issuer:"American Express",isBiz:true,fee:895,network:"Amex",cur:"Amex Membership Rewards",c1:"#1c1c1c",c2:"#3a3520",
 partners:["Air France/KLM Flying Blue","ANA","British Airways","Avianca LifeMiles","Cathay Pacific (5:4)","Delta","Emirates (5:4)","Singapore Airlines","Virgin Atlantic","Hilton","Marriott"],
 annual:[{n:"$300 Hotel Credit",v:300,d:"$300 Jan–Jun + $300 Jul–Dec on prepaid Fine Hotels+Resorts or Hotel Collection stays via Amex Travel.",cat:"travel",type:"credit",reset:"semi-annual",enroll:false,enrollUrl:"",useUrl:"https://www.americanexpress.com/en-us/travel/"},{n:"$1,150 Dell Credit",v:1150,d:"$150 in statement credits + up to $1,000 after $5,000+ annual Dell spend.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.dell.com"},{n:"$90 Indeed Credit",v:90,d:"$90/quarter in Indeed recruiting credits.",cat:"statement",type:"credit",reset:"quarterly",enroll:false,enrollUrl:"",useUrl:"https://www.indeed.com"},{n:"$250 Adobe Credit",v:250,d:"Up to $250 when spending $600+ annually on Adobe.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.adobe.com"},{n:"$209 CLEAR+ Credit",v:209,d:"Up to $209/year for a CLEAR+ membership.",cat:"travel",type:"credit",reset:"annual",enroll:true,enrollUrl:"https://www.clearme.com",useUrl:""},{n:"$200 Airline Fee Credit",v:200,d:"Select ONE airline. Covers incidental fees (bags, upgrades). Must select your airline!",cat:"travel",type:"credit",reset:"annual",enroll:true,enrollUrl:"https://www.americanexpress.com/en-us/benefits/",useUrl:""},{n:"$50 Hilton Credit",v:50,d:"$50/quarter at Hilton properties.",cat:"travel",type:"credit",reset:"quarterly",enroll:false,enrollUrl:"",useUrl:"https://www.hilton.com"},{n:"$120 Wireless Credit",v:120,d:"$10/month for wireless phone plan.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Global Entry/TSA PreCheck",v:120,d:"Up to $120 reimbursed for Global Entry or TSA PreCheck every 4–4.5 years.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"https://ttp.cbp.dhs.gov",useUrl:""},{n:"Centurion Lounge Access",v:null,d:"Unlimited access to Amex Centurion Lounges + Priority Pass when traveling on a flight.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.americanexpress.com/en-us/travel/centurion-lounge/"},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 90 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 5 years or less, up to $10,000 per item.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Return Protection",v:null,d:"Returns eligible items within 90 days if retailer won't accept, up to $300/item ($1,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $10,000 per trip, $20,000 per card per 12 months for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $300/day (max $1,000/trip) after delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Secondary Car Rental Insurance",v:null,d:"Secondary coverage for theft/damage to rental vehicles when you decline the CDW.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Baggage Insurance",v:null,d:"Up to $3,000 for carry-on, $2,000 for checked bags per person for lost/damaged/stolen luggage.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"$10 Wireless Credit",v:10,d:"$10/month for wireless phone plan statement credit.",cat:"statement",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],strat:[],signup:"200,000 pts after $20k in 3 mo",
 earn:{d:"1x",g:"1x",gas:"1x",t:"5x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},earnNotes:{o:"1.5x on individual purchases of $5,000+ (up to $2M/year). 5x on flights booked directly or via Amex Travel."},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"amex-biz-gold",name:"American Express® Business Gold Card",short:"Amex Business Gold",issuer:"American Express",isBiz:true,fee:375,network:"Amex",cur:"Amex Membership Rewards",c1:"#8B6914",c2:"#5c4411",
 partners:["Air France/KLM Flying Blue","ANA","British Airways","Avianca LifeMiles","Cathay Pacific (5:4)","Delta","Emirates (5:4)","Singapore Airlines","Virgin Atlantic","Hilton","Marriott"],
 annual:[{n:"$240 Flexible Business Credit",v:240,d:"$20/month at FedEx, Grubhub, office supply stores.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"$20 Business Credit",v:20,d:"Monthly credit at FedEx, Grubhub, or office supply stores.",cat:"statement",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"100,000 pts after $15k in 3 mo",
 earn:{d:"4x*",g:"4x*",gas:"4x*",t:"3x",s:"4x*",a:"4x*",tr:"4x*",p:"4x*",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"spark-cash-plus",name:"Capital One Spark Cash Plus",short:"Spark Cash Plus",issuer:"Capital One",isBiz:true,fee:150,network:"Mastercard",cur:"Cash Back",c1:"#991b1b",c2:"#7f1d1d",
 annual:[{n:"$200 Annual Cash Bonus",v:200,d:"$200 annual cash bonus when you spend $200k+.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"$1,200 after $30k in 3 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"5x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"sw-biz",name:"Southwest® Rapid Rewards® Performance Business",short:"SW Performance Business",issuer:"Chase",isBiz:true,fee:199,network:"Visa",cur:"Southwest Rapid Rewards",c1:"#304CB2",c2:"#1a2870",
 annual:[{n:"9,000 Anniversary Pts",v:135,d:"9,000 points each account anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"4 Upgraded Boardings",v:40,d:"4 A1–A15 upgraded boardings per year.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"365 In-Flight Wi-Fi Credits",v:365,d:"$8 credit per day for in-flight Wi-Fi.",cat:"entertainment",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"80,000 pts after $5k in 3 mo",
 earn:{d:"4x",g:"1x",gas:"1x",t:"3x",s:"4x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"united-biz",name:"United℠ Business Card",short:"United Business",issuer:"Chase",isBiz:true,fee:99,network:"Visa",cur:"United MileagePlus",c1:"#002244",c2:"#001020",
 annual:[{n:"5,000 Bonus Miles",v:75,d:"5,000 miles when you hold both United personal + business cards.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"2 United Club Passes",v:100,d:"Two annual United Club passes.",cat:"status",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"75,000 miles after $5k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1.5x",t:"2x",s:"1.5x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"hilton-biz",name:"Hilton Honors American Express Business Card",short:"Hilton Business",issuer:"American Express",isBiz:true,fee:195,network:"Amex",cur:"Hilton Honors Points",c1:"#1a3a6e",c2:"#0f2040",
 annual:[{n:"10 Priority Pass Passes",v:290,d:"10 airport lounge passes annually via Priority Pass.",cat:"status",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Hilton Gold Status",v:null,d:"Automatic Gold — suite upgrades and breakfast.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"130,000 pts after $3k in 3 mo",
 earn:{d:"6x",g:"6x",gas:"6x",t:"3x",s:"3x",a:"3x",tr:"3x",p:"3x",o:"3x"},earnNotes:{t:"6x on flights booked directly with airlines or via amextravel.com. Other travel is 3x.",g:"6x at U.S. supermarkets.",gas:"6x at U.S. gas stations and shipping in the US."},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"marriott-biz",name:"Marriott Bonvoy Business® American Express®",short:"Marriott Bonvoy Business",issuer:"American Express",isBiz:true,fee:125,network:"Amex",cur:"Marriott Bonvoy Points",c1:"#8B1A1A",c2:"#5c1010",
 annual:[{n:"Free Night Award",v:150,d:"1 free night (up to 35,000 pts) annually.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"15 Elite Night Credits",v:null,d:"15 elite night credits toward status qualification.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"5 free nights after $5k in 6 mo",
 earn:{d:"4x",g:"2x",gas:"4x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CHASE CONSUMER (EXPANDED) ─────────────────────────────────────────────────
{id:"marriott-bold",name:"Marriott Bonvoy Bold® Credit Card",short:"Marriott Bold",issuer:"Chase",isBiz:false,fee:0,network:"Visa",cur:"Marriott Bonvoy Points",c1:"#6b1414",c2:"#4a0d0d",
 partners:["Marriott Bonvoy"],
 annual:[{n:"Free Night Award",v:100,d:"1 free night at hotels up to 25,000 points on card anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"",requiresRenewal:true}],monthly:[],strat:[],signup:"30,000 pts after $1k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"united-gateway",name:"United Gateway℠ Card",short:"United Gateway",issuer:"Chase",isBiz:false,fee:0,network:"Visa",cur:"United MileagePlus",c1:"#001e4c",c2:"#000e26",
 annual:[],monthly:[],strat:[],signup:"20,000 miles after $1k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"2x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"british-airways-chase",name:"British Airways Visa Signature® Card",short:"British Airways Visa",issuer:"Chase",isBiz:false,fee:95,network:"Visa",cur:"British Airways Avios",c1:"#075aab",c2:"#043d75",
 partners:["British Airways","Iberia","Aer Lingus","Vueling","Qatar Airways"],
 annual:[],monthly:[],strat:[],signup:"75,000 Avios after $5k in 3 mo",
 earn:{d:"1x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"united-quest",name:"United Quest℠ Card",short:"United Quest",issuer:"Chase",isBiz:false,fee:250,network:"Visa",cur:"United MileagePlus",c1:"#001e3c",c2:"#000f20",
 annual:[{n:"$125 United Travel Credit",v:125,d:"Up to $125 back on United purchases each year.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"10,000 Anniversary Miles",v:150,d:"10,000 bonus miles each card anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"70,000 miles after $4k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"3x",s:"2x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"united-club-inf",name:"United Club℠ Infinite Card",short:"United Club Infinite",issuer:"Chase",isBiz:false,fee:525,network:"Visa",cur:"United MileagePlus",c1:"#002050",c2:"#001030",
 annual:[{n:"United Club Membership",v:700,d:"Full United Club membership — unlimited access to United Clubs and Star Alliance affiliated lounges.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"2 Free Checked Bags",v:70,d:"First and second checked bags free for cardholder + companion.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"80,000 miles after $5k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"4x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"sw-plus",name:"Southwest Rapid Rewards® Plus Credit Card",short:"SW Plus",issuer:"Chase",isBiz:false,fee:69,network:"Visa",cur:"Southwest Rapid Rewards",c1:"#1e3a8a",c2:"#112266",
 annual:[{n:"3,000 Anniversary Points",v:45,d:"3,000 points every card anniversary — worth ~$45 in Southwest travel.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 pts after $1k in 3 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"2x",s:"2x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"ihg-traveler",name:"IHG One Rewards Traveler Credit Card",short:"IHG Traveler",issuer:"Chase",isBiz:false,fee:0,network:"Visa",cur:"IHG One Rewards Points",c1:"#004d30",c2:"#00341f",
 annual:[{n:"Annual Free Night",v:75,d:"Free night at IHG properties on card anniversary — up to 25,000 pts value.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.ihg.com",requiresRenewal:true}],monthly:[],strat:[],signup:"100,000 pts after $3k in 3 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CHASE BUSINESS (EXPANDED) ─────────────────────────────────────────────────
{id:"ink-biz-premier",name:"Ink Business Premier® Credit Card",short:"Ink Premier",issuer:"Chase",isBiz:true,fee:195,network:"Visa",cur:"Chase Ultimate Rewards",c1:"#1a2a5e",c2:"#0f1a3c",
 annual:[],monthly:[],strat:[],signup:"$1,000 after $10k in 3 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"5x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"hyatt-biz",name:"World of Hyatt Business Credit Card",short:"Hyatt Business",issuer:"Chase",isBiz:true,fee:199,network:"Visa",cur:"Hyatt Points",c1:"#111111",c2:"#1e1030",
 partners:["World of Hyatt"],
 annual:[{n:"$100 Hyatt Credit",v:100,d:"$50 semi-annual statement credits at Hyatt properties.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"5 Tier-Qualifying Night Credits",v:null,d:"5 qualifying night credits toward status for every $10k spent.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 pts after $5k in 3 mo",
 earn:{d:"4x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"2x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── AMEX CONSUMER (EXPANDED) ──────────────────────────────────────────────────
{id:"amex-bce",name:"Blue Cash Everyday® Card from American Express",short:"Amex Blue Cash Everyday",issuer:"American Express",isBiz:false,fee:0,network:"Amex",cur:"Cash Back",c1:"#1d4ed8",c2:"#1e3a8a",
 annual:[],
 monthly:[{n:"$7 Disney Bundle Credit",v:7,d:"$7/month toward The Disney Bundle subscription.",cat:"entertainment",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""},{n:"$15 Home Chef Credit",v:15,d:"$15/month for Home Chef meal kit deliveries.",cat:"dining",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"$200 after $2k in 6 mo",
 earn:{d:"1x",g:"3x",gas:"2x",t:"1x",s:"1x",a:"3x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"amex-everyday",name:"Amex EveryDay® Credit Card",short:"Amex EveryDay",issuer:"American Express",isBiz:false,fee:0,network:"Amex",cur:"Amex Membership Rewards",c1:"#1e40af",c2:"#1e3a8a",
 partners:["Air France/KLM Flying Blue","ANA","British Airways","Avianca LifeMiles","Cathay Pacific (5:4)","Delta","Emirates (5:4)","Singapore Airlines","Virgin Atlantic","Hilton","Marriott"],
 annual:[],monthly:[],strat:[],signup:"10,000 pts after $2k in 6 mo",
 earn:{d:"1x",g:"2x",gas:"1x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"amex-edp",name:"Amex EveryDay® Preferred Credit Card",short:"Amex EveryDay Preferred",issuer:"American Express",isBiz:false,fee:95,network:"Amex",cur:"Amex Membership Rewards",c1:"#1e3a8a",c2:"#172554",
 partners:["Air France/KLM Flying Blue","ANA","British Airways","Avianca LifeMiles","Cathay Pacific (5:4)","Delta","Emirates (5:4)","Singapore Airlines","Virgin Atlantic","Hilton","Marriott"],
 annual:[],monthly:[],strat:[],signup:"15,000 pts after $2k in 6 mo",
 earn:{d:"1x",g:"4.5x",gas:"3x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"amex-cash-magnet",name:"Amex Cash Magnet® Card",short:"Amex Cash Magnet",issuer:"American Express",isBiz:false,fee:0,network:"Amex",cur:"Cash Back",c1:"#374151",c2:"#1f2937",
 annual:[],monthly:[],strat:[],signup:"$150 after $1k in 3 mo",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"1.5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"delta-blue",name:"Delta SkyMiles® Blue American Express Card",short:"Delta Blue",issuer:"American Express",isBiz:false,fee:0,network:"Amex",cur:"Delta SkyMiles",c1:"#9b0000",c2:"#6b0000",
 annual:[],monthly:[],strat:[],signup:"10,000 miles after $1k in 6 mo",
 earn:{d:"2x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"delta-plat",name:"Delta SkyMiles® Platinum American Express Card",short:"Delta Platinum",issuer:"American Express",isBiz:false,fee:350,network:"Amex",cur:"Delta SkyMiles",c1:"#7c0a02",c2:"#5c0601",
 annual:[{n:"Annual Companion Certificate",v:350,d:"Main cabin domestic companion certificate each anniversary year.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$120 Rideshare Credit",v:120,d:"$10/month in statement credits toward rideshare services.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Free Checked Bag",v:35,d:"First checked bag free for you + up to 8 companions.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"$10 Rideshare Credit",v:10,d:"$10/month statement credit for rideshare.",cat:"travel",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"50,000 miles after $3k in 6 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"2x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"delta-reserve",name:"Delta SkyMiles® Reserve American Express Card",short:"Delta Reserve",issuer:"American Express",isBiz:false,fee:650,network:"Amex",cur:"Delta SkyMiles",c1:"#4a0000",c2:"#2a0000",
 annual:[{n:"Delta Sky Club Access",v:null,d:"Up to 15 Sky Club visits/year when flying Delta (unlimited with $75k spend).",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Annual Companion Certificate",v:600,d:"First Class, Comfort+, or Main Cabin companion certificate annually.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$240 Resy Credit",v:240,d:"$20/month at eligible Resy restaurants.",cat:"dining",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"$20 Resy Credit",v:20,d:"$20/month at participating Resy restaurants.",cat:"dining",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"60,000 miles + 10,000 MQMs after $5k in 6 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"marriott-brilliant",name:"Marriott Bonvoy Brilliant® American Express® Card",short:"Marriott Brilliant",issuer:"American Express",isBiz:false,fee:650,network:"Amex",cur:"Marriott Bonvoy Points",c1:"#5c0f0f",c2:"#3a0808",
 partners:["Marriott Bonvoy"],
 annual:[{n:"$300 Marriott Dining Credit",v:300,d:"$25/month at restaurants worldwide.",cat:"dining",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Free Night Award",v:450,d:"1 free night at properties up to 85,000 Bonvoy points.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:"https://www.marriott.com",requiresRenewal:true},{n:"Platinum Elite Status",v:null,d:"Automatic Platinum Elite — suite upgrades, lounge access, breakfast.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Purchase Protection",v:null,d:"Covers new purchases against damage or theft for 90 days, up to $10,000 per claim ($50,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Extended Warranty",v:null,d:"Adds 1 extra year to manufacturer warranties of 3 years or less, up to $10,000 per item.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Return Protection",v:null,d:"Returns eligible items within 90 days if retailer won't accept, up to $300/item ($1,000/year).",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Cancellation/Interruption",v:null,d:"Up to $10,000 per trip, $20,000 per card per 12 months for non-refundable travel expenses.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Trip Delay Reimbursement",v:null,d:"Up to $500 per trip after 6-hour delay for meals, lodging, and essentials.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""},{n:"Secondary Car Rental Insurance",v:null,d:"Secondary coverage for theft/damage to rental vehicles when you decline the CDW.",cat:"protection",type:"perk",reset:"one-time",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"$25 Dining Credit",v:25,d:"$25/month at eligible restaurants worldwide.",cat:"dining",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"200,000 pts after $6k in 6 mo",
 earn:{d:"6x",g:"3x",gas:"3x",t:"3x",s:"3x",a:"3x",tr:"3x",p:"3x",o:"2x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"hilton-honors-amex",name:"Hilton Honors American Express Card",short:"Hilton Honors Amex",issuer:"American Express",isBiz:false,fee:0,network:"Amex",cur:"Hilton Honors Points",c1:"#162d54",c2:"#0f1f3d",
 annual:[],monthly:[],strat:[],signup:"70,000 pts after $2k in 6 mo",
 earn:{d:"5x",g:"5x",gas:"5x",t:"3x",s:"3x",a:"3x",tr:"3x",p:"3x",o:"3x"},earnNotes:{t:"7x at Hilton properties only. General travel is 3x."},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"marriott-bevy",name:"Marriott Bonvoy Bevy™ American Express® Card",short:"Marriott Bevy",issuer:"American Express",isBiz:false,fee:250,network:"Amex",cur:"Marriott Bonvoy Points",c1:"#6b1a1a",c2:"#4a1212",
 partners:["Marriott Bonvoy"],
 annual:[{n:"Free Night Award",v:200,d:"1 free night (up to 50,000 pts) after $15k annual spend.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"1,000 Pts Per Eligible Stay",v:null,d:"1,000 bonus Bonvoy points per eligible paid stay at Marriott.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"85,000 pts after $5k in 6 mo",
 earn:{d:"4x",g:"4x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── AMEX BUSINESS (EXPANDED) ──────────────────────────────────────────────────
{id:"amex-biz-cash",name:"American Express Blue Business Cash™ Card",short:"Blue Business Cash",issuer:"American Express",isBiz:true,fee:0,network:"Amex",cur:"Cash Back",c1:"#1e4096",c2:"#142b6b",
 annual:[],monthly:[],strat:[],signup:"$250 after $5k in 6 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"delta-biz-gold",name:"Delta SkyMiles® Gold Business American Express Card",short:"Delta Gold Business",issuer:"American Express",isBiz:true,fee:150,network:"Amex",cur:"Delta SkyMiles",c1:"#a30000",c2:"#720000",
 annual:[{n:"$200 Delta Flight Credit",v:200,d:"$200 Delta credit after $10k annual spend.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Free Checked Bag",v:35,d:"First checked bag free for you + up to 8 companions.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 miles after $3k in 6 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"1.5x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"delta-biz-plat",name:"Delta SkyMiles® Platinum Business American Express Card",short:"Delta Platinum Business",issuer:"American Express",isBiz:true,fee:350,network:"Amex",cur:"Delta SkyMiles",c1:"#8b0000",c2:"#5c0000",
 annual:[{n:"Annual Companion Certificate",v:350,d:"Domestic main cabin companion certificate each anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$120 Rideshare Credit",v:120,d:"$10/month for rideshare services.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Free Checked Bag",v:35,d:"First checked bag free for you + up to 8 companions.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[{n:"$10 Rideshare Credit",v:10,d:"$10/month toward rideshare.",cat:"travel",type:"credit",reset:"monthly",enroll:false,enrollUrl:"",useUrl:""}],
 strat:[],signup:"60,000 miles after $4k in 6 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"1.5x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"delta-biz-reserve",name:"Delta SkyMiles® Reserve Business American Express Card",short:"Delta Reserve Business",issuer:"American Express",isBiz:true,fee:650,network:"Amex",cur:"Delta SkyMiles",c1:"#3a0000",c2:"#1a0000",
 annual:[{n:"Delta Sky Club Access",v:null,d:"Unlimited Sky Club access when flying Delta.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Annual Companion Certificate",v:600,d:"First Class, Comfort+, or Main Cabin companion certificate annually.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 miles + 10,000 MQMs after $6k in 6 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CAPITAL ONE CONSUMER (EXPANDED) ───────────────────────────────────────────
{id:"venture-one",name:"Capital One VentureOne Rewards Credit Card",short:"VentureOne",issuer:"Capital One",isBiz:false,fee:0,network:"Visa",cur:"Capital One Miles",c1:"#a31e1e",c2:"#721414",
 partners:["Air France/KLM Flying Blue","Turkish Miles&Smiles","Avianca LifeMiles","Singapore Airlines","British Airways","Wyndham"],
 annual:[],monthly:[],strat:[],signup:"20,000 miles after $500 in 3 mo",
 earn:{d:"1.25x",g:"1.25x",gas:"1.25x",t:"5x",s:"1.25x",a:"1.25x",tr:"1.25x",p:"1.25x",o:"1.25x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"savor",name:"Capital One Savor Cash Rewards Credit Card",short:"Savor",issuer:"Capital One",isBiz:false,fee:95,network:"Mastercard",cur:"Cash Back",c1:"#5b21b6",c2:"#3b0764",
 annual:[],monthly:[],strat:[],signup:"$300 after $3k in 3 mo",
 earn:{d:"4x",g:"3x",gas:"3x",t:"1x",s:"4x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CAPITAL ONE BUSINESS (EXPANDED) ───────────────────────────────────────────
{id:"spark-miles",name:"Capital One Spark Miles for Business",short:"Spark Miles",issuer:"Capital One",isBiz:true,fee:95,network:"Visa",cur:"Capital One Miles",c1:"#881a1a",c2:"#5c1010",
 partners:["Air France/KLM Flying Blue","Turkish Miles&Smiles","Avianca LifeMiles","Singapore Airlines","British Airways","Wyndham"],
 annual:[],monthly:[],strat:[],signup:"50,000 miles after $4.5k in 3 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"5x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"spark-miles-select",name:"Capital One Spark Miles Select for Business",short:"Spark Miles Select",issuer:"Capital One",isBiz:true,fee:0,network:"Visa",cur:"Capital One Miles",c1:"#9a1818",c2:"#6b1010",
 annual:[],monthly:[],strat:[],signup:"20,000 miles after $3k in 3 mo",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"spark-cash-select",name:"Capital One Spark Cash Select for Business",short:"Spark Cash Select",issuer:"Capital One",isBiz:true,fee:0,network:"Mastercard",cur:"Cash Back",c1:"#7f1d1d",c2:"#5a1414",
 annual:[],monthly:[],strat:[],signup:"$750 after $6k in 6 mo",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"1.5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CITI CONSUMER (EXPANDED) ──────────────────────────────────────────────────
{id:"citi-rewards-plus",name:"Citi Rewards+® Card",short:"Citi Rewards+",issuer:"Citi",isBiz:false,fee:0,network:"Mastercard",cur:"Citi ThankYou Points",c1:"#1e4080",c2:"#142b5c",
 annual:[],monthly:[],strat:[],signup:"20,000 pts after $1.5k in 3 mo",
 earn:{d:"1x",g:"2x",gas:"2x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"citi-simplicity",name:"Citi Simplicity® Card",short:"Citi Simplicity",issuer:"Citi",isBiz:false,fee:0,network:"Mastercard",cur:"Cash Back",c1:"#162d5c",c2:"#0f1e3c",
 annual:[],monthly:[],strat:[],signup:"No signup bonus",
 earn:{d:"1x",g:"1x",gas:"1x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"citi-aa-exec",name:"Citi® / AAdvantage® Executive World Elite Mastercard®",short:"Citi AA Executive",issuer:"Citi",isBiz:false,fee:595,network:"Mastercard",cur:"American Airlines AAdvantage",c1:"#0050a0",c2:"#003070",
 annual:[{n:"Admirals Club Membership",v:700,d:"Full Admirals Club access — worldwide lounges for cardholder + guests.",cat:"status",type:"perk",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Global Entry/TSA PreCheck",v:120,d:"Up to $120 in Global Entry or TSA PreCheck credits.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"First Checked Bag Free",v:30,d:"First bag free for you + up to 8 companions on AA flights.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"70,000 miles after $7k in 3 mo",
 earn:{d:"4x",g:"1x",gas:"1x",t:"4x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"costco-citi",name:"Costco Anywhere Visa® Card by Citi",short:"Costco Visa",issuer:"Citi",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#005daa",c2:"#004080",
 annual:[],monthly:[],strat:[],signup:"No signup bonus",
 earn:{d:"3x",g:"2x",gas:"4x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"verified",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── BANK OF AMERICA (EXPANDED) ────────────────────────────────────────────────
{id:"boa-customized-cash",name:"Bank of America® Customized Cash Rewards Credit Card",short:"BofA Customized Cash",issuer:"Bank of America",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#8b0d20",c2:"#600915",
 annual:[],monthly:[],strat:[],isRotating:true,signup:"$200 after $1k in 90 days",
 earn:{d:"3x*",g:"2x",gas:"3x*",t:"3x*",s:"3x*",a:"3x*",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"boa-unlimited-cash",name:"Bank of America® Unlimited Cash Rewards Credit Card",short:"BofA Unlimited Cash",issuer:"Bank of America",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#a31020",c2:"#720b15",
 annual:[],monthly:[],strat:[],signup:"$200 after $1k in 90 days",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"1.5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"boa-travel",name:"Bank of America® Travel Rewards Credit Card",short:"BofA Travel Rewards",issuer:"Bank of America",isBiz:false,fee:0,network:"Visa",cur:"Points",c1:"#cc1428",c2:"#8b0d1a",
 annual:[],monthly:[],strat:[],signup:"25,000 pts ($250) after $1k in 90 days",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"3x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"alaska-biz",name:"Alaska Airlines Visa® Business Card",short:"Alaska Business Visa",issuer:"Bank of America",isBiz:true,fee:75,network:"Visa",cur:"Alaska Airlines Mileage Plan",c1:"#0a2d50",c2:"#061a30",
 annual:[{n:"Companion Fare",v:200,d:"Annual companion fare (~$99 + taxes) after $6k annual spend.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"Free Checked Bag",v:35,d:"Free first checked bag for cardholder + up to 6 guests.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"40,000 miles + companion fare after $2k in 90 days",
 earn:{d:"2x",g:"1x",gas:"1x",t:"3x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── WELLS FARGO (EXPANDED) ────────────────────────────────────────────────────
{id:"wf-active-cash",name:"Wells Fargo Active Cash® Card",short:"WF Active Cash",issuer:"Wells Fargo",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#b01c24",c2:"#7a1218",
 annual:[],monthly:[],strat:[],signup:"$200 after $500 in 3 mo",
 earn:{d:"2x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"wf-autograph-journey",name:"Wells Fargo Autograph Journey℠ Card",short:"WF Autograph Journey",issuer:"Wells Fargo",isBiz:false,fee:95,network:"Visa",cur:"Wells Fargo Rewards",c1:"#991420",c2:"#6b0d15",
 partners:["Air France/KLM Flying Blue","Avianca LifeMiles","British Airways","Aer Lingus","Choice Hotels","IHG"],
 annual:[{n:"$50 Airline Credit",v:50,d:"$50 annual statement credit toward airline purchases.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"60,000 pts after $4k in 3 mo",
 earn:{d:"3x",g:"1x",gas:"1x",t:"4x",s:"3x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"wf-reflect",name:"Wells Fargo Reflect® Card",short:"WF Reflect",issuer:"Wells Fargo",isBiz:false,fee:0,network:"Visa",cur:"Cash Back",c1:"#7a1018",c2:"#4a0a10",
 annual:[],monthly:[],strat:[],signup:"No signup bonus",
 earn:{d:"1x",g:"1x",gas:"1x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── U.S. BANK (EXPANDED) ──────────────────────────────────────────────────────
{id:"usb-altitude-go",name:"U.S. Bank Altitude® Go Visa Signature® Card",short:"US Bank Altitude Go",issuer:"U.S. Bank",isBiz:false,fee:0,network:"Visa",cur:"Points",c1:"#9a0000",c2:"#6b0000",
 annual:[{n:"$15 Streaming Credit",v:15,d:"$15 annual credit on eligible streaming services.",cat:"entertainment",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"20,000 pts ($200) after $1k in 90 days",
 earn:{d:"4x",g:"2x",gas:"2x",t:"2x",s:"2x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"usb-altitude-connect",name:"U.S. Bank Altitude® Connect Visa Signature® Card",short:"US Bank Altitude Connect",issuer:"U.S. Bank",isBiz:false,fee:95,network:"Visa",cur:"Points",c1:"#8b0000",c2:"#5c0000",
 annual:[{n:"$30 Streaming Credit",v:30,d:"$30/year toward eligible streaming services.",cat:"entertainment",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"4 Priority Pass Lounge Visits",v:120,d:"4 complimentary Priority Pass lounge visits per year.",cat:"status",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 pts after $2k in 120 days",
 earn:{d:"2x",g:"2x",gas:"4x",t:"4x",s:"2x",a:"1x",tr:"4x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"usb-biz-triple",name:"U.S. Bank Business Triple Cash Rewards World Elite Mastercard®",short:"USB Triple Cash Business",issuer:"U.S. Bank",isBiz:true,fee:0,network:"Mastercard",cur:"Cash Back",c1:"#7f0000",c2:"#500000",
 annual:[{n:"$100 Software Credit",v:100,d:"Annual $100 credit toward eligible software subscriptions.",cat:"statement",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"$500 after $4.5k in 150 days",
 earn:{d:"3x",g:"1x",gas:"3x",t:"1x",s:"1x",a:"1x",tr:"1x",p:"3x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── BARCLAYS (NEW) ────────────────────────────────────────────────────────────
{id:"jetblue-plus",name:"JetBlue Plus Card",short:"JetBlue Plus",issuer:"Barclays",isBiz:false,fee:99,network:"Mastercard",cur:"JetBlue TrueBlue Points",c1:"#003876",c2:"#001e42",
 annual:[{n:"5,000 Anniversary Bonus Points",v:75,d:"5,000 bonus points each card anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""},{n:"$100 JetBlue Vacations Credit",v:100,d:"$100 statement credit when booking JetBlue Vacations packages.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 pts after $1k in 90 days",
 earn:{d:"2x",g:"1x",gas:"1x",t:"6x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"wyndham-earner-plus",name:"Wyndham Rewards Earner® Plus Card",short:"Wyndham Earner+",issuer:"Barclays",isBiz:false,fee:75,network:"Mastercard",cur:"Wyndham Rewards Points",c1:"#1a3a5c",c2:"#0f2238",
 annual:[{n:"7,500 Anniversary Points",v:75,d:"7,500 bonus points each card anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"45,000 pts after $2k in 90 days",
 earn:{d:"2x",g:"2x",gas:"4x",t:"6x",s:"2x",a:"2x",tr:"2x",p:"2x",o:"2x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"jetblue-biz",name:"JetBlue Business Card",short:"JetBlue Business",issuer:"Barclays",isBiz:true,fee:99,network:"Mastercard",cur:"JetBlue TrueBlue Points",c1:"#002d66",c2:"#001840",
 annual:[{n:"5,000 Anniversary Bonus Points",v:75,d:"5,000 bonus points each card anniversary.",cat:"awards",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 pts after $2k in 90 days",
 earn:{d:"2x",g:"1x",gas:"1x",t:"6x",s:"1x",a:"1x",tr:"1x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── DISCOVER (EXPANDED) ───────────────────────────────────────────────────────
{id:"discover-miles",name:"Discover it® Miles",short:"Discover it Miles",issuer:"Discover",isBiz:false,fee:0,network:"Discover",cur:"Miles",c1:"#b85000",c2:"#7a3300",
 annual:[],monthly:[],strat:[],signup:"Miles match in year 1",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"1.5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"discover-student",name:"Discover it® Student Cash Back",short:"Discover Student",issuer:"Discover",isBiz:false,fee:0,network:"Discover",cur:"Cash Back",c1:"#cc5c00",c2:"#8b3d00",
 annual:[],monthly:[],strat:[],isRotating:true,signup:"Cash back match in year 1",
 earn:{d:"5x*",g:"5x*",gas:"5x*",t:"1x",s:"1x",a:"5x*",tr:"1x",p:"5x*",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
// ── CREDIT UNIONS & OTHER ISSUERS ─────────────────────────────────────────────
{id:"navyfed-more-rewards",name:"Navy Federal More Rewards American Express® Card",short:"Navy Fed More Rewards",issuer:"Navy Federal CU",isBiz:false,fee:0,network:"Amex",cur:"Rewards Points",c1:"#002b5c",c2:"#001a3c",
 annual:[],monthly:[],strat:[],signup:"$250 after $2.5k in 90 days",
 earn:{d:"3x",g:"3x",gas:"3x",t:"3x",s:"1x",a:"1x",tr:"3x",p:"1x",o:"1x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"penfed-pathfinder",name:"PenFed Pathfinder® Rewards Visa Signature® Card",short:"PenFed Pathfinder",issuer:"PenFed CU",isBiz:false,fee:95,network:"Visa",cur:"PenFed Points",c1:"#1a3a6e",c2:"#0f2244",
 annual:[{n:"$100 Airline Credit",v:100,d:"$100 annual statement credit toward airline purchases.",cat:"travel",type:"credit",reset:"annual",enroll:false,enrollUrl:"",useUrl:""}],
 monthly:[],strat:[],signup:"50,000 pts after $3k in 3 mo",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"4x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"1.5x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
{id:"paypal-cashback",name:"PayPal Cashback Mastercard®",short:"PayPal Cashback",issuer:"Synchrony",isBiz:false,fee:0,network:"Mastercard",cur:"Cash Back",c1:"#003087",c2:"#001a52",
 annual:[],monthly:[],strat:[],signup:"No signup bonus",
 earn:{d:"1.5x",g:"1.5x",gas:"1.5x",t:"1.5x",s:"1.5x",a:"1.5x",tr:"1.5x",p:"1.5x",o:"3x"},confidence:"estimated",
 retentionOffers:[],
 downgradePaths:[],
 ifYouCancel:null},
];

/* APPLICATION URLS — issuer direct apply pages */
// Affiliate application links for each card. When a user clicks 'Apply Now',
// they're taken to the issuer's application page through our affiliate tracking link.
const APPLY_URLS={
  // Chase
  "csr":              "https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve",
  "csp":              "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
  "cfu":              "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited",
  "cff":              "https://creditcards.chase.com/cash-back-credit-cards/freedom/flex",
  "hyatt":            "https://creditcards.chase.com/loyalty-credit-cards/hyatt",
  "sw-priority":      "https://creditcards.chase.com/travel-credit-cards/southwest-rapid-rewards/priority",
  "marriott-boundless":"https://creditcards.chase.com/loyalty-credit-cards/marriott-bonvoy/boundless",
  "united-explorer":  "https://creditcards.chase.com/travel-credit-cards/united/explorer",
  "aeroplan":         "https://creditcards.chase.com/travel-credit-cards/aeroplan",
  "ihg-premier":      "https://creditcards.chase.com/loyalty-credit-cards/ihg-one-rewards/premier",
  "amazon-prime":     "https://creditcards.chase.com/cash-back-credit-cards/amazon-prime-rewards",
  "ink-preferred":    "https://creditcards.chase.com/business-credit-cards/ink/preferred",
  "ink-cash":         "https://creditcards.chase.com/business-credit-cards/ink/cash",
  "ink-unlimited":    "https://creditcards.chase.com/business-credit-cards/ink/unlimited",
  "sw-biz":           "https://creditcards.chase.com/business-credit-cards/southwest",
  "united-biz":       "https://creditcards.chase.com/business-credit-cards/united/business",
  // American Express
  "amex-plat":        "https://www.americanexpress.com/us/credit-cards/card/platinum/",
  "amex-gold":        "https://www.americanexpress.com/us/credit-cards/card/gold-card/",
  "amex-bcp":         "https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/",
  "hilton-aspire":    "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-american-express-aspire-card/",
  "amex-green":       "https://www.americanexpress.com/us/credit-cards/card/green/",
  "delta-gold":       "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-gold-american-express-card/",
  "amex-bbp":         "https://www.americanexpress.com/us/credit-cards/card/blue-business-plus/",
  "hilton-surpass":   "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-american-express-surpass-card/",
  "amex-biz-plat":    "https://www.americanexpress.com/us/credit-cards/card/business-platinum/",
  "amex-biz-gold":    "https://www.americanexpress.com/us/credit-cards/card/american-express-business-gold-card/",
  "hilton-biz":       "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-american-express-business-card/",
  "marriott-biz":     "https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-business-american-express-card/",
  // Capital One
  "venture-x":        "https://www.capitalone.com/credit-cards/venture-x/",
  "venture":          "https://www.capitalone.com/credit-cards/venture/",
  "savorone":         "https://www.capitalone.com/credit-cards/savor-one-cash-rewards/",
  "quicksilver":      "https://www.capitalone.com/credit-cards/quicksilver/",
  "spark-cash-plus":  "https://www.capitalone.com/small-business/credit-cards/spark-cash-plus/",
  // Citi
  "citi-premier":     "https://www.citi.com/credit-cards/citi-strata-premier-credit-card",
  "citi-dc":          "https://www.citi.com/credit-cards/citi-double-cash-credit-card",
  "citi-custom":      "https://www.citi.com/credit-cards/citi-custom-cash-credit-card",
  "citi-aa":          "https://www.citi.com/credit-cards/citi-aadvantage-platinum-select-credit-card",
  // Wells Fargo / Bilt
  "bilt":             "https://www.biltrewards.com/card",
  "bilt-rent":        "https://www.biltrewards.com/card",
  "bilt-blue":        "https://www.biltrewards.com/card",
  "bilt-obsidian":    "https://www.biltrewards.com/card",
  "bilt-palladium":   "https://www.biltrewards.com/card",
  "wf-autograph":     "https://www.wellsfargo.com/credit-cards/autograph/",
  // Bank of America
  "boa-premium":      "https://www.bankofamerica.com/credit-cards/products/premium-rewards-credit-card/",
  "atmos-ascent":     "https://www.bankofamerica.com/credit-cards/products/alaska-airlines-credit-card/",
  "atmos-summit":     "https://www.bankofamerica.com/credit-cards/products/alaska-airlines-infinite-credit-card/",
  // U.S. Bank
  "usb-altitude-reserve":"https://www.usbank.com/credit-cards/altitude-reserve-visa-infinite-credit-card.html",
  "usb-cash-plus":    "https://www.usbank.com/credit-cards/cash-plus-visa-signature-credit-card.html",
  // Other issuers
  "apple-card":       "https://www.apple.com/apple-card/",
  "discover-it":      "https://www.discover.com/credit-cards/cash-back/",
  "fidelity":         "https://www.fidelity.com/go/visa-signature-card",
  "robinhood":        "https://robinhood.com/creditcard/",
  "robinhood-plat":   "https://robinhood.com/creditcard/platinum/",
  "disney-inspire":   "#apply-disney-inspire",
  "aviator-red":      "https://cards.barclaycardus.com/banking/cards/aadvantage-aviator-red-world-elite-mastercard/",
  // Chase consumer (expanded)
  "marriott-bold":    "https://creditcards.chase.com/loyalty-credit-cards/marriott-bonvoy/bold",
  "united-gateway":   "https://creditcards.chase.com/travel-credit-cards/united/gateway",
  "british-airways-chase":"https://creditcards.chase.com/travel-credit-cards/british-airways",
  "united-quest":     "https://creditcards.chase.com/travel-credit-cards/united/quest",
  "united-club-inf":  "https://creditcards.chase.com/travel-credit-cards/united/club-infinite",
  "sw-plus":          "https://creditcards.chase.com/travel-credit-cards/southwest-rapid-rewards/plus",
  "ihg-traveler":     "https://creditcards.chase.com/loyalty-credit-cards/ihg-one-rewards/traveler",
  // Chase business (expanded)
  "ink-biz-premier":  "https://creditcards.chase.com/business-credit-cards/ink/premier",
  "hyatt-biz":        "https://creditcards.chase.com/business-credit-cards/hyatt",
  // Amex consumer (expanded)
  "amex-bce":         "https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/",
  "amex-everyday":    "https://www.americanexpress.com/us/credit-cards/card/everyday/",
  "amex-edp":         "https://www.americanexpress.com/us/credit-cards/card/everyday-preferred/",
  "amex-cash-magnet": "https://www.americanexpress.com/us/credit-cards/card/cash-magnet/",
  "delta-blue":       "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-blue-american-express-card/",
  "delta-plat":       "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-platinum-american-express-card/",
  "delta-reserve":    "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-reserve-american-express-card/",
  "marriott-brilliant":"https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-brilliant/",
  "hilton-honors-amex":"https://www.americanexpress.com/us/credit-cards/card/hilton-honors/",
  "marriott-bevy":    "https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-bevy/",
  // Amex business (expanded)
  "amex-biz-cash":    "https://www.americanexpress.com/us/credit-cards/card/blue-business-cash/",
  "delta-biz-gold":   "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-gold-business-american-express-card/",
  "delta-biz-plat":   "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-platinum-business-american-express-card/",
  "delta-biz-reserve":"https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-reserve-business-american-express-card/",
  // Capital One consumer (expanded)
  "venture-one":      "https://www.capitalone.com/credit-cards/venture-one/",
  "savor":            "https://www.capitalone.com/credit-cards/savor-rewards/",
  // Capital One business (expanded)
  "spark-miles":      "https://www.capitalone.com/small-business/credit-cards/spark-miles/",
  "spark-miles-select":"https://www.capitalone.com/small-business/credit-cards/spark-miles-select/",
  "spark-cash-select":"https://www.capitalone.com/small-business/credit-cards/spark-cash-select/",
  // Citi (expanded)
  "citi-rewards-plus":"https://www.citi.com/credit-cards/citi-rewards-plus-credit-card",
  "citi-simplicity":  "https://www.citi.com/credit-cards/citi-simplicity-credit-card",
  "citi-aa-exec":     "https://www.citi.com/credit-cards/citi-aadvantage-executive-world-elite-mastercard-credit-card",
  "costco-citi":      "https://www.citi.com/credit-cards/costco-anywhere-visa-credit-card-by-citi",
  // Bank of America (expanded)
  "boa-customized-cash":"https://www.bankofamerica.com/credit-cards/products/cash-back-credit-card/",
  "boa-unlimited-cash":"https://www.bankofamerica.com/credit-cards/products/unlimited-cash-back-credit-card/",
  "boa-travel":       "https://www.bankofamerica.com/credit-cards/products/travel-rewards-credit-card/",
  "alaska-biz":       "https://www.bankofamerica.com/credit-cards/products/alaska-airlines-business-credit-card/",
  // Wells Fargo (expanded)
  "wf-active-cash":   "https://www.wellsfargo.com/credit-cards/active-cash/",
  "wf-autograph-journey":"https://www.wellsfargo.com/credit-cards/autograph-journey/",
  "wf-reflect":       "https://www.wellsfargo.com/credit-cards/reflect/",
  // U.S. Bank (expanded)
  "usb-altitude-go":  "https://www.usbank.com/credit-cards/altitude-go-visa-signature-credit-card.html",
  "usb-altitude-connect":"https://www.usbank.com/credit-cards/altitude-connect-visa-signature-credit-card.html",
  "usb-biz-triple":   "https://www.usbank.com/business/credit-cards/business-triple-cash-rewards-world-elite-mastercard.html",
  // Barclays
  "jetblue-plus":     "https://cards.barclaycardus.com/banking/cards/jetblue-plus-card/",
  "wyndham-earner-plus":"https://cards.barclaycardus.com/banking/cards/wyndham-rewards-earner-plus-card/",
  "jetblue-biz":      "https://cards.barclaycardus.com/banking/cards/jetblue-business-card/",
  // Discover (expanded)
  "discover-miles":   "https://www.discover.com/credit-cards/travel/",
  "discover-student": "https://www.discover.com/credit-cards/student/",
  // Credit unions & other
  "navyfed-more-rewards":"https://www.navyfederal.org/products-services/credit-cards/more-rewards-amex.html",
  "penfed-pathfinder":"https://www.penfed.org/credit-cards/pathfinder-rewards-visa",
  "paypal-cashback":  "https://www.paypal.com/us/webapps/mpp/cashback-mastercard",
};

/* STRATEGIES — with beginner fields */
// Strategies are predefined combinations of cards that work well together.
// Each strategy has a name, required cards, alternative card combos, a description, and a step-by-step playbook.
const STRATS={
"chase-trifecta":{id:"chase-trifecta",name:"Chase Trifecta",emoji:"🔱",
  req:["csr","cfu","cff"],alt:[["csp","cfu","cff"]],
  req_names:["Chase Sapphire Reserve (or Preferred)","Chase Freedom Unlimited","Chase Freedom Flex"],
  desc:"The gold standard of travel rewards. Combine a Sapphire card (for travel/dining), Freedom Flex (5x rotating categories), and Freedom Unlimited (1.5x everything) to earn on every purchase, then pool all points for airline/hotel transfers.",
  forBeginners:"Think of it like this: instead of earning 1 reward per dollar on everything, you're earning 3–5x in the categories you spend most. Then when you book travel, those points are worth 50% MORE than if you'd just saved cash — because you transfer them to airline or hotel programs that give you outsized value.",
  analogy:"It's like getting airline miles that are worth $1.50–2.00 instead of $1.00. You spend $1,000 normally, but those points buy $1,500–2,000 of flights or hotel nights when transferred correctly.",
  firstStep:"Step 1: Get Freedom Unlimited (free, no stress). Step 2: Get Freedom Flex (free, activate quarterly 5x bonus). Step 3: Add Sapphire Preferred ($95) or Reserve ($795). Step 4: Put each purchase on the card with the highest earn rate. Step 5: When booking a trip, transfer points to Hyatt or an airline for 50–100% more value than cash.",
  value:"$1,500–4,000+/year",
  play:["Dining & travel → Sapphire Reserve (3x) or Preferred (3x)","Rotating categories → Freedom Flex (5x, activate quarterly!)","Everything else → Freedom Unlimited (1.5x)","Pool ALL points to your Sapphire card first","Transfer to Hyatt for hotel awards — often worth 3–5¢/point","Transfer to Singapore Airlines for Suites, United for flights","Best hotel hack: Park Hyatt properties at 40k points vs $1,000+ cash"],
  learn:"The most common mistake: opening too many cards before Chase ones. Chase denies anyone with 5+ card applications in 24 months. Get your Chase cards FIRST, before Amex or Capital One."},
"amex-trifecta":{id:"amex-trifecta",name:"Amex Trifecta",emoji:"⚡",
  req:["amex-plat","amex-gold","amex-bbp"],alt:null,
  req_names:["Amex Platinum","Amex Gold","Amex Blue Business Plus"],
  desc:"The premium travel stack. Platinum handles 5x on flights and all the lounge/credit perks. Gold dominates dining and groceries at 4x. Blue Business Plus catches everything else at 2x — all points go into the same Membership Rewards pool.",
  forBeginners:"This is the 'frequent flyer who wants luxury travel' strategy. The Amex Platinum has a scary $895 fee, but there's $1,200+ in credits if you use them all — meaning the card literally pays you $300+ to hold it. The Gold card earns 4 points per dollar on food. The Blue Business Plus earns 2 points on literally everything else. All three use the same points currency, so you're building one big pile of flexible points.",
  analogy:"Like being a member of a travel club where your regular spending (groceries, restaurants, phone bill) automatically converts to business class flights. A $500 grocery run generates points worth $10–15 in business class tickets.",
  firstStep:"Step 1: Get Amex Gold (best for dining + groceries, $250 fee but $240 in monthly credits = $10 effective fee). Step 2: Add Blue Business Plus (free, 2x on everything). Step 3: When you're ready for premium travel, add Platinum and commit to using every credit monthly.",
  value:"$2,000–6,000+/year with full credit use",
  play:["Flights booked direct with airline → Amex Platinum (5x MR)","Dining + US supermarkets → Amex Gold (4x MR)","Everything else → Blue Business Plus (2x MR, no fee)","USE ALL Platinum credits every year: $200 airline, $200 hotel, $240 streaming, $155 Walmart+, $100 Saks","Transfer to Air France Flying Blue on their monthly Promo Award sale (30–40% off)","Book ANA First Class via Virgin Atlantic points (75k for a $25k experience)","Avianca LifeMiles for United Polaris Business: 63k vs 140k direct"],
  learn:"Amex gives each signup bonus only once per card per lifetime. Apply when there's a high offer (150k+ for Platinum). Don't apply at 80k if 150k bonuses appear regularly."},
"c1-duo":{id:"c1-duo",name:"Capital One Duo",emoji:"🦅",
  req:["venture-x"],alt:[["venture-x","savorone"]],
  req_names:["Capital One Venture X","Capital One SavorOne (no fee)"],
  desc:"Venture X for premium travel earning (10x on hotels, 5x on flights via portal) plus lounge access. SavorOne for dining and entertainment at 3x with no fee.",
  forBeginners:"Simple and clean. Venture X is basically a premium travel card that pays for itself — the $300 travel credit + 10,000 anniversary miles = $400 in value vs the $395 fee. SavorOne costs nothing and earns 3% at restaurants and grocery stores. Together they cover every major spending category without complexity.",
  analogy:"Like having two credit cards that together earn 2–10x on everything, for a total cost of $395/year — which the card refunds through credits before you even count points.",
  firstStep:"Step 1: Get SavorOne (free, no pressure). Step 2: Apply for Venture X and immediately book a hotel through the Capital One portal to start using the $300 credit. Step 3: Use Venture X for all travel, SavorOne for dining/grocery.",
  value:"$800–2,500+/year",
  play:["Hotels + rental cars → Venture X via C1 Travel portal (10x)","Flights → Venture X via C1 Travel portal (5x)","Dining, groceries, entertainment → SavorOne (3x, no fee)","Everything else → Venture X (2x)","Best transfer: Turkish Miles&Smiles for cheap United short-hop flights (7,500 miles)","Also valuable: Air France, Avianca, Singapore Airlines transfers","Use $300 travel credit first — it effectively makes the fee $95"],
  learn:"Capital One is more approval-friendly than Chase or Amex. If you're new to premium cards, Venture X is often a better starting point than Chase Sapphire Reserve."},
"citi-duo":{id:"citi-duo",name:"Citi Combo",emoji:"🌍",
  req:["citi-premier","citi-dc"],alt:null,
  req_names:["Citi Strata Premier","Citi Double Cash"],
  desc:"Strata Premier earns 3x on five major categories. Double Cash earns 2% everywhere and converts to ThankYou Points when you hold the Premier.",
  forBeginners:"Citi has one secret weapon: Qatar Airways. You can only transfer points to Qatar through Citi — and Qatar Q-Suite is rated the #1 business class in the world. So this combo is 'earn 2–3x everywhere, then convert to the world's best business class.' The Double Cash makes every dollar earn 2x transferable points for free.",
  analogy:"Like getting two flexible currencies that, when combined, can unlock a $5,000 business class flight for $700 in points.",
  firstStep:"Step 1: Get Citi Double Cash (free). Step 2: Add Citi Strata Premier ($95). Step 3: Your Double Cash rewards now automatically convert to ThankYou Points. Step 4: Save 70,000+ points for Qatar Q-Suite or Air France business class.",
  value:"$500–1,500+/year",
  play:["Dining, groceries, gas, hotels, flights → Strata Premier (3x)","Everything else → Double Cash (2% = 2x TYP with Premier)","Best transfer: Qatar Avios for Q-Suite Business Class (Citi exclusive!)","Also strong: Turkish LifeMiles (Star Alliance), Flying Blue (Air France)","Use $100 hotel credit via Citi Travel each year"],
  learn:"Citi ThankYou Points are the most underrated transferable currency. Qatar Airways partner access is Citi-exclusive — no other card program can book Q-Suite through points transfers."},
"ink-trio":{id:"ink-trio",name:"Ink Business Trio",emoji:"🖋️",
  req:["ink-preferred","ink-cash","ink-unlimited"],alt:null,
  req_names:["Ink Business Preferred","Ink Business Cash","Ink Business Unlimited"],
  desc:"The business version of the Chase Trifecta. Ink Preferred earns 3x on advertising/travel. Ink Cash earns 5x on internet/office supplies. Ink Unlimited earns 1.5x on everything. All pool to Preferred for transfer access.",
  forBeginners:"If you have a business — even freelance, side hustle, or LLC — you can get these cards. Ink Cash earns 5x on your internet bill, phone bill, and office supply stores. Ink Preferred earns 3x on Google/Facebook ads, shipping, and travel. Ink Unlimited earns 1.5x on literally everything else. All three use the same Chase Ultimate Rewards points, which transfer to Hyatt and airlines.",
  analogy:"For every $1,000 you spend on business internet/software subscriptions, you earn 5,000 Chase points worth $75 cash or $150+ in Hyatt hotel stays.",
  firstStep:"Step 1: Get Ink Cash (free, best signup bonus for a no-fee card). Step 2: Add Ink Unlimited (free, 1.5x on everything). Step 3: When your business grows, add Ink Preferred ($95) for 3x on advertising and shipping.",
  value:"$1,000–5,000+/year (scales with business)",
  play:["Internet, cable, phone, office supplies → Ink Cash (5x UR)","Digital advertising (Google, Meta) + shipping → Ink Preferred (3x)","Everything else → Ink Unlimited (1.5x)","Pool all to Ink Preferred for transfer partner access","Stack with personal Chase Trifecta for massive UR accumulation","Business cards generally DON'T count against your Chase 5/24 limit"],
  learn:"Business cards don't count against your Chase 5/24 rule in most cases. You can have multiple Ink cards simultaneously."},
"atmos-strategy":{id:"atmos-strategy",name:"Atmos Strategy",emoji:"🌊",
  req:["atmos-ascent"],alt:[["atmos-summit"]],
  req_names:["Atmos Ascent (or Summit)"],
  desc:"Atmos Rewards (Alaska + Hawaiian combined program) has one of the best award charts in the industry — especially for international premium cabin and the free stopover feature.",
  forBeginners:"Alaska Airlines (which merged with Hawaiian) runs a program called Atmos Rewards. The big deal: they partner with Japan Airlines, Cathay Pacific, Qatar Airways, and others. So your Atmos points can book amazing business class flights on those airlines — at a fraction of the cash price. AND they have a 'free stopover' feature where you can add a 14-day layover to your trip at no extra points cost.",
  analogy:"Imagine booking a flight from LA to Sydney and getting 14 days in Tokyo included for free. That's what a stopover does. You pay for one trip, you visit two cities.",
  firstStep:"Step 1: Get Atmos Ascent ($95). Step 2: Use it for all Alaska/Hawaiian flights (3x). Step 3: Accumulate 60,000–75,000 points. Step 4: Book Japan Airlines Business Class LAX→Tokyo with a stopover somewhere in Asia.",
  value:"$500–2,000+/year depending on redemptions",
  play:["All Alaska/Hawaiian purchases → Atmos card (3x)","Book JAL Business Class: 60k pts (West Coast→Tokyo) or 75k pts (East Coast→Tokyo)","Add a FREE stopover: stay in an extra city for up to 14 days at no extra point cost","Book Cathay Pacific Business LAX→HKG: 75k pts, zero fuel surcharges","Short West Coast hops: only 4,500 pts one-way (under 700 miles)","Roundtrip awards: get 2 free stopovers total (one per direction)"],
  learn:"Atmos is part of Oneworld alliance. You can mix airlines on a single award — fly JAL to Tokyo (stopover), then Cathay Pacific to your final destination. This 'open jaw with stopover' routing dramatically increases per-point value."},
};

/* STRUCTURED TIPS DB */
// The tips database. Each tip is a piece of advice about earning or redeeming points.
// Tips have a category, difficulty level, value rating, and list of relevant cards.
const TIPS_DB=[
// ── FLIGHTS ──────────────────────────────────────────────────────────────────
{id:"tip-001",title:"ANA First Class via Virgin Atlantic — $25k cabin for 75k points",section:"flights",requiresCards:["amex-plat","amex-gold"],
 body:"Transfer <strong>75,000 Amex MR to Virgin Atlantic</strong> Flying Club (1:1). Book <strong>ANA 'The Suite' First Class</strong> from the U.S. to Japan. Cash price: <strong>$15,000–25,000</strong> one-way. No fuel surcharges. ANA's 'The Suite' is a private first-class suite with sliding doors — widely considered the best first-class product flying. You cannot book it this cheaply through any other program."},
{id:"tip-002",title:"Qatar Q-Suite via Citi — world's best business class, Citi-exclusive",section:"flights",requiresCards:["citi-premier"],
 body:"Transfer <strong>~70,000 Citi TYP to Qatar Airways</strong> Avios (1:1, Citi exclusive). Book <strong>Qatar Q-Suite Business Class</strong> transatlantic. Cash price: <strong>$5,000–8,000</strong>. Qatar Q-Suite features a full private suite with doors, a double bed when flying with a partner, and the best inflight dining in business class. No other major credit card program transfers to Qatar — this is a <strong>Citi-only redemption</strong> pathway."},
{id:"tip-003",title:"Cathay Pacific Business via Atmos — zero fuel surcharges",section:"flights",requiresCards:["atmos-ascent","atmos-summit"],
 body:"Book <strong>Cathay Pacific Business Class</strong> LAX or SFO to Hong Kong for <strong>75,000 Atmos Rewards</strong> points. Cash equivalent: $3,500–5,000. Critically: <strong>zero fuel surcharges</strong>, which other programs charge $500–1,000 extra for the same flight. Cathay's Business Class (Aria Suite) features a direct-aisle seat with full lie-flat bed. Use the <strong>Atmos Summit companion award</strong> to bring a second person for just the base award."},
{id:"tip-004",title:"LifeMiles United Polaris Shortcut: 63k vs 140k points",section:"flights",requiresCards:["amex-plat","amex-gold","amex-bbp","citi-premier"],
 body:"Transfer Amex MR or Citi TYP to <strong>Avianca LifeMiles</strong> (1:1). Book <strong>United Polaris Business Class</strong> to Europe for <strong>63,000 LifeMiles</strong> one-way. The same flight through United's own program costs 140,000 miles — more than twice as many points. LifeMiles also charges no fuel surcharges on United. This is the fastest route to transatlantic business class using Amex or Citi points."},
{id:"tip-005",title:"Flying Blue Promo Awards: check every 1st of the month",section:"flights",requiresCards:[],
 body:"Air France/KLM <strong>Flying Blue</strong> releases <strong>Promo Awards</strong> every month — specific routes at 25–50% off the normal price. Transatlantic business class often drops to <strong>38,000–55,000 points</strong> (normally 87,000). Check flyingblue.com on the 1st of each month. Transfer Amex MR, Citi TYP, or Chase UR to Flying Blue (1:1) ONLY when you have a specific Promo Award booking ready. Never transfer speculatively."},
{id:"tip-006",title:"Japan Airlines Business Class: 60k Atmos points from West Coast",section:"flights",requiresCards:["atmos-ascent","atmos-summit"],
 body:"Book <strong>JAL Business Class</strong> from LAX/SFO to Tokyo for <strong>60,000 Atmos points</strong> one-way. East Coast (JFK) costs 75,000 pts. JAL's 'Sky Suite' features a fully flat bed, direct aisle access from every seat, and exceptional Japanese hospitality. Cash price: <strong>$3,500–6,000</strong>. Zero fuel surcharges. This is consistently one of the top-rated business class products in the world."},
{id:"tip-007",title:"Aer Lingus Business Class — 45k Avios transatlantic lie-flat",section:"flights",requiresCards:["csp","csr"],
 body:"Transfer <strong>45,000 Chase UR to Avios</strong> (British Airways/Aer Lingus shared program). Book <strong>Aer Lingus Business Class</strong> New York to Dublin. Full lie-flat seat, proper meal service, <strong>$1,500–2,500</strong> cash value. Aer Lingus is a Oneworld partner that often prices its own metal more cheaply than British Airways does. Dublin as a city is also a great stop before connecting to Europe."},
{id:"tip-008",title:"The Atmos Free Stopover: two cities, one award price",section:"flights",requiresCards:["atmos-ascent","atmos-summit"],
 body:"<strong>Atmos Rewards</strong> allows a <strong>FREE stopover</strong> of up to 14 days on one-way international awards. Book LAX to Sydney, but add a stopover in Tokyo. You pay the award price for LAX→Sydney, and the Tokyo leg is free. Stay in Tokyo for up to 14 days, then fly Tokyo→Sydney. Cash value of doing this separately: <strong>$2,000+</strong>. Atmos is one of the few programs still allowing free stopovers."},
{id:"tip-009",title:"The Double Stopover: four cities on one roundtrip",section:"flights",requiresCards:["atmos-ascent","atmos-summit"],
 body:"On <strong>Atmos roundtrip</strong> international awards, you get <strong>two free stopovers</strong> (one per direction). Book NYC→Seoul (stopover)→Tokyo→NYC with a return stopover in Hong Kong. Four cities. One award ticket price. With <strong>Japan Airlines and Cathay Pacific</strong> as Atmos partners, this routing is entirely bookable. Cash equivalent of visiting all four cities separately: $3,000–6,000 in flights."},
{id:"tip-010",title:"Aeroplan Open-Jaw Stopover: London + Paris on one ticket",section:"flights",requiresCards:["aeroplan"],
 body:"<strong>Aeroplan</strong> (Air Canada) allows <strong>open-jaw awards with a free stopover</strong>. Book NYC→London (stopover) then Paris→NYC as one award. Fly into London, spend time, train to Paris, fly home. All for the price of one transatlantic award. <strong>Star Alliance</strong> partners can handle this routing. Cash value of separate tickets: $400–800 more than the single award."},
{id:"tip-011",title:"Companion Pass Strategy: earn in January, use all year",section:"flights",requiresCards:["sw-priority"],
 body:"Southwest's <strong>Companion Pass</strong> lets your designated companion fly free (just taxes) on all Southwest flights for the rest of the calendar year AND all of next year. You need <strong>135,000 Rapid Rewards points</strong> in one calendar year. Strategy: Apply for a SW card in <strong>January</strong> when a 70,000–80,000 point bonus is available. Spend toward the signup bonus in January/February. You'll hit 135k early in the year and get 23 months of free companion travel."},
// ── HOTELS ───────────────────────────────────────────────────────────────────
{id:"tip-012",title:"Park Hyatt Maldives: 40k points vs $1,500/night",section:"hotels",requiresCards:["csr","csp","hyatt"],
 body:"Transfer <strong>40,000 Chase UR to World of Hyatt</strong> (1:1 ratio) and book one night at the <strong>Park Hyatt Maldives</strong> Hadahaa. Cash rate: <strong>$1,200–1,800/night</strong> for an overwater villa. Your cost: $0 beyond the points. At standard cash-out value (1.5¢/pt), those 40k points are 'worth' $600 — but you're getting $1,500+ in actual value. This is the <strong>Chase Trifecta's</strong> headline redemption."},
{id:"tip-013",title:"The Rent-to-Hyatt Pipeline: Bilt's hidden power",section:"hotels",requiresCards:["bilt","bilt-blue","bilt-obsidian","bilt-palladium"],
 body:"All <strong>Bilt cards earn on rent</strong> with no transaction fee. The Bilt 2.0 lineup (Blue, Obsidian, Palladium) uses a tiered system: spend 100% of your housing amount on non-housing purchases to earn up to <strong>1.25x on rent/mortgage</strong>. Average renter at $2,000/month = up to 30,000 Bilt points/year at 1.25x. <strong>Transfer to World of Hyatt</strong> at 1:1. 30,000 Hyatt points can cover a Category 5 Hyatt worth $400–500. You're converting mandatory housing payments into luxury hotel nights."},
{id:"tip-014",title:"Hotel Portal 10x + Loyalty Points: the double earn",section:"hotels",requiresCards:["venture-x"],
 body:"Book a hotel through <strong>Capital One Travel with Venture X</strong> (10x miles). When booking, enter your hotel loyalty number. Most hotels still credit loyalty points even on portal bookings. Result: <strong>10x C1 miles + hotel loyalty points</strong> simultaneously. On a $300 hotel night: 3,000 C1 miles ($45 value) + hotel points ($15–30 value) = effectively <strong>20% return</strong> on hotel spend."},
{id:"tip-015",title:"Bilt Palladium: $400 hotel credit via Bilt Travel",section:"hotels",requiresCards:["bilt-palladium"],
 body:"The <strong>Bilt Palladium</strong> Card includes a <strong>$400 annual hotel credit</strong> through the Bilt Travel Portal ($200 distributed semi-annually). Combined with the card's 1.25x earn rate on rent/mortgage and 2x on all other everyday purchases, Palladium cardholders can <strong>stack housing-earned Bilt Points</strong> with the hotel credit — effectively funding multiple hotel nights per year from rent payments alone."},
{id:"tip-016",title:"Always book direct for elite status and perks",section:"hotels",requiresCards:[],
 body:"Hotel loyalty status perks — <strong>free breakfast, upgrades, late checkout</strong> — only apply when <strong>booking directly</strong> through the hotel or its own loyalty program. Third-party bookings (Expedia, Hotels.com) forfeit these benefits. If you hold elite status with <strong>Hilton, Hyatt, or Marriott</strong>, always book direct. The exception: if a portal price is dramatically lower (30%+ savings), the cash savings may outweigh lost perks."},
{id:"tip-017",title:"Hilton Surpass: $180/year in dining and hotel credits",section:"hotels",requiresCards:["hilton-surpass"],
 body:"The <strong>Hilton Surpass</strong> earns <strong>$15/month in dining or hotel credit</strong> ($180/year) — more than offsetting the $150 annual fee. Use the dining credit at any eligible restaurant each month. <strong>Stack with 6x Hilton points</strong> on dining to earn points plus statement credit on the same transaction. The card pays for itself through credits alone before counting any points earned."},
// ── STACKING ─────────────────────────────────────────────────────────────────
{id:"tip-018",title:"The Triple Dip: 20%+ back on a single purchase",section:"stacking",requiresCards:["amex-plat","amex-gold"],
 body:"Stack three layers simultaneously: 1) Activate an <strong>Amex Offer</strong> (e.g., '$25 back at Nike'). 2) Click through a <strong>cashback portal</strong> (e.g., Rakuten, which earns Amex MR at 3–10%). 3) Pay with your Amex Gold (1x). Result: Amex Offer savings + portal cashback + card points = often <strong>15–25% effective return</strong>. Best categories: department stores, tech, and clothing during Amex Offer campaigns."},
{id:"tip-019",title:"Chase Freedom Flex 7.5% Return Stack",section:"stacking",requiresCards:["cff","csr"],
 body:"Earn <strong>5x UR with Freedom Flex</strong> on rotating categories. Transfer those points to a <strong>Chase Sapphire Reserve</strong>. Redeem through Chase Travel portal at 1.5¢/point. Effective return: <strong>7.5% back</strong>. On a $500 grocery spend during Q1, that's $37.50 in effective travel value from one card purchase. No travel card with an annual fee consistently beats this on a per-dollar basis."},
{id:"tip-020",title:"The Citi Double Cash Upgrade: free card to transferable points",section:"stacking",requiresCards:["citi-dc","citi-premier"],
 body:"The <strong>Citi Double Cash</strong> earns 2% cash back everywhere for free. When you also hold the <strong>Citi Strata Premier</strong> ($95), your Double Cash rewards automatically <strong>convert to ThankYou Points</strong> instead of cash — unlocking access to Qatar Airways, Air France, and other premium airline partners. Your no-fee flat-rate card becomes <strong>2x transferable points</strong> on every purchase. Most people don't realize this conversion happens automatically."},
{id:"tip-021",title:"Bilt Rent Day: boosted earning on the 1st of every month",section:"stacking",requiresCards:["bilt","bilt-blue","bilt-obsidian","bilt-palladium"],
 body:"Every 1st of the month ('<strong>Rent Day</strong>'), Bilt runs <strong>bonus point promotions</strong> with boosted earn rates on categories like dining, travel, and everyday spend. Exact bonuses rotate monthly — check the Bilt app to see what's offered and <strong>opt in before the 1st</strong>. Rent Day also typically features a <strong>transfer bonus</strong> to one airline/hotel partner (25-125% bonus depending on your Bilt status tier). Stack your biggest purchases on Rent Day for maximum points. The promo runs 12:00 AM ET to 11:59 PM PT — about 27 hours."},
{id:"tip-022",title:"The Multiple Custom Cash Play: auto-optimize multiple categories",section:"stacking",requiresCards:["citi-custom"],
 body:"Citi allows <strong>multiple Custom Cash cards</strong>. Each card automatically earns <strong>5% on whichever single category</strong> you spend the most in that billing cycle (up to $500/month per card). Get two cards: one self-selects 5% on dining, the other on gas — with zero management required. Add a third and cover streaming. This is the most <strong>automated cash back optimization</strong> strategy available — no category activation, no tracking."},
{id:"tip-023",title:"Transfer Bonus Waiting: never transfer until you have to",section:"stacking",requiresCards:[],
 body:"Amex, Chase, and Capital One periodically run <strong>30–40% transfer bonuses</strong> to specific partners (e.g., 'Transfer to Singapore Airlines and get 40% more miles'). If you transfer points speculatively now and a bonus appears next month, you miss the extra 40%. <strong>Keep points in your bank</strong> until you have a specific redemption booked, then transfer. If a bonus is active for your target partner, it's free money — <strong>always check before transferring</strong>."},
{id:"tip-024",title:"Bilt Obsidian: pick dining or groceries for 3x",section:"stacking",requiresCards:["bilt-obsidian"],
 body:"The <strong>Bilt Obsidian</strong> lets you choose one bonus category annually: <strong>3x on dining OR 3x on groceries</strong> (grocery capped at $25K/year). If you already hold a strong dining card like the <strong>Amex Gold</strong> (4x dining), pick groceries on the Obsidian. If groceries are covered, pick dining. Stack the Obsidian with other Bilt cards — use Blue or Palladium for non-bonus categories and Obsidian for your chosen 3x category."},
// ── OTHER ────────────────────────────────────────────────────────────────────
{id:"tip-025",title:"Chase 5/24: the rule that costs most people $1,000+",section:"other",requiresCards:[],
 body:"Chase automatically denies most applications if you've opened <strong>5+ credit cards in 24 months</strong> from ANY bank. Amex, Capital One, Citi cards all count. Chase's best cards (<strong>Sapphire Reserve, Sapphire Preferred</strong>, all Ink cards) require you to be under 5/24. Strategy: <strong>Get ALL Chase cards first</strong>, then diversify to other issuers. Most people do this backwards and lose access to Chase's best products permanently."},
{id:"tip-026",title:"Amex Platinum Break-Even Math: the card pays you $200",section:"other",requiresCards:["amex-plat"],
 body:"Most people see the <strong>$895 Amex Platinum</strong> fee and stop. The math: $200 airline credit + $600 hotel credit + $400 Resy dining + $300 lululemon + $300 Equinox + $300 streaming + $200 Uber Cash + $200 Oura Ring = <strong>$2,500+ in credits</strong>. Subtract the $895 fee = <strong>+$1,600 net positive</strong> before counting a single point. Add Centurion Lounges, Priority Pass, and 5x on flights, and the card is one of the strongest value propositions in premium credit cards — for people who actually use the credits."},
{id:"tip-027",title:"The P2 Strategy: double your points without doubling spend",section:"other",requiresCards:[],
 body:"'<strong>Player 2</strong>' (P2) refers to a spouse or domestic partner. When P2 applies for the same cards independently, your household earns <strong>two signup bonuses</strong> — often 120,000–160,000 points combined — without any additional total spending. P2 gets their own card, earns their own bonus. Both transfer to the same loyalty accounts (most programs allow <strong>household pooling</strong>). Couples who maximize P2 strategy often earn <strong>400,000–600,000 points/year</strong>."},
{id:"tip-028",title:"Amex Once-Per-Lifetime: apply at the highest bonus",section:"other",requiresCards:["amex-plat","amex-gold"],
 body:"Amex welcome bonuses are typically only available <strong>once per card per lifetime</strong>. If you apply for the Platinum at the baseline 80,000 offer, you forfeit the ability to earn <strong>150,000+ points</strong> when a higher offer appears. Strategy: Use <strong>CardMatch.com</strong> (free tool) to check for targeted elevated offers before applying. Also check during Q4 (October–December) when Amex historically runs the highest new card promotions."},
{id:"tip-029",title:"Freedom Flex Quarterly Activation: never miss the deadline",section:"other",requiresCards:["cff"],
 body:"<strong>Chase Freedom Flex</strong> earns 5x on rotating categories that change each quarter — but you <strong>MUST manually activate</strong>. If you don't activate, you earn only 1x. Missing one quarter on a $2,000 category spend costs you <strong>8,000 points (~$120)</strong> in value. Activate at chase.com/freedom or Chase app. Set four annual calendar reminders: January 1, April 1, July 1, October 1. Takes 30 seconds."},
{id:"tip-030",title:"Bilt Blue: earn on rent for free with no annual fee",section:"other",requiresCards:["bilt-blue"],
 body:"The <strong>Bilt Blue Card</strong> earns up to <strong>1.25x on rent/mortgage</strong> with zero annual fee and no transaction fee — making it the only no-cost way to earn <strong>transferable points on housing</strong> payments. The tiered system rewards non-housing spend: spend 100% of your housing payment on non-housing purchases to unlock the full 1.25x rate. Even at the base tier, you're earning points on a bill that normally earns nothing."},
{id:"tip-031",title:"Annual fee math: when to keep vs cancel a card",section:"other",requiresCards:[],
 body:"Before canceling an annual fee card, calculate the <strong>net value: credits + points − fee</strong>. If the card provides airline credits, hotel credits, or lounge access you actually use, it may be worth keeping. If you're not using the benefits, call the issuer and ask for a <strong>retention offer</strong> — many banks offer statement credits or bonus points to keep you. Always <strong>downgrade to a no-fee version</strong> if available instead of closing (preserves credit history)."},
// ── NEW FLIGHTS ──────────────────────────────────────────────────────────────
{id:"tip-032",title:"Turkish Miles&Smiles for United Polaris at ~45k miles",section:"flights",requiresCards:[],
 body:"<strong>Turkish Miles&Smiles</strong> prices <strong>United Polaris Business Class</strong> transatlantic at roughly <strong>45,000 miles</strong> each way — while United's own MileagePlus program charges 88,000 miles for the identical seat. Both Amex MR and Citi TYP transfer 1:1 to Turkish. The trick: search on United.com for saver availability first, then book through Turkish's site or call center. Same lie-flat bed, same Polaris lounge access, half the miles."},
{id:"tip-033",title:"Avianca LifeMiles 140% transfer bonuses make United even cheaper",section:"flights",requiresCards:[],
 body:"<strong>LifeMiles</strong> charges ~63,000 miles for United Polaris business transatlantic — already cheaper than United's own 88k price. But LifeMiles frequently runs <strong>100–140% transfer bonuses</strong> from Amex/Citi. During a 140% bonus, 45k Amex MR becomes <strong>108k LifeMiles</strong> — enough for nearly two transatlantic business class flights. <strong>Stack the transfer bonus</strong> with a sale to get absurd per-point value."},
{id:"tip-034",title:"Two one-ways beat roundtrips for award availability",section:"flights",requiresCards:[],
 body:"Airline award search engines often hide availability when searching roundtrip — they try to match both legs and fail. <strong>Search two separate one-ways</strong> instead. You'll frequently find business class saver space on the outbound that disappears in a roundtrip search. Bonus: one-way awards let you <strong>mix programs</strong> (fly out on ANA via <strong>Virgin Atlantic</strong> miles, return on Qatar via <strong>Citi ThankYou Points</strong>) for maximum flexibility."},
{id:"tip-035",title:"Iberia Avios for AA transatlantic business — distance-based pricing",section:"flights",requiresCards:[],
 body:"<strong>Iberia Avios</strong> prices American Airlines flights by distance, not zone. London–Madrid on AA metal can be <strong>34,000 Avios</strong> each way in business — AA's own program charges 57,500 miles for the same seat. <strong>Chase UR, Amex MR, and Citi TYP</strong> all transfer to Iberia (via British Airways Avios, which share the same currency). Key: search availability on aa.com first, then call Iberia to book with Avios."},
{id:"tip-036",title:"AA charges zero close-in booking fees on awards",section:"flights",requiresCards:[],
 body:"United charges $75 and Delta charges variable premiums for booking award tickets within 21 days of departure. <strong>American Airlines charges nothing</strong> — zero close-in booking fee, ever. This makes <strong>last-minute premium cabin awards</strong> uniquely valuable on AA metal. If business class space opens up 3 days before departure (which happens often on transatlantic routes), you can grab it at the <strong>standard saver rate</strong> with no penalty."},
{id:"tip-037",title:"Positioning flights unlock premium award space",section:"flights",requiresCards:[],
 body:"Premium cabin award availability often exists only from <strong>major hubs</strong> (JFK, LAX, ORD, SFO). If you live in a smaller city, paying <strong>$100–200 for a positioning flight</strong> to a hub can unlock a $5,000–15,000 business class award that doesn't originate at your home airport. Think of it as an access fee: $150 cash to unlock $10,000 in value. <strong>Search from multiple origin cities</strong>, not just yours."},
{id:"tip-038",title:"Bilt Rent Day: stack all planned purchases on the 1st",section:"flights",requiresCards:["bilt-obsidian","bilt-palladium"],
 body:"On the 1st of every month, <strong>Bilt doubles earn rates</strong> on all non-rent purchases. The <strong>Bilt Palladium</strong> goes from 3x dining to 6x, and 2x everywhere else to 4x. Stack all your planned Amazon orders, subscription renewals, and dining on the 1st. A household spending $3,000/month in non-rent purchases earns <strong>12,000 Bilt points on Rent Day</strong> vs 6,000 on any other day. Transfer those doubled points to Hyatt, United, or any of Bilt's 9 airline partners."},
// ── NEW HOTELS ───────────────────────────────────────────────────────────────
{id:"tip-039",title:"Hyatt Cash + Points: half the points, fraction of the cash",section:"hotels",requiresCards:[],
 body:"<strong>World of Hyatt's Cash + Points</strong> option uses roughly half the points of a full award plus a small cash co-pay. A Category 5 property (normally 20,000 points/night) often goes for <strong>7,500 points + ~$75 cash</strong>. On a $350/night hotel, you're getting $275 in value from 7,500 points (<strong>3.7¢/pt</strong>) — far better than the standard 1.5–2¢/pt cash-out. This option is hidden in the booking flow; select 'Points + Cash' on the Hyatt website."},
{id:"tip-040",title:"Small Luxury Hotels bookable with Hyatt points",section:"hotels",requiresCards:[],
 body:"<strong>World of Hyatt</strong>'s partnership with <strong>Small Luxury Hotels (SLH)</strong> means hundreds of boutique luxury properties — think converted villas in Santorini, jungle lodges in Costa Rica — are bookable at standard Hyatt award rates. Most people think Hyatt only means Park Hyatt and Grand Hyatt. Search 'SLH' on Hyatt.com to find properties that don't appear on the main map. Some of these $500–800/night boutique hotels price at <strong>Category 4–5 (15–20k points)</strong>."},
{id:"tip-041",title:"IHG Platinum can fast-track to Marriott Gold via status challenge",section:"hotels",requiresCards:["ihg-premier"],
 body:"The <strong>IHG Premier</strong> card gives automatic IHG Platinum Elite status. <strong>Marriott</strong> periodically runs <strong>status challenges</strong> where you can leverage existing hotel status from a competitor. Match your IHG Platinum to start a Marriott challenge — typically requiring 8–15 nights in 90 days to lock in <strong>Marriott Gold Elite</strong>. Gold unlocks free breakfast at select brands, room upgrades, and late checkout. One card's complimentary status bootstraps elite perks across two hotel chains."},
{id:"tip-042",title:"Amex FHR stacks with Platinum hotel credit",section:"hotels",requiresCards:["amex-plat"],
 body:"Book a <strong>Fine Hotels + Resorts</strong> property through Amex Travel with the <strong>Platinum card</strong>. You receive FHR benefits: complimentary breakfast, <strong>$100 property credit</strong>, room upgrade when available, guaranteed late checkout, and early check-in when available. Your $200 annual Platinum hotel credit (for FHR/Hotel Collection bookings) also applies to the same transaction. On a $400/night stay, you're getting <strong>$300+ in stacked benefits</strong> on top of the room."},
{id:"tip-043",title:"Marriott fifth night free compounds on long stays",section:"hotels",requiresCards:[],
 body:"<strong>Marriott's fifth night free</strong> on award stays means a 5-night stay costs only 4 nights of points — a <strong>20% discount</strong>. But this compounds: a 10-night stay gets nights 5 AND 10 free (pay 8 nights of points for 10 nights). On a Category 6 property at 50k/night, a 10-night stay costs 400k instead of 500k — saving <strong>100,000 points</strong>. Plan longer stays in multiples of 5 to maximize this. Hyatt and Hilton also offer this, but Marriott's high nightly point costs make the savings most dramatic."},
{id:"tip-044",title:"Bilt Travel Portal: stack hotel credit with point transfers",section:"hotels",requiresCards:["bilt-obsidian","bilt-palladium"],
 body:"<strong>Bilt Obsidian and Palladium</strong> cards include semi-annual hotel credits usable in the Bilt Travel Portal. But you can also <strong>transfer Bilt Points 1:1 to Hyatt</strong>, IHG, or other hotel partners. The optimal play: use your Bilt Travel Portal credit for incidental hotel costs or short stays, then transfer your accumulated Bilt Points to Hyatt for <strong>high-value award stays</strong>. Two separate pools of hotel value from one card ecosystem."},
{id:"tip-045",title:"Park Hyatt Tokyo for 25k points — Lost in Translation for free",section:"hotels",requiresCards:[],
 body:"The <strong>Park Hyatt Tokyo</strong> — made famous as the hotel in Lost in Translation — is one of the world's most iconic luxury properties. It prices at Hyatt Category 6: <strong>25,000 points/night</strong> standard, 29,000 peak. Cash rates run $500–800/night. For context, 25,000 Hyatt points is equivalent to what a domestic Marriott Courtyard costs in Bonvoy points. <strong>Transfer 25,000 Chase UR to Hyatt</strong> and stay at one of the best hotels on Earth."},
// ── NEW STACKING ─────────────────────────────────────────────────────────────
{id:"tip-046",title:"Rakuten + card offer + category bonus = triple stack on online shopping",section:"stacking",requiresCards:[],
 body:"When shopping online: 1) Click through <strong>Rakuten</strong> (2–10% back as cash or Amex MR). 2) Check for a matching <strong>Chase Offer or Amex Offer</strong> on the specific merchant ($10–$50 back). 3) Pay with a card earning bonus in that category. All three rewards <strong>stack on a single transaction</strong>. On a $200 Nike purchase: Rakuten 8% ($16) + Amex Offer ($20 back) + card points (~$4) = <strong>$40 back on $200</strong>. This works at hundreds of online merchants."},
{id:"tip-047",title:"Dining reservation apps add a fourth reward layer",section:"stacking",requiresCards:[],
 body:"Apps like <strong>Seated, Resy, or OpenTable</strong> pay bonus rewards just for making a reservation and dining. Book through the app, then pay with a <strong>4x dining card (Amex Gold)</strong> while an Amex dining Offer is active. You earn: 1) Reservation app reward, 2) Card dining category points, 3) Amex Offer statement credit. <strong>Three separate reward streams</strong> on one restaurant bill. Seated in particular pays $5–30 per qualifying reservation in gift cards."},
{id:"tip-048",title:"Chase household point pooling doubles your redemption power",section:"stacking",requiresCards:["csr"],
 body:"Chase allows instant, free <strong>point transfers between household members</strong>' Ultimate Rewards accounts. Two people each running CFU + CFF can pool all points into one person's <strong>Sapphire Reserve</strong> account for 1.5¢/pt portal redemptions or transfer partner access. Without pooling, those CFU/CFF points are stuck at 1¢/pt cash back. This effectively <strong>doubles the value</strong> of a household's Chase earn without any extra spending."},
{id:"tip-049",title:"Ibotta + grocery card + issuer offer = four rewards on one grocery run",section:"stacking",requiresCards:[],
 body:"Before each grocery trip: 1) Activate <strong>Ibotta</strong> rebates on specific products you're buying. 2) Check for a matching Amex/Chase grocery Offer. 3) Use your grocery store's own loyalty card for in-store pricing. 4) Pay with a <strong>4x grocery card (Amex Gold)</strong> or 6x Amex BCP. <strong>Four separate reward streams</strong> on one transaction. Ibotta alone typically yields <strong>$5–15/month</strong> on normal grocery purchases without buying anything you wouldn't already buy."},
{id:"tip-050",title:"Amex Business Platinum 35% airline rebate: 1.54x effective multiplier",section:"stacking",requiresCards:["amex-biz-plat"],
 body:"The <strong>Amex Business Platinum</strong> offers a <strong>35% points rebate</strong> when you use Pay with Points on Amex Travel for your selected airline. Book a $1,000 flight using 100,000 MR points and get 35,000 back — your 100k effectively bought $1,000 in flights for a net cost of 65k points. That's <strong>1.54¢/pt</strong>, which sometimes beats even the best transfer partner redemptions. Especially useful for domestic flights where transfer partner sweet spots are less dramatic."},
// ── NEW OTHER ────────────────────────────────────────────────────────────────
{id:"tip-051",title:"CardMatch in incognito for elevated targeted offers",section:"other",requiresCards:[],
 body:"The publicly advertised welcome bonus is rarely the best available. Visit <strong>cardmatch.com in incognito</strong> with no cookies — issuers serve targeted offers that are often <strong>25–50% higher</strong> than the public rate. The <strong>Amex Platinum</strong> sometimes shows 150,000 points vs the standard 80,000. The Amex Gold shows 90,000 vs 60,000. Check both logged-in and incognito results. These elevated offers can mean thousands of dollars in additional value."},
{id:"tip-052",title:"Retention offers: call before canceling any annual fee card",section:"other",requiresCards:[],
 body:"Before canceling any card with an annual fee, <strong>call the number on the back</strong> and say you're considering closing it because you're not getting enough value. Issuers frequently offer <strong>retention bonuses</strong>: 10,000–30,000 bonus points, $50–150 statement credits, or annual fee waivers. <strong>Amex</strong> is particularly generous — many cardholders receive <strong>$200–300 in retention offers</strong> on the Platinum alone. These offers are never advertised and only available by calling."},
{id:"tip-053",title:"The Chase 48-month Sapphire rule — not 24 months",section:"other",requiresCards:[],
 body:"Chase's Sapphire welcome bonus restriction is <strong>48 months from when you RECEIVED</strong> the last Sapphire bonus, not 24 months from the application date. Most people miscalculate this by looking at when they applied or when the card was approved. Check your old statements for the <strong>exact date the bonus posted</strong>. You can hold a Sapphire card and not be eligible for a new bonus if it hasn't been <strong>48 months</strong> since the last one posted."},
{id:"tip-054",title:"Amex 'No Lifetime Language' on some cards",section:"other",requiresCards:[],
 body:"Amex's standard policy is once-per-lifetime welcome bonuses. But some Amex cards periodically <strong>drop the lifetime restriction</strong> — the application page will say 'welcome offer not available to applicants who have or have had this Card' when the restriction IS active, and omit that language when it's not. If you held a card 7+ years ago and closed it, <strong>check the application page</strong> carefully. When the <strong>lifetime language is absent</strong>, you may be eligible for the full bonus again."},
{id:"tip-055",title:"Credit limit reallocation avoids hard pulls",section:"other",requiresCards:[],
 body:"Need a higher limit on one card? Instead of requesting an increase (which triggers a hard pull at most issuers), call and ask to <strong>move credit between cards</strong> at the same bank. <strong>Chase, Citi, and Amex</strong> typically do this with a <strong>soft pull or no inquiry</strong> at all. Move $5,000 from a card you don't use much to your primary card. Your total credit stays the same, your utilization ratio improves on the card you use most, and your credit report shows zero new inquiries."},
{id:"tip-056",title:"Product change preserves credit history and 5/24 slot",section:"other",requiresCards:[],
 body:"Instead of canceling a card you no longer want, call the issuer and request a <strong>product change (PC)</strong> to a no-fee version. <strong>Chase Sapphire Reserve</strong> can PC to a Freedom Flex or Freedom Unlimited. Amex Platinum can't PC (charge card), but Amex Green can PC to a no-fee card. The original account age stays on your credit report, the <strong>5/24 slot doesn't reopen</strong>, your credit limit is preserved, and you pay zero annual fee going forward."},
{id:"tip-057",title:"Authorized users count toward your minimum spend",section:"other",requiresCards:[],
 body:"Add a trusted person as an <strong>authorized user</strong> on a new card. Their purchases <strong>count toward YOUR minimum spend</strong> — the issuer doesn't distinguish between primary and authorized user transactions. If you need to hit <strong>$4,000 in 3 months</strong> and normally spend $2,000, an authorized user's regular spending can cover the gap without either person changing their habits. Most issuers charge $0–75 for authorized users."},
{id:"tip-058",title:"Time new applications before large planned purchases",section:"other",requiresCards:[],
 body:"Apply for a new card <strong>1–2 weeks before a large expense</strong>: new appliance, home repair, insurance premium, or tax payment. A single $3,000 purchase can satisfy 75% of a $4,000 minimum spend requirement on its own. Plan applications around annual insurance renewals, <strong>quarterly estimated taxes</strong> (via pay1040.com for a small fee), or any planned large purchase. The welcome bonus alone is often worth <strong>$750–1,500 in travel value</strong>."},
];

/* ROTATING CATEGORIES */
// Current quarter's rotating bonus categories for cards like Chase Freedom Flex and Discover it.
// Updated each quarter with new categories, earn rates, and activation deadlines.
const ROTATING_Q1=[
  {card:"Chase Freedom Flex",id:"cff",q:"Q1 2026",cats:"Dining, American Heart Association, Norwegian Cruise Line",rate:"5x",note:"Activate at chase.com/freedom — deadline 3/14/26",verified:true},
  {card:"Chase Freedom Flex",id:"cff",q:"Q2 2026",cats:"Amazon, Chase Travel, Whole Foods, Feeding America",rate:"5x",note:"Activate at chase.com/freedom — deadline 6/14/26",verified:true},
  {card:"Discover it Cash Back",id:"discover-it",q:"Q1 2026",cats:"Grocery Stores, Wholesale Clubs & Select Streaming",rate:"5%",note:"Activate at discover.com — deadline 3/14/26",verified:true},
  {card:"Discover it Cash Back",id:"discover-it",q:"Q2 2026",cats:"Restaurants, Home Improvement Stores",rate:"5%",note:"Activate at discover.com — activation window is the full quarter (Apr 1–Jun 30). NOT retroactive to Apr 1; you earn 5% only from the day you activate forward.",verified:true},
  {card:"U.S. Bank Cash+",id:"usb-cash-plus",q:"Quarterly — you choose",cats:"Pick 2: Fast Food, Cell Phones, Streaming, Utilities, Dept Stores, Electronics, Gym, Furniture",rate:"5%",note:"Select categories at usbank.com each quarter",verified:true},
];

/* CATEGORIES */
// The 9 standard spending categories used to compare card earn rates.
// Keys are short codes (d=dining, g=groceries, etc.) mapped to display labels and icons.
const BASIC_CATS=[
  {id:"d",label:"Restaurants",sub:"Dining & cafes",icon:"🍽️",color:"#ef4444",bg:"rgba(239,68,68,.12)",
    note:"Includes restaurants, cafes, bars, fast food, and delivery apps (DoorDash, Uber Eats, Grubhub). Does NOT include grocery stores, warehouse clubs (Costco), or some stadium/airport vendors."},
  {id:"g",label:"Groceries",sub:"Supermarkets",icon:"🛒",color:"#22c55e",bg:"rgba(34,197,94,.12)",
    note:"Supermarkets and grocery chains only. Walmart and Target code as 'superstores,' Costco as 'wholesale club,' and convenience stores often code differently. Online grocery delivery varies by merchant code."},
  {id:"gas",label:"Gas Stations",sub:"Fuel & EV",icon:"⛽",color:"#f59e0b",bg:"rgba(245,158,11,.12)",
    note:"Gas station pumps and in-store purchases. Tesla Superchargers code as 'automotive services,' Costco fuel as 'wholesale club,' and some truck stops may code differently."},
  {id:"t",label:"Travel",sub:"Flights & hotels",icon:"✈️",color:"#38bdf8",bg:"rgba(56,189,248,.12)",
    note:"Flights, hotels, rental cars, trains, taxis, rideshare, parking, and tolls. Cruises usually code as 'other' or 'travel agencies.' Airbnb/VRBO often code as 'other,' not hotels. Portal rates may differ — see below."},
  {id:"s",label:"Streaming",sub:"Subscriptions",icon:"📺",color:"#8b5cf6",bg:"rgba(139,92,246,.12)",
    note:"Eligible services vary by card. Most include Netflix, Hulu, Disney+, Spotify, and Apple Music. Some also cover cloud storage, audiobooks, and gaming subscriptions. Check your card's terms for the full list."},
  {id:"a",label:"Amazon",sub:"Online shopping",icon:"📦",color:"#f97316",bg:"rgba(249,115,22,.12)",
    note:"Amazon.com and Amazon Fresh purchases. Whole Foods in-store may code separately as groceries on some cards. Third-party sellers on Amazon still earn the Amazon rate."},
  {id:"tr",label:"Rideshare",sub:"Uber, Lyft, transit",icon:"🚗",color:"#10b981",bg:"rgba(16,185,129,.12)",
    note:"Uber and Lyft rides. Some cards also include subway, bus, commuter rail, and ferries. Parking garages vary — some code as transit, others as 'other.' Taxis usually count."},
  {id:"p",label:"Pharmacy",sub:"CVS, Walgreens",icon:"💊",color:"#ec4899",bg:"rgba(236,72,153,.12)",
    note:"Drugstores like CVS, Walgreens, and Rite Aid. Prescriptions filled at grocery store pharmacies usually code under groceries, not pharmacy."},
  {id:"o",label:"Everything Else",sub:"Catch-all",icon:"💳",color:"#94a3b8",bg:"rgba(148,163,184,.12)",
    note:"Any purchase that doesn't match a bonus category. Cruises, Airbnb, VRBO, and many online services often land here. This is where a strong base rate (2x) matters most."},
];
// Brand-specific spending categories for co-branded cards (e.g., Hyatt stays, Delta flights).
// These earn bonus rates only on purchases with that specific brand.
const SPECIAL_CATS=[
  {id:"hyatt",label:"Hyatt Hotels",sub:"World of Hyatt",icon:"🏨",color:"#7c3aed",bg:"rgba(124,58,237,.12)",cardId:"hyatt",rate:"9x"},
  {id:"delta",label:"Delta Airlines",sub:"SkyMiles",icon:"✈",color:"#c8000a",bg:"rgba(200,0,10,.12)",cardId:"delta-gold",rate:"2x"},
  {id:"sw",label:"Southwest",sub:"Rapid Rewards",icon:"🔵",color:"#304CB2",bg:"rgba(48,76,178,.12)",cardId:"sw-priority",rate:"3x"},
  {id:"united",label:"United Airlines",sub:"MileagePlus",icon:"🔷",color:"#002244",bg:"rgba(0,34,68,.12)",cardId:"united-explorer",rate:"2x"},
  {id:"hilton",label:"Hilton Hotels",sub:"Honors",icon:"🏩",color:"#1a3a6e",bg:"rgba(26,58,110,.12)",cardId:"hilton-aspire",rate:"14x"},
  {id:"marriott",label:"Marriott Hotels",sub:"Bonvoy",icon:"🏪",color:"#8B1A1A",bg:"rgba(139,26,26,.12)",cardId:"marriott-boundless",rate:"6x"},
  {id:"alaska",label:"Alaska/Atmos",sub:"Atmos Rewards",icon:"🌊",color:"#0d3d6e",bg:"rgba(13,61,110,.12)",cardId:"atmos-ascent",rate:"3x"},
  {id:"aa",label:"American Airlines",sub:"AAdvantage",icon:"🔴",color:"#0078d2",bg:"rgba(0,120,210,.12)",cardId:"citi-aa",rate:"2x"},
  {id:"amazon",label:"Amazon.com",sub:"Prime members",icon:"📦",color:"#ff9900",bg:"rgba(255,153,0,.12)",cardId:"amazon-prime",rate:"5%"},
  {id:"rent",label:"Rent Payments",sub:"Bilt cards",icon:"🏠",color:"#10b981",bg:"rgba(16,185,129,.12)",cardId:"bilt-palladium",rate:"1.25x"},
  {id:"ihg",label:"IHG Hotels",sub:"4th Night Free",icon:"🌿",color:"#006747",bg:"rgba(0,103,71,.12)",cardId:"ihg-premier",rate:"26x"},
];
// For each spending category, lists which cards earn the most points, ranked best to worst.
// Used by the 'Use Card' tab to show the optimal card for each purchase type.
const EARN_PRIORITY={
  d:["amex-gold","amex-biz-gold","csr","csp","bilt-palladium","bilt-obsidian","cff","cfu","citi-premier","wf-autograph","savorone","venture-x","venture","hilton-aspire","hilton-surpass","hilton-biz","marriott-bevy","marriott-biz","delta-gold"],
  g:["amex-bcp","hilton-surpass","hilton-biz","hilton-honors-amex","amex-gold","marriott-bevy","marriott-boundless","citi-premier","savorone","hilton-aspire","delta-gold","bilt-palladium"],
  gas:["hilton-surpass","hilton-biz","hilton-honors-amex","costco-citi","amex-bcp","citi-premier","wf-autograph","marriott-boundless","hilton-aspire","bilt-palladium"],
  t:["amex-plat","amex-biz-plat","venture-x","spark-miles","csr","csp","citi-premier","ink-preferred","bilt-obsidian","bilt-palladium","united-explorer","aeroplan","atmos-ascent","atmos-summit","delta-gold","sw-priority"],
  s:["amex-bcp","csp","bilt-palladium","wf-autograph","savorone"],
  a:["amazon-prime","discover-it","bilt-palladium","usb-cash-plus"],
  tr:["csr","amex-gold","amex-green","wf-autograph","bilt-palladium","amazon-prime","cfu","savorone","bilt"],
  p:["cfu","cff","bilt-palladium","apple-card"],
  o:["amex-bbp","robinhood","bilt-palladium","venture-x","venture","citi-dc","wf-active-cash","fidelity","cfu"],
};
/* ISSUER PHONE NUMBERS — for retention call scripts */
const ISSUER_PHONES={
  "Chase":"1-800-432-3117",
  "American Express":"1-800-528-4800",
  "Citi":"1-800-950-5114",
  "Capital One":"1-800-227-4825",
  "Bank of America":"1-800-732-9194",
  "Barclays":"1-877-523-0478",
  "U.S. Bank":"1-800-285-8585",
  "Wells Fargo":"1-800-869-3557",
  "Discover":"1-800-347-2683",
  "Bilt":"1-833-810-2458",
  "Bilt / Column N.A.":"1-833-810-2458",
  "Cardless":"1-833-810-2458",
  "Hilton":"1-800-528-4800",
  "Delta":"1-800-528-4800",
  "Marriott":"1-800-432-3117",
  "IHG":"1-800-432-3117",
  "Hyatt":"1-800-432-3117",
  "Southwest":"1-800-432-3117",
  "United":"1-800-432-3117",
  "Goldman Sachs":"1-877-255-5923",
  "Synchrony":"1-866-419-4096",
  "Navy Federal CU":"1-888-842-6328",
  "PenFed CU":"1-800-247-5626",
  "Elan Financial":"1-800-558-3424",
  "Coastal Community Bank":"1-800-347-2683",
};

/* RETENTION SCRIPT — universal template for calling to request a retention offer */
const RETENTION_SCRIPT="Hi, I'm calling about my [CARD_NAME]. My annual fee is coming up and I'm considering whether to keep the card. I've enjoyed being a cardholder, but I want to make sure I'm getting good value for the fee. Is there anything you can offer — like a statement credit or bonus points — that might help me decide to keep it?";

/* ── CARD SYNERGY DATA ──────────────────────────────────────────────────────── */

const SYNERGY_TYPES={
  ecosystemUnlocker:{label:"Ecosystem Unlocker",icon:"🔑",description:"Adding this card unlocks transfer partners for points you already earn on other cards.",color:"#0d7377"},
  companionCombo:{label:"Companion Combo",icon:"🤝",description:"These cards are worth more together than apart — combined strategy beats either card alone.",color:"#d97706"},
  statusStacking:{label:"Status Stacking",icon:"👑",description:"Holding both cards accelerates you toward elite status tiers or gives you automatic status.",color:"#7c3aed"},
  categoryCoverage:{label:"Category Coverage",icon:"🎯",description:"This card fills a gap in your earning structure, so you earn max points on every purchase.",color:"#2563eb"}
};

const CARD_SYNERGIES={
  "Chase Sapphire Preferred":[
    {type:"ecosystemUnlocker",pairWith:"Chase Freedom Flex",youGet:"Your Freedom Flex 5x categories become worth 10-15% via transfer partners instead of 5% cash back",details:"Freedom Flex earns 5x UR in rotating quarterly categories. Without a Sapphire card, those points are stuck at 1¢ each as cash back. With the CSP, you can transfer to Hyatt at 2-3¢ per point or United at 1.5-2¢. That turns a $75 quarterly bonus into $112-225 in travel value. Over a year of rotating categories, the uplift adds up fast.",estimatedUplift:"$150-600/yr",bestFor:"Anyone with Freedom Flex or Freedom Unlimited"},
    {type:"ecosystemUnlocker",pairWith:"Chase Freedom Unlimited",youGet:"Your Freedom Unlimited 1.5x on everything becomes worth 3-4.5% via transfer partners",details:"Freedom Unlimited earns 1.5 UR per dollar on everything. At 1¢ each, that's 1.5% cash back. But add the CSP and transfer those points to partners at 2-3¢ each — suddenly you're earning 3-4.5% effective on all spending. On $20k/yr in non-category spend, that's $600-900 in travel value vs $300 in cash back.",estimatedUplift:"$300-600/yr",bestFor:"Anyone with Freedom Unlimited"},
    {type:"companionCombo",pairWith:"World of Hyatt Card",youGet:"Transfer UR to Hyatt at 2-3¢/point while earning 4x on Hyatt stays — the ultimate hotel strategy",details:"The Hyatt card earns 4x at Hyatt properties plus a free Category 1-4 night annually. The CSP lets you transfer other UR points to Hyatt 1:1. Hyatt points are consistently worth 2-3¢ each — the highest hotel currency value. Together you earn fast on Hyatt stays and funnel all other UR into the same high-value pool.",estimatedUplift:"$200-500/yr",bestFor:"Hyatt loyalists"}
  ],
  "Chase Sapphire Reserve":[
    {type:"ecosystemUnlocker",pairWith:"Chase Freedom Flex",youGet:"Freedom Flex 5x becomes worth 12.5-15% via CSR portal/transfers",details:"The CSR's 1.5¢ portal redemption rate beats the CSP's 1.25¢. So Freedom Flex 5x × 1.5¢ = 7.5% through the Chase Travel portal, or 5x × 2-3¢ = 10-15% via transfer partners like Hyatt and United. The Reserve makes every Freedom point significantly more valuable than the Preferred does.",estimatedUplift:"$200-700/yr",bestFor:"Anyone with Freedom Flex"},
    {type:"companionCombo",pairWith:"World of Hyatt Card",youGet:"CSR portal at 1.5¢ + Hyatt transfers at 2-3¢ + Hyatt card 4x = premium hotel trifecta",details:"In 2026, $75k in CSR spend also earns World of Hyatt Explorist status — room upgrades, late checkout, and bonus points. Combined with the Hyatt card's 4x earning at properties and the ability to transfer all UR to Hyatt at 2-3¢ each, this is the most powerful hotel setup in the points game.",estimatedUplift:"$300-800/yr",bestFor:"Hyatt loyalists, luxury travelers"},
    {type:"categoryCoverage",pairWith:"Chase Freedom Unlimited",youGet:"1.5x everything (FU) + 3x travel/dining (CSR) = no earning gaps",details:"The CSR earns 3x on travel and dining but just 1x on everything else. Freedom Unlimited fills that gap at 1.5x on all non-category spend. Add Freedom Flex for 5x rotating categories and you have the complete Chase Trifecta. Total annual fees: $795 + $0 + $0 = $795 for a system that covers every dollar.",estimatedUplift:"$200-400/yr",bestFor:"Everyone building a Chase Trifecta"}
  ],
  "Chase Freedom Flex":[
    {type:"ecosystemUnlocker",pairWith:"Chase Sapphire Preferred",youGet:"Your 5x rotating categories are trapped at 1¢/point — the CSP unlocks 2-3¢ via transfers",details:"Without a Sapphire or Ink Preferred card, your UR points are cash back only at 1¢ each. The CSP ($95/yr) unlocks transfer partners for ALL your Chase UR points. Your 5x rotating categories go from 5% cash back to 10-15% effective value through Hyatt, United, and other partners.",estimatedUplift:"$150-600/yr",bestFor:"Anyone without a Sapphire or Ink Preferred card"}
  ],
  "Chase Freedom Unlimited":[
    {type:"ecosystemUnlocker",pairWith:"Chase Sapphire Preferred",youGet:"Your 1.5% everywhere becomes 3-4.5% when you can transfer to partners",details:"Freedom Unlimited earns 1.5 UR per dollar on everything. Without a Sapphire card, that's 1.5% cash back. Add the CSP ($95/yr) and those points become transferable — worth 2-3¢ each via Hyatt, United, Southwest, and 11 other partners. Your baseline earning on all spending doubles or triples.",estimatedUplift:"$300-600/yr",bestFor:"Anyone spending $20k+/yr without a Sapphire card"}
  ],
  "The Platinum Card® from American Express":[
    {type:"companionCombo",pairWith:"American Express® Gold Card",youGet:"Platinum covers travel/lounges, Gold covers dining/groceries — maximize every MR point",details:"The Platinum earns 5x on flights but only 1x on dining and groceries. The Gold fills that gap with 4x dining and 4x supermarkets. All Membership Rewards points pool together across both cards, giving you access to 20+ transfer partners. Combined net cost is roughly $695-825 after using all credits, while earning $3,000-4,000+ per year in transferable points.",estimatedUplift:"$500-1,500/yr",bestFor:"High spenders on dining and travel"},
    {type:"statusStacking",pairWith:"Hilton Honors American Express Aspire Card",youGet:"Platinum gives Hilton Gold, Aspire gives Diamond — stack for max hotel perks",details:"The Platinum automatically gives you Hilton Gold (room upgrades, breakfast at select properties). The Aspire upgrades you to Diamond — the top tier with suite upgrades, executive lounge access, daily F&B credits, and 100% bonus points. The Aspire's $550 fee is largely offset by $250 resort credit, free weekend night, and $100 airline credit. Together: Diamond status + Centurion Lounges + Priority Pass + combined earning power.",estimatedUplift:"$500-2,000/yr",bestFor:"Frequent Hilton guests"},
    {type:"statusStacking",pairWith:"Marriott Bonvoy Boundless®",youGet:"Platinum gives Marriott Gold + Boundless adds 15 elite nights toward Platinum status",details:"The Amex Platinum auto-enrolls you in Marriott Gold Elite. The Boundless ($95/yr) adds 15 elite qualifying night credits each year plus 6x at Marriott. Combined: you start each year with Gold status and a 15-night head start toward Marriott Platinum (50 nights). Stay 35 more nights and you unlock suite upgrades, lounge access, and complimentary breakfast.",estimatedUplift:"$200-500/yr",bestFor:"Marriott loyalists aiming for Platinum status"}
  ],
  "American Express® Gold Card":[
    {type:"ecosystemUnlocker",pairWith:"Amex EveryDay",youGet:"If you cancel Gold, downgrade to EveryDay ($0) to preserve all MR points",details:"CRITICAL: If the Gold is your only Membership Rewards card and you cancel it, you LOSE ALL your MR points. The EveryDay card has no annual fee and keeps your MR account alive. This isn't about earning synergy — it's point insurance. Even if you cancel the Gold, make sure you have EveryDay, Green, or Blue Business Plus to preserve potentially thousands of dollars in MR points.",estimatedUplift:"Preserves $500-5,000+ in MR",bestFor:"Anyone considering canceling their Gold card"},
    {type:"companionCombo",pairWith:"The Platinum Card® from American Express",youGet:"Gold handles dining/groceries (4x), Platinum handles travel (5x) — the Amex power duo",details:"The Gold earns 4x on dining and 4x on supermarkets — two of the biggest spending categories. The Platinum earns 5x on flights and provides lounges, status, and premium travel perks. All MR points pool together across both cards and access the same 20+ transfer partners. The combined strategy covers every major spending category at premium rates.",estimatedUplift:"$500-1,500/yr",bestFor:"High spenders across dining, groceries, and travel"}
  ],
  "Capital One Venture X Rewards Credit Card":[
    {type:"categoryCoverage",pairWith:"Capital One SavorOne Cash Rewards",youGet:"SavorOne earns 3-8% on dining/entertainment/groceries, Venture X handles everything else at 2x + transfers",details:"SavorOne ($0/yr) earns 3% on dining, 3% on groceries, 8% on Capital One Entertainment, and 5% on hotels via Capital One Travel. All rewards pool with Venture X for transfer partner access. $600/mo in dining on SavorOne earns $216/yr vs $144 at Venture X's 2x rate. The SavorOne fills the category gaps while the Venture X provides transfers, lounges, and travel credits.",estimatedUplift:"$100-300/yr",bestFor:"Capital One cardholders who spend heavily on dining and groceries"}
  ],
  "Capital One SavorOne Cash Rewards":[
    {type:"ecosystemUnlocker",pairWith:"Capital One Venture X Rewards Credit Card",youGet:"Your cash back converts to miles and unlocks 15+ transfer partners",details:"SavorOne alone earns cash back rewards. But paired with the Venture X, those rewards convert to Capital One miles and unlock 15+ transfer partners. Turkish Miles&Smiles turns 7,500 miles into $300-500 United flights (4-6.6¢ per point). Air Canada, British Airways, and more. The Venture X is effectively free after its $300 travel credit and 10,000 anniversary miles.",estimatedUplift:"$200-500/yr",bestFor:"SavorOne holders who travel"}
  ],
  "Citi Strata Premier℠ Card":[
    {type:"ecosystemUnlocker",pairWith:"Citi Double Cash® Card",youGet:"Your Double Cash 2% becomes 3-4% when ThankYou points transfer to partners",details:"The Double Cash earns 2 ThankYou points per dollar on everything. Without the Strata Premier, those points are stuck at 1¢ each — just 2% cash back. With the Strata Premier, transfer to Turkish Miles&Smiles at 3-6.6¢ (7,500 miles for a United domestic flight), Avianca, or Air France. On $30k/yr: $600 in cash back becomes $900-1,200 in transfer value.",estimatedUplift:"$300-600/yr",bestFor:"Double Cash holders who travel"},
    {type:"ecosystemUnlocker",pairWith:"Citi Custom Cash® Card",youGet:"Your Custom Cash 5% top category becomes 10-15% via transfers",details:"The Custom Cash earns 5x ThankYou points in your top spending category (up to $500/mo). Without the Strata Premier, that's 5% cash back. With transfers: Turkish at 3-6.6¢ per point means your top category effectively earns 10-15%. On the full $500/mo cap, that's $60-90/mo in transfer value vs $25 in cash back.",estimatedUplift:"$420-780/yr",bestFor:"Custom Cash holders"}
  ],
  "Citi Double Cash® Card":[
    {type:"ecosystemUnlocker",pairWith:"Citi Strata Premier℠ Card",youGet:"Your 2% everywhere is actually 2 ThankYou points per dollar — unlock transfers for 3-4%",details:"Most people think the Double Cash is a cash back card, but it actually earns ThankYou points. Add the Strata Premier ($95/yr) and those points become transferable to 22 partners. The Turkish Miles&Smiles sweet spot — 7,500 miles for United domestic flights worth $300-500 — turns your everyday 2% card into a premium travel engine.",estimatedUplift:"$300-600/yr",bestFor:"Double Cash holders who want more from their points"}
  ],
  "World of Hyatt Card":[
    {type:"companionCombo",pairWith:"Chase Sapphire Preferred",youGet:"Transfer ALL your Chase UR to Hyatt at 2-3¢ each — best hotel transfer in the game",details:"The Hyatt card earns 4x at Hyatt properties but limited rates elsewhere. The CSP (or CSR) lets you transfer UR from Freedom Flex, Freedom Unlimited, and Sapphire cards to Hyatt 1:1. At 2-3¢ per point, 15,000 points at a Park Hyatt is worth $400+ (2.67¢/point). This dual pipeline is the most efficient way to accumulate the highest-value hotel currency.",estimatedUplift:"$300-1,000/yr",bestFor:"Hyatt loyalists with Chase UR cards"}
  ],
  "Marriott Bonvoy Boundless®":[
    {type:"statusStacking",pairWith:"The Platinum Card® from American Express",youGet:"Platinum gives instant Marriott Gold + Boundless adds 15 elite nights toward Platinum status",details:"The Amex Platinum gives you automatic Marriott Gold Elite. The Boundless adds 15 elite qualifying night credits each year. Together: Gold status with a 15-night head start toward Platinum (50 nights). Stay 35 more nights in a year and you unlock suite upgrades, executive lounge access, and complimentary breakfast. The Boundless free night certificate ($95 fee) covers most Marriott properties.",estimatedUplift:"$200-500/yr",bestFor:"Marriott loyalists with Amex Platinum"}
  ],
  "Hilton Honors American Express Aspire Card":[
    {type:"statusStacking",pairWith:"The Platinum Card® from American Express",youGet:"Aspire gives Diamond + Platinum gives Hilton Gold backup + Centurion Lounges stack with Priority Pass",details:"The Aspire gives top-tier Hilton Diamond status — suite upgrades, executive lounge, daily F&B credits, 100% bonus points. The Platinum adds Centurion Lounge access for airports without Hilton lounges. Both cards have Priority Pass — give one membership to a travel companion. The Platinum's Marriott Gold diversifies your hotel loyalty across two major chains.",estimatedUplift:"$300-800/yr",bestFor:"Frequent Hilton travelers with Amex Platinum"}
  ],
  "Bilt Mastercard®":[
    {type:"companionCombo",pairWith:"World of Hyatt Card",youGet:"Earn points on rent, redeem at 2-3¢ each at Hyatt",details:"Bilt is the only card that earns points on rent payments. Transfer those points 1:1 to World of Hyatt at 2-3¢ per point. At $2,000/mo rent, that's 24,000 points per year — enough for 1-2 free nights worth $400-700 at great Hyatt properties. The Hyatt card adds 4x earning at Hyatt stays, creating a dual pipeline into the most valuable hotel currency.",estimatedUplift:"$400-700/yr",bestFor:"Renters who stay at Hyatt properties"},
    {type:"ecosystemUnlocker",pairWith:"Chase Sapphire Preferred",youGet:"Both Bilt and Chase UR transfer to Hyatt — run dual pipelines into the same account",details:"Bilt and Chase Ultimate Rewards both transfer 1:1 to World of Hyatt. This isn't same-ecosystem synergy — it's dual-pipeline strategy. Earn Bilt points on rent, earn UR on everything else, and funnel both into Hyatt at 2-3¢ per point. Two independent earning engines feeding the highest-value hotel currency. The CSP also adds United, Southwest, and 11 other partners.",estimatedUplift:"$300-600/yr",bestFor:"Renters who also hold Chase UR cards"}
  ]
};

const ECOSYSTEM_MAP={
  "Chase Ultimate Rewards":{
    earners:["Chase Freedom Flex","Chase Freedom Unlimited","Ink Business Cash® Credit Card","Ink Business Unlimited® Credit Card"],
    unlockers:["Chase Sapphire Preferred","Chase Sapphire Reserve","Ink Business Preferred® Credit Card"],
    cheapestUnlocker:"Chase Sapphire Preferred",cheapestUnlockerFee:95,
    valueUplift:"1¢ → 2-3¢ per point (2-3x)"
  },
  "Amex Membership Rewards":{
    earners:["American Express® Gold Card","The Platinum Card® from American Express","American Express® Green Card","Amex EveryDay","Amex EveryDay Preferred","American Express® Blue Business Plus"],
    unlockers:["American Express® Gold Card","The Platinum Card® from American Express","American Express® Green Card","Amex EveryDay","Amex EveryDay Preferred","American Express® Blue Business Plus"],
    cheapestUnlocker:"Amex EveryDay",cheapestUnlockerFee:0,
    valueUplift:"0.6¢ → 2.2¢ per point (3.7x)",
    warning:"Canceling your ONLY MR card forfeits ALL your Membership Rewards points."
  },
  "Citi ThankYou Points":{
    earners:["Citi Double Cash® Card","Citi Custom Cash® Card","Citi Rewards+® Card"],
    unlockers:["Citi Strata Premier℠ Card"],
    cheapestUnlocker:"Citi Strata Premier℠ Card",cheapestUnlockerFee:95,
    valueUplift:"1¢ → 1.9-2¢ per point (2x)"
  },
  "Capital One Miles":{
    earners:["Capital One SavorOne Cash Rewards","Capital One Quicksilver","Capital One Savor"],
    unlockers:["Capital One Venture X Rewards Credit Card","Capital One Venture Rewards"],
    cheapestUnlocker:"Capital One Venture Rewards",cheapestUnlockerFee:95,
    valueUplift:"1¢ → 1.85¢ per point (1.85x)"
  },
  "Bilt Points":{
    earners:["Bilt Mastercard®"],
    unlockers:["Bilt Mastercard®"],
    cheapestUnlocker:"Bilt Mastercard®",cheapestUnlockerFee:0,
    valueUplift:"1¢ → 2-3¢ via Hyatt/Turkish transfers"
  }
};

const POINT_SHARING_RULES={
  "Chase Ultimate Rewards":{
    canShareHousehold:true,
    method:"Combine points between household members at same address via phone call to Chase",
    requirements:"Same address, both must have a UR-earning card",
    limits:"No fee, 1,000 point increments, one combine partner at a time",
    implication:"Only ONE household member needs a Sapphire/Ink Preferred to unlock transfer partners for both. Person A can transfer UR to Person B, then Person B transfers to Hyatt/United/etc."
  },
  "Amex Membership Rewards":{
    canShareHousehold:false,
    method:"No direct account-to-account transfer. Workaround: add partner as authorized user (90-day wait), then transfer to their loyalty accounts",
    requirements:"Authorized user must be on card 90+ days before transfers",
    limits:"Small excise tax on transfers to US airlines ($0.0006/point, max $99)",
    implication:"Each person needs their OWN MR-earning card to maintain transfer access. Canceling Person 2's only MR card means their points are stranded — authorized user workaround is slow and limited."
  },
  "Capital One Miles":{
    canShareHousehold:true,
    method:"Call Capital One to transfer miles to any other Capital One cardholder — no address or relationship requirement",
    requirements:"Both must have a Capital One card",
    limits:"No fee, no limits, instant transfer",
    implication:"Most flexible program. Only ONE household member needs a Venture X/Venture to unlock transfers for both."
  },
  "Citi ThankYou Points":{
    canShareHousehold:true,
    method:"Transfer TY points to any ThankYou member online",
    requirements:"Recipient needs a ThankYou account",
    limits:"100,000 points/year send and receive cap",
    warning:"CRITICAL: Citi is discontinuing point sharing on May 17, 2026. After that date, each person needs their own Strata Premier for transfer access.",
    implication:"Currently only one person needs Strata Premier, but after May 2026 each person will need their own."
  },
  "Bilt Points":{
    canShareHousehold:false,
    method:"No direct transfers between Bilt accounts",
    requirements:"N/A",
    limits:"N/A",
    implication:"Each person's Bilt points are locked to their own account. Workaround: transfer to Hyatt and use Hyatt's point combining, or book travel in partner's name."
  },
  "Marriott Bonvoy Points":{
    canShareHousehold:true,
    method:"Free transfers between Marriott Bonvoy members",
    requirements:"Both members must have Bonvoy accounts",
    limits:"100,000 points/year send limit",
    implication:"One Marriott card per household is enough since you can share points freely."
  },
  "Hilton Honors Points":{
    canShareHousehold:true,
    method:"Pool points with up to 10 members via Hilton Honors account",
    requirements:"Both must have Hilton Honors accounts",
    limits:"Up to 500,000 points/year per member",
    implication:"Pool points together — one Aspire covers Diamond status for stays booked under that member."
  },
  "Hyatt Points":{
    canShareHousehold:true,
    method:"Combine points by submitting a signed form to Hyatt",
    requirements:"Both must have World of Hyatt accounts and submit a Points Combining Form",
    limits:"Requires paperwork, not instant",
    implication:"Can combine but requires both to sign a form. Plan ahead if you need combined points for a redemption."
  },
  "IHG One Rewards Points":{
    canShareHousehold:true,
    method:"Transfer points between IHG accounts",
    requirements:"Both must have IHG accounts",
    limits:"Restricted based on elite status tier. May incur a fee for non-elite members.",
    implication:"Transfers limited — check your elite tier. Points & Cash bookings can help stretch a single balance."
  }
};

/* TRANSFER_PATHS — maps loyalty program currencies to flexible-point programs
   that can transfer into them. Used by the Renewal Advisor to show alternative
   points paths when a user considers canceling a co-branded hotel/airline card. */
const TRANSFER_PATHS={
  "Marriott Bonvoy Points":{
    program:"Marriott Bonvoy",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]},
      {currency:"Amex Membership Rewards",ratio:"1:1",cards:["amex-gold","amex-plat","amex-green","amex-everyday"]},
      {currency:"Bilt Points",ratio:"1:1",cards:["bilt"]}
    ]
  },
  "Hilton Honors Points":{
    program:"Hilton Honors",
    sources:[
      {currency:"Amex Membership Rewards",ratio:"1:2",note:"1,000 MR = 2,000 Hilton",cards:["amex-gold","amex-plat","amex-green","amex-everyday"]}
    ]
  },
  "Hyatt Points":{
    program:"World of Hyatt",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]},
      {currency:"Bilt Points",ratio:"1:1",cards:["bilt"]}
    ]
  },
  "IHG One Rewards Points":{
    program:"IHG Rewards",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]},
      {currency:"Bilt Points",ratio:"1:1",cards:["bilt"]}
    ]
  },
  "Wyndham Rewards Points":{
    program:"Wyndham Rewards",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]},
      {currency:"Capital One Miles",ratio:"1:1",cards:["venture-x","venture"]},
      {currency:"Citi ThankYou Points",ratio:"1:1",cards:["citi-strata"]}
    ]
  },
  "Southwest Rapid Rewards":{
    program:"Southwest Rapid Rewards",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]}
    ]
  },
  "United MileagePlus":{
    program:"United MileagePlus",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]},
      {currency:"Bilt Points",ratio:"1:1",cards:["bilt"]}
    ]
  },
  "British Airways Avios":{
    program:"British Airways Avios",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]},
      {currency:"Amex Membership Rewards",ratio:"1:1",cards:["amex-gold","amex-plat","amex-green","amex-everyday"]},
      {currency:"Capital One Miles",ratio:"1:1",cards:["venture-x","venture"]},
      {currency:"Citi ThankYou Points",ratio:"1:1",cards:["citi-strata"]},
      {currency:"Bilt Points",ratio:"1:1",cards:["bilt"]}
    ]
  },
  "American Airlines AAdvantage":{
    program:"American Airlines AAdvantage",
    sources:[
      {currency:"Citi ThankYou Points",ratio:"1:1",cards:["citi-strata"]},
      {currency:"Bilt Points",ratio:"1:1",cards:["bilt"]}
    ]
  },
  "Delta SkyMiles":{
    program:"Delta SkyMiles",
    sources:[
      {currency:"Amex Membership Rewards",ratio:"1:1",cards:["amex-gold","amex-plat","amex-green","amex-everyday"]},
      {currency:"Virgin Atlantic (indirect)",ratio:"varies",note:"Transfer Amex, Chase, or Bilt to Virgin Atlantic, then book Delta flights",cards:["amex-gold","amex-plat","csp","csr","bilt"]}
    ]
  },
  "Air France/KLM Flying Blue":{
    program:"Air France/KLM Flying Blue",
    sources:[
      {currency:"Chase Ultimate Rewards",ratio:"1:1",cards:["csp","csr","ink-preferred"]},
      {currency:"Amex Membership Rewards",ratio:"1:1",cards:["amex-gold","amex-plat","amex-green","amex-everyday"]},
      {currency:"Capital One Miles",ratio:"1:1",cards:["venture-x","venture"]},
      {currency:"Citi ThankYou Points",ratio:"1:1",cards:["citi-strata"]},
      {currency:"Bilt Points",ratio:"1:1",cards:["bilt"]}
    ]
  }
};

/* OVERLAP_GROUPS — curated map of household-redundant benefits.
   Each group has: label, keywords (matched against benefit names), a tip for
   households, and estimated annual savings if one person drops the overlap. */
const OVERLAP_GROUPS={
  "lounge-access":{
    label:"Lounge Access",
    keywords:["Priority Pass","Centurion Lounge","Capital One Lounge","Delta Sky Club","United Club","Admirals Club","Escape Lounge"],
    tip:"Most lounge memberships allow free guest entry. One card with lounge access can cover both partners.",
    savings:"$300–695/yr by consolidating lounge cards to one partner"
  },
  "global-entry":{
    label:"Global Entry / TSA PreCheck",
    keywords:["Global Entry","TSA PreCheck","NEXUS"],
    tip:"Global Entry only needs to be paid once every 5 years per person. If both partners already have it, the second credit is wasted until renewal.",
    savings:"$100–120/yr if one credit goes unused"
  },
  "airline-fee-credit":{
    label:"Airline Fee Credits",
    keywords:["Airline Fee Credit","Airline Credit","airline incidental"],
    tip:"These credits often cover the same types of fees (seat upgrades, bags). If you both fly the same airline, one credit may be enough.",
    savings:"$200–250/yr if one airline credit is redundant"
  },
  "hotel-credit":{
    label:"Hotel Credits",
    keywords:["Hotel Credit","Resort Credit","Hilton Resort","$300 Hotel","$250 Hotel","$200 Hotel"],
    tip:"Hotel credits typically apply per stay, not per room. Couples traveling together may only need one hotel credit card.",
    savings:"$200–300/yr if hotel stays are always shared"
  },
  "free-night-award":{
    label:"Free Night Awards",
    keywords:["Free Night","Free Weekend Night","Anniversary Night"],
    tip:"Free night awards are great to keep on both partners — they stack for multi-night stays. This is usually NOT redundant.",
    savings:null
  },
  "dining-credit":{
    label:"Dining Credits",
    keywords:["Dining Credit","Resy Credit","Restaurant Credit","Uber Eats","DoorDash","Grubhub"],
    tip:"Dining and delivery credits can usually both be used — each partner orders separately. Keep both if you'll use them.",
    savings:null
  },
  "streaming-credit":{
    label:"Streaming & Entertainment Credits",
    keywords:["Digital Entertainment","Streaming Credit","Disney+","Hulu","Audible","NYT","Peacock","Walmart+"],
    tip:"A household only needs one streaming subscription per service. If both cards cover the same service, one credit is wasted.",
    savings:"$100–240/yr if subscriptions overlap"
  },
  "rideshare-credit":{
    label:"Rideshare Credits",
    keywords:["Uber Credit","Uber Cash","Lyft Credit","Lyft Pink"],
    tip:"Uber/Lyft credits are per-account. Both partners can use theirs independently — usually not redundant.",
    savings:null
  },
  "checked-bag":{
    label:"Free Checked Bags",
    keywords:["Free Checked Bag","First Checked Bag Free"],
    tip:"Free checked bag perks on airline cards apply to the cardholder's reservation. If both partners fly the same airline, both cards are useful.",
    savings:null
  },
  "travel-credit":{
    label:"General Travel Credits",
    keywords:["$300 Travel Credit","Annual Travel Credit","$75 Annual Travel","Travel Credit"],
    tip:"Travel credits usually apply to the cardholder's purchases. If both partners travel, both credits get used. Redundant only if one person books everything.",
    savings:"$75–300/yr if one partner books all travel"
  },
  "cell-phone-protection":{
    label:"Cell Phone Protection",
    keywords:["Cell Phone Protection","Wireless Phone"],
    tip:"Cell phone protection covers phones on the bill paid with that card. One card can cover the whole family plan.",
    savings:"$25–50/yr (secondary coverage value)"
  },
  "marriott-status":{
    label:"Marriott Elite Status",
    keywords:["Silver Elite","Gold Elite Status","Platinum Elite","Titanium Elite"],
    tip:"Marriott elite status doesn't stack — you get the highest tier from any card. The second card's status is redundant, but the card may still be worth keeping for other benefits like free night certificates.",
    savings:null,
    isInfoNote:true
  },
  "hilton-status":{
    label:"Hilton Elite Status",
    keywords:["Diamond Status","Gold Status","Silver Status"],
    tip:"Hilton status doesn't stack. The highest tier from any card applies. The second card's status is redundant, but the card may still earn valuable Hilton points.",
    savings:null,
    isInfoNote:true
  },
  "hyatt-status":{
    label:"Hyatt Elite Status",
    keywords:["Discoverist Status","Explorist Status","Globalist"],
    tip:"Hyatt elite status applies the highest tier from your cards. Duplicate status is redundant, but the card may be worth keeping for the free night certificate.",
    savings:null,
    isInfoNote:true
  },
  "rental-car-insurance":{
    label:"Rental Car Insurance",
    keywords:["Primary Car Rental","Secondary Car Rental","Primary CDW","rental vehicle"],
    tip:"Rental car insurance follows the cardholder, not the household. Both partners having coverage is actually useful for separate rentals. Not redundant.",
    savings:null
  },
  "trip-delay-insurance":{
    label:"Trip Delay / Cancellation Insurance",
    keywords:["Trip Cancellation","Trip Delay","Trip Interruption","Baggage Delay"],
    tip:"Travel insurance covers the cardholder's trip. Both partners having it means both are covered when traveling separately. Not redundant.",
    savings:null
  }
};

// Calculates how many days remain until a given date. Used for benefit reset countdowns
// (e.g., '15 days until your monthly Uber credit resets').
function daysUntil(d){if(!d)return 999;const dt=new Date(d),n=new Date();n.setHours(0,0,0,0);dt.setHours(0,0,0,0);return Math.ceil((dt-n)/86400000);}

/* ── TRIP PLANNER DESTINATION DATA ──────────────────────────────────────────
   Maps destination regions to relevant airlines, hotel programs, point estimates,
   and keywords for matching user input. Used by the PlanTab component. */
const DEST_REGIONS={
  japan:{
    name:"Japan",display:"Tokyo / Japan",
    airlines:["ANA","JAL","United","Singapore Airlines"],
    hotelPrograms:["Hyatt","Marriott","Hilton","IHG"],
    transferPartners:["ANA","Virgin Atlantic","United","Air France/KLM Flying Blue","Singapore Airlines"],
    keywords:["japan","tokyo","osaka","kyoto","okinawa","sapporo","narita","haneda"],
    estimates:{
      economy:{pts:"50–70k",partner:"United / ANA",cash:"$800–1,200"},
      business:{pts:"75–110k",partner:"ANA via Virgin Atlantic / JAL",cash:"$4,000–8,000"},
      first:{pts:"110–180k",partner:"ANA via Virgin Atlantic",cash:"$15,000–25,000"},
      hotel5:{pts:"75–150k",partner:"Hyatt / Marriott",cash:"$1,000–3,500"}
    },
    notes:"ANA First Class via Virgin Atlantic at 75k–110k is one of the best redemptions in the hobby. Park Hyatt Tokyo at 25k/night is iconic."
  },
  europe:{
    name:"Europe",display:"Paris / Europe",
    airlines:["Air France","British Airways","Lufthansa","Aer Lingus","Iberia","Turkish Airlines"],
    hotelPrograms:["Marriott","Hilton","Hyatt","IHG"],
    transferPartners:["Air France/KLM Flying Blue","British Airways","Virgin Atlantic","Turkish Miles&Smiles","Avianca LifeMiles","Iberia"],
    keywords:["europe","paris","london","rome","italy","france","spain","germany","amsterdam","barcelona","lisbon","portugal","greece","athens","santorini","dublin","ireland","switzerland","vienna","prague","berlin","munich","copenhagen","stockholm"],
    estimates:{
      economy:{pts:"30–60k",partner:"Flying Blue / British Airways",cash:"$400–800"},
      business:{pts:"55–100k",partner:"Aer Lingus Avios / Flying Blue",cash:"$2,500–6,000"},
      first:{pts:"100–180k",partner:"Lufthansa / British Airways",cash:"$6,000–12,000"},
      hotel5:{pts:"80–200k",partner:"Marriott / Hyatt",cash:"$1,000–4,000"}
    },
    notes:"Flying Blue Promo Awards on the 1st of each month offer 25–50% off. Aer Lingus via Chase Avios at 45k for transatlantic business is a sweet spot."
  },
  uk:{
    name:"United Kingdom",display:"London / UK",
    airlines:["British Airways","Virgin Atlantic","American Airlines"],
    hotelPrograms:["Marriott","Hilton","Hyatt","IHG"],
    transferPartners:["British Airways","Virgin Atlantic","American Airlines"],
    keywords:["uk","england","london","scotland","edinburgh","manchester","heathrow"],
    estimates:{
      economy:{pts:"26–50k",partner:"British Airways Avios",cash:"$400–700"},
      business:{pts:"55–77k",partner:"Virgin Atlantic / British Airways",cash:"$3,000–6,000"},
      first:{pts:"100–150k",partner:"British Airways / Virgin Atlantic",cash:"$6,000–10,000"},
      hotel5:{pts:"100–250k",partner:"Marriott / Hilton",cash:"$1,500–5,000"}
    },
    notes:"Virgin Atlantic charges low surcharges on its own metal. British Airways Avios are great for short hops within Europe from London."
  },
  caribbean:{
    name:"Caribbean",display:"Caribbean / Islands",
    airlines:["American Airlines","JetBlue","Delta","United","Southwest"],
    hotelPrograms:["Marriott","Hilton","Hyatt","IHG"],
    transferPartners:["American Airlines","British Airways","Delta","United"],
    keywords:["caribbean","bahamas","jamaica","aruba","turks","caicos","barbados","st lucia","punta cana","dominican","puerto rico","cancun","cabo","virgin islands","bermuda","antigua","curacao"],
    estimates:{
      economy:{pts:"15–35k",partner:"American / JetBlue",cash:"$250–500"},
      business:{pts:"40–60k",partner:"American / Delta",cash:"$800–2,000"},
      first:{pts:"N/A",partner:"—",cash:"—"},
      hotel5:{pts:"100–250k",partner:"Marriott / Hilton",cash:"$1,500–5,000"}
    },
    notes:"Southwest Companion Pass doubles your value for Caribbean destinations. Hyatt all-inclusives (Ziva/Zilara) are excellent point redemptions."
  },
  mexico:{
    name:"Mexico",display:"Mexico / Central America",
    airlines:["American Airlines","United","Delta","Southwest","Aeromexico"],
    hotelPrograms:["Marriott","Hilton","Hyatt","IHG"],
    transferPartners:["American Airlines","United","Delta","Avianca LifeMiles"],
    keywords:["mexico","cancun","cabo","tulum","mexico city","playa del carmen","oaxaca","riviera maya","costa rica","belize","guatemala","panama"],
    estimates:{
      economy:{pts:"10–25k",partner:"Southwest / United",cash:"$200–500"},
      business:{pts:"30–55k",partner:"American / Aeromexico",cash:"$600–1,500"},
      first:{pts:"N/A",partner:"—",cash:"—"},
      hotel5:{pts:"60–150k",partner:"Hyatt / Marriott",cash:"$700–3,000"}
    },
    notes:"Hyatt Ziva/Zilara all-inclusives in Mexico are among the best hotel point redemptions available. Southwest Companion Pass is ideal for short-haul Mexico flights."
  },
  hawaii:{
    name:"Hawaii",display:"Hawaii",
    airlines:["Hawaiian Airlines","United","Delta","American Airlines","Southwest","Alaska Airlines"],
    hotelPrograms:["Marriott","Hilton","Hyatt"],
    transferPartners:["United","American Airlines","Delta","British Airways"],
    keywords:["hawaii","maui","oahu","honolulu","waikiki","kauai","big island","kona","hilo"],
    estimates:{
      economy:{pts:"20–40k",partner:"Southwest / United",cash:"$300–600"},
      business:{pts:"50–80k",partner:"Hawaiian / United",cash:"$1,200–2,500"},
      first:{pts:"80–120k",partner:"United / Hawaiian",cash:"$2,500–5,000"},
      hotel5:{pts:"100–250k",partner:"Marriott / Hyatt",cash:"$1,500–5,000"}
    },
    notes:"Southwest Companion Pass works to Hawaii. Andaz Maui (Hyatt) at 25–30k points/night is a standout hotel redemption."
  },
  southeast_asia:{
    name:"Southeast Asia",display:"Southeast Asia",
    airlines:["Singapore Airlines","Cathay Pacific","ANA","Thai Airways","EVA Air"],
    hotelPrograms:["Hyatt","Marriott","Hilton","IHG"],
    transferPartners:["Singapore Airlines","Cathay Pacific","ANA","Turkish Miles&Smiles","Virgin Atlantic"],
    keywords:["thailand","bangkok","bali","indonesia","vietnam","singapore","malaysia","philippines","cambodia","laos","myanmar","phuket","chiang mai","hanoi","ho chi minh","saigon","kuala lumpur"],
    estimates:{
      economy:{pts:"35–60k",partner:"Singapore / Cathay",cash:"$600–1,000"},
      business:{pts:"70–120k",partner:"Singapore Airlines / Cathay Pacific",cash:"$3,000–7,000"},
      first:{pts:"90–180k",partner:"Singapore Suites / Cathay",cash:"$8,000–18,000"},
      hotel5:{pts:"40–100k",partner:"Hyatt / Marriott",cash:"$500–2,000"}
    },
    notes:"Singapore Airlines Suites are bookable with KrisFlyer miles (Amex/Citi/Chase transfer). Hotels in SEA are incredibly cheap on points."
  },
  middle_east:{
    name:"Middle East",display:"Dubai / Middle East",
    airlines:["Emirates","Qatar Airways","Etihad","Turkish Airlines"],
    hotelPrograms:["Marriott","Hilton","Hyatt","IHG"],
    transferPartners:["Emirates","Qatar Airways","Turkish Miles&Smiles"],
    keywords:["dubai","abu dhabi","qatar","doha","uae","jordan","amman","israel","tel aviv","oman","saudi","riyadh","bahrain","maldives","male"],
    estimates:{
      economy:{pts:"40–65k",partner:"Emirates / Turkish",cash:"$500–900"},
      business:{pts:"70–115k",partner:"Qatar Q-Suite / Emirates",cash:"$3,000–7,000"},
      first:{pts:"115–180k",partner:"Emirates First / Etihad",cash:"$8,000–20,000"},
      hotel5:{pts:"100–250k",partner:"Hyatt / Marriott",cash:"$1,500–5,000"}
    },
    notes:"Qatar Q-Suite via Citi ThankYou Points is a Citi-exclusive sweet spot. Emirates First Class Suites with shower are bookable via Emirates Skywards."
  },
  south_pacific:{
    name:"South Pacific",display:"Australia / South Pacific",
    airlines:["Qantas","Air New Zealand","United","Cathay Pacific","ANA"],
    hotelPrograms:["Marriott","Hilton","Hyatt","IHG"],
    transferPartners:["Cathay Pacific","ANA","Singapore Airlines","United","Virgin Atlantic"],
    keywords:["australia","sydney","melbourne","new zealand","auckland","queenstown","fiji","tahiti","bora bora","french polynesia"],
    estimates:{
      economy:{pts:"40–70k",partner:"United / ANA",cash:"$800–1,400"},
      business:{pts:"80–140k",partner:"Cathay / ANA / Qantas",cash:"$4,000–9,000"},
      first:{pts:"110–200k",partner:"ANA via Virgin Atlantic",cash:"$10,000–20,000"},
      hotel5:{pts:"100–200k",partner:"Marriott / Hilton",cash:"$1,000–3,000"}
    },
    notes:"ANA free stopovers via Atmos let you add Tokyo on the way to Australia at no extra award cost."
  },
  south_america:{
    name:"South America",display:"South America",
    airlines:["LATAM","Avianca","American Airlines","Delta","United"],
    hotelPrograms:["Marriott","Hilton","Hyatt","IHG"],
    transferPartners:["Avianca LifeMiles","American Airlines","Delta","United"],
    keywords:["brazil","rio","sao paulo","argentina","buenos aires","colombia","bogota","cartagena","peru","lima","machu picchu","chile","santiago","ecuador","galapagos","patagonia","uruguay"],
    estimates:{
      economy:{pts:"25–50k",partner:"Avianca LifeMiles / United",cash:"$400–800"},
      business:{pts:"55–90k",partner:"LifeMiles / American",cash:"$2,000–5,000"},
      first:{pts:"N/A",partner:"—",cash:"—"},
      hotel5:{pts:"60–150k",partner:"Marriott / Hyatt",cash:"$500–2,000"}
    },
    notes:"Avianca LifeMiles frequently runs transfer bonuses from Amex/Citi, making South American business class very affordable."
  },
  africa:{
    name:"Africa",display:"Africa",
    airlines:["Ethiopian Airlines","South African Airways","Emirates","Turkish Airlines","Qatar Airways"],
    hotelPrograms:["Marriott","Hilton","IHG"],
    transferPartners:["Turkish Miles&Smiles","Emirates","Qatar Airways","United"],
    keywords:["africa","south africa","cape town","johannesburg","kenya","nairobi","safari","tanzania","kilimanjaro","morocco","marrakech","egypt","cairo","ghana","nigeria","ethiopia"],
    estimates:{
      economy:{pts:"40–70k",partner:"Turkish / Ethiopian",cash:"$600–1,200"},
      business:{pts:"80–130k",partner:"Turkish / Qatar / Emirates",cash:"$3,000–7,000"},
      first:{pts:"120–180k",partner:"Emirates",cash:"$8,000–15,000"},
      hotel5:{pts:"80–200k",partner:"Marriott / Hilton",cash:"$600–2,500"}
    },
    notes:"Turkish Miles&Smiles via Citi offers excellent pricing to Africa via Istanbul. Emirates connects to dozens of African cities through Dubai."
  },
  india:{
    name:"India",display:"India / South Asia",
    airlines:["Air India","Singapore Airlines","Cathay Pacific","Emirates","Turkish Airlines","Qatar Airways"],
    hotelPrograms:["Marriott","Hyatt","Hilton","IHG"],
    transferPartners:["Singapore Airlines","Emirates","Turkish Miles&Smiles","Qatar Airways","Air France/KLM Flying Blue"],
    keywords:["india","delhi","mumbai","goa","jaipur","bangalore","hyderabad","chennai","kolkata","sri lanka","nepal","kathmandu"],
    estimates:{
      economy:{pts:"35–60k",partner:"Turkish / Air India",cash:"$500–1,000"},
      business:{pts:"70–120k",partner:"Singapore / Qatar / Emirates",cash:"$3,000–7,000"},
      first:{pts:"100–180k",partner:"Singapore Suites / Emirates",cash:"$7,000–15,000"},
      hotel5:{pts:"50–120k",partner:"Marriott / Hyatt",cash:"$500–1,500"}
    },
    notes:"Singapore Airlines and Qatar Airways offer the best premium cabin products for India routes."
  },
  korea:{
    name:"South Korea",display:"Seoul / South Korea",
    airlines:["Korean Air","Asiana","United","Delta","ANA"],
    hotelPrograms:["Marriott","Hyatt","Hilton","IHG"],
    transferPartners:["ANA","United","Delta","Singapore Airlines","Turkish Miles&Smiles"],
    keywords:["korea","seoul","busan","incheon","jeju"],
    estimates:{
      economy:{pts:"35–60k",partner:"United / Korean Air",cash:"$600–1,000"},
      business:{pts:"70–110k",partner:"ANA / Korean Air",cash:"$3,000–6,000"},
      first:{pts:"100–160k",partner:"Korean Air / ANA",cash:"$6,000–12,000"},
      hotel5:{pts:"60–120k",partner:"Marriott / Hyatt",cash:"$600–1,500"}
    },
    notes:"Grand Hyatt Seoul and Park Hyatt Seoul are both excellent redemptions at 15–25k points/night."
  }
};
