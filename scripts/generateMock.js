import fs from 'fs';

// 1. Read the array from App.jsx
const appCode = fs.readFileSync('src/App.jsx', 'utf8');
const match = appCode.match(/const STOCK_UNIVERSE = \[([\s\S]*?)\];/);
if (!match) {
    console.error("Could not find STOCK_UNIVERSE array in App.jsx.");
    process.exit(1);
}

// 2. Parse the symbols
const symbols = match[1]
  .replace(/"/g, '')
  .replace(/'/g, '')
  .replace(/\n/g, '')
  .replace(/\r/g, '')
  .split(',')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log(`Extracting mock data for ${symbols.length} tickers...`);

// 3. Generate deterministic pseudo-random offline mock data for all fields
const MOCK_DATA = symbols.map((symbol, i) => {
    // Deterministic hash so values stay stable across regenerations
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + i;

    // ── Base price / range ──
    const price      = parseFloat((20 + (hash % 3500) + (hash % 100) / 100).toFixed(2));
    const high52     = parseFloat((price * (1.15 + (hash % 30) / 100)).toFixed(2));
    const low52      = parseFloat((price * (0.65 + (hash % 25) / 100)).toFixed(2));

    // ── Moving averages (realistically between low52 and high52) ──
    const ma50       = parseFloat((low52 + (high52 - low52) * (0.4 + (hash % 40) / 100)).toFixed(2));
    const ma200      = parseFloat((low52 + (high52 - low52) * (0.3 + (hash % 35) / 100)).toFixed(2));

    // ── Volume ──
    const avgVolume  = Math.round(100000 + (hash % 5000000));
    const volumeMult = 0.5 + (hash % 300) / 100;          // 0.5x – 3.5x of avg
    const volume     = Math.round(avgVolume * volumeMult);

    // ── Fundamentals ──
    const eps            = parseFloat(((hash % 200) / 10 - 5).toFixed(2));   // -5 to +15
    const beta           = parseFloat((0.5 + (hash % 150) / 100).toFixed(2)); // 0.5 – 2.0
    const revenueGrowth  = parseFloat((((hash % 60) / 10) - 2).toFixed(2));  // -2% to +4%
    const earningsGrowth = parseFloat((((hash % 80) / 10) - 3).toFixed(2));  // -3% to +5%

    // ── Derived fields (same formulas as normalizeYahooData) ──
    const fromHigh52  = parseFloat(((price - high52)  / high52  * 100).toFixed(2));
    const fromLow52   = parseFloat(((price - low52)   / low52   * 100).toFixed(2));
    const vsMA50      = parseFloat(((price - ma50)    / ma50    * 100).toFixed(2));
    const vsMA200     = parseFloat(((price - ma200)   / ma200   * 100).toFixed(2));
    const volumeSpike = parseFloat((volume / avgVolume * 100).toFixed(1));

    return {
        // Identity
        symbol,
        company:        symbol.replace('.NS', '') + ' (Offline Mock)',
        sector:         "Simulated Market",
        // Price / change
        price,
        change:         parseFloat((((hash % 100) / 10) - 4).toFixed(2)),
        // Valuation
        pe:             parseFloat(((hash % 60) + 5).toFixed(1)),
        pb:             parseFloat((1 + (hash % 80) / 10).toFixed(2)),
        roe:            parseFloat(((hash % 30) + (hash % 10) / 10).toFixed(1)),
        divYield:       parseFloat(((hash % 40) / 10).toFixed(2)),
        eps,
        marketCap:      10000000000 * (1 + (hash % 100)),
        // Growth / risk
        revenueGrowth,
        earningsGrowth,
        beta,
        // 52-week / MAs
        high52,
        low52,
        ma50,
        ma200,
        // Volume
        volume,
        avgVolume,
        // Derived
        fromHigh52,
        fromLow52,
        vsMA50,
        vsMA200,
        volumeSpike,
    };
});

// 4. Save to src/data/mockData.js
const fileContent = `// Auto-generated offline mock data for ${symbols.length} symbols
export const OFFLINE_MOCK_DATA = ${JSON.stringify(MOCK_DATA, null, 2)};
`;

fs.writeFileSync('src/data/mockData.js', fileContent);
console.log('✅ Generated new mock data file: src/data/mockData.js');

