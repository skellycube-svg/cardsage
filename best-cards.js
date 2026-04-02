// best-cards.js — FeeWorth Best Cards listicle page (vanilla JS)
// Loads cards-data.js and renders ROI rankings for 25 annual-fee cards.

(function() {
  'use strict';

  // Card IDs for each tier, and their URL slugs + categories
  var CARD_META = {
    // Premium
    'venture-x':       { slug: 'capital-one-venture-x',       cat: 'Travel' },
    'csr':             { slug: 'chase-sapphire-reserve',       cat: 'Travel' },
    'amex-plat':       { slug: 'amex-platinum',                cat: 'Travel' },
    'amex-biz-plat':   { slug: 'amex-business-platinum',       cat: 'Business' },
    'venture-x-biz':   { slug: 'capital-one-venture-x-business', cat: 'Business' },
    'delta-reserve':   { slug: 'delta-skymiles-reserve',       cat: 'Airline' },
    'united-club-inf': { slug: 'united-club-infinite',         cat: 'Airline' },
    'citi-aa-exec':    { slug: 'citi-aadvantage-executive',    cat: 'Airline' },
    'marriott-brilliant': { slug: 'marriott-bonvoy-brilliant', cat: 'Hotel' },
    'hilton-aspire':   { slug: 'hilton-honors-aspire',         cat: 'Hotel' },
    // Mid
    'amex-gold':       { slug: 'amex-gold',                    cat: 'Travel' },
    'amex-biz-gold':   { slug: 'amex-business-gold',           cat: 'Business' },
    'delta-plat':      { slug: 'delta-skymiles-platinum',      cat: 'Airline' },
    'sw-priority':     { slug: 'southwest-priority',           cat: 'Airline' },
    'ink-biz-premier': { slug: 'chase-ink-business-premier',   cat: 'Business' },
    'amex-green':      { slug: 'amex-green',                   cat: 'Travel' },
    'delta-gold':      { slug: 'delta-skymiles-gold',          cat: 'Airline' },
    'united-explorer': { slug: 'united-explorer',              cat: 'Airline' },
    // Budget
    'csp':             { slug: 'chase-sapphire-preferred',     cat: 'Travel' },
    'citi-premier':    { slug: 'citi-strata-premier',          cat: 'Travel' },
    'venture':         { slug: 'capital-one-venture',           cat: 'Travel' },
    'ink-preferred':   { slug: 'chase-ink-business-preferred', cat: 'Business' },
    'ihg-premier':     { slug: 'ihg-one-rewards-premier',      cat: 'Hotel' },
    'hyatt':           { slug: 'world-of-hyatt',               cat: 'Hotel' },
    'amex-bcp':        { slug: 'amex-blue-cash-preferred',     cat: 'Cash Back' }
  };

  var TIERS = {
    premium: ['venture-x','csr','amex-plat','amex-biz-plat','venture-x-biz','delta-reserve','united-club-inf','citi-aa-exec','marriott-brilliant','hilton-aspire'],
    mid: ['amex-gold','amex-biz-gold','delta-plat','sw-priority','ink-biz-premier','amex-green','delta-gold','united-explorer'],
    budget: ['csp','citi-premier','venture','ink-preferred','ihg-premier','hyatt','amex-bcp']
  };

  // Realistic redemption rates for benefit categories
  // Conservative: most credits at 85-95%, some niche ones lower
  var REDEMPTION_RATES = {
    travel: 0.90,
    dining: 0.90,
    statement: 0.75, // vendor-specific credits are harder to use
    awards: 0.80,    // companion certs, free nights — high value but not 100% usage
    status: 0.70,    // lounge access — only if you fly enough
    entertainment: 0.70,
    protection: 0    // protections have value but aren't quantifiable for ROI
  };

  // Card-specific verdicts (who it's best for)
  var VERDICTS = {
    'venture-x':       'Best for travelers who book through Capital One Travel. The $300 credit nearly covers the fee.',
    'csr':             'Best for frequent travelers who value Priority Pass, travel protections, and 1.5¢/point redemptions.',
    'amex-plat':       'Best for road warriors who use Centurion Lounges, airline credits, and hotel credits regularly.',
    'amex-biz-plat':   'Best for businesses spending on Dell, Adobe, and travel. Massive credit stack if you use the vendors.',
    'venture-x-biz':   'Best for businesses booking travel through Capital One. Simple $300 credit plus lounge access.',
    'delta-reserve':   'Best for frequent Delta flyers who value Sky Club access and the companion certificate.',
    'united-club-inf': 'Best for United hub flyers — Club membership alone exceeds the fee.',
    'citi-aa-exec':    'Best for AA loyalists — Admirals Club access is the main draw at a lower price than standalone membership.',
    'marriott-brilliant': 'Best for Marriott loyalists who use the free night and hotel credits consistently.',
    'hilton-aspire':   'Best for Hilton regulars who maximize the resort credit, free night, and Diamond status.',
    'amex-gold':       'Best for foodies — 4x dining and groceries plus monthly Uber and dining credits.',
    'amex-biz-gold':   'Best for businesses with high spend in rotating top categories. The 4x rate is the draw.',
    'delta-plat':      'Best for couples who fly Delta — the companion certificate alone can exceed the fee.',
    'sw-priority':     'Best for Southwest loyalists in a hub city. Anniversary points and travel credit add up.',
    'ink-biz-premier': 'Best for businesses with heavy travel spend. 5% on travel and 2.5% on everything else.',
    'amex-green':      'Best for occasional travelers who use CLEAR and LoungeBuddy. Easy to break even.',
    'delta-gold':      'Best for casual Delta flyers — the $200 flight credit alone exceeds the fee.',
    'united-explorer': 'Best for United flyers with a generous stack of travel credits that easily covers the fee.',
    'csp':             'Best entry-level travel card. Low fee with solid earning rates and trip protections.',
    'citi-premier':    'Best for well-rounded spenders who want 3x on dining, groceries, gas, and travel.',
    'venture':         'Best for simplicity — 2x flat-rate miles on everything with flexible redemptions.',
    'ink-preferred':   'Best for small businesses wanting 3x on travel, shipping, and advertising. Cell phone protection is a bonus.',
    'ihg-premier':     'Best budget hotel card — the free night alone covers the fee at most IHG properties.',
    'hyatt':           'Best value hotel card in the game. Free night worth $150+ against a $95 fee.',
    'amex-bcp':        'Best for families with high grocery and streaming spend. 6% on groceries up to $6k/year.'
  };

  // Load cards-data.js
  var s = document.createElement('script');
  s.src = '/cards-data.js';
  s.onload = function() { init(); };
  document.body.appendChild(s);

  function init() {
    if (typeof CARDS === 'undefined') return;
    var allCards = computeAll();
    renderTier('bc-tier-premium', TIERS.premium, allCards);
    renderTier('bc-tier-mid', TIERS.mid, allCards);
    renderTier('bc-tier-budget', TIERS.budget, allCards);
    renderTable(allCards);
    initFaq();
    injectItemListSchema(allCards);
  }

  function computeAll() {
    var results = [];
    var allIds = TIERS.premium.concat(TIERS.mid).concat(TIERS.budget);
    allIds.forEach(function(id) {
      var card = CARDS.find(function(c) { return c.id === id; });
      if (!card) return;
      var value = calcRealisticValue(card);
      var roi = card.fee > 0 ? Math.round((value / card.fee) * 100) : 0;
      results.push({
        id: id,
        card: card,
        value: value,
        roi: roi,
        meta: CARD_META[id],
        verdict: VERDICTS[id] || ''
      });
    });
    return results;
  }

  function calcRealisticValue(card) {
    var total = 0;
    (card.annual || []).forEach(function(b) {
      if (!b.v || b.v <= 0) return;
      var rate = REDEMPTION_RATES[b.cat] || 0.80;
      total += b.v * rate;
    });
    (card.monthly || []).forEach(function(b) {
      if (!b.v || b.v <= 0) return;
      var rate = REDEMPTION_RATES[b.cat] || 0.80;
      total += b.v * 12 * rate;
    });
    return Math.round(total);
  }

  function renderTier(containerId, ids, allCards) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var tierCards = ids.map(function(id) {
      return allCards.find(function(c) { return c.id === id; });
    }).filter(Boolean);

    // Sort by ROI descending within tier
    tierCards.sort(function(a, b) { return b.roi - a.roi; });

    var h = '';
    tierCards.forEach(function(item, i) {
      var c = item.card;
      var nw = c.network === 'Visa' ? 'VISA' : c.network === 'Amex' ? 'AMEX' : c.network === 'Mastercard' ? 'MC' : c.network;
      var roiClass = item.roi >= 100 ? 'bc-rank-roi-positive' : 'bc-rank-roi-negative';

      h += '<div class="bc-rank-card">' +
        '<div class="bc-rank-number">' + (i + 1) + '</div>' +
        '<div class="bc-rank-art" style="background:linear-gradient(135deg,' + c.c1 + ',' + c.c2 + ')">' + esc(nw) + '</div>' +
        '<div class="bc-rank-body">' +
          '<div class="bc-rank-header">' +
            '<div class="bc-rank-name"><a href="/cards/' + item.meta.slug + '">' + esc(c.short) + '</a></div>' +
            '<div class="bc-rank-fee">$' + c.fee + '/yr</div>' +
          '</div>' +
          '<div class="bc-rank-stats">' +
            '<div class="bc-rank-stat"><span class="bc-rank-stat-label">Realistic value: </span><span class="bc-rank-stat-value">$' + item.value.toLocaleString() + '/yr</span></div>' +
            '<div class="bc-rank-stat ' + roiClass + '"><span class="bc-rank-stat-label">ROI: </span><span class="bc-rank-stat-value">' + item.roi + '%</span></div>' +
          '</div>' +
          '<div class="bc-rank-verdict">' + esc(item.verdict) + '</div>' +
          '<a href="/cards/' + item.meta.slug + '" class="bc-rank-link">Check your ROI →</a>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML = h;
  }

  function renderTable(allCards) {
    var tbody = document.getElementById('bc-table-body');
    if (!tbody) return;

    // Sort by ROI descending by default
    var sorted = allCards.slice().sort(function(a, b) { return b.roi - a.roi; });

    tbody.innerHTML = sorted.map(function(item) {
      var roiClass = item.roi >= 120 ? 'bc-td-roi-good' : item.roi >= 80 ? 'bc-td-roi-ok' : 'bc-td-roi-bad';
      return '<tr>' +
        '<td class="bc-td-name"><a href="/cards/' + item.meta.slug + '">' + esc(item.card.short) + '</a></td>' +
        '<td class="bc-td-right">$' + item.card.fee + '</td>' +
        '<td class="bc-td-right">$' + item.value.toLocaleString() + '</td>' +
        '<td class="bc-td-right ' + roiClass + '">' + item.roi + '%</td>' +
        '<td><span class="bc-td-cat">' + esc(item.meta.cat) + '</span></td>' +
      '</tr>';
    }).join('');

    // Sort functionality
    initTableSort(allCards);
  }

  function initTableSort(allCards) {
    var table = document.getElementById('bc-table');
    if (!table) return;

    var headers = table.querySelectorAll('.bc-th-sortable');
    var currentSort = { key: 'roi', dir: 'desc' };

    headers.forEach(function(th) {
      th.addEventListener('click', function() {
        var key = th.getAttribute('data-sort');
        var dir = (currentSort.key === key && currentSort.dir === 'desc') ? 'asc' : 'desc';
        currentSort = { key: key, dir: dir };

        // Update header classes
        headers.forEach(function(h) { h.classList.remove('bc-sorted-asc', 'bc-sorted-desc'); });
        th.classList.add(dir === 'asc' ? 'bc-sorted-asc' : 'bc-sorted-desc');

        var sorted = allCards.slice().sort(function(a, b) {
          var va, vb;
          if (key === 'name') { va = a.card.short; vb = b.card.short; }
          else if (key === 'fee') { va = a.card.fee; vb = b.card.fee; }
          else if (key === 'value') { va = a.value; vb = b.value; }
          else { va = a.roi; vb = b.roi; }

          if (typeof va === 'string') {
            return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
          }
          return dir === 'asc' ? va - vb : vb - va;
        });

        var tbody = document.getElementById('bc-table-body');
        tbody.innerHTML = sorted.map(function(item) {
          var roiClass = item.roi >= 120 ? 'bc-td-roi-good' : item.roi >= 80 ? 'bc-td-roi-ok' : 'bc-td-roi-bad';
          return '<tr>' +
            '<td class="bc-td-name"><a href="/cards/' + item.meta.slug + '">' + esc(item.card.short) + '</a></td>' +
            '<td class="bc-td-right">$' + item.card.fee + '</td>' +
            '<td class="bc-td-right">$' + item.value.toLocaleString() + '</td>' +
            '<td class="bc-td-right ' + roiClass + '">' + item.roi + '%</td>' +
            '<td><span class="bc-td-cat">' + esc(item.meta.cat) + '</span></td>' +
          '</tr>';
        }).join('');
      });
    });

    // Mark initial sort
    var roiTh = table.querySelector('[data-sort="roi"]');
    if (roiTh) roiTh.classList.add('bc-sorted-desc');
  }

  function initFaq() {
    document.querySelectorAll('.bc-faq-q').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var exp = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !exp);
        var a = btn.nextElementSibling;
        if (a) a.classList.toggle('open', !exp);
      });
    });
  }

  function injectItemListSchema(allCards) {
    var sorted = allCards.slice().sort(function(a, b) { return b.roi - a.roi; });
    var items = sorted.map(function(item, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: item.card.name,
        url: 'https://www.feeworth.com/cards/' + item.meta.slug
      };
    });
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Best Credit Cards With Annual Fees (2026)',
      numberOfItems: items.length,
      itemListElement: items
    };
    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(schema);
    document.head.appendChild(el);
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
})();
