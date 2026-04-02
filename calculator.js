// calculator.js — FeeWorth Annual Fee Calculator page (vanilla JS)
//
// Self-contained interactive calculator. Loads cards-data.js for card data,
// but requires NO React, Firebase, or Babel. Firebase only loads if user
// clicks "Save results" / "Create free account."

(function() {
  'use strict';

  // ── State ──
  var selectedCard = null;
  var checkedBenefits = {};  // key -> true

  // ── DOM refs ──
  var toolBody = document.getElementById('calc-tool-body');
  var searchInput = document.getElementById('calc-search');
  var searchResults = document.getElementById('calc-search-results');

  // ── Wait for cards-data.js to load ──
  function waitForCards(cb) {
    if (window.CARDS) return cb();
    var s = document.createElement('script');
    s.src = 'cards-data.js';
    s.onload = function() { cb(); };
    s.onerror = function() { toolBody.innerHTML = '<p style="padding:20px;text-align:center;color:#dc2626">Failed to load card data. Please refresh.</p>'; };
    document.body.appendChild(s);
  }

  // ── Scroll to tool ──
  var startBtn = document.getElementById('calc-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      document.getElementById('calc-tool').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() { if (searchInput) searchInput.focus(); }, 400);
    });
  }

  // ── FAQ toggles ──
  document.querySelectorAll('.calc-faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      var answer = btn.nextElementSibling;
      if (answer) answer.classList.toggle('open', !expanded);
    });
  });

  // ── Popular card tiles ──
  document.querySelectorAll('[data-card-id]').forEach(function(tile) {
    tile.addEventListener('click', function() {
      var cardId = tile.getAttribute('data-card-id');
      waitForCards(function() {
        var card = CARDS.find(function(c) { return c.id === cardId; });
        if (card) selectCard(card);
        document.getElementById('calc-tool').scrollIntoView({ behavior: 'smooth' });
      });
    });
  });

  // ── Initialize search on first focus ──
  var searchInitialized = false;
  if (searchInput) {
    searchInput.addEventListener('focus', function() {
      if (!searchInitialized) {
        searchInitialized = true;
        waitForCards(function() { initSearch(); });
      }
    });
  }

  function initSearch() {
    searchInput.addEventListener('input', function() {
      var q = searchInput.value.trim().toLowerCase();
      if (q.length < 1) { searchResults.style.display = 'none'; return; }
      var matches = CARDS.filter(function(c) {
        return !c.isBiz && (
          c.name.toLowerCase().indexOf(q) !== -1 ||
          c.short.toLowerCase().indexOf(q) !== -1 ||
          c.issuer.toLowerCase().indexOf(q) !== -1
        );
      }).slice(0, 8);

      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="calc-search-empty">No cards found</div>';
      } else {
        searchResults.innerHTML = matches.map(function(c) {
          return '<div class="calc-search-item" data-sid="' + c.id + '">' +
            '<div class="calc-search-card-chip" style="background:linear-gradient(135deg,' + c.c1 + ',' + c.c2 + ')">' + (c.network === 'Visa' ? 'VISA' : c.network === 'Amex' ? 'AMEX' : c.network) + '</div>' +
            '<div><div class="calc-search-name">' + esc(c.short) + '</div>' +
            '<div class="calc-search-meta">' + esc(c.issuer) + (c.fee > 0 ? ' &middot; $' + c.fee + '/yr' : ' &middot; No annual fee') + '</div></div></div>';
        }).join('');
      }
      searchResults.style.display = 'block';

      // Bind click handlers
      searchResults.querySelectorAll('.calc-search-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var card = CARDS.find(function(c) { return c.id === item.getAttribute('data-sid'); });
          if (card) selectCard(card);
          searchResults.style.display = 'none';
          searchInput.value = '';
        });
      });
    });

    // Close dropdown on click outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.calc-search-wrap')) searchResults.style.display = 'none';
    });
  }

  // ── Select a card and render the calculator ──
  function selectCard(card) {
    selectedCard = card;
    checkedBenefits = {};
    renderCalculator();
  }

  function renderCalculator() {
    var card = selectedCard;
    if (!card) return;

    // Gather all benefits with dollar values
    var annualBenefits = (card.annual || []).filter(function(b) { return b.v && b.v > 0; });
    var monthlyBenefits = (card.monthly || []).filter(function(b) { return b.v && b.v > 0; });
    var totalPossible = 0;
    annualBenefits.forEach(function(b) { totalPossible += b.v; });
    monthlyBenefits.forEach(function(b) { totalPossible += b.v * 12; });

    var totalUsed = 0;
    Object.keys(checkedBenefits).forEach(function(key) {
      if (!checkedBenefits[key]) return;
      // Find the benefit
      var found = annualBenefits.find(function(b) { return benKey(b, false) === key; });
      if (found) { totalUsed += found.v; return; }
      found = monthlyBenefits.find(function(b) { return benKey(b, true) === key; });
      if (found) totalUsed += found.v * 12;
    });

    var net = totalUsed - card.fee;
    var isPositive = net >= 0;

    // Card header
    var html = '<div class="calc-card-header">' +
      '<div class="calc-card-art" style="background:linear-gradient(135deg,' + card.c1 + ',' + card.c2 + ')">' + (card.network === 'Visa' ? 'VISA' : card.network === 'Amex' ? 'AMEX' : card.network) + '</div>' +
      '<div><div class="calc-card-name">' + esc(card.short) + '</div>' +
      '<div class="calc-card-issuer">' + esc(card.issuer) + ' &middot; ' + esc(card.network) + '</div></div>' +
      '<button class="calc-change-btn" id="calc-change">Change card</button></div>';

    // Metrics
    html += '<div class="calc-metrics">' +
      '<div class="calc-metric"><div class="calc-metric-label">Annual Fee</div><div class="calc-metric-value calc-metric-value-fee">$' + card.fee + '</div></div>' +
      '<div class="calc-metric"><div class="calc-metric-label">Credits Used</div><div class="calc-metric-value calc-metric-value-used">$' + totalUsed.toLocaleString() + '</div></div>' +
      '<div class="calc-net-box"><div class="calc-metric-label">Net Value</div><div class="calc-metric-value ' + (isPositive ? 'calc-net-positive' : 'calc-net-negative') + '">' + (isPositive ? '+' : '') + '$' + Math.abs(net).toLocaleString() + '</div></div>' +
      '</div>';

    // Annual benefits
    if (annualBenefits.length > 0) {
      html += '<div class="calc-benefits-label">Annual Benefits</div>';
      annualBenefits.forEach(function(b) {
        var key = benKey(b, false);
        var checked = !!checkedBenefits[key];
        var tagClass = 'calc-benefit-tag-' + (b.cat || 'statement');
        html += '<div class="calc-benefit-row" data-key="' + key + '">' +
          '<div class="calc-benefit-check' + (checked ? ' checked' : '') + '"></div>' +
          '<div class="calc-benefit-name">' + esc(b.n) + '</div>' +
          '<span class="calc-benefit-tag ' + tagClass + '">' + esc(capitalize(b.cat || '')) + '</span>' +
          '<div class="calc-benefit-value">$' + b.v + '/yr</div></div>';
      });
    }

    // Monthly benefits
    if (monthlyBenefits.length > 0) {
      html += '<div class="calc-monthly-label">Monthly Benefits</div>';
      monthlyBenefits.forEach(function(b) {
        var key = benKey(b, true);
        var checked = !!checkedBenefits[key];
        var tagClass = 'calc-benefit-tag-' + (b.cat || 'statement');
        html += '<div class="calc-benefit-row" data-key="' + key + '">' +
          '<div class="calc-benefit-check' + (checked ? ' checked' : '') + '"></div>' +
          '<div class="calc-benefit-name">' + esc(b.n) + '</div>' +
          '<span class="calc-benefit-tag ' + tagClass + '">' + esc(capitalize(b.cat || '')) + '</span>' +
          '<div class="calc-benefit-value">$' + b.v + '/mo</div></div>';
      });
    }

    // Verdict
    if (card.fee === 0) {
      html += '<div class="calc-verdict calc-verdict-keep">' +
        '<div class="calc-verdict-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6b5a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></div>' +
        '<div class="calc-verdict-title">No annual fee — this card costs nothing to keep</div>' +
        '<div class="calc-verdict-desc">Free cards are always worth keeping for credit history length.</div></div>';
    } else {
      html += '<div class="calc-verdict ' + (isPositive ? 'calc-verdict-keep' : 'calc-verdict-cancel') + '">' +
        '<div class="calc-verdict-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + (isPositive ? '#1a6b5a' : '#dc2626') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="' + (isPositive ? 'M9 12l2 2 4-4' : 'M15 9l-6 6M9 9l6 6') + '"/></svg></div>' +
        '<div class="calc-verdict-title">' + (isPositive ? 'This card pays for itself — you\'re $' + Math.abs(net).toLocaleString() + ' ahead' : 'You\'re leaving $' + Math.abs(net).toLocaleString() + ' on the table') + '</div>' +
        '<div class="calc-verdict-desc">' + (isPositive ? 'Based on the benefits you actually use, the fee is worth it.' : 'You\'re not using enough benefits to cover the $' + card.fee + ' fee. Consider which unchecked benefits you might use, or explore downgrade options.') + '</div></div>';
    }

    // Save prompt
    html += '<div class="calc-save-prompt">' +
      '<p>Track your benefits year-round and get renewal reminders</p>' +
      '<button class="calc-save-btn" id="calc-save-btn">Create Free Account</button></div>';

    toolBody.innerHTML = html;

    // ── Bind events ──
    // Change card
    var changeBtn = document.getElementById('calc-change');
    if (changeBtn) {
      changeBtn.addEventListener('click', function() {
        selectedCard = null;
        checkedBenefits = {};
        renderSearchState();
        searchInput.focus();
      });
    }

    // Benefit toggles
    toolBody.querySelectorAll('.calc-benefit-row').forEach(function(row) {
      row.addEventListener('click', function() {
        var key = row.getAttribute('data-key');
        checkedBenefits[key] = !checkedBenefits[key];
        renderCalculator();
      });
    });

    // Save button — lazy-load app
    var saveBtn = document.getElementById('calc-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        window.location.href = '/?signup=1';
      });
    }
  }

  function renderSearchState() {
    toolBody.innerHTML = '<div class="calc-search-wrap">' +
      '<svg class="calc-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
      '<input class="calc-search" id="calc-search" type="text" placeholder="Search for your credit card..." autocomplete="off"/>' +
      '<div class="calc-search-results" id="calc-search-results" style="display:none"></div></div>' +
      '<p style="text-align:center;color:#8a94a6;font-size:0.85rem;margin-top:12px">Or pick a popular card below</p>';

    // Re-bind refs
    searchInput = document.getElementById('calc-search');
    searchResults = document.getElementById('calc-search-results');
    searchInitialized = false;
    searchInput.addEventListener('focus', function() {
      if (!searchInitialized) {
        searchInitialized = true;
        waitForCards(function() { initSearch(); });
      }
    });
  }

  // ── Helpers ──
  function benKey(b, isMonthly) { return (isMonthly ? 'm-' : 'a-') + b.n; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ── Pre-fill popular cards with data from cards-data.js ──
  // This runs after cards-data.js loads to update fee amounts from source of truth
  function updatePopularCardFees() {
    if (!window.CARDS) return;
    document.querySelectorAll('[data-card-id]').forEach(function(tile) {
      var cardId = tile.getAttribute('data-card-id');
      var card = CARDS.find(function(c) { return c.id === cardId; });
      if (card) {
        var feeEl = tile.querySelector('.calc-card-tile-fee');
        if (feeEl) feeEl.textContent = '$' + card.fee + '/yr';
      }
    });
  }

  // Eagerly load cards-data.js so popular card fees are accurate
  waitForCards(function() { updatePopularCardFees(); });

})();
