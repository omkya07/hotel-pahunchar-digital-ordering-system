# 🍽️ Hotel Pahunchar Digital Ordering System

A modern **real-time digital ordering system** for Hotel Pahunchar featuring **Marathi voice support**, QR code table ordering, and a powerful admin panel.

Built with **React + Vite + Node.js + Express + Socket.IO + MongoDB**

---

## ✨ Key Features

### Customer Side
- Scan QR code on table to begin ordering
- Support for **मराठी** and **English** with voice instructions
- Beautiful menu with Non-Veg & Veg Thalis
- Detailed "What's Included" for each thali
- Real-time order tracking with "Got it ✓" and "Not Received ✗"
- Basic items ordering (Vada, Rassa, Solakadhi, Kanda, etc.)
- Live chat with restaurant staff
- Voice feedback using browser TTS (Hindi voice for Marathi text)

### Admin Side
- Live seating requests with Approve/Reject
- Real-time order management dashboard
- Voice wait time announcements (2 / 3 / 5 minutes)
- 15-table live status map
- Per-table chat with customers
- QR codes for all tables (ready to print)
- Session history and conversation replay
- Easy session ending

---

## 🚀 Quick Setup — Windows (PowerShell)

### Prerequisites
- **Node.js 18+** → [Download here](https://nodejs.org)
- **MongoDB Community** → [Download here](https://www.mongodb.com/try/download/community)

**Start MongoDB**:
- Run `mongod` in terminal, OR
- Open **MongoDB Compass**

### Step 1: Server Setup (Terminal 1)
```powershell
cd server
npm install
node seed.js
Expected Output:
textMongoDB connected
✅ Admin created: admin / pahunchar2024
✅ Table 1 to 15 created with QR
🎉 Setup complete!
Step 2: Start Server
PowerShellnpm run dev
Step 3: Client Setup (New Terminal)
PowerShellcd client
npm install
npm run dev

🌐 Local URLs

























URLPurposehttp://localhost:3000Home / Landing Pagehttp://localhost:3000/adminAdmin Panelhttp://localhost:3000/table/1Table 1 Customer Orderinghttp://localhost:3000/table/15Table 15 Customer Ordering

🔑 Default Admin Credentials

Username: admin
Password: pahunchar2024


📱 Mobile Testing (Same WiFi Network)

Find your PC’s IP address:PowerShellipconfig(Look for IPv4 Address — e.g., 192.168.x.x)
Update server/.env:envCLIENT_URL=http://192.168.x.x:3000
Update client/.env:envVITE_API_URL=http://192.168.x.x:5000/api
VITE_SOCKET_URL=http://192.168.x.x:5000
Restart both server and client.


⚠️ Common Issues & Fixes

























ProblemSolutionmongod: command not foundUse MongoDB Compass or add MongoDB to PATHCannot connect to MongoDBMake sure MongoDB is running before node seed.jsPort 3000 / 5000 already in useChange port in vite.config.js or server/.envBlank screen on customer pageCheck browser console (F12)

📁 Project Structure
Bashhotel-pahunchar-digital-ordering-system/
├── server/                 # Backend (Node.js + Express + Socket.IO)
│   ├── index.js
│   ├── seed.js
│   ├── .env
│   ├── routes/
│   ├── models/
│   └── middleware/
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx         # Main Customer + Admin UI
│   │   ├── main.jsx
│   │   └── utils/
│   ├── vite.config.js
│   └── .env
│
├── README.md
└── .gitignore

💡 Future Enhancements

Razorpay / UPI Payment Integration
Kitchen Display System (KDS)
Menu item photos
Daily sales reports & analytics
Customer feedback & rating system
WhatsApp order notifications


Made with ❤️ for Hotel Pahunchar
