import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────
// Po nasazení Google Apps Script sem vložte URL vašeho webového endpointu:
const API_URL = ""; // např. "https://script.google.com/macros/s/ABCDEF.../exec"
// Pokud je prázdný, aplikace běží v offline/demo režimu s local storage
// ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: "triko_kratky", name: "Triko krátký rukáv", price: 550, category: "clothing" },
  { id: "triko_dlouhy", name: "Triko dlouhý rukáv", price: 800, category: "clothing" },
  { id: "polo", name: "Polo triko", price: 800, category: "clothing" },
  { id: "mikina", name: "Mikina s kapucí", price: 950, category: "clothing" },
  { id: "vesta", name: "Vesta modrá", price: 1500, category: "clothing" },
  { id: "kratasy_volne", name: "Volné kraťasy", price: 700, category: "clothing" },
  { id: "leginy", name: "Dlouhé legíny", price: 700, category: "clothing" },
  { id: "tilko", name: "Závodní tílko", price: 750, category: "racing" },
  { id: "kratasy_zavodni", name: "Závodní kraťasy", price: 850, category: "racing" },
  { id: "spricdeka", name: "Špricdeka", price: 1500, category: "racing" },
  { id: "cepice_tenka", name: "Čepice tenká", price: 300, category: "accessories" },
  { id: "cepice_tlusta", name: "Čepice tlustá", price: 350, category: "accessories" },
  { id: "celenka", name: "Čelenka", price: 200, category: "accessories" },
  { id: "ksiltovka", name: "Kšiltovka", price: 150, category: "accessories" },
];

const SIZES = ["XS", "S", "M", "L", "XL"];
const CATEGORIES = { clothing: "Oblečení", racing: "Závodní", accessories: "Doplňky" };

const DEFAULT_INVENTORY = {
  triko_kratky: { XS: 0, S: 3, M: 1, L: 4, XL: 1 },
  triko_dlouhy: { XS: 6, S: 10, M: 2, L: 4, XL: 3 },
  kratasy_volne: { XS: 1, S: 4, M: 2, L: 0, XL: 0 },
  leginy: { XS: 1, S: 0, M: 3, L: 0, XL: 0 },
  mikina: { XS: 0, S: 4, M: 3, L: 2, XL: 0 },
  polo: { XS: 0, S: 15, M: 2, L: 6, XL: 0 },
  tilko: { XS: 6, S: 9, M: 0, L: 12, XL: 7 },
  vesta: { XS: 0, S: 9, M: 11, L: 12, XL: 3 },
  kratasy_zavodni: { XS: 10, S: 6, M: 0, L: 2, XL: 0 },
  spricdeka: { XS: 0, S: 0, M: 20, L: 0, XL: 0 },
  cepice_tenka: { XS: 0, S: 12, M: 10, L: 5, XL: 0 },
  cepice_tlusta: { XS: 0, S: 20, M: 10, L: 12, XL: 0 },
  celenka: { XS: 0, S: 0, M: 36, L: 0, XL: 0 },
  ksiltovka: { XS: 0, S: 0, M: 10, L: 0, XL: 0 },
};

const C = {
  blue900: "#0a1e3d", blue800: "#0d2b5e", blue700: "#11397a", blue600: "#1a4fa0",
  blue500: "#2563c4", blue400: "#4a8ae8", blue200: "#b3d4fc",
  blue100: "#dbeafe", blue50: "#eff6ff",
  kvsBlue: "#4a90c4",
  kvsRed: "#d94040",
  white: "#ffffff",
  gray50: "#f9fafb", gray100: "#f3f4f6", gray200: "#e5e7eb", gray300: "#d1d5db",
  gray400: "#9ca3af", gray500: "#6b7280", gray600: "#4b5563", gray700: "#374151",
  gray800: "#1f2937", gray900: "#111827",
  green: "#059669", greenLight: "#d1fae5", greenDark: "#065f46",
  red: "#dc2626", redLight: "#fee2e2", redDark: "#991b1b",
  amber: "#d97706", amberLight: "#fef3c7", amberDark: "#92400e",
};

/* ─── API helpers ─── */
const api = {
  isOnline: () => !!API_URL,
  async getInventory() {
    if (!API_URL) return null;
    try {
      const r = await fetch(`${API_URL}?action=getInventory`);
      const d = await r.json();
      return d.success ? d.data : null;
    } catch { return null; }
  },
  async getOrders() {
    if (!API_URL) return null;
    try {
      const r = await fetch(`${API_URL}?action=getOrders`);
      const d = await r.json();
      return d.success ? d.data : null;
    } catch { return null; }
  },
  async submitOrder(order) {
    if (!API_URL) return false;
    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "submitOrder", order }),
      });
      const d = await r.json();
      return d.success;
    } catch { return false; }
  },
  async updateOrderStatus(orderId, status) {
    if (!API_URL) return false;
    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateStatus", orderId, status }),
      });
      const d = await r.json();
      return d.success;
    } catch { return false; }
  },
  async updateInventory(inventory) {
    if (!API_URL) return false;
    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateInventory", inventory }),
      });
      const d = await r.json();
      return d.success;
    } catch { return false; }
  },
};

/* ─── SVG LOGO ─── */
function KVSLogo({ height = 44 }) {
  const w = height * 2.6;
  const ch = height;
  const cr = ch * 0.42;
  const cx = cr + 2;
  const cy = ch / 2;
  const flagX = cx + cr + 4;
  const flagW = w - flagX - 2;
  const stripes = 7;
  const sw = flagW / stripes;
  const pts = (i) => {
    const x = flagX + i * sw;
    const wave = Math.sin((i / stripes) * Math.PI * 0.8) * ch * 0.08;
    return { x, topY: ch * 0.08 + wave, botY: ch * 0.92 + wave };
  };
  return (
    <svg width={w} height={ch} viewBox={`0 0 ${w} ${ch}`} style={{ display: "block" }}>
      <circle cx={cx} cy={cy} r={cr} fill="none" stroke={C.kvsBlue} strokeWidth={2.5} />
      <text x={cx} y={cy - 1} textAnchor="middle" dominantBaseline="central" fill={C.kvsBlue} fontSize={cr * 0.82} fontWeight="800" fontFamily="'Barlow Condensed', sans-serif" fontStyle="italic">KVS</text>
      <text x={cx} y={cy + cr * 0.62} textAnchor="middle" fill={C.kvsBlue} fontSize={cr * 0.36} fontWeight="700" fontFamily="'Barlow Condensed', sans-serif">1924</text>
      {Array.from({ length: stripes }).map((_, i) => {
        const p1 = pts(i);
        const p2 = pts(i + 1);
        const path = `M${p1.x},${p1.topY} L${p2.x},${p2.topY} L${p2.x},${p2.botY} L${p1.x},${p1.botY} Z`;
        return <path key={i} d={path} fill={i % 2 === 0 ? C.kvsRed : C.white} />;
      })}
    </svg>
  );
}

/* ─── MAIN APP ─── */
export default function KVSApp() {
  const [view, setView] = useState("catalog");
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [form, setForm] = useState({ name: "", surname: "", email: "", phone: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [inventoryEditing, setInventoryEditing] = useState(false);
  const [editInventory, setEditInventory] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Load data
  useEffect(() => {
    (async () => {
      if (api.isOnline()) {
        const [inv, ord] = await Promise.all([api.getInventory(), api.getOrders()]);
        if (inv) setInventory(inv);
        if (ord) setOrders(ord);
      } else {
        try {
          const [oR, iR] = await Promise.all([
            window.storage.get("kvs-orders-v3").catch(() => null),
            window.storage.get("kvs-inventory-v3").catch(() => null),
          ]);
          if (oR?.value) setOrders(JSON.parse(oR.value));
          if (iR?.value) setInventory(JSON.parse(iR.value));
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    })();
  }, []);

  // Offline persistence
  const saveLocal = useCallback(async (key, data) => {
    if (!api.isOnline()) {
      try { await window.storage.set(key, JSON.stringify(data)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveOrders = useCallback(async (o) => {
    setOrders(o);
    await saveLocal("kvs-orders-v3", o);
  }, [saveLocal]);

  const saveInventory = useCallback(async (i) => {
    setInventory(i);
    await saveLocal("kvs-inventory-v3", i);
  }, [saveLocal]);

  const addToCart = (pid, sz) => { const k = `${pid}__${sz}`; setCart(p => ({ ...p, [k]: (p[k] || 0) + 1 })); };
  const removeFromCart = (k) => { setCart(p => { const n = { ...p }; if (n[k] > 1) n[k]--; else delete n[k]; return n; }); };
  const getAvail = (pid, sz) => inventory[pid]?.[sz] ?? 0;
  const cartTotal = Object.entries(cart).reduce((s, [k, q]) => s + (PRODUCTS.find(p => p.id === k.split("__")[0])?.price || 0) * q, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const submitOrder = async () => {
    if (!form.name.trim() || !form.surname.trim() || cartCount === 0) return;
    setSyncing(true);
    const items = Object.entries(cart).map(([k, qty]) => {
      const [pid, sz] = k.split("__");
      const pr = PRODUCTS.find(p => p.id === pid);
      return { productId: pid, size: sz, qty, name: pr.name, unitPrice: pr.price };
    });
    const order = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...form, items, total: cartTotal,
      date: new Date().toISOString(), status: "pending",
    };

    if (api.isOnline()) {
      const ok = await api.submitOrder(order);
      if (ok) {
        const [inv, ord] = await Promise.all([api.getInventory(), api.getOrders()]);
        if (inv) setInventory(inv);
        if (ord) setOrders(ord);
      } else {
        // Fallback to local
        const ni = JSON.parse(JSON.stringify(inventory));
        items.forEach(({ productId, size, qty }) => { if (ni[productId]?.[size] !== undefined) ni[productId][size] -= qty; });
        await saveOrders([order, ...orders]);
        await saveInventory(ni);
      }
    } else {
      const ni = JSON.parse(JSON.stringify(inventory));
      items.forEach(({ productId, size, qty }) => { if (ni[productId]?.[size] !== undefined) ni[productId][size] -= qty; });
      await saveOrders([order, ...orders]);
      await saveInventory(ni);
    }
    setCart({});
    setForm({ name: "", surname: "", email: "", phone: "" });
    setSyncing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const updateStatus = async (id, st) => {
    setSyncing(true);
    if (api.isOnline()) {
      await api.updateOrderStatus(id, st);
      const ord = await api.getOrders();
      if (ord) setOrders(ord);
    } else {
      await saveOrders(orders.map(o => o.id === id ? { ...o, status: st } : o));
    }
    setSyncing(false);
  };

  const deleteOrder = async (id) => {
    const o = orders.find(x => x.id === id); if (!o) return;
    setSyncing(true);
    if (api.isOnline()) {
      await api.updateOrderStatus(id, "cancelled");
      const [inv, ord] = await Promise.all([api.getInventory(), api.getOrders()]);
      if (inv) setInventory(inv);
      if (ord) setOrders(ord);
    } else {
      const ni = JSON.parse(JSON.stringify(inventory));
      o.items.forEach(({ productId, size, qty }) => { if (ni[productId]?.[size] !== undefined) ni[productId][size] += qty; });
      await saveOrders(orders.filter(x => x.id !== id));
      await saveInventory(ni);
    }
    setSyncing(false);
  };

  const fmtPrice = n => n.toLocaleString("cs-CZ") + " Kč";
  const fmtDate = iso => new Date(iso).toLocaleDateString("cs-CZ");

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.blue900, color: C.white }}>
      <div style={{ width: 48, height: 48, border: `4px solid ${C.blue700}`, borderTop: `4px solid ${C.kvsRed}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ marginTop: 16, letterSpacing: 2, fontSize: 13, textTransform: "uppercase" }}>Načítání...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Barlow', 'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: C.gray50, color: C.gray800 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; }
        input:focus { border-color: ${C.blue500} !important; outline: none; }
      `}</style>

      {/* HEADER */}
      <header style={{ background: `linear-gradient(135deg, ${C.blue900} 0%, ${C.blue800} 60%, ${C.blue700} 100%)`, color: C.white, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(10,30,61,0.4)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "14px 0 10px", gap: 16 }}>
            <KVSLogo height={46} />
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>Klubové oblečení</h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.5, letterSpacing: 0.5 }}>Klub vodních sportů Praha</p>
            </div>
            {!api.isOnline() && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 99, opacity: 0.7 }}>demo</span>}
            {syncing && <span style={{ fontSize: 11, color: C.kvsRed }}>⟳</span>}
          </div>
          <nav style={{ display: "flex", gap: 2, borderTop: `1px solid ${C.blue700}` }}>
            {[
              { key: "catalog", label: "Katalog" },
              { key: "order", label: cartCount > 0 ? `Objednávka (${cartCount})` : "Objednávka" },
              { key: "admin", label: "Správa" },
            ].map(t => (
              <button key={t.key} onClick={() => setView(t.key)} style={{
                padding: "11px 20px", border: "none", cursor: "pointer", fontSize: 13,
                fontWeight: 700, fontFamily: "'Barlow', sans-serif", letterSpacing: 0.5,
                textTransform: "uppercase", transition: "all 0.15s",
                background: view === t.key ? C.white : "transparent",
                color: view === t.key ? C.blue800 : "rgba(255,255,255,0.55)",
                borderRadius: "6px 6px 0 0",
              }}>{t.label}</button>
            ))}
          </nav>
        </div>
      </header>

      {showSuccess && (
        <div style={{ background: `linear-gradient(90deg, ${C.green}, #0d9488)`, color: C.white, textAlign: "center", padding: "14px 20px", fontWeight: 700, fontSize: 14, animation: "fadeIn 0.3s" }}>
          ✓ Objednávka odeslána — zaplaťte převodem na účet KVS (poznámka: jméno — oblečení)
        </div>
      )}

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px" }}>
        {view === "catalog" && <Catalog {...{ inventory, cart, addToCart, removeFromCart, getAvail, fmtPrice, setView, cartCount }} />}
        {view === "order" && <Order {...{ cart, removeFromCart, addToCart, cartTotal, cartCount, form, setForm, submitOrder, fmtPrice, setView, setCart, syncing }} />}
        {view === "admin" && <Admin {...{ adminAuth, adminPin, setAdminPin, setAdminAuth, orders, inventory, inventoryEditing, setInventoryEditing, editInventory, setEditInventory, saveInventory, updateStatus, deleteOrder, fmtPrice, fmtDate, expandedOrder, setExpandedOrder, syncing }} />}
      </main>

      <footer style={{ textAlign: "center", padding: "20px", fontSize: 12, color: C.gray400, borderTop: `1px solid ${C.gray200}` }}>
        KVS Praha — Klub vodních sportů © 2025&ensp;·&ensp;Praha 4, Podolí
      </footer>
    </div>
  );
}

/* ════════════ CATALOG ════════════ */
function Catalog({ inventory, cart, addToCart, removeFromCart, getAvail, fmtPrice, setView, cartCount }) {
  const [openProduct, setOpenProduct] = useState(null);
  const [selSize, setSelSize] = useState(null);
  const grouped = {};
  PRODUCTS.forEach(p => { if (!grouped[p.category]) grouped[p.category] = []; grouped[p.category].push(p); });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={hd}>Katalog</h2>
        <p style={{ margin: "-16px 0 0", color: C.gray500, fontSize: 14 }}>Klikněte na produkt pro výběr velikosti</p>
      </div>

      {["clothing", "racing", "accessories"].map(cat => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: `3px solid ${C.blue800}` }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: C.blue700 }}>{CATEGORIES[cat]}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {(grouped[cat] || []).map(product => {
              const isOpen = openProduct === product.id;
              const totalAvail = SIZES.reduce((s, sz) => s + Math.max(0, getAvail(product.id, sz)), 0);
              const inCart = Object.entries(cart).filter(([k]) => k.startsWith(product.id + "__")).reduce((s, [, q]) => s + q, 0);
              return (
                <div key={product.id} onClick={() => { setOpenProduct(isOpen ? null : product.id); setSelSize(null); }} style={{
                  background: C.white, borderRadius: 8, overflow: "hidden", cursor: "pointer",
                  border: `2px solid ${isOpen ? C.blue500 : C.gray200}`,
                  boxShadow: isOpen ? "0 4px 16px rgba(37,99,196,0.12)" : "none",
                  transition: "all 0.15s", opacity: totalAvail === 0 && !isOpen ? 0.5 : 1,
                }}>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.gray900 }}>{product.name}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: C.blue600, fontFamily: "'Barlow Condensed', sans-serif" }}>{fmtPrice(product.price)}</span>
                        <span style={{ fontSize: 12, color: totalAvail > 0 ? C.green : C.red, fontWeight: 600 }}>{totalAvail > 0 ? `${totalAvail} ks` : "vyprodáno"}</span>
                      </div>
                    </div>
                    {inCart > 0 && <div style={{ background: C.blue600, color: C.white, borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 800 }}>{inCart}×</div>}
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.gray100}`, paddingTop: 12, animation: "fadeIn 0.15s" }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.gray500, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Velikost</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {SIZES.map(sz => {
                          const av = getAvail(product.id, sz);
                          const sel = selSize === sz;
                          return (
                            <button key={sz} disabled={av <= 0} onClick={() => setSelSize(sel ? null : sz)} style={{
                              flex: 1, padding: "8px 4px", border: `2px solid ${sel ? C.blue500 : av <= 0 ? C.gray100 : C.gray200}`,
                              borderRadius: 6, cursor: av > 0 ? "pointer" : "not-allowed",
                              background: sel ? C.blue50 : C.white, opacity: av <= 0 ? 0.4 : 1,
                              fontFamily: "inherit", transition: "all 0.1s",
                            }}>
                              <div style={{ fontWeight: 800, fontSize: 14, color: sel ? C.blue600 : C.gray800 }}>{sz}</div>
                              <div style={{ fontSize: 11, color: av <= 0 ? C.gray400 : av < 3 ? C.amber : C.green, fontWeight: 600 }}>{av <= 0 ? "—" : `${av} ks`}</div>
                            </button>
                          );
                        })}
                      </div>
                      {selSize && (
                        <button onClick={() => { addToCart(product.id, selSize); setSelSize(null); }} style={{
                          marginTop: 10, width: "100%", padding: "11px",
                          background: `linear-gradient(135deg, ${C.blue600}, ${C.blue500})`,
                          color: C.white, border: "none", borderRadius: 6, fontWeight: 700,
                          fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                          letterSpacing: 0.3, textTransform: "uppercase",
                        }}>Přidat · {selSize}</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {cartCount > 0 && (
        <div onClick={() => setView("order")} style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: `linear-gradient(135deg, ${C.blue800}, ${C.blue600})`, color: C.white,
          padding: "14px 32px", borderRadius: 99, fontWeight: 800, fontSize: 14, cursor: "pointer",
          boxShadow: "0 8px 32px rgba(10,30,61,0.5)", zIndex: 50,
          fontFamily: "'Barlow', sans-serif", letterSpacing: 0.5, textTransform: "uppercase",
          border: `2px solid ${C.kvsRed}`, animation: "slideUp 0.3s",
        }}>Zobrazit objednávku · {cartCount} pol.</div>
      )}
    </div>
  );
}

/* ════════════ ORDER ════════════ */
function Order({ cart, removeFromCart, addToCart, cartTotal, cartCount, form, setForm, submitOrder, fmtPrice, setView, setCart, syncing }) {
  const entries = Object.entries(cart);
  if (entries.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.gray800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Objednávka je prázdná</div>
      <p style={{ color: C.gray500, margin: "8px 0 24px", fontSize: 14 }}>Přidejte si oblečení z katalogu</p>
      <button onClick={() => setView("catalog")} style={btnS(C.blue600)}>Přejít do katalogu</button>
    </div>
  );
  const canSubmit = form.name.trim() && form.surname.trim() && !syncing;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2 style={hd}>Objednávka</h2>
      <div style={cardS}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={secL}>Položky</span>
          <button onClick={() => setCart({})} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Vyprázdnit</button>
        </div>
        {entries.map(([key, qty]) => {
          const [pid, sz] = key.split("__");
          const pr = PRODUCTS.find(p => p.id === pid);
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.gray100}`, gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <span style={{ fontWeight: 700, color: C.gray900 }}>{pr.name}</span>
                <span style={{ display: "inline-block", background: C.blue50, color: C.blue700, borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{sz}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => removeFromCart(key)} style={qtyB}>−</button>
                <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button onClick={() => addToCart(pid, sz)} style={qtyB}>+</button>
              </div>
              <div style={{ fontWeight: 800, color: C.blue600, minWidth: 80, textAlign: "right", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16 }}>{fmtPrice(pr.price * qty)}</div>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginTop: 8, borderTop: `3px solid ${C.blue800}` }}>
          <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", letterSpacing: 1, color: C.gray700 }}>Celkem</span>
          <span style={{ fontWeight: 900, fontSize: 24, color: C.blue700, fontFamily: "'Barlow Condensed', sans-serif" }}>{fmtPrice(cartTotal)}</span>
        </div>
      </div>

      <div style={cardS}>
        <div style={{ ...secL, marginBottom: 14 }}>Údaje objednatele</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labS}>Příjmení *</label><input style={inpS} value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} placeholder="Novák" /></div>
          <div><label style={labS}>Jméno *</label><input style={inpS} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jan" /></div>
          <div><label style={labS}>E-mail</label><input style={inpS} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jan@email.cz" /></div>
          <div><label style={labS}>Telefon</label><input style={inpS} type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+420 ..." /></div>
        </div>
      </div>

      <div style={{ background: C.blue50, border: `1px solid ${C.blue200}`, borderRadius: 8, padding: "14px 18px", fontSize: 14, color: C.blue800, marginBottom: 16, lineHeight: 1.5 }}>
        Platba převodem na účet KVS. Do poznámky uveďte: <strong>jméno závodníka — oblečení</strong>
      </div>

      <button disabled={!canSubmit} onClick={submitOrder} style={{
        width: "100%", padding: "16px",
        background: canSubmit ? `linear-gradient(135deg, ${C.green}, #0d9488)` : C.gray300,
        color: C.white, border: "none", borderRadius: 8, fontWeight: 800, fontSize: 15,
        cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: 1, textTransform: "uppercase",
      }}>{syncing ? "Odesílání..." : `Odeslat objednávku — ${fmtPrice(cartTotal)}`}</button>
    </div>
  );
}

/* ════════════ ADMIN ════════════ */
function Admin({ adminAuth, adminPin, setAdminPin, setAdminAuth, orders, inventory, inventoryEditing, setInventoryEditing, editInventory, setEditInventory, saveInventory, updateStatus, deleteOrder, fmtPrice, fmtDate, expandedOrder, setExpandedOrder, syncing }) {
  const [tab, setTab] = useState("orders");

  if (!adminAuth) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ margin: "0 auto 20px" }}><KVSLogo height={56} /></div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.gray800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Správa skladu</div>
      <p style={{ color: C.gray500, margin: "8px 0 24px", fontSize: 14 }}>Zadejte PIN pro přístup</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <input style={{ ...inpS, width: 130, textAlign: "center", letterSpacing: 6, fontSize: 20, fontWeight: 800 }} type="password" maxLength={6} value={adminPin} onChange={e => setAdminPin(e.target.value)} onKeyDown={e => e.key === "Enter" && setAdminAuth(true)} placeholder="• • •" />
        <button onClick={() => setAdminAuth(true)} style={btnS(C.blue700)}>Vstoupit</button>
      </div>
      <p style={{ fontSize: 12, color: C.gray400, marginTop: 12 }}>Demo: jakýkoliv PIN</p>
    </div>
  );

  const inv = inventoryEditing ? editInventory : inventory;
  const pending = orders.filter(o => o.status === "pending");
  const paid = orders.filter(o => o.status === "paid");
  const rev = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const sts = {
    pending: { bg: C.amberLight, text: C.amberDark, label: "Čekající" },
    paid: { bg: C.greenLight, text: C.greenDark, label: "Zaplaceno" },
    delivered: { bg: C.blue100, text: C.blue700, label: "Vydáno" },
    cancelled: { bg: C.redLight, text: C.redDark, label: "Zrušeno" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ ...hd, marginBottom: 0 }}>Správa</h2>
        <button onClick={() => { setAdminAuth(false); setAdminPin(""); }} style={{ background: "none", border: `1px solid ${C.gray200}`, borderRadius: 6, padding: "8px 16px", color: C.gray500, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Odhlásit</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Celkem", val: orders.length, color: C.blue700 },
          { label: "Čekající", val: pending.length, color: C.amber },
          { label: "Zaplaceno", val: paid.length, color: C.green },
          { label: "Tržby", val: fmtPrice(rev), color: C.kvsRed },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.gray200}`, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 11, color: C.gray500, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: "'Barlow Condensed', sans-serif", marginTop: 2 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[{ key: "orders", label: `Objednávky (${orders.length})` }, { key: "inventory", label: "Sklad" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "10px 20px", border: `2px solid ${tab === t.key ? C.blue600 : C.gray200}`,
            borderRadius: 6, background: tab === t.key ? C.blue50 : C.white,
            cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'Barlow', sans-serif",
            color: tab === t.key ? C.blue700 : C.gray500, letterSpacing: 0.5, textTransform: "uppercase",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "orders" && (
        orders.length === 0 ? <p style={{ textAlign: "center", color: C.gray400, padding: 40 }}>Zatím žádné objednávky</p> :
        orders.map(order => {
          const exp = expandedOrder === order.id;
          const st = sts[order.status] || sts.pending;
          return (
            <div key={order.id} style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.gray200}`, marginBottom: 8, overflow: "hidden" }}>
              <div onClick={() => setExpandedOrder(exp ? null : order.id)} style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: C.gray900 }}>{order.surname} {order.name}</strong>
                  <span style={{ display: "inline-block", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, marginLeft: 10, background: st.bg, color: st.text }}>{st.label}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: C.blue600, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16 }}>{fmtPrice(order.total)}</div>
                  <div style={{ fontSize: 12, color: C.gray400 }}>{fmtDate(order.date)}</div>
                </div>
                <span style={{ color: C.gray400, fontSize: 12 }}>{exp ? "▼" : "▶"}</span>
              </div>
              {exp && (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.gray100}`, animation: "fadeIn 0.15s" }}>
                  {(order.phone || order.email) && (
                    <div style={{ padding: "10px 0", fontSize: 13, color: C.gray600, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {order.email && <span>✉ {order.email}</span>}
                      {order.phone && <span>☎ {order.phone}</span>}
                    </div>
                  )}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
                    <thead><tr>
                      {["Položka", "Vel.", "Ks", "Cena"].map((h, i) => <th key={h} style={{ textAlign: i === 3 ? "right" : "left", padding: "6px 10px", fontSize: 11, color: C.gray500, borderBottom: `1px solid ${C.gray200}`, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{order.items.map((it, i) => (
                      <tr key={i}>{[it.name, it.size, it.qty, fmtPrice(it.unitPrice * it.qty)].map((v, j) => (
                        <td key={j} style={{ padding: "8px 10px", fontSize: 14, borderBottom: `1px solid ${C.gray50}`, textAlign: j === 3 ? "right" : "left", fontWeight: j === 3 ? 700 : 400 }}>{v}</td>
                      ))}</tr>
                    ))}</tbody>
                  </table>
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    {order.status === "pending" && <button disabled={syncing} onClick={() => updateStatus(order.id, "paid")} style={{ ...actB, background: C.greenLight, color: C.greenDark }}>✓ Zaplaceno</button>}
                    {order.status === "paid" && <button disabled={syncing} onClick={() => updateStatus(order.id, "delivered")} style={{ ...actB, background: C.blue100, color: C.blue700 }}>Vydáno</button>}
                    {order.status !== "cancelled" && order.status !== "delivered" && <button disabled={syncing} onClick={() => deleteOrder(order.id)} style={{ ...actB, background: C.redLight, color: C.redDark }}>✕ Zrušit</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {tab === "inventory" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, gap: 8 }}>
            {inventoryEditing ? (
              <>
                <button onClick={async () => {
                  if (editInventory) {
                    if (api.isOnline()) await api.updateInventory(editInventory);
                    await saveInventory(editInventory);
                    setInventoryEditing(false); setEditInventory(null);
                  }
                }} style={btnS(C.green)}>Uložit</button>
                <button onClick={() => { setInventoryEditing(false); setEditInventory(null); }} style={{ ...btnS(C.gray400), background: C.gray200, color: C.gray700 }}>Zrušit</button>
              </>
            ) : (
              <button onClick={() => { setInventoryEditing(true); setEditInventory(JSON.parse(JSON.stringify(inventory))); }} style={btnS(C.blue600)}>Upravit sklad</button>
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: C.white, borderRadius: 8, overflow: "hidden" }}>
              <thead><tr>
                <th style={{ ...iTh, textAlign: "left" }}>Produkt</th>
                {SIZES.map(sz => <th key={sz} style={iTh}>{sz}</th>)}
                <th style={iTh}>Σ</th>
              </tr></thead>
              <tbody>{PRODUCTS.map(pr => {
                const row = inv[pr.id] || {};
                const tot = SIZES.reduce((s, sz) => s + (row[sz] || 0), 0);
                return (
                  <tr key={pr.id}>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, borderBottom: `1px solid ${C.gray100}`, whiteSpace: "nowrap" }}>{pr.name}</td>
                    {SIZES.map(sz => {
                      const v = row[sz] ?? 0;
                      return (
                        <td key={sz} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, fontSize: 14, borderBottom: `1px solid ${C.gray100}`, background: v <= 0 ? C.redLight : v < 3 ? C.amberLight : "transparent", color: v <= 0 ? C.red : v < 3 ? C.amber : C.gray800 }}>
                          {inventoryEditing ? (
                            <input type="number" value={v} onChange={e => { const ni = { ...editInventory }; ni[pr.id] = { ...ni[pr.id], [sz]: parseInt(e.target.value) || 0 }; setEditInventory(ni); }} style={{ width: 50, padding: "4px", border: `2px solid ${C.blue200}`, borderRadius: 4, textAlign: "center", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }} />
                          ) : v}
                        </td>
                      );
                    })}
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 900, fontSize: 14, borderBottom: `1px solid ${C.gray100}`, color: C.blue800 }}>{tot}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const hd = { margin: "0 0 24px", fontSize: 26, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: C.blue900, textTransform: "uppercase", letterSpacing: 1 };
const cardS = { background: C.white, borderRadius: 8, padding: 20, marginBottom: 16, border: `1px solid ${C.gray200}` };
const secL = { fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: C.gray500 };
const labS = { display: "block", fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 };
const inpS = { width: "100%", padding: "10px 14px", borderRadius: 6, border: `2px solid ${C.gray200}`, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.15s" };
const btnS = (bg) => ({ padding: "10px 20px", background: bg, color: C.white, border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 });
const qtyB = { width: 30, height: 30, borderRadius: 99, border: `2px solid ${C.gray200}`, background: C.white, cursor: "pointer", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", color: C.gray700 };
const actB = { padding: "8px 16px", borderRadius: 6, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };
const iTh = { padding: "10px 12px", fontSize: 11, fontWeight: 700, color: C.gray500, borderBottom: `2px solid ${C.gray200}`, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" };
