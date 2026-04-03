// card-page.js — FeeWorth card-specific SEO page (vanilla JS)
//
// Reads data-card-id from the page, loads cards-data.js, and populates:
// - Interactive Fee Check calculator (pre-selected to this card)
// - Key benefits grid
// - Break-even math
// - FAQ answers with card-specific numbers

(function() {
  'use strict';

  var CARD_ID = document.documentElement.getAttribute('data-card-id');
  if (!CARD_ID) return;

  var checkedBenefits = {};
  var card = null;
  var toolBody = document.getElementById('cp-tool-body');
  var benefitsGrid = document.getElementById('cp-benefits-grid');
  var breakeven = document.getElementById('cp-breakeven');

  // Load cards-data.js then initialize
  var s = document.createElement('script');
  s.src = '/cards-data.js';
  s.onload = function() { init(); };
  document.body.appendChild(s);

  function init() {
    card = CARDS.find(function(c) { return c.id === CARD_ID; });
    if (!card) { toolBody.innerHTML = '<p class="cp-tool-loading">Card not found.</p>'; return; }

    // Update dynamic text that JS enhances beyond static HTML
    updateFee('.cp-fee-dynamic', '$' + card.fee);
    renderCalculator();
    renderBenefitsGrid();
    renderBreakeven();
    renderFaqAnswers();
  }

  function updateFee(sel, text) {
    document.querySelectorAll(sel).forEach(function(el) { el.textContent = text; });
  }

  // ── Fee Check Calculator ──
  function renderCalculator() {
    var annualBenefits = (card.annual || []).filter(function(b) { return b.v && b.v > 0; });
    var monthlyBenefits = (card.monthly || []).filter(function(b) { return b.v && b.v > 0; });

    var totalUsed = 0;
    Object.keys(checkedBenefits).forEach(function(key) {
      if (!checkedBenefits[key]) return;
      // Period-specific keys (e.g. a-Dining Credit-2026-H1) are handled below
      if (key.match(/-\d{4}-(Q\d|H\d)$/)) return;
      // Single-key annual benefit
      var found = annualBenefits.find(function(b) { return bk(b, false) === key; });
      if (found) { totalUsed += found.v; return; }
      // Monthly benefit
      found = monthlyBenefits.find(function(b) { return bk(b, true) === key; });
      if (found) totalUsed += found.v * 12;
    });
    // Multi-period benefits: each checked period adds one period's value
    annualBenefits.forEach(function(b) {
      var pk = periodKeys(b);
      if (!pk) return;
      pk.forEach(function(p) {
        if (checkedBenefits[p.key]) totalUsed += b.v;
      });
    });

    var net = totalUsed - card.fee;
    var pos = net >= 0;
    var nw = card.network === 'Visa' ? 'VISA' : card.network === 'Amex' ? 'AMEX' : card.network;

    var h = '<div class="cp-card-header">' +
      '<div class="cp-card-art" style="background:linear-gradient(135deg,' + card.c1 + ',' + card.c2 + ')">' + nw + '</div>' +
      '<div><div class="cp-card-name">' + esc(card.short) + '</div><div class="cp-card-issuer">' + esc(card.issuer) + ' &middot; ' + esc(card.network) + '</div></div></div>';

    h += '<div class="cp-metrics">' +
      '<div class="cp-metric"><div class="cp-metric-label">Annual Fee</div><div class="cp-metric-value cp-metric-fee">$' + card.fee + '</div></div>' +
      '<div class="cp-metric"><div class="cp-metric-label">Credits Used</div><div class="cp-metric-value cp-metric-used">$' + totalUsed.toLocaleString() + '</div></div>' +
      '<div class="cp-net-box"><div class="cp-metric-label">Net Value</div><div class="cp-metric-value ' + (pos ? 'cp-net-positive' : 'cp-net-negative') + '">' + (pos ? '+' : '-') + '$' + Math.abs(net).toLocaleString() + '</div></div></div>';

    if (annualBenefits.length > 0) {
      h += '<div class="cp-benefits-label">Annual Benefits</div>';
      annualBenefits.forEach(function(b) { h += benefitRow(b, false); });
    }
    if (monthlyBenefits.length > 0) {
      h += '<div class="cp-monthly-label">Monthly Benefits</div>';
      monthlyBenefits.forEach(function(b) { h += benefitRow(b, true); });
    }

    if (card.fee === 0) {
      h += verdict(true, 'No annual fee — this card costs nothing to keep', 'Free cards are always worth keeping for credit history length.');
    } else {
      h += verdict(pos,
        pos ? 'This card pays for itself — you\'re $' + Math.abs(net).toLocaleString() + ' ahead' : 'You\'re leaving $' + Math.abs(net).toLocaleString() + ' on the table',
        pos ? 'Based on the benefits you actually use, the fee is worth it.' : 'You\'re not using enough benefits to cover the $' + card.fee + ' fee. Check the benefits you might use, or explore downgrade options.');
    }

    h += '<div class="cp-save-prompt"><p>Track your benefits year-round and get renewal reminders</p><button class="cp-save-btn" id="cp-save-btn">Create Free Account</button></div>';

    toolBody.innerHTML = h;

    // Bind single-checkbox rows
    toolBody.querySelectorAll('.cp-benefit-row:not([data-multi])').forEach(function(row) {
      row.addEventListener('click', function() {
        checkedBenefits[row.getAttribute('data-key')] = !checkedBenefits[row.getAttribute('data-key')];
        renderCalculator();
      });
    });
    // Bind multi-period checkboxes
    toolBody.querySelectorAll('.cp-period-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var pkey = item.getAttribute('data-pkey');
        checkedBenefits[pkey] = !checkedBenefits[pkey];
        renderCalculator();
      });
    });
    var saveBtn = document.getElementById('cp-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', function() { window.location.href = '/?signup=1'; });
  }

  function benefitRow(b, isMonthly) {
    var pk = isMonthly ? null : periodKeys(b);

    if (pk) {
      // Multi-period row (semi-annual or quarterly)
      var allChecked = pk.every(function(p) { return !!checkedBenefits[p.key]; });
      var periodLabel = b.reset === 'quarterly' ? 'quarter' : '6 mo';
      var h = '<div class="cp-benefit-row cp-benefit-multi" data-multi="true">';
      h += '<div class="cp-benefit-name">' + esc(b.n) + '</div>';
      h += '<span class="cp-benefit-tag cp-benefit-tag-' + (b.cat || 'statement') + '">' + cap(b.cat || '') + '</span>';
      h += '<div class="cp-benefit-value' + (allChecked ? ' cp-benefit-value-done' : '') + '">$' + b.v + '/' + periodLabel + '</div>';
      h += '<div class="cp-period-checks">';
      pk.forEach(function(p) {
        var pd = !!checkedBenefits[p.key];
        var classes = 'cp-period-box';
        if (pd) classes += ' checked';
        if (p.current && !pd) classes += ' current';
        if (p.past && !pd) classes += ' past';
        h += '<div class="cp-period-item" data-pkey="' + p.key + '">';
        h += '<div class="' + classes + '"></div>';
        h += '<span class="cp-period-label' + (p.current ? ' cp-period-current' : '') + '">' + p.label + '</span>';
        if (p.sub) h += '<span class="cp-period-sub">' + p.sub + '</span>';
        h += '</div>';
      });
      h += '</div></div>';
      return h;
    }

    // Single-checkbox row (monthly, annual, one-time)
    var key = bk(b, isMonthly);
    var checked = !!checkedBenefits[key];
    return '<div class="cp-benefit-row" data-key="' + key + '">' +
      '<div class="cp-benefit-check' + (checked ? ' checked' : '') + '"></div>' +
      '<div class="cp-benefit-name">' + esc(b.n) + '</div>' +
      '<span class="cp-benefit-tag cp-benefit-tag-' + (b.cat || 'statement') + '">' + cap(b.cat || '') + '</span>' +
      '<div class="cp-benefit-value">$' + b.v + freqSuffix(b, isMonthly) + '</div></div>';
  }

  function verdict(pos, title, desc) {
    return '<div class="cp-verdict ' + (pos ? 'cp-verdict-keep' : 'cp-verdict-cancel') + '">' +
      '<div class="cp-verdict-title">' + title + '</div>' +
      '<div class="cp-verdict-desc">' + desc + '</div></div>';
  }

  // ── Benefits Grid ──
  function renderBenefitsGrid() {
    if (!benefitsGrid) return;
    var all = [].concat(
      (card.annual || []).map(function(b) { return Object.assign({}, b, { period: b.reset || 'annual' }); }),
      (card.monthly || []).map(function(b) { return Object.assign({}, b, { period: 'monthly' }); })
    );
    if (all.length === 0) { benefitsGrid.innerHTML = '<p style="color:#8a94a6">This card has no recurring credits — its value comes from points earnings and protections.</p>'; return; }
    benefitsGrid.innerHTML = all.map(function(b) {
      var valStr = b.v ? '$' + b.v + freqSuffixFromPeriod(b.period) : 'Included';
      return '<div class="cp-bg-card' + (!b.v ? ' cp-bg-perk' : '') + '">' +
        '<div class="cp-bg-name">' + esc(b.n) + '</div>' +
        '<div class="cp-bg-value">' + valStr + '</div>' +
        (b.d ? '<div class="cp-bg-desc">' + esc(b.d.substring(0, 120)) + (b.d.length > 120 ? '...' : '') + '</div>' : '') +
        '</div>';
    }).join('');
  }

  // ── Break-even Math ──
  function renderBreakeven() {
    if (!breakeven || card.fee === 0) { if (breakeven) breakeven.style.display = 'none'; return; }
    var valued = [].concat(
      (card.annual || []).filter(function(b) { return b.v > 0; }).map(function(b) { return Object.assign({}, b, { v: b.v * annualMultiplier(b) }); }),
      (card.monthly || []).filter(function(b) { return b.v > 0; }).map(function(b) { return Object.assign({}, b, { v: b.v * 12, _monthly: true }); })
    ).sort(function(a, b) { return b.v - a.v; });

    if (valued.length === 0) { breakeven.style.display = 'none'; return; }
    var top = valued.slice(0, 3);
    var sum = top.reduce(function(s, b) { return s + b.v; }, 0);
    var names = top.map(function(b) { return b.n; });
    var nameStr = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];

    breakeven.innerHTML = '<div class="cp-breakeven-title">Break-Even Math</div>' +
      '<div class="cp-breakeven-text">If you use ' + esc(nameStr) + ', you\'ll recoup <span class="cp-breakeven-amount">$' + sum.toLocaleString() + '</span> of the $' + card.fee + ' fee — ' +
      (sum >= card.fee ? 'more than covering the annual cost.' : 'getting you ' + Math.round(sum / card.fee * 100) + '% of the way there.') + ' Run the calculator above to see your exact ROI.</div>';
  }

  // ── FAQ Answers ──
  function renderFaqAnswers() {
    // Worth it answer
    var valued = [].concat(
      (card.annual || []).filter(function(b) { return b.v > 0; }).map(function(b) { return Object.assign({}, b, { v: b.v * annualMultiplier(b) }); }),
      (card.monthly || []).filter(function(b) { return b.v > 0; }).map(function(b) { return Object.assign({}, b, { v: b.v * 12 }); })
    ).sort(function(a, b) { return b.v - a.v; });
    var topNames = valued.slice(0, 2).map(function(b) { return b.n; }).join(' and ');

    setFaq('faq-worth', 'It depends on your usage. Cardholders who use ' + (topNames || 'the key benefits') + ' typically recoup the $' + card.fee + ' fee. Run the calculator above to see your specific ROI.');
    setFaq('faq-fee', 'The ' + card.short + ' has a $' + card.fee + ' annual fee.');

    // Downgrade
    var dp = card.downgradePaths;
    if (dp && dp.length > 0) {
      var paths = dp.map(function(d) { return d.cardName + ' ($' + d.annualFee + '/yr)'; }).join(', ');
      setFaq('faq-downgrade', 'Yes. Available downgrades: ' + paths + '. Contact ' + card.issuer + ' to product-change and preserve your account history.');
    } else {
      setFaq('faq-downgrade', 'Contact ' + card.issuer + ' to ask about downgrade or product-change options that preserve your account history and credit line.');
    }

    setFaq('faq-when', 'The annual fee is typically charged on your account anniversary date. FeeWorth can track your renewal date and remind you to re-evaluate before it hits.');
  }

  function setFaq(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── FAQ toggles ──
  document.querySelectorAll('.cp-faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var exp = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !exp);
      var a = btn.nextElementSibling;
      if (a) a.classList.toggle('open', !exp);
    });
  });

  // ── Scroll to tool ──
  var startBtn = document.getElementById('cp-start-btn');
  if (startBtn) startBtn.addEventListener('click', function() {
    document.getElementById('cp-tool').scrollIntoView({ behavior: 'smooth' });
  });

  // Helpers
  function bk(b, m) { return (m ? 'm-' : 'a-') + b.n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function annualMultiplier(b) {
    var r = b.reset || 'annual';
    if (r === 'quarterly') return 4;
    if (r === 'semi-annual') return 2;
    return 1;
  }
  function freqSuffix(b, isMonthly) {
    if (isMonthly) return '/mo';
    var r = b.reset || 'annual';
    if (r === 'quarterly') return '/quarter';
    if (r === 'semi-annual') return '/semi-annually';
    return '/yr';
  }
  function periodKeys(b) {
    var year = new Date().getFullYear();
    var month = new Date().getMonth();
    var base = 'a-' + b.n;
    if (b.reset === 'quarterly') {
      var cq = Math.floor(month / 3);
      return [0,1,2,3].map(function(i) {
        return { key: base + '-' + year + '-Q' + (i+1), label: 'Q' + (i+1), current: i === cq, past: i < cq };
      });
    }
    if (b.reset === 'semi-annual') {
      var ch = month < 6 ? 0 : 1;
      return [
        { key: base + '-' + year + '-H1', label: 'H1', sub: 'Jan\u2013Jun', current: ch === 0, past: false },
        { key: base + '-' + year + '-H2', label: 'H2', sub: 'Jul\u2013Dec', current: ch === 1, past: ch > 1 }
      ];
    }
    return null;
  }
  function freqSuffixFromPeriod(period) {
    if (period === 'monthly') return '/mo';
    if (period === 'quarterly') return '/quarter';
    if (period === 'semi-annual') return '/semi-annually';
    return '/yr';
  }
})();
