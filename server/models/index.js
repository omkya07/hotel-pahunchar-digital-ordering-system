// models/index.js - All models in one file
const mongoose = require('mongoose');

// ── TABLE MODEL ──────────────────────────────────────────
const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  qrCode: String,
  isOccupied: { type: Boolean, default: false },
  currentSession: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' }
}, { timestamps: true });

// ── SESSION MODEL ─────────────────────────────────────────
const sessionSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerPhone: String,
  status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
  language: { type: String, enum: ['mr', 'en'], default: 'mr' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  basicOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BasicOrder' }],
  messages: [{
    sender: { type: String, enum: ['customer', 'admin'] },
    text: String,
    type: { type: String, default: 'text' }, // text | voice | system
    waitTime: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

// ── ORDER MODEL (Main Menu) ───────────────────────────────
const orderSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  tableNumber: Number,
  customerName: String,
  items: [{
    name: String,
    nameMarathi: String,
    category: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'preparing', 'sent', 'received', 'not-received'], default: 'pending' },
    orderedAt: { type: Date, default: Date.now },
    sentAt: Date,
    receivedAt: Date,
    notReceivedReportedAt: Date,
    notReceivedTimeout: Date // 5 min after ordered
  }],
  totalAmount: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'served', 'completed'], default: 'pending' },
  adminNote: String,
  orderedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ── BASIC ORDER MODEL ─────────────────────────────────────
const basicOrderSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  mainOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // linked to main order
  tableNumber: Number,
  customerName: String,
  items: [{
    name: String,
    nameMarathi: String,
    quantity: { type: Number, default: 1 },
    unit: String, // plate, vati, piece
    status: { type: String, enum: ['pending', 'sent', 'received', 'not-received'], default: 'pending' },
    orderedAt: { type: Date, default: Date.now },
    sentAt: Date,
    receivedAt: Date,
    notReceivedTimeout: Date // 1 min after ordered
  }],
  status: { type: String, enum: ['pending', 'sent', 'served'], default: 'pending' },
  orderedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ── ADMIN MODEL ───────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String
}, { timestamps: true });

module.exports = {
  Table: mongoose.model('Table', tableSchema),
  Session: mongoose.model('Session', sessionSchema),
  Order: mongoose.model('Order', orderSchema),
  BasicOrder: mongoose.model('BasicOrder', basicOrderSchema),
  Admin: mongoose.model('Admin', adminSchema)
};
