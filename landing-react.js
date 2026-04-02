// landing-react.js — React version of the FeeWorth landing page component
//
// This is only loaded after the user clicks a CTA and the app bundle loads.
// The static HTML version in index.html handles the initial render.
// This component is used by App()'s early-return for unauthenticated users
// after React has taken over rendering.

function LpIcon({d, size=20, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {d}
    </svg>
  );
}

const LpCheck = () => (
  <svg className="lp-feature-check" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <polyline points="5 12 10 17 20 7"/>
  </svg>
);

function LandingPage({onGetStarted}) {

  const scrollToHow = () => {
    const el = document.getElementById('lp-how-it-works');
    if (el) el.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <div className="lp">
      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-container">
          <div className="lp-nav-logo">FeeWorth</div>
          <button className="lp-nav-cta" onClick={onGetStarted}>Check Your Cards Free</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">Free credit card fee analyzer</div>
            <h1>Is Your Credit Card Annual Fee <em>Worth It?</em></h1>
            <p className="lp-hero-sub">
              Track every credit card benefit, see your real ROI, and never overpay for a card again.
            </p>
            <div className="lp-hero-cta-group">
              <button className="lp-btn-primary" onClick={onGetStarted}>
                Check Your Cards Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button className="lp-btn-secondary" onClick={scrollToHow}>See how it works</button>
            </div>
            <p className="lp-hero-note">No credit card required. Works with any card.</p>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-screenshot-frame">
              <div className="lp-browser-bar">
                <span className="lp-browser-dot lp-browser-dot-red"></span>
                <span className="lp-browser-dot lp-browser-dot-yellow"></span>
                <span className="lp-browser-dot lp-browser-dot-green"></span>
                <div className="lp-browser-url">feeworth.com/fee-check</div>
              </div>
              <div className="lp-screenshot-content">
                <div className="lp-sim-card-header">
                  <div className="lp-sim-card-img">VISA</div>
                  <div>
                    <div className="lp-sim-card-name">Sapphire Reserve</div>
                    <div className="lp-sim-card-issuer">Chase &middot; Visa</div>
                  </div>
                </div>
                <div className="lp-sim-metrics">
                  <div className="lp-sim-metric">
                    <div className="lp-sim-metric-label">Annual Fee</div>
                    <div className="lp-sim-metric-value lp-sim-metric-value-fee">$795</div>
                  </div>
                  <div className="lp-sim-metric">
                    <div className="lp-sim-metric-label">Total Credits</div>
                    <div className="lp-sim-metric-value lp-sim-metric-value-credits">$2,598</div>
                  </div>
                  <div className="lp-sim-net-box">
                    <div className="lp-sim-metric-label">Net Value</div>
                    <div className="lp-sim-metric-value lp-sim-metric-value-net">+$1,803</div>
                  </div>
                </div>
                <div className="lp-sim-verdict">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a6b5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                  This card pays for itself &mdash; you're $1,803 ahead
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ── */}
      <section className="lp-value-props">
        <div className="lp-container">
          <div className="lp-section-label">Why FeeWorth</div>
          <h2 className="lp-section-title">Stop guessing if your card is worth keeping</h2>
          <p className="lp-section-subtitle">
            Most people pay annual fees without knowing if they're getting their money's worth. FeeWorth shows you the real numbers.
          </p>
          <div className="lp-props-grid">
            <div className="lp-prop-card">
              <div className="lp-prop-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              </div>
              <div className="lp-prop-title">See your real ROI</div>
              <div className="lp-prop-desc">
                Know exactly whether each card pays for itself. See your annual fee vs. total credits at a glance, with a clear net value number you can act on.
              </div>
            </div>
            <div className="lp-prop-card">
              <div className="lp-prop-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div className="lp-prop-title">Never miss a benefit</div>
              <div className="lp-prop-desc">
                Track every credit, perk, and deadline. Check off benefits as you use them and see your actual ROI update in real time. Monthly reminders included.
              </div>
            </div>
            <div className="lp-prop-card">
              <div className="lp-prop-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <div className="lp-prop-title">Know when to keep, cancel, or switch</div>
              <div className="lp-prop-desc">
                Get personalized recommendations: retention offers to try, downgrade options, and replacement cards that could save you money.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features">
        <div className="lp-container">
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-title">Everything you need to make the call</h2>
          <p className="lp-section-subtitle">
            FeeWorth goes beyond simple fee comparisons with tools that give you the full picture.
          </p>

          <div className="lp-feature-row">
            <div className="lp-feature-text">
              <div className="lp-feature-tag">Benefit Tracker</div>
              <h3 className="lp-feature-title">Check off benefits. Watch your ROI climb.</h3>
              <p className="lp-feature-desc">
                Every card comes with credits you might be leaving on the table. FeeWorth lists every benefit, lets you check off what you've used, and shows your real ROI — not the theoretical maximum.
              </p>
              <ul className="lp-feature-bullets">
                <li><LpCheck/> Track travel credits, dining credits, streaming credits, and more</li>
                <li><LpCheck/> See monthly vs. annual benefits with deadline reminders</li>
                <li><LpCheck/> Transfer partner value insights that most tools miss</li>
              </ul>
            </div>
            <div className="lp-feature-visual">
              <div className="lp-feature-screenshot">
                <div className="lp-fs-header">
                  <div className="lp-fs-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="5 12 10 17 20 7"/></svg>
                  </div>
                  <div>
                    <div className="lp-fs-title">Benefit Tracker</div>
                    <div className="lp-fs-subtitle">4/12 checked &middot; $1,520 of $2,598 captured</div>
                  </div>
                </div>
                <div className="lp-bt-row"><div className="lp-bt-check lp-bt-check-on"></div><div className="lp-bt-name">$300 Travel Credit</div><span className="lp-bt-tag lp-bt-tag-travel">Travel</span><div className="lp-bt-value">$300/yr</div></div>
                <div className="lp-bt-row"><div className="lp-bt-check lp-bt-check-on"></div><div className="lp-bt-name">DoorDash Credit</div><span className="lp-bt-tag lp-bt-tag-dining">Dining</span><div className="lp-bt-value">$300/yr</div></div>
                <div className="lp-bt-row"><div className="lp-bt-check lp-bt-check-on"></div><div className="lp-bt-name">$10 Lyft Credit</div><span className="lp-bt-tag lp-bt-tag-travel">Travel</span><div className="lp-bt-value">$120/yr</div></div>
                <div className="lp-bt-row"><div className="lp-bt-check lp-bt-check-on"></div><div className="lp-bt-name">Global Entry / TSA PreCheck</div><span className="lp-bt-tag lp-bt-tag-travel">Travel</span><div className="lp-bt-value">$120/yr</div></div>
                <div className="lp-bt-row"><div className="lp-bt-check"></div><div className="lp-bt-name">$500 The Edit Hotel Credit</div><span className="lp-bt-tag lp-bt-tag-travel">Travel</span><div className="lp-bt-value">$500/yr</div></div>
                <div className="lp-bt-row"><div className="lp-bt-check"></div><div className="lp-bt-name">Priority Pass Lounge</div><span className="lp-bt-tag lp-bt-tag-travel">Travel</span><div className="lp-bt-value">Included</div></div>
              </div>
            </div>
          </div>

          <div className="lp-feature-row lp-feature-row-reverse">
            <div className="lp-feature-text">
              <div className="lp-feature-tag">Decision Tools</div>
              <h3 className="lp-feature-title">The guidance people are actually Googling for</h3>
              <p className="lp-feature-desc">
                Thinking about canceling? Not sure if you should downgrade? FeeWorth gives you every option — retention offers, what you'll lose, downgrade paths, and better alternatives — all in one place.
              </p>
              <ul className="lp-feature-bullets">
                <li><LpCheck/> Retention offer scripts and tips before you call</li>
                <li><LpCheck/> Exactly what you'll lose if you cancel</li>
                <li><LpCheck/> No-hard-pull downgrade options from your issuer</li>
                <li><LpCheck/> Better replacement cards ranked by net value</li>
              </ul>
            </div>
            <div className="lp-feature-visual">
              <div className="lp-feature-screenshot">
                <div className="lp-dt-row"><div className="lp-dt-icon lp-dt-icon-green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div><div className="lp-dt-label">Beyond the Numbers</div><div className="lp-dt-sub">Transfer partners, insurance, status perks &amp; more</div></div><div className="lp-dt-arrow">&rsaquo;</div></div>
                <div className="lp-dt-row"><div className="lp-dt-icon lp-dt-icon-green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div><div><div className="lp-dt-label">Retention Offers</div><div className="lp-dt-sub">Call before you cancel — most people get an offer</div></div><div className="lp-dt-arrow">&rsaquo;</div></div>
                <div className="lp-dt-row"><div className="lp-dt-icon lp-dt-icon-red"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div><div className="lp-dt-label">If You Cancel</div><div className="lp-dt-sub">What you'll lose and what happens to your points</div></div><div className="lp-dt-arrow">&rsaquo;</div></div>
                <div className="lp-dt-row"><div className="lp-dt-icon lp-dt-icon-green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></div><div><div className="lp-dt-label">Downgrade Options</div><div className="lp-dt-sub">3 product changes available &middot; No hard pull</div></div><div className="lp-dt-arrow">&rsaquo;</div></div>
                <div className="lp-dt-row"><div className="lp-dt-icon lp-dt-icon-green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg></div><div><div className="lp-dt-label">Recommended Replacement</div><div className="lp-dt-sub">Amex Platinum &middot; +$2,034 net value</div></div><div className="lp-dt-arrow">&rsaquo;</div></div>
              </div>
            </div>
          </div>

          <div className="lp-feature-row">
            <div className="lp-feature-text">
              <div className="lp-feature-tag">Household View</div>
              <h3 className="lp-feature-title">Manage cards together as a household</h3>
              <p className="lp-feature-desc">
                Couples and families often share card strategies. FeeWorth's household view tracks all your cards in one place — yours and your partner's — so you can optimize your total annual fees as a team.
              </p>
              <ul className="lp-feature-bullets">
                <li><LpCheck/> See combined fees, credits, and net value at a glance</li>
                <li><LpCheck/> Tag cards as "You" or "Partner" for clear ownership</li>
                <li><LpCheck/> Renewal timeline across all household cards</li>
              </ul>
            </div>
            <div className="lp-feature-visual">
              <div className="lp-feature-screenshot">
                <div className="lp-fs-header">
                  <div className="lp-fs-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12l2-2m0 0l7-7 7 7m-14 0v8a1 1 0 0 0 1 1h3m10-9l2 2m-2-2v8a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1m-4 0h4"/></svg></div>
                  <div><div className="lp-fs-title">Fee Dashboard</div><div className="lp-fs-subtitle">6 cards (household) &middot; 4 with annual fees</div></div>
                </div>
                <div className="lp-sim-metrics" style={{marginBottom:20}}>
                  <div className="lp-sim-metric"><div className="lp-sim-metric-label">Total Fees</div><div className="lp-sim-metric-value lp-sim-metric-value-fee" style={{fontSize:'1.3rem'}}>$1,080</div></div>
                  <div className="lp-sim-metric"><div className="lp-sim-metric-label">Credits</div><div className="lp-sim-metric-value lp-sim-metric-value-credits" style={{fontSize:'1.3rem'}}>$4,196</div></div>
                  <div className="lp-sim-net-box"><div className="lp-sim-metric-label">Net ROI</div><div className="lp-sim-metric-value lp-sim-metric-value-net" style={{fontSize:'1.3rem'}}>+$3,116</div></div>
                </div>
                <div className="lp-hh-timeline-label">Renewal Timeline</div>
                <div className="lp-bt-row"><div className="lp-hh-bar lp-hh-bar-you"></div><div className="lp-bt-name">Sapphire Reserve <span className="lp-hh-tag lp-hh-tag-you">YOU</span></div><div className="lp-bt-value">$795/yr</div></div>
                <div className="lp-bt-row"><div className="lp-hh-bar lp-hh-bar-partner"></div><div className="lp-bt-name">Hyatt Card <span className="lp-hh-tag lp-hh-tag-partner">PARTNER</span></div><div className="lp-bt-value">$95/yr</div></div>
                <div className="lp-bt-row"><div className="lp-hh-bar lp-hh-bar-you"></div><div className="lp-bt-name">Bilt Obsidian <span className="lp-hh-tag lp-hh-tag-you">YOU</span></div><div className="lp-bt-value">$95/yr</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how-it-works" id="lp-how-it-works">
        <div className="lp-container">
          <div className="lp-section-label">How it works</div>
          <h2 className="lp-section-title">Get your answer in 2 minutes</h2>
          <div className="lp-steps-grid">
            <div className="lp-step"><div className="lp-step-number">1</div><div className="lp-step-title">Add your cards</div><div className="lp-step-desc">Select your credit cards from our database of 100+ cards with pre-loaded benefits.</div></div>
            <div className="lp-step"><div className="lp-step-number">2</div><div className="lp-step-title">Check off what you use</div><div className="lp-step-desc">Mark the benefits you actually redeem. Your real ROI updates instantly.</div></div>
            <div className="lp-step"><div className="lp-step-number">3</div><div className="lp-step-title">Get your verdict</div><div className="lp-step-desc">See whether to keep, cancel, downgrade, or switch — with the exact options to do it.</div></div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-final-cta">
        <div className="lp-container">
          <h2>Stop guessing. Start knowing.</h2>
          <p>Find out if your credit card fees are actually worth it — in under 2 minutes, completely free.</p>
          <button className="lp-btn-primary" onClick={onGetStarted}>
            Check Your Cards Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <p className="lp-final-note">No account required to start. Works with all major credit cards.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-logo">FeeWorth</div>
          <div className="lp-footer-links">
            <a href="./privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>
            <a href="./terms.html" target="_blank" rel="noopener">Terms of Service</a>
            <a href="./affiliate-disclosure.html" target="_blank" rel="noopener">Affiliate Disclosure</a>
          </div>
          <div className="lp-footer-disclosure">
            FeeWorth may earn a commission from card applications. This does not influence our recommendations. All card data is stored locally on your device and synced securely to your account.
          </div>
        </div>
      </footer>
    </div>
  );
}
