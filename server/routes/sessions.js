const express = require('express');
const router = express.Router();
const { Session, Table, Order, BasicOrder } = require('../models');

// Customer requests session (sends join request)
router.post('/request', async (req, res) => {
  try {
    const { tableNumber, customerName, customerPhone, language } = req.body;
    const session = await Session.create({
      tableNumber, customerName, customerPhone,
      language: language || 'mr',
      status: 'pending'
    });
    // Notify admin via socket
    const io = req.app.get('io');
    io.to('admin-room').emit('new-session-request', {
      session,
      tableNumber,
      customerName,
      customerPhone,
      language
    });
    res.json({ session, message: 'Request sent to admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin confirms session
router.put('/:id/confirm', async (req, res) => {
  try {
    const { adminNote } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'active', startTime: new Date() },
      { new: true }
    );
    await Table.findOneAndUpdate(
      { number: session.tableNumber },
      { isOccupied: true, currentSession: session._id }
    );
    const io = req.app.get('io');
    io.to(`table-${session.tableNumber}`).emit('session-confirmed', {
      session,
      message: adminNote || (session.language === 'mr' 
        ? `टेबल ${session.tableNumber} साठी स्वागत आहे! आपण आता ऑर्डर करू शकता.`
        : `Welcome to Table ${session.tableNumber}! You can now place your order.`)
    });
    io.to('admin-room').emit('session-updated', session);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin rejects session
router.put('/:id/reject', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', endTime: new Date() },
      { new: true }
    );
    const io = req.app.get('io');
    io.to(`table-${session.tableNumber}`).emit('session-rejected', {
      message: session.language === 'mr' 
        ? 'क्षमा करा, आत्ता जागा उपलब्ध नाही.'
        : 'Sorry, no seats available right now.'
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// End session (customer leaves)
router.put('/:id/end', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('orders')
      .populate('basicOrders');
    
    const totalAmount = session.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', endTime: new Date(), totalAmount },
      { new: true }
    );
    await Table.findOneAndUpdate(
      { number: session.tableNumber },
      { isOccupied: false, currentSession: null }
    );
    const io = req.app.get('io');
    io.to('admin-room').emit('session-ended', { session: updated, tableNumber: session.tableNumber });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session by ID (with all orders and messages)
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('orders')
      .populate('basicOrders');
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active sessions
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const sessions = await Session.find(filter)
      .populate('orders')
      .populate('basicOrders')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add message to session
router.post('/:id/message', async (req, res) => {
  try {
    const { sender, text, type, waitTime } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { $push: { messages: { sender, text, type: type || 'text', waitTime, timestamp: new Date() } } },
      { new: true }
    );
    const io = req.app.get('io');
    if (sender === 'admin') {
      io.to(`table-${session.tableNumber}`).emit('message-from-admin', { text, type, waitTime, timestamp: new Date() });
    } else {
      io.to('admin-room').emit('message-from-customer', { tableNumber: session.tableNumber, text, sessionId: req.params.id, timestamp: new Date() });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
