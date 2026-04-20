require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'https://hotel-pahunchar-digital-ordering-sy.vercel.app';

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  CLIENT_URL,
  "https://hotel-pahunchar-digital-ordering-sy.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// ====================== BASIC TEST ROUTES ======================
app.get('/', (req, res) => {
  res.json({ 
    message: "Hotel Pahunchar Backend is Running!",
    status: "ok",
    version: "1.0"
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: "Hotel Pahunchar API is Running!",
    status: "ok"
  });
});

// ====================== MAIN ROUTES ======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/qr', require('./routes/qr'));

// Socket.IO Setup
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins, 
    credentials: true 
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('👨‍💼 Admin joined admin-room');
  });

  socket.on('join-table', ({ tableNumber, sessionId }) => {
    socket.join(`table-${tableNumber}`);
    console.log(`📱 Table ${tableNumber} joined`);
  });

  socket.on('send-message-to-table', ({ tableNumber, message, type, waitTime }) => {
    io.to(`table-${tableNumber}`).emit('message-from-admin', { 
      message, type, waitTime, timestamp: new Date() 
    });
  });

  socket.on('send-message-to-admin', ({ tableNumber, message, sessionId }) => {
    io.to('admin-room').emit('message-from-customer', { 
      tableNumber, message, sessionId, timestamp: new Date() 
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Frontend URL: ${CLIENT_URL}`);
});