import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

const tagColors = {
  Bestseller: "#FF6B35", Sweet: "#E91E8C", Homestyle: "#2D9B5A",
  Snack: "#F5A623", Festive: "#9B59B6", Breakfast: "#3498DB",
  Special: "#E74C3C", Veg: "#27AE60", Comfort: "#16A085", Spicy: "#C0392B",
};

export default function App() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [locationFilter, setLocationFilter] = useState("All");
  const [communityFilter, setCommunityFilter] = useState("All");
  const [foodFilter, setFoodFilter] = useState("All");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", dish: "", qty: "", price: "", phone: "" });
  const [orderData, setOrderData] = useState({ customerName: "", customerPhone: "", deliveryAddress: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const locations = ["All", "Chennai", "Bandra West", "Dadar", "Andheri East"];
  const communities = ["All", "Tamil", "Muslim", "Hindu"];

  const fetchCooks = async () => {
    try {
      const params = new URLSearchParams();
      if (locationFilter !== "All") params.append("location", locationFilter);
      if (communityFilter !== "All") params.append("community", communityFilter);
      const res = await fetch(`${API}/cooks?${params}`);
      const data = await res.json();
      setCooks(data);
    } catch (err) {
      console.error("Backend not running!", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCooks(); }, [locationFilter, communityFilter]);

  const addToCart = (item, cookName) => setCart(prev => ({
    ...prev,
    [item.id]: { ...item, cookName, count: (prev[item.id]?.count || 0) + 1 }
  }));

  const removeFromCart = (itemId) => setCart(prev => {
    const updated = { ...prev };
    if (updated[itemId].count > 1) updated[itemId] = { ...updated[itemId], count: updated[itemId].count - 1 };
    else delete updated[itemId];
    return updated;
  });

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.count, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.count, 0);

  const handleOrder = async () => {
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, ...orderData }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart({});
        setShowOrderForm(false);
        setOrderPlaced(true);
        setOrderData({ customerName: "", customerPhone: "", deliveryAddress: "" });
        fetchCooks();
        setTimeout(() => setOrderPlaced(false), 4000);
      } else {
        alert(data.error || "Order failed");
      }
    } catch (err) {
      alert("Backend not running! Start server.js first.");
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.dish || !formData.phone) {
      alert("Please fill Name, Dish and Phone");
      return;
    }
    try {
      const res = await fetch(`${API}/register-cook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormSubmitted(true);
        setTimeout(() => {
          setFormSubmitted(false);
          setShowPostForm(false);
          setFormData({ name: "", location: "", dish: "", qty: "", price: "", phone: "" });
        }, 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Backend not running! Start server.js first.");
    }
  };

  const filteredCooks = cooks.filter(c =>
    foodFilter === "All" ? true : c.menu.some(m => m.type === foodFilter)
  );

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#FFF8F0", minHeight: "100vh", width: "100vw", color: "#1A0A00" }}>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg, #FF6B35, #D4450C)", boxShadow: "0 4px 20px rgba(212,69,12,0.3)", position: "sticky", top: 0, zIndex: 100, width: "100%" }}>
        <div style={{ width: "100%", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>🍛</span>
            <div>
              <div style={{ color: "#FFF", fontSize: 28, fontWeight: "bold" }}>HomeMeals</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: 3, textTransform: "uppercase" }}>Home Cook Marketplace</div>
            </div>
          </div>
          {cartCount > 0 && (
            <div style={{ background: "#FFF8F0", borderRadius: 14, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <span style={{ fontSize: 20 }}>🛒</span>
              <span style={{ fontWeight: "bold", color: "#D4450C", fontSize: 15 }}>{cartCount} items</span>
              <span style={{ color: "#aaa" }}>•</span>
              <span style={{ fontWeight: "bold", fontSize: 15 }}>₹{cartTotal}</span>
              <button onClick={() => setShowOrderForm(true)} style={{ background: "#D4450C", color: "#fff", border: "none", borderRadius: 10, padding: "6px 18px", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 14, fontWeight: "bold" }}>Order Now</button>
            </div>
          )}
        </div>
      </header>

      {/* TOAST */}
      {orderPlaced && (
        <div style={{ position: "fixed", top: 90, left: "50%", transform: "translateX(-50%)", background: "#2D9B5A", color: "#fff", padding: "18px 40px", borderRadius: 14, fontWeight: "bold", fontSize: 17, zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          🎉 Order placed! Your cook will prepare it fresh.
        </div>
      )}

      {/* HERO */}
      <div style={{ background: "linear-gradient(180deg, #FFF3E8 0%, #FFF8F0 100%)", padding: "48px 48px 32px", textAlign: "center", borderBottom: "1px solid #FFE8D6" }}>
        <h1 style={{ fontSize: 42, fontWeight: "bold", margin: "0 0 10px", color: "#1A0A00" }}>Today's Home-Cooked Menus 🍽️</h1>
        <p style={{ color: "#7A4A30", fontSize: 18, margin: 0 }}>Real people, real kitchens, real food. Order before it runs out.</p>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ width: "100%", padding: "32px 48px", boxSizing: "border-box" }}>

        {/* FILTERS */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", marginBottom: 32, border: "1px solid #FFE8D6", boxShadow: "0 2px 12px rgba(212,69,12,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: "#7A4A30", fontWeight: "bold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>📍 Location</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {locations.map(opt => (
                  <button key={opt} onClick={() => setLocationFilter(opt)} style={{ padding: "7px 16px", borderRadius: 20, border: "2px solid", borderColor: locationFilter === opt ? "#FF6B35" : "#FFD0B0", background: locationFilter === opt ? "#FF6B35" : "#fff", color: locationFilter === opt ? "#fff" : "#7A4A30", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13, fontWeight: "bold" }}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#7A4A30", fontWeight: "bold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🏡 Community</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {communities.map(opt => (
                  <button key={opt} onClick={() => setCommunityFilter(opt)} style={{ padding: "7px 16px", borderRadius: 20, border: "2px solid", borderColor: communityFilter === opt ? "#9B59B6" : "#E8D5F5", background: communityFilter === opt ? "#9B59B6" : "#fff", color: communityFilter === opt ? "#fff" : "#7A4A30", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13, fontWeight: "bold" }}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#7A4A30", fontWeight: "bold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🥗 Food Type</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ label: "All", color: "#888", key: "All" }, { label: "🟢 Veg", color: "#27AE60", key: "veg" }, { label: "🔴 Non-Veg", color: "#E74C3C", key: "non-veg" }].map(f => (
                  <button key={f.key} onClick={() => setFoodFilter(f.key)} style={{ padding: "7px 18px", borderRadius: 20, border: "2px solid", borderColor: foodFilter === f.key ? f.color : "#eee", background: foodFilter === f.key ? f.color : "#fff", color: foodFilter === f.key ? "#fff" : "#555", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13, fontWeight: "bold" }}>{f.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COOK CARDS GRID */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#FF6B35", fontSize: 20 }}>🍳 Loading fresh menus...</div>
        ) : filteredCooks.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#888", fontSize: 18 }}>No cooks found. Try different filters!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))", gap: 28 }}>
            {filteredCooks.map(cook => (
              <CookCard key={cook.id} cook={cook} cart={cart} foodFilter={foodFilter} addToCart={addToCart} removeFromCart={removeFromCart} />
            ))}
          </div>
        )}

        {/* CTA BANNER */}
        <div style={{ marginTop: 48, background: "linear-gradient(135deg, #1A0A00, #3D1A00)", borderRadius: 24, padding: "48px", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👩‍🍳</div>
          <h3 style={{ margin: "0 0 10px", fontSize: 28 }}>Cook from home, earn from home</h3>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 24px", fontSize: 16 }}>Join 200+ home cooks earning ₹15,000–₹40,000/month on HomeMeals</p>
          <button onClick={() => setShowPostForm(true)} style={{ background: "#FF6B35", color: "#fff", border: "none", borderRadius: 14, padding: "14px 40px", fontSize: 18, fontFamily: "Georgia,serif", fontWeight: "bold", cursor: "pointer" }}>Post Your Menu Today →</button>
        </div>

        <div style={{ textAlign: "center", marginTop: 32, color: "#C9A080", fontSize: 13 }}>HomeMeals · Home Cook Marketplace 🍛</div>
      </div>

      {/* ORDER MODAL */}
      {showOrderForm && (
        <Modal onClose={() => setShowOrderForm(false)}>
          <h3 style={{ margin: "0 0 16px", fontSize: 22 }}>🛒 Confirm Your Order</h3>
          <div style={{ background: "#FFF3E8", borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
            {cartItems.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span>{i.emoji} {i.name} × {i.count}</span>
                <span style={{ fontWeight: "bold" }}>₹{i.price * i.count}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px dashed #FFD0B0", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 16 }}>
              <span>Total</span><span style={{ color: "#D4450C" }}>₹{cartTotal}</span>
            </div>
          </div>
          {[
            { label: "Your Name", key: "customerName", placeholder: "e.g. Rahul" },
            { label: "Phone Number", key: "customerPhone", placeholder: "e.g. 9876543210" },
            { label: "Delivery Address", key: "deliveryAddress", placeholder: "e.g. 12, Anna Nagar, Chennai" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: "bold", color: "#7A4A30", marginBottom: 5 }}>{f.label}</label>
              <input value={orderData[f.key]} onChange={e => setOrderData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #FFD0B0", fontFamily: "Georgia,serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <button onClick={handleOrder} style={{ width: "100%", background: "#FF6B35", color: "#fff", border: "none", borderRadius: 12, padding: 15, fontSize: 17, fontFamily: "Georgia,serif", fontWeight: "bold", cursor: "pointer", marginTop: 8 }}>Place Order 🚀</button>
        </Modal>
      )}

      {/* REGISTER COOK MODAL */}
      {showPostForm && (
        <Modal onClose={() => setShowPostForm(false)}>
          {formSubmitted ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
              <h3 style={{ color: "#2D9B5A", margin: "0 0 10px", fontSize: 22 }}>You're registered!</h3>
              <p style={{ color: "#555", fontSize: 15 }}>We'll contact you on WhatsApp soon.</p>
            </div>
          ) : (
            <>
              <h3 style={{ margin: "0 0 18px", fontSize: 22 }}>🍳 Post Your Menu</h3>
              {[
                { label: "Your Name *", key: "name", placeholder: "e.g. Meenakshi Amma" },
                { label: "Location *", key: "location", placeholder: "e.g. Chennai, T Nagar" },
                { label: "Today's Dish *", key: "dish", placeholder: "e.g. Sambar Sadam" },
                { label: "How many packets?", key: "qty", placeholder: "e.g. 10" },
                { label: "Price per packet (₹)", key: "price", placeholder: "e.g. 120" },
                { label: "WhatsApp Number *", key: "phone", placeholder: "e.g. 9876543210" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: "bold", color: "#7A4A30", marginBottom: 5 }}>{f.label}</label>
                  <input value={formData[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #FFD0B0", fontFamily: "Georgia,serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <button onClick={handleRegister} style={{ width: "100%", background: "#FF6B35", color: "#fff", border: "none", borderRadius: 12, padding: 15, fontSize: 17, fontFamily: "Georgia,serif", fontWeight: "bold", cursor: "pointer", marginTop: 8 }}>Submit & Start Selling 🚀</button>
            </>
          )}
        </Modal>
      )}

      <style>{`
        button:hover { filter: brightness(0.92); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 100vw; overflow-x: hidden; }
      `}</style>
    </div>
  );
}

function CookCard({ cook, cart, foodFilter, addToCart, removeFromCart }) {
  const vegItems = cook.menu.filter(m => m.type === "veg");
  const nonVegItems = cook.menu.filter(m => m.type === "non-veg");
  const communityColors = { Muslim: "#1a6b3a", Tamil: "#8B0000", Hindu: "#2c5f8a" };

  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(212,69,12,0.1)", border: "1px solid #FFE8D6" }}>
      <div style={{ background: "linear-gradient(135deg, #FFF3E8, #FFE8D6)", padding: "22px 26px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0, boxShadow: "0 4px 12px rgba(255,107,53,0.3)" }}>{cook.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 20, fontWeight: "bold" }}>{cook.name}</span>
            <span style={{ background: "#FF6B35", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: "bold" }}>{cook.badge}</span>
            <span style={{ background: communityColors[cook.community] || "#555", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: "bold" }}>{cook.community}</span>
          </div>
          <div style={{ color: "#7A4A30", fontSize: 14, marginTop: 4 }}>📍 {cook.location} &nbsp;•&nbsp; ⭐ {cook.rating} ({cook.reviews} reviews)</div>
          <div style={{ color: "#666", fontSize: 13, marginTop: 4, fontStyle: "italic" }}>{cook.bio}</div>
        </div>
      </div>
      <div style={{ padding: "18px 26px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        {(foodFilter === "All" || foodFilter === "veg") && vegItems.length > 0 && (
          <>
            {foodFilter === "All" && <SectionDivider label="🟢 Veg" color="#27AE60" bg="#E8F5E9" />}
            {vegItems.map(item => <MenuItem key={item.id} item={item} cart={cart} onAdd={() => addToCart(item, cook.name)} onRemove={() => removeFromCart(item.id)} />)}
          </>
        )}
        {(foodFilter === "All" || foodFilter === "non-veg") && nonVegItems.length > 0 && (
          <>
            {foodFilter === "All" && <SectionDivider label="🔴 Non-Veg" color="#E74C3C" bg="#FDECEA" />}
            {nonVegItems.map(item => <MenuItem key={item.id} item={item} cart={cart} onAdd={() => addToCart(item, cook.name)} onRemove={() => removeFromCart(item.id)} />)}
          </>
        )}
      </div>
    </div>
  );
}

function SectionDivider({ label, color, bg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
      <span style={{ background: color, color: "#fff", fontSize: 12, padding: "3px 14px", borderRadius: 20, fontWeight: "bold" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: bg }} />
    </div>
  );
}

function MenuItem({ item, cart, onAdd, onRemove }) {
  const inCart = cart[item.id]?.count || 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 14, background: inCart > 0 ? "#FFF3E8" : "#FAFAFA", border: `1.5px solid ${inCart > 0 ? "#FFD0B0" : "#F0F0F0"}`, transition: "all 0.2s" }}>
      <div style={{ fontSize: 32 }}>{item.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontWeight: "bold", fontSize: 15 }}>{item.name}</span>
          <span style={{ background: tagColors[item.tag] || "#999", color: "#fff", fontSize: 10, padding: "1px 8px", borderRadius: 20, fontWeight: "bold" }}>{item.tag}</span>
        </div>
        <div style={{ color: "#888", fontSize: 12, marginTop: 3 }}>{item.desc}</div>
        <div style={{ fontSize: 12, color: item.qty <= 3 ? "#E74C3C" : "#2D9B5A", marginTop: 3, fontWeight: "bold" }}>
          {item.qty <= 3 ? `🔥 Only ${item.qty} left!` : `✓ ${item.qty} available`}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <span style={{ fontWeight: "bold", fontSize: 17, color: "#D4450C" }}>₹{item.price}</span>
        {inCart === 0 ? (
          <button onClick={onAdd} style={{ background: "#FF6B35", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontFamily: "Georgia,serif", fontWeight: "bold", fontSize: 13 }}>Add</button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={onRemove} style={{ width: 28, height: 28, background: "#FFE8D6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16, fontWeight: "bold", color: "#D4450C" }}>−</button>
            <span style={{ fontWeight: "bold", color: "#D4450C", minWidth: 16, textAlign: "center" }}>{inCart}</span>
            <button onClick={onAdd} style={{ width: 28, height: 28, background: "#FF6B35", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16, fontWeight: "bold", color: "#fff" }}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 36, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}