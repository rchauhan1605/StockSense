import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    orig = f.read()

c_idx = orig.find('const METRIC_CONFIG = {')

constants = """const BEGINNER_TABS = [
  {
    id: "beg_quality",
    label: "🏆 Quality",
    tagline: "Consistently profitable companies",
    explanation: "These companies have been generating strong returns for shareholders year after year. High ROE means they're efficient with money. Low-to-moderate P/E means you're not overpaying.",
    recommendation: "Great starting point for long-term investors.",
    color: "#2563eb",
    bgColor: "#eff6ff",
    filters: [
      { field: "roe", operator: ">", value: 20 },
      { field: "pe", operator: "<", value: 35 },
      { field: "pe", operator: ">", value: 5 },
      { field: "pb", operator: "<", value: 5 }
    ],
    sortCol: "roe",
    sortDir: -1
  },
  {
    id: "beg_value",
    label: "💎 Value",
    tagline: "Underpriced quality stocks",
    explanation: "These stocks are trading at low prices relative to their actual worth. Low P/E and P/B ratios suggest the market may have underpriced them. Value investing made famous by Warren Buffett.",
    recommendation: "Best for patient investors with 2-3 year horizon.",
    color: "#059669",
    bgColor: "#ecfdf5",
    filters: [
      { field: "pe", operator: "<", value: 15 },
      { field: "pe", operator: ">", value: 3 },
      { field: "pb", operator: "<", value: 2 },
      { field: "roe", operator: ">", value: 12 }
    ],
    sortCol: "pe",
    sortDir: 1
  },
  {
    id: "beg_dividend",
    label: "💰 Income",
    tagline: "Stocks that pay you regularly",
    explanation: "These companies share their profits with shareholders as dividends — like interest from a fixed deposit, but from a stock. Higher yield means more income per rupee invested.",
    recommendation: "Ideal for passive income seekers.",
    color: "#d97706",
    bgColor: "#fffbeb",
    filters: [
      { field: "divYield", operator: ">", value: 2 },
      { field: "roe", operator: ">", value: 10 },
      { field: "pe", operator: "<", value: 40 }
    ],
    sortCol: "divYield",
    sortDir: -1
  },
  {
    id: "beg_growth",
    label: "🚀 Growth",
    tagline: "Fast-growing companies",
    explanation: "These companies are expanding revenues and earnings rapidly. Higher P/E is acceptable here because you're paying for future growth potential. Think of it as buying tomorrow's leaders today.",
    recommendation: "For investors comfortable with higher risk for higher reward.",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    filters: [
      { field: "revenueGrowth", operator: ">", value: 15 },
      { field: "earningsGrowth", operator: ">", value: 15 },
      { field: "roe", operator: ">", value: 15 }
    ],
    sortCol: "earningsGrowth",
    sortDir: -1
  },
  {
    id: "beg_momentum",
    label: "📈 Trending",
    tagline: "Stocks the market is buying now",
    explanation: "These stocks are in an uptrend — trading above their 200-day average price, and seeing higher-than-normal buying volume. Momentum means: what's going up tends to keep going up (in the short term).",
    recommendation: "For short-to-medium term investors. Set stop losses.",
    color: "#dc2626",
    bgColor: "#fef2f2",
    filters: [
      { field: "vsMA200", operator: ">", value: 0 },
      { field: "vsMA50", operator: ">", value: 0 },
      { field: "change", operator: ">", value: 0 }
    ],
    sortCol: "vsMA200",
    sortDir: -1
  },
  {
    id: "beg_watchlist",
    label: "⭐ My Saves",
    tagline: "Stocks you've bookmarked",
    explanation: "These are the stocks you starred while browsing. Come back here to track them anytime.",
    recommendation: "Your personal shortlist.",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    filters: [],
    sortCol: null,
    sortDir: -1
  }
];

const METRIC_CATEGORIES = {
  fundamental: ["pe", "roe", "pb", "divYield", "eps", 
                "revenueGrowth", "earningsGrowth", "marketCap"],
  technical:   ["change", "price", "beta", "fromHigh52", 
                "fromLow52", "vsMA50", "vsMA200", 
                "volumeSpike", "volume"],
  combined:    ["pe", "roe", "pb", "divYield", "eps",
                "revenueGrowth", "earningsGrowth", "marketCap",
                "change", "price", "beta", "fromHigh52",
                "fromLow52", "vsMA50", "vsMA200", 
                "volumeSpike", "volume"]
};

const INVESTOR_TYPES = [
  {
    id: "fundamental",
    icon: "📊",
    label: "Fundamental",
    sublabel: "Value & Quality",
    desc: "Filter by P/E, ROE, P/B, EPS, Growth metrics",
    longDesc: "For investors who analyse company financials. Focuses on business quality, valuation, and profitability.",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    exampleUse: "Warren Buffett style investing"
  },
  {
    id: "technical",
    icon: "📈",
    label: "Technical",
    sublabel: "Charts & Momentum",
    desc: "Filter by Moving Averages, 52W, Volume, Beta",
    longDesc: "For traders who follow price action and momentum. Focuses on trend direction and market activity.",
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    exampleUse: "Trend-following and momentum trading"
  },
  {
    id: "combined",
    icon: "🔀",
    label: "Combined",
    sublabel: "Complete Picture",
    desc: "Use both Fundamental + Technical together",
    longDesc: "The most powerful approach — find stocks that are both fundamentally strong AND technically bullish.",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    exampleUse: "CAN SLIM style screening"
  }
];

"""
orig = orig[:c_idx] + constants + orig[c_idx:]

app_idx = orig.find('// ── MAIN COMPONENT ──')

comp = """
function BeginnerModeView({ 
  tabs, activeTab, onTabChange, stocks, loading, error,
  onRetry, onMockData, onWatchlist, watchlist, onSelectStock,
  fetchedAt, visibleCount, onLoadMore
}) {
  const tab = tabs.find(t => t.id === activeTab);
  const displayed = stocks.slice(0, visibleCount);

  if (loading) return null; // parent handles loading spinner

  return (
    <div>
      {/* Beginner Tab Bar */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        padding: "4px 0 16px", marginBottom: "1rem",
        scrollbarWidth: "none"
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 24,
              border: activeTab === t.id
                ? `2px solid ${t.color}`
                : "1.5px solid var(--color-border-tertiary)",
              background: activeTab === t.id ? t.bgColor : "white",
              color: activeTab === t.id ? t.color : "var(--color-text-secondary)",
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: 13, whiteSpace: "nowrap", cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Explanation Card */}
      {tab && activeTab !== "beg_watchlist" && (
        <div style={{
          background: tab.bgColor,
          border: `1px solid ${tab.color}22`,
          borderRadius: 14, padding: "1rem 1.25rem",
          marginBottom: "1.5rem"
        }}>
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: tab.color, marginBottom: 4
          }}>
            {tab.tagline}
          </div>
          <div style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6, marginBottom: 6
          }}>
            {tab.explanation}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: tab.color, display: "flex",
            alignItems: "center", gap: 4
          }}>
            💡 {tab.recommendation}
          </div>
        </div>
      )}

      {/* Result count */}
      {stocks.length > 0 && (
        <div style={{
          fontSize: 13, color: "var(--color-text-secondary)",
          marginBottom: 12
        }}>
          Found <b style={{color: tab?.color}}>{stocks.length}</b> stocks 
          matching {tab?.tagline?.toLowerCase()}
          {fetchedAt && (
            <span style={{
              color: "var(--color-text-tertiary)", fontSize: 11
            }}>
              {" · "}synced at {fetchedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Empty watchlist state */}
      {activeTab === "beg_watchlist" && stocks.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          border: "1px dashed var(--color-border-tertiary)",
          borderRadius: 16
        }}>
          <div style={{fontSize: 40, marginBottom: 12}}>⭐</div>
          <div style={{
            fontSize: 16, fontWeight: 600,
            color: "var(--color-text-primary)"
          }}>
            No saved stocks yet
          </div>
          <p style={{
            fontSize: 13, color: "var(--color-text-secondary)",
            maxWidth: 300, margin: "8px auto 0"
          }}>
            While browsing any tab, tap the ☆ star next to a 
            stock to save it here.
          </p>
        </div>
      )}

      {/* Empty results state */}
      {activeTab !== "beg_watchlist" && stocks.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          border: "1px dashed var(--color-border-tertiary)",
          borderRadius: 16
        }}>
          <div style={{fontSize: 40, marginBottom: 12}}>🧘</div>
          <div style={{
            fontSize: 16, fontWeight: 600,
            color: "var(--color-text-primary)"
          }}>
            No matches right now
          </div>
          <p style={{
            fontSize: 13, color: "var(--color-text-secondary)",
            maxWidth: 320, margin: "8px auto 0"
          }}>
            The market doesn't have stocks meeting these exact 
            standards today. Check back after market hours or 
            try another category.
          </p>
        </div>
      )}

      {/* Stock Cards (beginner mode uses cards not table) */}
      {displayed.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 12, marginBottom: "1.5rem"
        }}>
          {displayed.map(s => (
            <div
              key={s.symbol}
              onClick={() => onSelectStock(s)}
              style={{
                background: "white",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 14, padding: "1rem",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            >
              {/* Card Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 10
              }}>
                <div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: "var(--color-text-primary)"
                    }}>
                      {s.symbol.replace(".NS", "")}
                    </span>
                    <SmartBadge stock={s} />
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                    marginTop: 2,
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {s.company}
                  </div>
                </div>
                <div style={{textAlign: "right"}}>
                  <div style={{
                    fontWeight: 700, fontSize: 15
                  }}>
                    ₹{(s.price||0).toLocaleString("en-IN")}
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: metricColor("change", s.change)
                  }}>
                    {fmtPct(s.change)}
                  </div>
                </div>
              </div>

              {/* Key metrics for this tab */}
              <div style={{
                display: "flex", gap: 6, flexWrap: "wrap"
              }}>
                {tab?.filters.slice(0, 3).map(f => (
                  <div key={f.field} style={{
                    fontSize: 11, padding: "3px 8px",
                    borderRadius: 6,
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-secondary)"
                  }}>
                    <span style={{
                      fontWeight: 600,
                      color: tab.color
                    }}>
                      {METRIC_CONFIG[f.field]?.label}:
                    </span>
                    {" "}
                    {typeof s[f.field] === "number"
                      ? s[f.field].toFixed(1)
                      : "—"}
                    {METRIC_CONFIG[f.field]?.suffix}
                  </div>
                ))}
              </div>

              {/* Star button */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center", marginTop: 10,
                paddingTop: 10,
                borderTop: "0.5px solid var(--color-border-tertiary)"
              }}>
                <span style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)"
                }}>
                  Tap for full analysis →
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onWatchlist(s.symbol);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: watchlist.includes(s.symbol)
                      ? "#f59e0b" : "#cbd5e1",
                    fontSize: 18, padding: 0
                  }}
                >
                  {watchlist.includes(s.symbol) ? "★" : "☆"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {visibleCount < stocks.length && (
        <div style={{textAlign: "center", marginTop: 8}}>
          <button
            onClick={onLoadMore}
            style={{
              background: "transparent",
              border: `1px solid ${tab?.color || "#10b981"}`,
              color: tab?.color || "#10b981",
              padding: "10px 24px", borderRadius: 8,
              fontSize: 13, fontWeight: 600
            }}
          >
            Load More ({stocks.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

function InvestorTypeSelector({ active, onChange }) {
  return (
    <div style={{marginBottom: "1.5rem"}}>
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase", letterSpacing: "0.5px",
        marginBottom: 10
      }}>
        Your Investor Style
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10
      }}>
        {INVESTOR_TYPES.map(type => (
          <div
            key={type.id}
            onClick={() => onChange(type.id)}
            style={{
              padding: "14px",
              borderRadius: 12,
              border: active === type.id
                ? `2px solid ${type.color}`
                : `1.5px solid ${type.borderColor}`,
              background: active === type.id
                ? type.bgColor : "white",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            <div style={{
              fontSize: 20, marginBottom: 4
            }}>
              {type.icon}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: active === type.id
                ? type.color
                : "var(--color-text-primary)",
              marginBottom: 2
            }}>
              {type.label}
            </div>
            <div style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              marginBottom: 6
            }}>
              {type.sublabel}
            </div>
            <div style={{
              fontSize: 10,
              color: active === type.id
                ? type.color
                : "var(--color-text-tertiary)",
              lineHeight: 1.4
            }}>
              {type.desc}
            </div>
            {active === type.id && (
              <div style={{
                marginTop: 8, paddingTop: 8,
                borderTop: `1px solid ${type.borderColor}`,
                fontSize: 10,
                color: type.color,
                fontStyle: "italic"
              }}>
                💡 {type.exampleUse}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"""
orig = orig[:app_idx] + comp + orig[app_idx:]

orig = orig.replace("""  const [showBuilder, setShowBuilder] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(true);""", """  const [showBuilder, setShowBuilder] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [activeBegTab, setActiveBegTab] = useState("beg_quality");
  const [investorType, setInvestorType] = useState("fundamental");""")

orig = orig.replace("""                    <div 
                        onClick={() => setBeginnerMode(!beginnerMode)}""", """                    <div 
                        onClick={() => {
                            const newMode = !beginnerMode;
                            setBeginnerMode(newMode);
                            setFilters([{ id: 1, field: "pe", operator: "<", value: 100 }]);
                            setVisibleCount(50);
                            setSelectedStock(null);
                            setSearch("");
                            if (!newMode) setInvestorType("fundamental");
                        }}""")

orig = orig.replace("""                        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)", margin: 0, letterSpacing: "-0.4px" }}>
                            SmartScreener NSE
                        </h1>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                            Live Yahoo Finance Data · Deterministic Screening · Professional Grade
                        </p>""", """                        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)", margin: 0, letterSpacing: "-0.4px" }}>
                            {beginnerMode ? "SmartScreener — Beginner Mode" : "SmartScreener NSE — Pro"}
                        </h1>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                            {beginnerMode ? "Curated picks, no jargon" : "Full screening power"}
                        </p>""")


beg_filt = """  const begFilteredStocks = useMemo(() => {
    if (!beginnerMode) return [];
    
    const tab = BEGINNER_TABS.find(t => t.id === activeBegTab);
    if (!tab) return [];

    if (activeBegTab === "beg_watchlist") {
      return universe.filter(s => watchlist.includes(s.symbol));
    }

    return universe.filter(s =>
      tab.filters.every(f => {
        const val = getFilterValue(s, f.field);
        const target = parseFloat(f.value);
        if (f.operator === "<") return val < target;
        if (f.operator === ">") return val > target;
        return true;
      })
    );
  }, [universe, activeBegTab, beginnerMode, watchlist]);

  const begSortedStocks = useMemo(() => {
    if (!beginnerMode) return [];
    const tab = BEGINNER_TABS.find(t => t.id === activeBegTab);
    if (!tab) return [];

    return [...begFilteredStocks].sort((a, b) => {
      if (!tab.sortCol) return b.marketCap - a.marketCap;
      const av = a[tab.sortCol], bv = b[tab.sortCol];
      if (av == null) return 1;
      if (bv == null) return -1;
      return tab.sortDir * (av < bv ? -1 : av > bv ? 1 : 0);
    });
  }, [begFilteredStocks, activeBegTab, beginnerMode]);

  const filteredStocks = useMemo(() => {"""

orig = orig.replace("""  const filteredStocks = useMemo(() => {""", beg_filt, 1)

main_ui_start = orig.find('          {/* ── TABS ── */}')
main_ui_end = orig.find('      <StockDetailPanel')

expert_ui = orig[main_ui_start:main_ui_end]

toolbar_end = expert_ui.find('          {/* ── PRESETS (BEGINNER MODE) ── */}')

inv_sel = """          <InvestorTypeSelector
            active={investorType}
            onChange={(type) => {
              setInvestorType(type);
              const defaults = {
                fundamental: [{ id: Date.now(), field: "pe", operator: "<", value: 100 }],
                technical: [{ id: Date.now(), field: "vsMA200", operator: ">", value: 0 }],
                combined: [
                  { id: Date.now(), field: "pe", operator: "<", value: 35 },
                  { id: Date.now()+1, field: "vsMA200", operator: ">", value: 0 }
                ]
              };
              setFilters(defaults[type]);
            }}
          />

"""
expert_ui = expert_ui[:toolbar_end] + inv_sel + expert_ui[toolbar_end:]

fb_start = expert_ui.find("""<optgroup label="📊 Fundamental">""")
fb_end = expert_ui.find('                              </select>', fb_start)

new_selects = """                                  { ["fundamental", "combined"].includes(investorType) && (
                                    <optgroup label="📊 Fundamental">
                                      {Object.entries(METRIC_CONFIG).filter(([key, c]) => c.category === "fundamental" && METRIC_CATEGORIES[investorType].includes(key)).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                                    </optgroup>
                                  )}
                                  { ["technical", "combined"].includes(investorType) && (
                                    <optgroup label="📈 Technical">
                                      {Object.entries(METRIC_CONFIG).filter(([key, c]) => c.category === "technical" && METRIC_CATEGORIES[investorType].includes(key)).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                                    </optgroup>
                                  )}
"""

expert_ui = expert_ui[:fb_start] + new_selects + expert_ui[fb_end:]

ctx_pos = expert_ui.find('matches from <b>{displayUniverse.length}</b> stocks')
ctx_pos = expert_ui.find('</div>', ctx_pos)
ctx_insert = """                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 4,
                    background: INVESTOR_TYPES.find(t=>t.id===investorType)?.bgColor,
                    color: INVESTOR_TYPES.find(t=>t.id===investorType)?.color,
                    fontWeight: 600, marginLeft: 8
                  }}>
                    {INVESTOR_TYPES.find(t=>t.id===investorType)?.label} Screen
                  </span>
"""
expert_ui = expert_ui[:ctx_pos] + ctx_insert + expert_ui[ctx_pos:]

expert_ui = expert_ui.replace("""{beginnerMode && (""", """{(!beginnerMode) && (""")
expert_ui = expert_ui.replace("""<div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>Recommended Presets</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
                      {BEGINNER_PRESETS.map(p => (""", """<div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>Quick Presets</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
                      {BEGINNER_PRESETS.filter(p => {
                          if (investorType === "fundamental") return ["undervalued", "quality", "income"].includes(p.id);
                          if (investorType === "technical") return ["nearHigh", "maBreakout", "volumeSurge"].includes(p.id);
                          return true;
                      }).map(p => (""")

new_view = f"""          {{beginnerMode ? (
            <>
              {{error ? (
                <div style={{{{ border: "1px dashed #ef4444", borderRadius: 16, padding: "4rem 2rem", textAlign: "center", background: "#fee2e2" }}}}>
                    <div style={{{{ fontSize: 40, marginBottom: 12 }}}}>⚠️</div>
                    <div style={{{{ fontSize: 16, fontWeight: 600, color: "#991b1b" }}}}>Failed to sync market data</div>
                    <p style={{{{ fontSize: 13, color: "#b91c1c", maxWidth: 400, margin: "8px auto 0" }}}}>{{error}}</p>
                    <div style={{{{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}}}>
                        <button onClick={{loadUniverse}} style={{{{ fontSize: 13, padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}}}>Try Again</button>
                        <button onClick={{() => {{ setUniverse(OFFLINE_MOCK_DATA); setError(null); setFetchedAt(new Date()); }}}} style={{{{ fontSize: 13, padding: "8px 16px", background: "transparent", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}}}>Use Offline Mock Data</button>
                    </div>
                </div>
              ) : loading ? (
                <div style={{{{ padding: "4rem 0", textAlign: "center" }}}}>
                   <div style={{{{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}}} />
                   <p style={{{{ fontSize: 14, color: "var(--color-text-primary)", fontWeight: 500 }}}}>Syncing live market data from Yahoo Finance...</p>
                   {{progress && <p style={{{{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8 }}}}>{{progress}}</p>}}
                   <style>{{`@keyframes spin {{ to {{ transform: rotate(360deg); }} }}`}}</style>
                </div>
              ) : (
                <BeginnerModeView
                  tabs={{BEGINNER_TABS}}
                  activeTab={{activeBegTab}}
                  onTabChange={{setActiveBegTab}}
                  stocks={{begSortedStocks}}
                  loading={{loading}}
                  error={{error}}
                  onRetry={{loadUniverse}}
                  onMockData={{() => {{
                    setUniverse(OFFLINE_MOCK_DATA);
                    setError(null);
                    setFetchedAt(new Date());
                  }}}}
                  onWatchlist={{toggleWatchlist}}
                  watchlist={{watchlist}}
                  onSelectStock={{setSelectedStock}}
                  fetchedAt={{fetchedAt}}
                  visibleCount={{visibleCount}}
                  onLoadMore={{() => setVisibleCount(v => v + 20)}}
                />
              )}}
            </>
          ) : (
            <>
{expert_ui}
            </>
          )}}
"""

orig = orig[:main_ui_start] + new_view + orig[main_ui_end:]

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(orig)
