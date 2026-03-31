import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# -----------------
# CHANGE 1: Title & Document Title
# -----------------
code = code.replace(
    '{beginnerMode ? "SmartScreener — Beginner Mode" : "SmartScreener NSE — Pro"}',
    '{beginnerMode ? "StockSense 🧠" : "StockSense Pro ⚡"}'
)
code = code.replace(
    '{beginnerMode ? "Curated picks, no jargon" : "Full screening power"}',
    '{beginnerMode ? "Smart picks, zero confusion — investing made stupid simple" : "Full screening power · Live NSE data · No mercy on bad stocks"}'
)

use_effect_insert = """  useEffect(() => {
    document.title = beginnerMode 
      ? "StockSense — Find great stocks, simply" 
      : "StockSense Pro — NSE Stock Screener";
  }, [beginnerMode]);

"""
code = code.replace("  // Auto-fetch universe on mount\n  useEffect(() => {\n    loadUniverse();\n  }, []);", use_effect_insert + "  // Auto-fetch universe on mount\n  useEffect(() => {\n    loadUniverse();\n  }, []);")

# -----------------
# CHANGE 2: Watchlist inline toggle & Remove Tab Bar
# -----------------
# Remove existing tabs
start_tabs = code.find('          {/* ── TABS ── */}')
end_tabs = code.find('          {/* ── TOOLBAR ── */}', start_tabs)
if start_tabs != -1 and end_tabs != -1:
    code = code[:start_tabs] + code[end_tabs:]

# Wait, `activeTab` from SCREENER_TABS is no longer needed. We will keep it but it might cause warnings.
# Add showWatchlistOnly state
state_insert = """  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);\n"""
code = code.replace('  const [search, setSearch] = useState("");', '  const [search, setSearch] = useState("");\n' + state_insert)

# Modify the toolbar to include the Watchlist Button
toolbar_btn_target = """              <button 
                onClick={() => setShowBuilder(!showBuilder)}"""

toolbar_new_btn = """              <button
                onClick={() => setShowWatchlistOnly(v => !v)}
                style={{
                  background: showWatchlistOnly ? "#fef3c7" : "transparent",
                  color: showWatchlistOnly ? "#d97706" : "var(--color-text-secondary)",
                  border: `1px solid ${showWatchlistOnly ? "#fcd34d" : "var(--color-border-tertiary)"}`,
                  padding: "0 1rem", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6, height: 40
                }}
              >
                {showWatchlistOnly ? "★" : "☆"} 
                Watchlist
                {watchlist.length > 0 && (
                  <span style={{
                    background: "#f59e0b", color: "white",
                    borderRadius: "50%", width: 18, height: 18,
                    fontSize: 10, display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 700
                  }}>
                    {watchlist.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setShowBuilder(!showBuilder)}"""
code = code.replace(toolbar_btn_target, toolbar_new_btn)

# Modify filteredStocks universe
filtered_logic = """  const baseUniverse = showWatchlistOnly 
    ? universe.filter(s => watchlist.includes(s.symbol))
    : universe;

  const filteredStocks = useMemo(() => {
    return baseUniverse.filter(s => {"""
code = code.replace("""  const filteredStocks = useMemo(() => {
    return displayUniverse.filter(s => {""", filtered_logic)

# -----------------
# CHANGE 3: Fix Filter Builder UI
# -----------------
code = code.replace(
    """<select 
                                value={f.field} onChange={e => updateFilter(f.id, { field: e.target.value })}
                                style={{ flex: 1, minWidth: 180, borderRadius: 8, height: 38 }}""",
    """<select 
                                value={f.field} onChange={e => updateFilter(f.id, { field: e.target.value })}
                                style={{ flex: "0 0 180px", width: 180, borderRadius: 8, height: 38, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", padding: "0 8px" }}"""
)
code = code.replace(
    """<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>""",
    """<div className="filter-row-grid" style={{ display: "grid", gridTemplateColumns: "180px 110px 1fr 36px", gap: 8, alignItems: "center" }}>"""
)
code = code.replace(
    """<div style={{ position: "relative", flex: 1, minWidth: 120 }}>""",
    """<div className="filter-value-wrap" style={{ position: "relative", flex: 1, minWidth: 120 }}>"""
)
code = code.replace(
    """<button 
                                disabled={filters.length === 1}
                                onClick={() => removeFilter(f.id)}
                                style={{ background: "transparent", color: "#dc2626", border: "none", fontSize: 18, cursor: "pointer", width: 32 }}
                              >""",
    """<button 
                                className="filter-delete-btn"
                                onClick={() => removeFilter(f.id)}
                                title={filters.length === 1 ? "Resets to default" : "Remove filter"}
                                style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: filters.length === 1 ? "not-allowed" : "pointer", width: 36, height: 38, display: "flex", alignItems: "center", justifyContent: "center", opacity: filters.length === 1 ? 0.35 : 1, flexShrink: 0 }}
                              >"""
)

remove_filter_logic = """  const removeFilter = (id) => {
      if (filters.length === 1) {
        const defaultField = investorType === "technical" ? "vsMA200" : "pe";
        const defaultOp = investorType === "technical" ? ">" : "<";
        const defaultVal = investorType === "technical" ? 0 : 100;
        setFilters([{ 
          id: Date.now(), 
          field: defaultField, 
          operator: defaultOp, 
          value: defaultVal 
        }]);
      } else {
        setFilters(filters.filter(f => f.id !== id));
      }
  };"""
code = code.replace("""  const removeFilter = (id) => setFilters(filters.filter(f => f.id !== id));""", remove_filter_logic)


# -----------------
# CHANGE 4: Fix Combined Presets Arrays
# -----------------
presets = """
const FUNDAMENTAL_PRESETS = [
  { id: "f1", name: "💎 Deep Value", desc: "Low PE, Low PB, decent ROE", filters: [ { field: "pe", operator: "<", value: 12 }, { field: "pb", operator: "<", value: 1.5 }, { field: "roe", operator: ">", value: 12 } ] },
  { id: "f2", name: "🏆 Quality Compounder", desc: "High ROE, reasonable PE", filters: [ { field: "roe", operator: ">", value: 22 }, { field: "pe", operator: "<", value: 35 }, { field: "earningsGrowth", operator: ">", value: 12 } ] },
  { id: "f3", name: "💰 Dividend Aristocrat", desc: "High yield + profitable", filters: [ { field: "divYield", operator: ">", value: 2.5 }, { field: "roe", operator: ">", value: 15 }, { field: "eps", operator: ">", value: 0 } ] },
  { id: "f4", name: "🌱 Growth at Value", desc: "Growing fast but not overpriced", filters: [ { field: "earningsGrowth", operator: ">", value: 20 }, { field: "revenueGrowth", operator: ">", value: 15 }, { field: "pe", operator: "<", value: 40 } ] }
];

const TECHNICAL_PRESETS = [
  { id: "t1", name: "⚡ MA Breakout", desc: "Above 50 and 200 day MA", filters: [ { field: "vsMA50", operator: ">", value: 0 }, { field: "vsMA200", operator: ">", value: 0 } ] },
  { id: "t2", name: "🎯 Near 52W High", desc: "Strong stocks near peak", filters: [ { field: "fromHigh52", operator: ">", value: -8 }, { field: "vsMA50", operator: ">", value: 0 } ] },
  { id: "t3", name: "🔥 Volume Surge", desc: "Unusual buying activity", filters: [ { field: "volumeSpike", operator: ">", value: 150 }, { field: "change", operator: ">", value: 1 } ] },
  { id: "t4", name: "📉 Deep Dip", desc: "Far from highs — potential bounce", filters: [ { field: "fromHigh52", operator: "<", value: -30 }, { field: "fromLow52", operator: ">", value: 5 } ] }
];

const COMBINED_PRESETS = [
  { id: "combo_quality_breakout", name: "🏆⚡ Quality Breakout", desc: "Fundamentally strong + technically breaking out", filters: [ { field: "roe", operator: ">", value: 18 }, { field: "pe", operator: "<", value: 30 }, { field: "vsMA50", operator: ">", value: 0 }, { field: "vsMA200", operator: ">", value: 0 } ] },
  { id: "combo_value_reversal", name: "💎📈 Value Reversal", desc: "Cheap stocks starting to trend up", filters: [ { field: "pe", operator: "<", value: 15 }, { field: "pb", operator: "<", value: 2 }, { field: "fromLow52", operator: ">", value: 15 }, { field: "vsMA50", operator: ">", value: 0 } ] },
  { id: "combo_growth_momentum", name: "🚀📊 Growth + Momentum", desc: "High earnings growth with volume confirmation", filters: [ { field: "earningsGrowth", operator: ">", value: 20 }, { field: "revenueGrowth", operator: ">", value: 15 }, { field: "volumeSpike", operator: ">", value: 120 }, { field: "change", operator: ">", value: 0 } ] },
  { id: "combo_dividend_uptrend", name: "💰📈 Income + Uptrend", desc: "Dividend payers in a long-term uptrend", filters: [ { field: "divYield", operator: ">", value: 2 }, { field: "roe", operator: ">", value: 12 }, { field: "vsMA200", operator: ">", value: 0 }, { field: "beta", operator: "<", value: 1.2 } ] },
  { id: "combo_canslim", name: "🔀 CAN SLIM Style", desc: "Classic growth + technicals combo", filters: [ { field: "earningsGrowth", operator: ">", value: 25 }, { field: "revenueGrowth", operator: ">", value: 20 }, { field: "vsMA200", operator: ">", value: 5 }, { field: "volumeSpike", operator: ">", value: 130 }, { field: "fromHigh52", operator: ">", value: -15 } ] }
];"""
code = code.replace("const BEGINNER_PRESETS =", presets + "\n\nconst BEGINNER_PRESETS =")

# Add activePresets logic
preset_logic = """  const activePresets = 
    investorType === "fundamental" ? FUNDAMENTAL_PRESETS :
    investorType === "technical"   ? TECHNICAL_PRESETS :
    COMBINED_PRESETS;
"""
code = code.replace('export default function App() {\n', 'export default function App() {\n' + preset_logic)

# Replace the expert branch preset map
old_expert_presets = """{BEGINNER_PRESETS.filter(p => {
                          if (investorType === "fundamental") return ["undervalued", "quality", "income"].includes(p.id);
                          if (investorType === "technical") return ["nearHigh", "maBreakout", "volumeSurge"].includes(p.id);
                          return true;
                      }).map(p => ("""
new_expert_presets = """{activePresets.map(p => ("""
code = code.replace(old_expert_presets, new_expert_presets)


# -----------------
# CHANGE 5: API fetch string & Comments
# -----------------
code = code.replace("const url = `/api/yahoo/v8/finance/quote?symbols=${joined}`;", "const url = `/api/yahoo/v8/finance/quote?symbols=${joined}`; // fallback kept just in case")
code = code.replace("const url = `/api/yahoo/v7/finance/quote?symbols=${joined}`;", "const url = `/api/yahoo?symbols=${joined}`;")

comment = """/*
 * DEPLOY TO VERCEL (FREE):
 * 1. Push this project to GitHub (github.com → New repo → push code)
 * 2. Go to vercel.com → Sign up free with GitHub
 * 3. Click "Add New Project" → Import your GitHub repo
 * 4. Framework: Vite (auto-detected)
 * 5. Click Deploy — done. You get a live URL like:
 *    https://stocksense-yourname.vercel.app
 * 
 * The api/yahoo.js serverless function handles Yahoo Finance
 * in production — no CORS issues, no proxy needed.
 *
 * To update: just push to GitHub → Vercel auto-redeploys.
 */
"""
code = comment + code

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

