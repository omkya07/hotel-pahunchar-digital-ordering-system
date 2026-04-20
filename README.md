# 🍽️ Hotel Pahunchar — Digital Ordering System

> Built with **Vite + React** (replaces Create React App to avoid Node.js 18+ compatibility issues)

---

## ✅ Quick Setup — Windows (PowerShell)

### Prerequisites
1. **Node.js 18+** → https://nodejs.org (LTS version)
2. **MongoDB Community** → https://www.mongodb.com/try/download/community
   - After installing, start MongoDB:
     - Option A: Run `mongod` in a terminal
     - Option B: Open **MongoDB Compass** (it starts mongod automatically)

---

### Step 1 — Server Setup (Terminal 1)
```powershell
cd hotel-pahunchar\server
npm install
node seed.js
```

Expected output:
```
MongoDB connected
✅ Admin created: admin / pahunchar2024
✅ Table 1 created with QR
...
✅ Table 15 created with QR
🎉 Setup complete!
```

### Step 2 — Start Server (keep Terminal 1 open)
```powershell
npm run dev
# ✅ Server running on port 5000
```

### Step 3 — Client Setup (Terminal 2 — NEW window)
```powershell
cd hotel-pahunchar\client
npm install
npm run dev
# ✅ Opens at http://localhost:3000
```

---

## 🌐 URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Home page |
| `http://localhost:3000/admin` | Admin Panel |
| `http://localhost:3000/table/1` | Table 1 customer page |
| `http://localhost:3000/table/2` | Table 2 customer page |
| ... | ... |
| `http://localhost:3000/table/15` | Table 15 customer page |

---

## 🔑 Admin Credentials
- **Username:** `admin`
- **Password:** `pahunchar2024`

---

## 📱 For Real Mobile Testing (Same WiFi)

1. Find your PC's WiFi IP:
   ```powershell
   ipconfig
   # Look for: IPv4 Address . . . . 192.168.x.x
   ```

2. Update `server/.env`:
   ```
   CLIENT_URL=http://192.168.x.x:3000
   ```

3. Update `client/.env`:
   ```
   VITE_API_URL=http://192.168.x.x:5000/api
   VITE_SOCKET_URL=http://192.168.x.x:5000
   ```

4. Restart both server and client. Now phones on the same WiFi can scan QR codes.

---

## ⚠️ Common Issues

| Problem | Fix |
|---------|-----|
| `mongod: command not found` | Start MongoDB Compass or add MongoDB to PATH |
| `Cannot connect to MongoDB` | Make sure mongod is running before `node seed.js` |
| Port 3000 already in use | Change `vite.config.js` → `server: { port: 3001 }` |
| Port 5000 already in use | Change `server/.env` → `PORT=5001` |
| Blank white screen | Open browser console (F12) and check for errors |

---

## 📁 Project Structure

```
hotel-pahunchar/
├── README.md
├── package.json
│
├── server/                    ← Node.js + Express + Socket.IO + MongoDB
│   ├── index.js               ← Main server file
│   ├── seed.js                ← Run once to create admin + 15 tables
│   ├── .env                   ← MongoDB URI, JWT secret, port
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js            ← JWT authentication
│   ├── models/
│   │   └── index.js           ← MongoDB schemas (Table, Session, Order, etc.)
│   └── routes/
│       ├── auth.js            ← Login/setup
│       ├── sessions.js        ← Seating requests, confirm/reject, messages
│       ├── orders.js          ← Main menu orders + basic item orders
│       ├── tables.js          ← 15 table management
│       ├── menu.js            ← Menu data API
│       └── qr.js              ← QR code generation
│
└── client/                    ← React + Vite frontend
    ├── index.html             ← Entry HTML (Vite style)
    ├── vite.config.js         ← Vite configuration
    ├── .env                   ← VITE_API_URL, VITE_SOCKET_URL
    ├── package.json
    └── src/
        ├── main.jsx           ← App entry point + router
        ├── App.jsx            ← Complete Customer + Admin UI
        ├── index.css          ← Global dark theme styles
        ├── context/
        │   └── LanguageContext.jsx
        ├── hooks/
        │   └── useSocket.js   ← Reusable socket hook
        └── utils/
            ├── api.js         ← Fetch wrapper
            ├── menuData.js    ← Complete menu + timer constants
            └── translations.js ← Marathi + English strings
```

---

## 🎯 Full Feature List

### Customer Side
- Scan table QR → Enter name + phone + language (मराठी/English)
- Send seating request to admin
- Admin approves → auto welcome message (voice TTS)
- Browse full menu: NonVeg Thalis + Veg Thalis
- Add to cart with quantity control
- View included items per thali
- Place main order → real-time tracking
- Order basic items: Roti, Vada, Rassa, Kanda, Solakadhi, etc.
- Per-item **"Got it ✓"** button when item is sent
- Per-item **"Not Received ✗"** button:
  - Main items: appears after **5 minutes**
  - Basic items: appears after **1 minute**
- Real-time chat with admin
- Admin voice messages play via browser TTS
- Leave table when done

### Admin Side
- Login with username/password
- 🔔 Live pending seating requests → Confirm / Reject
- 📋 Live order board with per-item status dropdowns
- Send order status: Preparing → Sent
- **🔊 Voice wait messages**: 2 min / 3 min / 5 min
  (auto speaks on customer's phone via Web Speech API)
- 🪑 15-table map with live occupied/empty status
- QR code display for each table (for printing)
- 💬 Per-table chat with customer
- 📚 Full session history: orders + conversation replay
- End session → table freed

---

## 💡 Suggestions for Enhancement
1. **Razorpay/UPI payment** at checkout
2. **Kitchen display screen** (separate view for kitchen staff)
3. **Push notifications** (browser push API)
4. **Menu photos** for each dish
5. **Daily sales reports** / analytics
6. **Advance table booking** system
7. **Customer feedback** / rating after session
8. **Inventory management** (mark items unavailable)
9. **Multiple admin roles** (manager / waiter / kitchen)
10. **WhatsApp notifications** via Twilio
