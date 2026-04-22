require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET','POST','PUT','DELETE'] } });

app.use(cors());
app.use(express.json());
app.set('io', io);

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/tables',   require('./routes/tables'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/menu',     require('./routes/menu'));
app.use('/api/qr',       require('./routes/qr'));

io.on('connection', (socket) => {

  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin connected:', socket.id);
  });

  socket.on('join-table', ({ tableNumber, sessionId }) => {
    socket.join(`table-${tableNumber}`);
    socket.tableNumber = tableNumber;
    socket.sessionId = sessionId;
    console.log(`Table ${tableNumber} joined`);
  });

  // Admin → Customer (wait message / text message)
  socket.on('send-message-to-table', ({ tableNumber, message, type, waitTime }) => {
    io.to(`table-${tableNumber}`).emit('message-from-admin', { message, type, waitTime, timestamp: new Date() });
  });

  // Customer → Admin message
  socket.on('send-message-to-admin', ({ tableNumber, message, sessionId }) => {
    io.to('admin-room').emit('message-from-customer', { tableNumber, message, sessionId, timestamp: new Date() });
    // Voice + flash notify admin
    io.to('admin-room').emit('voice-notify-admin', {
      text: `टेबल ${tableNumber} वरून संदेश आला आहे: ${message}`,
      type: 'remind'
    });
  });

  // Customer clicked "Not Received" — notify admin with voice + flash
  socket.on('item-not-received', ({ tableNumber, itemName, sessionId, isBasic }) => {
    io.to('admin-room').emit('item-not-received', { tableNumber, itemName, sessionId, isBasic });
    // Voice alert to admin
    io.to('admin-room').emit('voice-notify-admin', {
      text: `तातडी! टेबल ${tableNumber} वरून "${itemName}" मिळाली नाही. लगेच पाठवा.`,
      type: 'notreceived'
    });
  });

  // New order notify admin
  socket.on('notify-admin-order', ({ tableNumber, orderType, count }) => {
    const text = orderType === 'basic'
      ? `टेबल ${tableNumber} वरून ${count} वस्तूंची मागणी आली आहे`
      : `टेबल ${tableNumber} वरून ऑर्डर आली आहे`;
    io.to('admin-room').emit('voice-notify-admin', { text, type: 'info', tableNumber });
  });

  // New seating request notify admin
  socket.on('notify-admin-request', ({ tableNumber, customerName }) => {
    io.to('admin-room').emit('voice-notify-admin', {
      text: `टेबल ${tableNumber} वरून ${customerName} यांची बसण्याची विनंती आली आहे`,
      type: 'info', tableNumber, customerName
    });
  });

  // Item received
  socket.on("item-status-update", ({ tableNumber, orderId, itemIndex, status, isBasic, itemName }) => {
    io.to(`table-${tableNumber}`).emit("item-status-update", { orderId, itemIndex, status, isBasic, itemName });
  });

  socket.on("item-received", ({ orderId, itemIndex, isBasic, tableNumber, itemName }) => {
    io.to('admin-room').emit('item-received', { orderId, itemIndex, isBasic, tableNumber, itemName });
  });

  socket.on('order-update', (data) => { io.to('admin-room').emit('order-update', data); });

  socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-pahunchar';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
