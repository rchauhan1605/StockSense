/*
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
import { useState, useEffect, useRef, useMemo } from "react";
import { OFFLINE_MOCK_DATA } from "./data/mockData";

// ── CONSTANTS & CONFIG ──
const STOCK_UNIVERSE = [
  "20MICRONS.NS","21STCENMGM.NS","3IINFOLTD.NS","3MINDIA.NS","5PAISA.NS",
  "AARTIDRUGS.NS","AARTIIND.NS","AARTIPHARM.NS","AARTISURF.NS","AAVAS.NS",
  "ABB.NS","ABBOTINDIA.NS","ABCAPITAL.NS","ABFRL.NS","ABREL.NS",
  "ACC.NS","ADANIENT.NS","ADANIGREEN.NS","ADANIPORTS.NS","ADANIPOWER.NS",
  "ADFFOODS.NS","ADVENZYMES.NS","AEGISLOG.NS","AETHER.NS","AFFLE.NS",
  "AGI.NS","AIAENG.NS","AJANTPHARM.NS","AKZOINDIA.NS","ALKEM.NS",
  "ALKYLAMINE.NS","ALLCARGO.NS","ALOKINDS.NS","AMARAJABAT.NS","AMBER.NS",
  "AMBUJACEM.NS","ANANDRATHI.NS","ANGELONE.NS","ANURAS.NS","APARINDS.NS",
  "APLLTD.NS","APOLLOHOSP.NS","APOLLOPIPE.NS","APOLLOTYRE.NS","APTUS.NS",
  "ASAHIINDIA.NS","ASHOKA.NS","ASHOKLEY.NS","ASIANPAINT.NS","ASTRAL.NS",
  "ASTRAZEN.NS","ATGL.NS","ATUL.NS","AUBANK.NS","AUROPHARMA.NS",
  "AVANTIFEED.NS","AXISBANK.NS","BAJAJ-AUTO.NS","BAJAJFINSV.NS","BAJFINANCE.NS",
  "BALAMINES.NS","BALKRISIND.NS","BALRAMCHIN.NS","BANDHANBNK.NS","BANKBARODA.NS",
  "BATAINDIA.NS","BAYERCROP.NS","BDL.NS","BEL.NS","BEML.NS",
  "BERGEPAINT.NS","BHARATFORG.NS","BHARTIARTL.NS","BHEL.NS","BIOCON.NS",
  "BIRLACORPN.NS","BLUEDART.NS","BLUESTARCO.NS","BOSCHLTD.NS","BPCL.NS",
  "BRIGADE.NS","BRITANNIA.NS","CAMS.NS","CANBK.NS","CANFINHOME.NS",
  "CARBORUNIV.NS","CEATLTD.NS","CENTRALBK.NS","CENTURYPLY.NS","CERA.NS",
  "CGPOWER.NS","CHALET.NS","CHAMBLFERT.NS","CIEINDIA.NS","CIPLA.NS",
  "CLEAN.NS","COALINDIA.NS","COFORGE.NS","COLPAL.NS","CONCOR.NS",
  "COROMANDEL.NS","CROMPTON.NS","CUMMINSIND.NS","CYIENT.NS","DABUR.NS",
  "DALBHARAT.NS","DEEPAKFERT.NS","DEEPAKNTR.NS","DELHIVERY.NS","DIVISLAB.NS",
  "DIXON.NS","DLF.NS","DRREDDY.NS","ECLERX.NS","EICHERMOT.NS",
  "EIDPARRY.NS","ESCORTS.NS","EXIDEIND.NS","FEDERALBNK.NS","FINCABLES.NS",
  "FORTIS.NS","GAIL.NS","GLENMARK.NS","GMRP&UI.NS","GODREJCP.NS",
  "GODREJPROP.NS","GRANULES.NS","GRASIM.NS","GSPL.NS","GUJGASLTD.NS",
  "HAL.NS","HAVELLS.NS","HCLTECH.NS","HDFCAMC.NS","HDFCBANK.NS",
  "HDFCLIFE.NS","HEROMOTOCO.NS","HINDALCO.NS","HINDCOPPER.NS","HINDPETRO.NS",
  "HINDUNILVR.NS","ICICIBANK.NS","ICICIGI.NS","ICICIPRULI.NS","IDFCFIRSTB.NS",
  "IGL.NS","INDIGO.NS","INDUSINDBK.NS","INFY.NS","IOC.NS",
  "IRCON.NS","IRCTC.NS","IRFC.NS","ITC.NS","JBCHEPHARM.NS",
  "JINDALSTEL.NS","JKCEMENT.NS","JSWENERGY.NS","JSWSTEEL.NS","JUBLFOOD.NS",
  "KAJARIACER.NS","KALYANKJIL.NS","KEC.NS","KNRCON.NS","KOTAKBANK.NS",
  "KPITTECH.NS","LALPATHLAB.NS","LAURUSLABS.NS","LICHSGFIN.NS","LICI.NS",
  "LODHA.NS","LT.NS","LTIM.NS","LTTS.NS","LUPIN.NS",
  "M&M.NS","M&MFIN.NS","MANAPPURAM.NS","MANKIND.NS","MARICO.NS",
  "MARUTI.NS","MAZDOCK.NS","MCX.NS","METROPOLIS.NS","MGL.NS",
  "MPHASIS.NS","MRF.NS","MUTHOOTFIN.NS","NATCOPHARM.NS","NAUKRI.NS",
  "NESTLEIND.NS","NHPC.NS","NMDC.NS","NTPC.NS","NYKAA.NS",
  "OBEROIRLTY.NS","ONGC.NS","PAGEIND.NS","PAYTM.NS","PERSISTENT.NS",
  "PETRONET.NS","PFC.NS","PIDILITIND.NS","PIIND.NS","POLYCAB.NS",
  "POWERGRID.NS","RAMCOCEM.NS","RBLBANK.NS","RECLTD.NS","RELIANCE.NS",
  "RITES.NS","SBIN.NS","SBICARD.NS","SBILIFE.NS","SHREECEM.NS",
  "SHRIRAMFIN.NS","SIEMENS.NS","SRF.NS","SUNPHARMA.NS","SUPREMEIND.NS",
  "SUZLON.NS","TATACOMM.NS","TATACONSUM.NS","TATAELXSI.NS","TATAMOTORS.NS",
  "TATAPOWER.NS","TATASTEEL.NS","TCS.NS","TECHM.NS","TITAN.NS",
  "TORNTPHARM.NS","TRENT.NS","TVSMOTOR.NS","UBL.NS","ULTRACEMCO.NS",
  "UPL.NS","VEDL.NS","VOLTAS.NS","WIPRO.NS","ZENSARTECH.NS","ZOMATO.NS"
];

const SCREENER_TABS = [
  { 
    id: "fundamental", 
    label: "📊 Fundamental", 
    desc: "P/E, ROE, P/B, EPS",
    defaultFilters: [{ id: 1, field: "pe", operator: "<", value: 100 }],
    defaultSort: null  // sorts by marketCap
  },
  { 
    id: "technical", 
    label: "📈 Technical", 
    desc: "MA, 52W, Volume",
    defaultFilters: [{ id: 1, field: "vsMA200", operator: ">", value: 0 }],
    defaultSort: "volumeSpike"
  },
  { 
    id: "dividend", 
    label: "💰 Dividend", 
    desc: "Yield & Income",
    defaultFilters: [{ id: 1, field: "divYield", operator: ">", value: 1 }],
    defaultSort: "divYield"
  },
  { 
    id: "momentum", 
    label: "🚀 Momentum", 
    desc: "Breakouts & Movers",
    defaultFilters: [
      { id: 1, field: "change", operator: ">", value: 0 },
      { id: 2, field: "vsMA50", operator: ">", value: 0 }
    ],
    defaultSort: "change"
  },
  { 
    id: "watchlist", 
    label: "⭐ Watchlist", 
    desc: "Your saved stocks",
    defaultFilters: [],
    defaultSort: null
  }
];

const BEGINNER_TABS = [
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

const METRIC_CONFIG = {
  // ── Fundamental ──
  pe:             { label: "P/E Ratio",            hint: "Price-to-Earnings. < 15 is often deep value; > 40 is high growth but expensive.",              defaultOp: "<", suffix: "",   category: "fundamental" },
  roe:            { label: "ROE (%)",               hint: "Return on Equity. Above 15% is healthy; 20%+ is top quality.",                                defaultOp: ">", suffix: "%",  category: "fundamental" },
  pb:             { label: "P/B Ratio",             hint: "Price-to-Book. Below 2.0 is often considered margin of safety.",                              defaultOp: "<", suffix: "",   category: "fundamental" },
  divYield:       { label: "Div Yield (%)",         hint: "Dividend Yield. Above 2.0% is strong for regular income.",                                    defaultOp: ">", suffix: "%",  category: "fundamental" },
  eps:            { label: "EPS (₹)",               hint: "Earnings Per Share. Higher is better. Negative EPS means the company is loss-making.",        defaultOp: ">", suffix: "₹",  category: "fundamental" },
  marketCap:      { label: "Market Cap (Cr)",       hint: "Company size in Crores. Large cap > 20,000 Cr. Mid cap 5,000–20,000 Cr. Small cap < 5,000 Cr.",defaultOp: ">", suffix: "Cr", category: "fundamental", transform: v => v / 10000000 },
  revenueGrowth:  { label: "Revenue Growth (%)",    hint: "Year-over-year revenue growth. Above 15% is strong growth.",                                  defaultOp: ">", suffix: "%",  category: "fundamental" },
  earningsGrowth: { label: "Earnings Growth (%)",   hint: "Year-over-year earnings growth. The most important growth metric.",                           defaultOp: ">", suffix: "%",  category: "fundamental" },
  // ── Technical ──
  change:         { label: "Day Chg (%)",           hint: "Percentage change in stock price over the current session.",                                   defaultOp: ">", suffix: "%",  category: "technical" },
  price:          { label: "Price (₹)",             hint: "The current market price in Indian Rupees.",                                                   defaultOp: ">", suffix: "₹",  category: "technical" },
  beta:           { label: "Beta",                   hint: "Volatility vs market. Beta < 1 = less volatile than Nifty. Beta > 1 = more volatile.",        defaultOp: "<", suffix: "",   category: "technical" },
  fromHigh52:     { label: "% from 52W High",       hint: "How far below the 52-week high the stock is. -10% means 10% below peak.",                    defaultOp: ">", suffix: "%",  category: "technical" },
  fromLow52:      { label: "% from 52W Low",        hint: "How far above the 52-week low. +50% means 50% above its yearly bottom.",                     defaultOp: ">", suffix: "%",  category: "technical" },
  vsMA50:         { label: "vs 50-Day MA (%)",      hint: "Price vs 50-day moving average. Positive = above MA (bullish). Negative = below (bearish).",  defaultOp: ">", suffix: "%",  category: "technical" },
  vsMA200:        { label: "vs 200-Day MA (%)",     hint: "Price vs 200-day moving average. Above 200MA = long-term uptrend.",                           defaultOp: ">", suffix: "%",  category: "technical" },
  volumeSpike:    { label: "Volume Spike (%)",      hint: "Today's volume vs 3-month average. 200% = double average volume = high interest.",            defaultOp: ">", suffix: "%",  category: "technical" },
};

// Helpers to get filter-comparable value (marketCap has a display transform but filter uses raw)
function getFilterValue(stock, field) {
  return stock[field];
}


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
];

const BEGINNER_PRESETS = [
    { id: "undervalued",        name: "💎 Undervalued Stars",       desc: "Low P/E and Low P/B assets",                    filters: [{ field: "pe",             operator: "<", value: 15  }, { field: "pb",             operator: "<", value: 1.5 }] },
    { id: "quality",            name: "🏆 Quality Champions",       desc: "High ROE consistent performers",                filters: [{ field: "roe",            operator: ">", value: 20  }, { field: "pe",             operator: "<", value: 35  }] },
    { id: "income",             name: "💰 Dividend Income",         desc: "Stable yield for monthly income",               filters: [{ field: "divYield",       operator: ">", value: 2.5 }] },
    { id: "momentum",           name: "🚀 Growth Momentum",         desc: "High ROE with positive price action",           filters: [{ field: "roe",            operator: ">", value: 18  }, { field: "change",         operator: ">", value: 0   }] },
    { id: "nearHigh",           name: "🎯 Near 52W High",           desc: "Strong stocks near yearly peak",                filters: [{ field: "fromHigh52",     operator: ">", value: -5  }, { field: "roe",            operator: ">", value: 15  }] },
    { id: "recovery",           name: "📈 Recovery Play",           desc: "Bouncing from yearly lows with quality",        filters: [{ field: "fromLow52",      operator: ">", value: 20  }, { field: "fromHigh52",     operator: "<", value: -20 }, { field: "pe", operator: "<", value: 30 }] },
    { id: "maBreakout",         name: "⚡ MA Breakout",             desc: "Above both 50 and 200 day MA",                  filters: [{ field: "vsMA50",         operator: ">", value: 0   }, { field: "vsMA200",        operator: ">", value: 0   }] },
    { id: "volumeSurge",        name: "🔥 Volume Surge",            desc: "Unusual buying activity today",                 filters: [{ field: "volumeSpike",    operator: ">", value: 150 }, { field: "change",         operator: ">", value: 1   }] },
    { id: "compoundingMachine", name: "🏭 Compounding Machine",     desc: "High growth + high quality combo",              filters: [{ field: "roe",            operator: ">", value: 20  }, { field: "earningsGrowth", operator: ">", value: 15  }, { field: "revenueGrowth", operator: ">", value: 10 }] },
];

// ── HELPERS ──
function fmtPct(v) {
  if (v === null || v === undefined) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

function metricColor(field, val) {
  if (val === null || val === undefined) return "var(--color-text-secondary)";
  if (field === "pe") return val < 15 ? "#16a34a" : val < 40 ? "#d97706" : "#dc2626";
  if (field === "roe") return val > 20 ? "#16a34a" : val > 12 ? "#d97706" : "#dc2626";
  if (field === "divYield") return val > 2 ? "#16a34a" : val > 1 ? "#d97706" : "var(--color-text-secondary)";
  if (field === "change") return val > 0 ? "#16a34a" : val < 0 ? "#dc2626" : "var(--color-text-secondary)";
  return "var(--color-text-primary)";
}

// ── DATA LAYER (BATCH FETCH) ──
const BATCH_SIZE = 50; // Yahoo Finance handles ~50 symbols per request reliably

const FETCH_HEADERS = {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
};

async function fetchBatch(symbols) {
    const joined = symbols.map(s => encodeURIComponent(s)).join(",");

    // Attempt 1: v8 endpoint (newer, more reliable)
    try {
        const url = `/api/yahoo/v8/finance/quote?symbols=${joined}`; // fallback kept just in case
        const res = await fetch(url, { headers: FETCH_HEADERS });
        const data = await res.json();
        if (res.ok && !data.finance?.error && data.quoteResponse?.result?.length) {
            return data.quoteResponse.result.map(normalizeYahooData);
        }
    } catch (_) { /* fall through */ }

    // Attempt 2: v7 endpoint fallback
    try {
        const url = `/api/yahoo?symbols=${joined}`;
        const res = await fetch(url, { headers: FETCH_HEADERS });
        const data = await res.json();
        if (res.ok && !data.finance?.error && data.quoteResponse?.result?.length) {
            return data.quoteResponse.result.map(normalizeYahooData);
        }
        throw new Error(data.finance?.error?.description || "No Result");
    } catch (e) {
        throw new Error("Yahoo Finance API Error (v8+v7 both failed): " + e.message);
    }
}

async function fetchStockData(onProgress) {
    const allResults = [];
    const totalBatches = Math.ceil(STOCK_UNIVERSE.length / BATCH_SIZE);
    let failedBatches = 0;

    for (let i = 0; i < STOCK_UNIVERSE.length; i += BATCH_SIZE) {
        const batch = STOCK_UNIVERSE.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        
        try {
            const results = await fetchBatch(batch);
            allResults.push(...results);
            if (onProgress) onProgress(batchNum, totalBatches, allResults.length);
        } catch (e) {
            failedBatches++;
            console.warn(`[YAHOO] Batch ${batchNum}/${totalBatches} failed:`, e.message);
        }

        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < STOCK_UNIVERSE.length) {
            await new Promise(r => setTimeout(r, 300));
        }
    }

    if (allResults.length === 0) {
        throw new Error(`All ${totalBatches} batches failed. Yahoo Finance may be unavailable.`);
    }

    if (failedBatches > 0) {
        console.warn(`[YAHOO] ${failedBatches}/${totalBatches} batches failed. Loaded ${allResults.length}/${STOCK_UNIVERSE.length} stocks.`);
    }

    return allResults;
}

function normalizeYahooData(q) {
    try {
        const price   = q.regularMarketPrice || 0;
        const high52  = q.fiftyTwoWeekHigh   || 0;
        const low52   = q.fiftyTwoWeekLow    || 0;
        const ma50    = q.fiftyDayAverage    || 0;
        const ma200   = q.twoHundredDayAverage || 0;
        const volume  = q.regularMarketVolume || 0;
        const avgVolume = q.averageDailyVolume3Month || 0;

        const base = {
            // ── Identity ──
            symbol:         q.symbol || "—",
            company:        q.longName || q.shortName || q.symbol || "—",
            sector:         q.quoteSourceName || "National Stock Exchange",
            // ── Price ──
            price,
            change:         q.regularMarketChangePercent || 0,
            // ── Valuation ──
            pe:             q.trailingPE || 0,
            pb:             q.priceToBook || 0,
            roe:            q.returnOnEquity ? parseFloat((q.returnOnEquity * 100).toFixed(2)) : 0,
            divYield:       q.dividendYield  ? parseFloat((q.dividendYield  * 100).toFixed(2)) : 0,
            eps:            q.epsTrailingTwelveMonths || 0,
            marketCap:      q.marketCap || 0,
            // ── Growth ──
            revenueGrowth:  q.revenueGrowth  ? parseFloat((q.revenueGrowth  * 100).toFixed(2)) : 0,
            earningsGrowth: q.earningsGrowth ? parseFloat((q.earningsGrowth * 100).toFixed(2)) : 0,
            beta:           q.beta || 0,
            // ── 52-week / MA ──
            high52,
            low52,
            ma50,
            ma200,
            // ── Volume ──
            volume,
            avgVolume,
        };

        // ── Derived fields ──
        base.fromHigh52   = price > 0 && high52 > 0
            ? parseFloat(((price - high52)  / high52  * 100).toFixed(2)) : 0;
        base.fromLow52    = price > 0 && low52  > 0
            ? parseFloat(((price - low52)   / low52   * 100).toFixed(2)) : 0;
        base.vsMA50       = price > 0 && ma50   > 0
            ? parseFloat(((price - ma50)    / ma50    * 100).toFixed(2)) : 0;
        base.vsMA200      = price > 0 && ma200  > 0
            ? parseFloat(((price - ma200)   / ma200   * 100).toFixed(2)) : 0;
        base.volumeSpike  = avgVolume > 0
            ? parseFloat((volume / avgVolume * 100).toFixed(1)) : 0;

        return base;
    } catch (e) {
        return {
            symbol: "ERR", company: "Data Error", sector: "—",
            price: 0, change: 0, pe: 0, pb: 0, roe: 0, divYield: 0,
            eps: 0, marketCap: 0, revenueGrowth: 0, earningsGrowth: 0, beta: 0,
            high52: 0, low52: 0, ma50: 0, ma200: 0,
            volume: 0, avgVolume: 0,
            fromHigh52: 0, fromLow52: 0, vsMA50: 0, vsMA200: 0, volumeSpike: 0,
        };
    }
}

// ── UI COMPONENTS ──

function FinanceIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#10b981"/>
            <path d="M8 22L14 16L18 20L24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 12H24V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function SmartBadge({ stock }) {
    if (stock.pe > 0 && stock.pe < 15 && stock.pb < 1.5) return <span style={{fontSize: 9, padding: "2px 6px", background: "#ecfdf5", color: "#059669", borderRadius: 4, marginLeft: 6, border: "0.5px solid #d1fae5"}}>Value Star</span>;
    if (stock.roe > 25) return <span style={{fontSize: 9, padding: "2px 6px", background: "#eff6ff", color: "#2563eb", borderRadius: 4, marginLeft: 6, border: "0.5px solid #dbeafe"}}>High Quality</span>;
    return null;
}


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

// ── MAIN COMPONENT ──
export default function App() {
  const [filters, setFilters] = useState([{ id: 1, field: "pe", operator: "<", value: 100 }]);
  const [universe, setUniverse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [activeBegTab, setActiveBegTab] = useState("beg_quality");
  const [viewType, setViewType] = useState("fundamental");
  const activePresets = 
    viewType === "fundamental" ? FUNDAMENTAL_PRESETS :
    viewType === "technical"   ? TECHNICAL_PRESETS :
    COMBINED_PRESETS;

  const [fetchedAt, setFetchedAt] = useState(null);
  const [search, setSearch] = useState("");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(50);
  const [activeTab, setActiveTab] = useState("fundamental");
  const [watchlist, setWatchlist] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem("watchlist") || "[]"); 
    } catch { return []; }
  });
  const [selectedStock, setSelectedStock] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    document.title = beginnerMode 
      ? "StockSense — Find great stocks, simply" 
      : "StockSense Pro — NSE Stock Screener";
  }, [beginnerMode]);

  // Auto-fetch universe on mount
  useEffect(() => {
    loadUniverse();
  }, []);

  useEffect(() => {
    const handler = (e) => { 
      if (e.key === "Escape") setSelectedStock(null); 
      if (e.key === "/") {
        if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function loadUniverse() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setProgress("Connecting to Yahoo Finance...");
    try {
        const data = await fetchStockData((batchNum, totalBatches, loadedCount) => {
            setProgress(`Fetched ${loadedCount} stocks... (Batch ${batchNum}/${totalBatches})`);
        });
        setUniverse(data);
        setFetchedAt(new Date());
    } catch (e) {
        setError(e.message);
    } finally {
        setLoading(false);
        setProgress(null);
    }
  }

  const addFilter = () => setFilters([...filters, { id: Date.now(), field: "pe", operator: "<", value: 20 }]);
  const removeFilter = (id) => {
      if (filters.length === 1) {
        const defaultField = viewType === "technical" ? "vsMA200" : "pe";
        const defaultOp = viewType === "technical" ? ">" : "<";
        const defaultVal = viewType === "technical" ? 0 : 100;
        setFilters([{ 
          id: Date.now(), 
          field: defaultField, 
          operator: defaultOp, 
          value: defaultVal 
        }]);
      } else {
        setFilters(filters.filter(f => f.id !== id));
      }
  };
  const updateFilter = (id, upd) => setFilters(filters.map(f => f.id === id ? { ...f, ...upd } : f));

  const applyPreset = (preset) => {
      setFilters(preset.filters.map((f, i) => ({ ...f, id: i })));
      setShowBuilder(true);
      setVisibleCount(50);
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    const tab = SCREENER_TABS.find(t => t.id === tabId);
    if (tab && tabId !== "watchlist") {
      setFilters(tab.defaultFilters.map((f,i) => ({...f, id: Date.now()+i})));
      setSortCol(tab.defaultSort);
      setSortDir(-1);
      setSearch("");
      setVisibleCount(50);
    }
  };

  const toggleWatchlist = (symbol) => {
    const updated = watchlist.includes(symbol)
      ? watchlist.filter(s => s !== symbol)
      : [...watchlist, symbol];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  const displayUniverse = activeTab === "watchlist" 
    ? universe.filter(s => watchlist.includes(s.symbol))
    : universe;

  const begFilteredStocks = useMemo(() => {
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

  const baseUniverse = showWatchlistOnly 
    ? universe.filter(s => watchlist.includes(s.symbol))
    : universe;

  const filteredStocks = useMemo(() => {
    return baseUniverse.filter(s => {
        // Apply Global Search
        const searchMatches = !search.trim() || s.company.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase());
        if (!searchMatches) return false;

        // Apply Dynamic Filters
        return filters.every(f => {
            const val = getFilterValue(s, f.field);
            const target = parseFloat(f.value);
            if (f.operator === "<") return val < target;
            if (f.operator === ">") return val > target;
            if (f.operator === "=") return Math.abs(val - target) < 0.5;
            return true;
        });
    });
  }, [displayUniverse, filters, search]);

  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
        if (!sortCol) return b.marketCap - a.marketCap;
        const av = a[sortCol], bv = b[sortCol];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        return sortDir * (av < bv ? -1 : av > bv ? 1 : 0);
    });
  }, [filteredStocks, sortCol, sortDir]);

  const displayedStocks = sortedStocks.slice(0, visibleCount);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d * -1);
    else { setSortCol(col); setSortDir(-1); }
  };

  const thStyle = (col) => ({
    padding: "12px", fontSize: 11, fontWeight: 600,
    color: sortCol === col ? "var(--color-text-primary)" : "var(--color-text-secondary)",
    textAlign: col === "Instrument" || col === "company" ? "left" : "right",
    cursor: "pointer", borderBottom: "0.5px solid var(--color-border-tertiary)",
    background: "var(--color-background-secondary)",
    whiteSpace: "nowrap",
  });

  const tdStyle = (align = "right") => ({
    padding: "12px", fontSize: 13, textAlign: align,
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  });

  let mostRestrictiveFilter = null;
  if (sortedStocks.length === 0 && displayUniverse.length > 0) {
      const stats = filters.map(f => {
          let eliminated = 0;
          displayUniverse.forEach(s => {
              const val = getFilterValue(s, f.field);
              const target = parseFloat(f.value);
              let pass = true;
              if (f.operator === "<") pass = val < target;
              if (f.operator === ">") pass = val > target;
              if (f.operator === "=") pass = Math.abs(val - target) < 0.5;
              if (!pass) eliminated++;
          });
          return { ...f, eliminated };
      });
      mostRestrictiveFilter = stats.sort((a,b) => b.eliminated - a.eliminated)[0];
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ fontFamily: "var(--font-sans)", padding: "0 0 4rem" }}>

          {/* ── HEADER ── */}
          <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "1.25rem 0", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <FinanceIcon />
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)", margin: 0, letterSpacing: "-0.4px" }}>
                            {beginnerMode ? "StockSense 🧠" : "StockSense Pro ⚡"}
                        </h1>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                            {beginnerMode ? "Smart picks, zero confusion — investing made stupid simple" : "Full screening power · Live NSE data · No mercy on bad stocks"}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: beginnerMode ? "#10b981" : "var(--color-text-tertiary)" }}>Beginner Mode</span>
                    <div 
                        onClick={() => {
                            const newMode = !beginnerMode;
                            setBeginnerMode(newMode);
                            setFilters([{ id: 1, field: "pe", operator: "<", value: 100 }]);
                            setVisibleCount(50);
                            setSelectedStock(null);
                            setSearch("");
                            if (!newMode) setViewType("fundamental");
                        }}
                        style={{
                            width: 36, height: 20, borderRadius: 10, background: beginnerMode ? "#10b981" : "var(--color-border-tertiary)",
                            position: "relative", cursor: "pointer", transition: "0.2s"
                        }}
                    >
                        <div style={{
                            width: 16, height: 16, borderRadius: "50%", background: "#fff",
                            position: "absolute", top: 2, left: beginnerMode ? 18 : 2, transition: "0.2s"
                        }} />
                    </div>
                </div>
            </div>
          </div>

          {beginnerMode ? (
            <>
              {error ? (
                <div style={{ border: "1px dashed #ef4444", borderRadius: 16, padding: "4rem 2rem", textAlign: "center", background: "#fee2e2" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#991b1b" }}>Failed to sync market data</div>
                    <p style={{ fontSize: 13, color: "#b91c1c", maxWidth: 400, margin: "8px auto 0" }}>{error}</p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                        <button onClick={loadUniverse} style={{ fontSize: 13, padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Try Again</button>
                        <button onClick={() => { setUniverse(OFFLINE_MOCK_DATA); setError(null); setFetchedAt(new Date()); }} style={{ fontSize: 13, padding: "8px 16px", background: "transparent", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Use Offline Mock Data</button>
                    </div>
                </div>
              ) : loading ? (
                <div style={{ padding: "4rem 0", textAlign: "center" }}>
                   <div style={{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                   <p style={{ fontSize: 14, color: "var(--color-text-primary)", fontWeight: 500 }}>Syncing live market data from Yahoo Finance...</p>
                   {progress && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8 }}>{progress}</p>}
                   <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <BeginnerModeView
                  tabs={BEGINNER_TABS}
                  activeTab={activeBegTab}
                  onTabChange={setActiveBegTab}
                  stocks={begSortedStocks}
                  loading={loading}
                  error={error}
                  onRetry={loadUniverse}
                  onMockData={() => {
                    setUniverse(OFFLINE_MOCK_DATA);
                    setError(null);
                    setFetchedAt(new Date());
                  }}
                  onWatchlist={toggleWatchlist}
                  watchlist={watchlist}
                  onSelectStock={setSelectedStock}
                  fetchedAt={fetchedAt}
                  visibleCount={visibleCount}
                  onLoadMore={() => setVisibleCount(v => v + 20)}
                />
              )}
            </>
          ) : (
            <>
          {/* ── TOOLBAR ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                  <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--color-text-tertiary)" }}>⌕</span>
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder='Search by name or ticker...'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36, borderRadius: 10, fontSize: 14, width: "100%" }}
                      />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 6, marginLeft: 4 }}>
                    Press / to focus search · Esc to close detail panel
                  </div>
              </div>
              <button
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
                onClick={() => setShowBuilder(!showBuilder)}
                style={{ 
                    background: showBuilder ? "var(--color-background-secondary)" : "var(--color-text-primary)", 
                    color: showBuilder ? "var(--color-text-primary)" : "#fff",
                    border: "1px solid var(--color-text-primary)",
                    padding: "0 1.25rem", borderRadius: 10, fontSize: 13, fontWeight: 600 
                }}
              >
                {showBuilder ? "Hide Filter Builder" : "🔍 Open Filter Builder"}
              </button>
          </div>

          <InvestorTypeSelector
            active={viewType}
            onChange={(type) => {
              setViewType(type);
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

          {/* ── PRESETS (BEGINNER MODE) ── */}
          {(!beginnerMode) && (
              <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>Quick Presets</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
                      {activePresets.map(p => (
                          <div 
                            key={p.id} onClick={() => applyPreset(p)}
                            style={{
                                padding: "16px", borderRadius: 14, border: "0.5px solid var(--color-border-tertiary)",
                                background: "var(--color-background-primary)", cursor: "pointer",
                                transition: "transform 0.1s, border-color 0.1s",
                            }}
                          >
                              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{p.desc}</div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* ── FILTER BUILDER ── */}
          {showBuilder && (
              <div style={{ background: "var(--color-background-secondary)", padding: "1.5rem", borderRadius: 16, marginBottom: "2rem", border: "1px solid var(--color-border-secondary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Build your screening query</span>
                      <button onClick={addFilter} style={{ fontSize: 11, padding: "6px 12px", background: "transparent", color: "var(--color-text-primary)", border: "1px solid var(--color-border-tertiary)" }}>+ Add Filter</button>
                  </div>
                  
                  {filters.map((f, idx) => (
                      <div key={f.id} style={{ marginBottom: 16 }}>
                          <div className="filter-row-grid" style={{ display: "grid", gridTemplateColumns: "180px 110px 1fr 36px", gap: 8, alignItems: "center" }}>
                              <select 
                                value={f.field} onChange={e => updateFilter(f.id, { field: e.target.value })}
                                style={{ flex: "0 0 180px", width: 180, borderRadius: 8, height: 38, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", padding: "0 8px" }}
                              >
                                                                    { ["fundamental", "combined"].includes(viewType) && (
                                    <optgroup label="📊 Fundamental">
                                      {Object.entries(METRIC_CONFIG).filter(([key, c]) => c.category === "fundamental" && METRIC_CATEGORIES[viewType].includes(key)).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                                    </optgroup>
                                  )}
                                  { ["technical", "combined"].includes(viewType) && (
                                    <optgroup label="📈 Technical">
                                      {Object.entries(METRIC_CONFIG).filter(([key, c]) => c.category === "technical" && METRIC_CATEGORIES[viewType].includes(key)).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                                    </optgroup>
                                  )}
                              </select>
                              <select 
                                value={f.operator} onChange={e => updateFilter(f.id, { operator: e.target.value })}
                                style={{ width: 80, borderRadius: 8, height: 38 }}
                              >
                                  <option value="<">Less than</option>
                                  <option value=">">Greater</option>
                                  <option value="=">Equal</option>
                              </select>
                              <div className="filter-value-wrap" style={{ position: "relative", flex: 1, minWidth: 120 }}>
                                  <input 
                                    type="number" value={f.value} onChange={e => updateFilter(f.id, { value: e.target.value })}
                                    style={{ borderRadius: 8, height: 38, paddingRight: 30 }}
                                  />
                                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--color-text-secondary)" }}>{METRIC_CONFIG[f.field].suffix}</span>
                              </div>
                              <button 
                                className="filter-delete-btn"
                                onClick={() => removeFilter(f.id)}
                                title={filters.length === 1 ? "Resets to default" : "Remove filter"}
                                style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: filters.length === 1 ? "not-allowed" : "pointer", width: 36, height: 38, display: "flex", alignItems: "center", justifyContent: "center", opacity: filters.length === 1 ? 0.35 : 1, flexShrink: 0 }}
                              >×</button>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 6, marginLeft: 2, display: "flex", gap: 4 }}>
                              <span style={{color: "#10b981"}}>💡 Tip:</span> {METRIC_CONFIG[f.field].hint}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {error ? (
            <div style={{ border: "1px dashed #ef4444", borderRadius: 16, padding: "4rem 2rem", textAlign: "center", background: "#fee2e2" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#991b1b" }}>Failed to sync market data</div>
                <p style={{ fontSize: 13, color: "#b91c1c", maxWidth: 400, margin: "8px auto 0" }}>{error}</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                    <button onClick={loadUniverse} style={{ fontSize: 13, padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Try Again</button>
                    <button onClick={() => { setUniverse(OFFLINE_MOCK_DATA); setError(null); setFetchedAt(new Date()); }} style={{ fontSize: 13, padding: "8px 16px", background: "transparent", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Use Offline Mock Data</button>
                </div>
            </div>
          ) : loading ? (
            <div style={{ padding: "4rem 0", textAlign: "center" }}>
               <div style={{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
               <p style={{ fontSize: 14, color: "var(--color-text-primary)", fontWeight: 500 }}>Syncing live market data from Yahoo Finance...</p>
               {progress && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8 }}>{progress}</p>}
               <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : activeTab === "watchlist" && watchlist.length === 0 ? (
            <div style={{ border: "1px dashed var(--color-border-tertiary)", borderRadius: 16, padding: "4rem 2rem", textAlign: "center", background: "var(--color-background-secondary)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>Your watchlist is empty</div>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 320, margin: "8px auto 0" }}>Click the star next to any stock to save it here.</p>
            </div>
          ) : sortedStocks.length === 0 ? (
            <div style={{ border: "1px dashed var(--color-border-tertiary)", borderRadius: 16, padding: "4rem 2rem", textAlign: "center", background: "var(--color-background-secondary)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧘</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>Your filters are too strict.</div>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 320, margin: "8px auto 0" }}>
                  {displayUniverse.length} stocks loaded, 0 matched. <br/><br/>
                  {mostRestrictiveFilter && (
                      <span>Try adjusting: <b>{METRIC_CONFIG[mostRestrictiveFilter.field]?.label} {mostRestrictiveFilter.operator} {mostRestrictiveFilter.value}</b> (eliminates {mostRestrictiveFilter.eliminated} stocks)</span>
                  )}
                </p>
                <button onClick={() => setFilters([{ id: 1, field: "pe", operator: "<", value: 100 }])} style={{ marginTop: 20, fontSize: 12 }}>Reset Filters</button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {filters.map(f => (
                  <div key={f.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                    padding: "4px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500
                  }}>
                    {METRIC_CONFIG[f.field]?.label} {f.operator} {f.value} {METRIC_CONFIG[f.field]?.suffix}
                    <button onClick={() => removeFilter(f.id)} style={{
                      background: "transparent", color: "#16a34a", padding: 0, margin: 0,
                      width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14
                    }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                    Showing <b>{displayedStocks.length}</b> of <b>{sortedStocks.length}</b> matches from <b>{displayUniverse.length}</b> stocks
                    {fetchedAt && <span style={{ color: "var(--color-text-tertiary)", fontSize: 11 }}> · sync at {fetchedAt.toLocaleTimeString()}</span>}
                                    <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 4,
                    background: INVESTOR_TYPES.find(t=>t.id===viewType)?.bgColor,
                    color: INVESTOR_TYPES.find(t=>t.id===viewType)?.color,
                    fontWeight: 600, marginLeft: 8
                  }}>
                    {INVESTOR_TYPES.find(t=>t.id===viewType)?.label} Screen
                  </span>
</div>
                  <button 
                    onClick={loadUniverse} 
                    style={{ background: "transparent", border: "1px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)", fontSize: 10, padding: "4px 10px" }}
                  >↻ Sync Market Data</button>
              </div>

              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle("company"), textAlign: "center", width: 36 }}>#</th>
                        <th style={thStyle("company")} onClick={() => handleSort("company")}>Instrument</th>
                        <th style={thStyle("price")} onClick={() => handleSort("price")}>Price ₹</th>
                        <th style={thStyle("change")} onClick={() => handleSort("change")}>Day Chg%</th>
                        <th style={thStyle("pe")} onClick={() => handleSort("pe")}>P/E Ratio</th>
                        <th style={thStyle("pb")} onClick={() => handleSort("pb")}>P/B Ratio</th>
                        <th style={thStyle("roe")} onClick={() => handleSort("roe")}>ROE%</th>
                        <th style={thStyle("divYield")} onClick={() => handleSort("divYield")}>Yield%</th>
                        <th style={{...thStyle("sector"), cursor: "default"}}>Exchange</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedStocks.map((s, i) => (
                        <tr key={s.symbol} 
                          onClick={() => setSelectedStock(s)}
                          style={{ background: i % 2 === 0 ? "var(--color-background-primary)" : "var(--color-background-secondary)", transition: "0.1s", cursor: "pointer" }}>
                          <td style={{textAlign:"center", padding:"12px", cursor:"pointer"}}
                            onClick={(e) => { e.stopPropagation(); toggleWatchlist(s.symbol); }}>
                            <span style={{
                              fontSize: 16,
                              color: watchlist.includes(s.symbol) ? "#f59e0b" : "#e2e8f0"
                            }}>
                              {watchlist.includes(s.symbol) ? "★" : "☆"}
                            </span>
                          </td>
                          <td style={{ ...tdStyle("left") }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>{s.symbol}</span>
                                <SmartBadge stock={s} />
                            </div>
                            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{s.company}</div>
                          </td>
                          <td style={{ ...tdStyle(), fontWeight: 600, color: "var(--color-text-primary)" }}>₹{(s.price || 0).toLocaleString("en-IN")}</td>
                          <td style={{ ...tdStyle(), color: metricColor("change", s.change), fontWeight: 600 }}>{fmtPct(s.change)}</td>
                          <td style={{ ...tdStyle(), color: metricColor("pe", s.pe) }}>{(s.pe || 0).toFixed(1)}</td>
                          <td style={{ ...tdStyle() }}>{(s.pb || 0).toFixed(2)}</td>
                          <td style={{ ...tdStyle(), color: metricColor("roe", s.roe), fontWeight: 500 }}>{(s.roe || 0).toFixed(1)}%</td>
                          <td style={{ ...tdStyle() }}>{(s.divYield || 0).toFixed(2)}%</td>
                          <td style={{ ...tdStyle(), fontSize: 11, color: "var(--color-text-tertiary)" }}>{s.sector}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── LOAD MORE ── */}
              {visibleCount < sortedStocks.length && (
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button
                    onClick={() => setVisibleCount(v => v + 50)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--color-border-tertiary)",
                      color: "var(--color-text-secondary)",
                      fontSize: 13, padding: "10px 24px", borderRadius: 10,
                      cursor: "pointer", fontWeight: 500,
                    }}
                  >
                    Load 50 More ({sortedStocks.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>
      <StockDetailPanel 
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onWatchlist={toggleWatchlist}
        isWatchlisted={watchlist.includes(selectedStock?.symbol)}
      />
    </div>
  );
}

function StockDetailPanel({ stock, onClose, onWatchlist, isWatchlisted }) {
  if (!stock) return null;

  const metrics = [
    { label: "P/E Ratio", value: stock.pe?.toFixed(1), 
      color: metricColor("pe", stock.pe),
      explain: stock.pe < 15 
        ? "🟢 Cheap — you pay less than ₹15 per ₹1 of earnings" 
        : stock.pe < 30 
        ? "🟡 Fair value range" 
        : "🔴 Expensive — high growth expectations priced in" },
    { label: "P/B Ratio", value: stock.pb?.toFixed(2),
      explain: stock.pb < 1 
        ? "🟢 Trading below book value — potential deep value" 
        : stock.pb < 3 
        ? "🟡 Reasonable price-to-book" 
        : "🔴 Premium to book value" },
    { label: "ROE %", value: stock.roe?.toFixed(1) + "%", 
      color: metricColor("roe", stock.roe),
      explain: stock.roe > 20 
        ? "🟢 Excellent — company generates strong returns on capital" 
        : stock.roe > 12 
        ? "🟡 Average returns on equity" 
        : "🔴 Below average capital efficiency" },
    { label: "Div Yield", value: stock.divYield?.toFixed(2) + "%",
      explain: stock.divYield > 3 
        ? "🟢 Strong income stream" 
        : stock.divYield > 1 
        ? "🟡 Modest dividend" 
        : "⚪ Low or no dividend — likely growth-focused" },
    { label: "52W High", value: "₹" + stock.high52?.toLocaleString("en-IN"),
      explain: `Stock is ${Math.abs(stock.fromHigh52 || 0).toFixed(1)}% ${(stock.fromHigh52||0) < 0 ? "below" : "at"} its yearly peak` },
    { label: "vs 200MA", value: (stock.vsMA200||0).toFixed(1) + "%",
      explain: (stock.vsMA200||0) > 0 
        ? "🟢 Above 200-day MA — long-term uptrend" 
        : "🔴 Below 200-day MA — long-term downtrend" },
    { label: "Beta", value: stock.beta?.toFixed(2),
      explain: (stock.beta||0) < 1 
        ? "🟢 Less volatile than market — defensive stock" 
        : "🔴 More volatile than market — higher risk/reward" },
    { label: "Volume Spike", value: (stock.volumeSpike||0).toFixed(0) + "%",
      explain: (stock.volumeSpike||0) > 150 
        ? "🔥 Unusually high volume today — strong interest" 
        : "Normal trading volume" },
  ];

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.3)",
        zIndex:100, backdropFilter:"blur(2px)"
      }} />
      
      {/* Panel */}
      <div style={{
        position:"fixed", right:0, top:0, bottom:0, width:420,
        maxWidth:"95vw", background:"white", zIndex:101,
        boxShadow:"-8px 0 32px rgba(0,0,0,0.12)",
        overflowY:"auto", padding:"2rem"
      }}>
        {/* Header */}
        <div style={{display:"flex", justifyContent:"space-between", 
                     alignItems:"flex-start", marginBottom:"1.5rem"}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <h2 style={{margin:0, fontSize:20, fontWeight:700}}>
                {stock.symbol}
              </h2>
              <SmartBadge stock={stock} />
            </div>
            <div style={{fontSize:13, color:"var(--color-text-secondary)", 
                         marginTop:4}}>
              {stock.company}
            </div>
          </div>
          <div style={{display:"flex", gap:8}}>
            <button onClick={() => onWatchlist(stock.symbol)} style={{
              background:"transparent", color: isWatchlisted ? "#f59e0b":"#94a3b8",
              border:"1px solid currentColor", padding:"6px 12px", fontSize:18
            }}>
              {isWatchlisted ? "★" : "☆"}
            </button>
            <button onClick={onClose} style={{
              background:"transparent", color:"var(--color-text-secondary)",
              border:"1px solid var(--color-border-tertiary)",
              padding:"6px 12px", fontSize:18
            }}>×</button>
          </div>
        </div>

        {/* Price Block */}
        <div style={{
          background:"var(--color-background-secondary)", 
          borderRadius:12, padding:"1rem", marginBottom:"1.5rem"
        }}>
          <div style={{fontSize:28, fontWeight:700}}>
            ₹{stock.price?.toLocaleString("en-IN")}
          </div>
          <div style={{
            fontSize:16, fontWeight:600, 
            color: metricColor("change", stock.change)
          }}>
            {fmtPct(stock.change)} today
          </div>
          <div style={{fontSize:11, color:"var(--color-text-tertiary)", 
                       marginTop:4}}>
            Exchange: {stock.sector}
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{marginBottom:"1.5rem"}}>
          <div style={{fontSize:11, fontWeight:600, 
                       color:"var(--color-text-tertiary)",
                       textTransform:"uppercase", letterSpacing:"0.5px",
                       marginBottom:12}}>
            Key Metrics
          </div>
          {metrics.map(m => (
            <div key={m.label} style={{
              padding:"12px 0", 
              borderBottom:"0.5px solid var(--color-border-tertiary)"
            }}>
              <div style={{display:"flex", justifyContent:"space-between",
                           alignItems:"center", marginBottom:4}}>
                <span style={{fontSize:12, 
                              color:"var(--color-text-secondary)"}}>
                  {m.label}
                </span>
                <span style={{fontSize:14, fontWeight:600, 
                              color: m.color || "var(--color-text-primary)"}}>
                  {m.value || "—"}
                </span>
              </div>
              <div style={{fontSize:11, color:"var(--color-text-tertiary)"}}>
                {m.explain}
              </div>
            </div>
          ))}
        </div>

        {/* View on external sites */}
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {[
            { label: "Yahoo Finance", 
              url: `https://finance.yahoo.com/quote/${stock.symbol}` },
            { label: "Screener.in", 
              url: `https://www.screener.in/company/${stock.symbol.replace(".NS","")}/` },
            { label: "Moneycontrol", 
              url: `https://www.moneycontrol.com/india/stockpricequote/${stock.symbol.replace(".NS","")}` },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" 
               rel="noreferrer"
               style={{
                 fontSize:12, padding:"6px 12px", borderRadius:6,
                 background:"var(--color-background-secondary)",
                 color:"var(--color-text-primary)", textDecoration:"none",
                 border:"1px solid var(--color-border-tertiary)"
               }}>
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
