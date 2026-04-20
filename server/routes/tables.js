const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { Table } = require('../models');

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Initialize 15 tables
router.post('/init', async (req, res) => {
  try {
    const tables = [];
    for (let i = 1; i <= 15; i++) {
      const url = `${BASE_URL}/table/${i}`;
      const qrCode = await QRCode.toDataURL(url, { width: 300, margin: 2 });
      const t = await Table.findOneAndUpdate(
        { number: i },
        { number: i, qrCode },
        { upsert: true, new: true }
      );
      tables.push(t);
    }
    res.json({ message: '15 tables initialized', tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 }).populate('currentSession');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single table with QR
router.get('/:number', async (req, res) => {
  try {
    let table = await Table.findOne({ number: req.params.number }).populate('currentSession');
    if (!table) {
      const url = `${BASE_URL}/table/${req.params.number}`;
      const qrCode = await QRCode.toDataURL(url, { width: 300, margin: 2 });
      table = await Table.create({ number: req.params.number, qrCode });
    }
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
