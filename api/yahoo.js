export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  // Forward the query string as-is to Yahoo Finance
  const qs = new URLSearchParams(req.query).toString();
  
  // Try v8 first, fall back to v7
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/quote?${qs}`,
    `https://query2.finance.yahoo.com/v8/finance/quote?${qs}`,
    `https://query1.finance.yahoo.com/v7/finance/quote?${qs}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          "Referer": "https://finance.yahoo.com"
        }
      });
      
      if (!response.ok) continue;
      const data = await response.json();
      if (data?.quoteResponse?.result) {
        return res.status(200).json(data);
      }
    } catch (e) {
      continue;
    }
  }
  
  res.status(502).json({ 
    error: "All Yahoo Finance endpoints failed" 
  });
}
