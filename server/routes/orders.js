const express = require('express');
const router = express.Router();
const { Order, BasicOrder, Session } = require('../models');

// Place main menu order
router.post('/', async (req, res) => {
  try {
    const { sessionId, tableNumber, customerName, items } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Add not-received timeout (5 min) for each item
    const itemsWithTimeout = items.map(item => ({
      ...item,
      orderedAt: new Date(),
      notReceivedTimeout: new Date(Date.now() + 5 * 60 * 1000)
    }));

    const order = await Order.create({
      session: sessionId, tableNumber, customerName,
      items: itemsWithTimeout, totalAmount, status: 'pending'
    });

    await Session.findByIdAndUpdate(sessionId, { $push: { orders: order._id } });

    const io = req.app.get('io');
    io.to('admin-room').emit('new-order', { order, tableNumber, customerName });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place basic items order
router.post('/basic', async (req, res) => {
  try {
    const { sessionId, mainOrderId, tableNumber, customerName, items } = req.body;
    
    const itemsWithTimeout = items.map(item => ({
      ...item,
      orderedAt: new Date(),
      notReceivedTimeout: new Date(Date.now() + 1 * 60 * 1000) // 1 min
    }));

    const order = await BasicOrder.create({
      session: sessionId, mainOrder: mainOrderId,
      tableNumber, customerName, items: itemsWithTimeout, status: 'pending'
    });

    await Session.findByIdAndUpdate(sessionId, { $push: { basicOrders: order._id } });

    const io = req.app.get('io');
    io.to('admin-room').emit('new-basic-order', { order, tableNumber, customerName });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order item status (sent/received/not-received)
router.put('/:id/item/:itemIndex/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const idx = parseInt(req.params.itemIndex);
    order.items[idx].status = status;
    if (status === 'sent') order.items[idx].sentAt = new Date();
    if (status === 'received') order.items[idx].receivedAt = new Date();
    await order.save();

    const io = req.app.get('io');
    io.to(`table-${order.tableNumber}`).emit('order-item-update', { orderId: order._id, itemIndex: idx, status });
    io.to('admin-room').emit('order-updated', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update basic order item status
router.put('/basic/:id/item/:itemIndex/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await BasicOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const idx = parseInt(req.params.itemIndex);
    order.items[idx].status = status;
    if (status === 'sent') order.items[idx].sentAt = new Date();
    if (status === 'received') order.items[idx].receivedAt = new Date();
    await order.save();

    const io = req.app.get('io');
    io.to(`table-${order.tableNumber}`).emit('basic-order-item-update', { orderId: order._id, itemIndex: idx, status });
    io.to('admin-room').emit('basic-order-updated', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update main order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, adminNote, waitTime } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status, adminNote }, { new: true }
    );
    const io = req.app.get('io');
    io.to(`table-${order.tableNumber}`).emit('order-status-update', { orderId: order._id, status, adminNote, waitTime });
    io.to('admin-room').emit('order-updated', order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders by session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const orders = await Order.find({ session: req.params.sessionId }).sort({ createdAt: -1 });
    const basicOrders = await BasicOrder.find({ session: req.params.sessionId }).sort({ createdAt: -1 });
    res.json({ orders, basicOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active orders
router.get('/active', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $nin: ['completed'] } }).sort({ createdAt: -1 });
    const basicOrders = await BasicOrder.find({ status: { $ne: 'served' } }).sort({ createdAt: -1 });
    res.json({ orders, basicOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
