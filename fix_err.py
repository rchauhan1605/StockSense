with open('src/App.jsx', 'r', encoding='utf-8') as f:
    orig = f.read()

new_load_universe = '''  async function loadUniverse() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setProgress(null);
    try {
        const data = await fetchStockData((batchNum, totalBatches, loadedCount) => {
            // keep it silent or optional
        });
        setUniverse(data);
        setFetchedAt(new Date());
    } catch (e) {
        setUniverse(OFFLINE_MOCK_DATA);
        setError("fallback");
        setFetchedAt(new Date());
    } finally {
        setLoading(false);
    }
  }'''

orig = orig.replace('''  async function loadUniverse() {
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
  }''', new_load_universe)

beg_err = '''              {error ? (
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
              ) : ('''

new_beg_err = '''              {loading ? (
                <div style={{ padding: "4rem 0", textAlign: "center" }}>
                   <div style={{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                   <div style={{ fontSize: 16, color: "var(--color-text-primary)", fontWeight: 600 }}>🔄 Loading market data...</div>
                   <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <>
                  {error === "fallback" && (
                    <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: "16px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#d97706", marginBottom: 4 }}>Showing sample data for now while we connect to live market sources.</div>
                      </div>
                      <button onClick={loadUniverse} style={{ fontSize: 13, padding: "8px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Retry Live Data</button>
                    </div>
                  )}'''

orig = orig.replace(beg_err, new_beg_err)

exp_err = '''          {error ? (
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
          ) : activeTab === "watchlist" && watchlist.length === 0 ? ('''

new_exp_err = '''          {loading ? (
            <div style={{ padding: "4rem 0", textAlign: "center" }}>
               <div style={{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
               <div style={{ fontSize: 16, color: "var(--color-text-primary)", fontWeight: 600 }}>🔄 Loading market data...</div>
               <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {error === "fallback" && (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: "16px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#d97706", marginBottom: 4 }}>Showing sample data for now while we connect to live market sources.</div>
                  </div>
                  <button onClick={loadUniverse} style={{ fontSize: 13, padding: "8px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Retry Live Data</button>
                </div>
              )}
              {activeTab === "watchlist" && watchlist.length === 0 ? ('''

orig = orig.replace(exp_err, new_exp_err)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(orig)

print("Replacement Complete")
