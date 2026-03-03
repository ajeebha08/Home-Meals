const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let cooks = [
  {
    id: 1,
    name: "Ammi Fatima",
    avatar: "👩‍🦳",
    location: "Bandra West",
    rating: 4.9,
    reviews: 134,
    bio: "35 years of family recipes from Hyderabad",
    badge: "Top Cook",
    community: "Muslim",
    menu: [
      { id: 1, name: "Chicken Biryani", desc: "Slow-cooked dum biryani, saffron & whole spices", price: 220, qty: 8, emoji: "🍛", tag: "Bestseller", type: "non-veg" },
      { id: 2, name: "Mutton Keema", desc: "Spiced minced mutton with peas", price: 180, qty: 6, emoji: "🥘", tag: "Special", type: "non-veg" },
      { id: 3, name: "Sheer Khurma", desc: "Vermicelli pudding with dates & dry fruits", price: 80, qty: 12, emoji: "🍮", tag: "Sweet", type: "veg" },
    ],
  },
  {
    id: 2,
    name: "Paati Meenakshi",
    avatar: "👵",
    location: "Chennai",
    rating: 4.9,
    reviews: 112,
    bio: "Authentic Brahmin cooking, just like Paati made",
    badge: "Tamil Special",
    community: "Tamil",
    menu: [
      { id: 4, name: "Sambar Sadam", desc: "Rice with thick lentil sambar & ghee", price: 80, qty: 15, emoji: "🍲", tag: "Homestyle", type: "veg" },
      { id: 5, name: "Pongal", desc: "Creamy rice & lentil with cumin & ghee", price: 60, qty: 20, emoji: "🥗", tag: "Breakfast", type: "veg" },
      { id: 6, name: "Kozhukattai", desc: "Steamed rice dumplings with coconut filling", price: 50, qty: 18, emoji: "🫔", tag: "Snack", type: "veg" },
      { id: 7, name: "Rasam Rice", desc: "Peppery tomato rasam with hot rice", price: 70, qty: 15, emoji: "🥣", tag: "Comfort", type: "veg" },
    ],
  },
  {
    id: 3,
    name: "Amma Fathima Begum",
    avatar: "👩‍🦱",
    location: "Chennai",
    rating: 4.8,
    reviews: 87,
    bio: "Tamil Muslim kitchen — Chettinad flavours with love",
    badge: "Chettinad 🌶️",
    community: "Muslim",
    menu: [
      { id: 8, name: "Ambur Biryani", desc: "Famous Ambur-style chicken biryani, seeraga samba rice", price: 200, qty: 10, emoji: "🍛", tag: "Bestseller", type: "non-veg" },
      { id: 9, name: "Chicken Chettinad", desc: "Fiery Chettinad spices, slow cooked chicken", price: 180, qty: 8, emoji: "🍗", tag: "Spicy", type: "non-veg" },
      { id: 10, name: "Mutton Kola Urundai", desc: "Deep fried minced mutton balls, street style", price: 120, qty: 12, emoji: "🟤", tag: "Snack", type: "non-veg" },
      { id: 11, name: "Veg Kurma", desc: "Coconut-based mixed vegetable curry", price: 100, qty: 14, emoji: "🥥", tag: "Veg", type: "veg" },
      { id: 12, name: "Tirunelveli Halwa", desc: "Wheat halwa with ghee & nuts", price: 60, qty: 20, emoji: "🟠", tag: "Sweet", type: "veg" },
    ],
  },
  {
    id: 4,
    name: "Maa Annapurna",
    avatar: "👩‍🍳",
    location: "Dadar",
    rating: 4.8,
    reviews: 98,
    bio: "Pure Maharashtrian home food, no shortcuts",
    badge: "Community Fav",
    community: "Hindu",
    menu: [
      { id: 13, name: "Puran Poli + Dal", desc: "Jaggery-stuffed flatbread with coconut dal", price: 120, qty: 15, emoji: "🫓", tag: "Homestyle", type: "veg" },
      { id: 14, name: "Ukdiche Modak", desc: "Steamed modak with coconut-jaggery filling", price: 90, qty: 6, emoji: "🫔", tag: "Festive", type: "veg" },
    ],
  },
  {
    id: 5,
    name: "Nani Sarojini",
    avatar: "🧓",
    location: "Andheri East",
    rating: 5.0,
    reviews: 61,
    bio: "Bengali tiffin that feels like Sunday at home",
    badge: "New Star ⭐",
    community: "Hindu",
    menu: [
      { id: 15, name: "Luchi & Aloor Dom", desc: "Puffed bread with spiced baby potatoes", price: 100, qty: 10, emoji: "🫓", tag: "Breakfast", type: "veg" },
      { id: 16, name: "Shorshe Ilish", desc: "Hilsa fish in mustard-turmeric gravy", price: 280, qty: 4, emoji: "🐟", tag: "Special", type: "non-veg" },
    ],
  },
];

let orders = [];
let registrations = [];
let nextOrderId = 1;

app.get("/", (req, res) => res.json({ message: "✅ HomeMeals Backend Running!" }));

app.get("/api/cooks", (req, res) => {
  const { location, community } = req.query;
  let result = [...cooks];
  if (location && location !== "All") result = result.filter(c => c.location === location);
  if (community && community !== "All") result = result.filter(c => c.community === community);
  res.json(result);
});

app.get("/api/cooks/:id", (req, res) => {
  const cook = cooks.find(c => c.id === parseInt(req.params.id));
  if (!cook) return res.status(404).json({ error: "Cook not found" });
  res.json(cook);
});

app.post("/api/register-cook", (req, res) => {
  const { name, location, dish, qty, price, phone } = req.body;
  if (!name || !dish || !phone) return res.status(400).json({ error: "Name, dish and phone are required" });
  const newReg = { id: registrations.length + 1, name, location, dish, qty, price, phone, createdAt: new Date() };
  registrations.push(newReg);
  console.log("New cook registered:", newReg);
  res.status(201).json({ message: "Registration successful!", data: newReg });
});

app.post("/api/orders", (req, res) => {
  const { items, customerName, customerPhone, deliveryAddress } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: "No items in order" });
  items.forEach(orderItem => {
    cooks.forEach(cook => {
      const menuItem = cook.menu.find(m => m.id === orderItem.id);
      if (menuItem) menuItem.qty = Math.max(0, menuItem.qty - orderItem.count);
    });
  });
  const total = items.reduce((sum, i) => sum + i.price * i.count, 0);
  const order = { id: nextOrderId++, items, customerName: customerName || "Guest", customerPhone: customerPhone || "", deliveryAddress: deliveryAddress || "", total, status: "confirmed", createdAt: new Date() };
  orders.push(order);
  console.log("New order:", order);
  res.status(201).json({ message: "Order placed!", order });
});

app.get("/api/orders", (req, res) => res.json(orders));
app.get("/api/registrations", (req, res) => res.json(registrations));

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ HomeMeals backend running on http://localhost:${PORT}`));