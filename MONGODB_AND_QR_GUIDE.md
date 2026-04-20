# MongoDB Atlas Setup Guide
# ══════════════════════════════════════════════════════

## Option A: MongoDB Atlas (Cloud — Free Tier)

### Step 1: Create Account
1. Go to https://cloud.mongodb.com
2. Sign up with Google or Email
3. Choose "Free" (M0 Sandbox — FREE forever)

### Step 2: Create Cluster
1. Click "Create" → Choose "M0 Free"
2. Select region: "AWS Mumbai (ap-south-1)" for India
3. Cluster name: "hotel-pahunchar"
4. Click "Create Deployment"

### Step 3: Create Database User
1. In "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: pahunchar_admin
4. Password: (auto-generate, SAVE IT!)
5. Role: "Atlas Admin"
6. Click "Add User"

### Step 4: Allow Your IP
1. In "Security" → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Click "Confirm"

### Step 5: Get Connection String
1. In "Deployment" → "Clusters"
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string:
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

### Step 6: Update server/.env
Replace MONGO_URI with your Atlas string:

MONGO_URI=mongodb+srv://pahunchar_admin:YOUR_PASSWORD@hotel-pahunchar.xxxxx.mongodb.net/hotel-pahunchar?retryWrites=true&w=majority

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Option B: Local MongoDB (Already Working)

If mongod is running locally, keep this in server/.env:
MONGO_URI=mongodb://localhost:27017/hotel-pahunchar

Your data is stored at:
Windows: C:\Users\YourName\AppData\Local\Programs\MongoDB\data\db
Or wherever you configured MongoDB data path.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Where is my data in MongoDB?

### Using MongoDB Compass (GUI — Recommended)
1. Download: https://www.mongodb.com/try/download/compass
2. Connect:
   - Local: mongodb://localhost:27017
   - Atlas: paste your connection string
3. Open database: "hotel-pahunchar"
4. Collections you'll see:
   - admins      ← admin accounts
   - sessions    ← customer sessions (orders, chat history)
   - orders      ← main menu orders
   - basicorders ← roti/kanda/etc orders
   - tables      ← 15 tables with QR codes

### Using MongoDB Atlas Web UI
1. Go to cloud.mongodb.com
2. Click your cluster → "Browse Collections"
3. Select database "hotel-pahunchar"
4. View all collections and documents

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## View QR Codes for Tables

### Method 1: Admin Panel (Easiest)
1. Go to http://localhost:3000/admin
2. Login with admin credentials
3. Click "📱 QR Codes" tab
4. Click "Load QR Codes"
5. Each table shows its QR code image
6. Click "⬇ Download" to save as PNG
7. Print and laminate for each table

### Method 2: Direct API
Open browser and go to:
http://localhost:5000/api/qr/1   ← Table 1 QR
http://localhost:5000/api/qr/5   ← Table 5 QR
http://localhost:5000/api/qr/15  ← Table 15 QR

### Method 3: Download All at Once
http://localhost:5000/api/qr/all/print
(Returns JSON with all 15 QR codes as base64 images)

### What URL does the QR code point to?
http://YOUR_SERVER_IP:3000/table/1  (for Table 1)
http://YOUR_SERVER_IP:3000/table/5  (for Table 5)

For phones on your WiFi to scan:
Update server/.env → CLIENT_URL=http://192.168.x.x:3000
Then re-run: node seed.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
