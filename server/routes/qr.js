const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:3000';

router.get('/:tableNumber', async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const url = `${BASE_URL}/table/${tableNumber}`;
    const qr = await QRCode.toDataURL(url, {
      width: 400, margin: 3,
      color: { dark: '#7b1111', light: '#fff9f0' }
    });
    res.json({ tableNumber, url, qrCode: qr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all/print', async (req, res) => {
  try {
    const qrs = [];
    for (let i = 1; i <= 15; i++) {
      const url = `${BASE_URL}/table/${i}`;
      const qr = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#7b1111', light: '#fff9f0' } });
      qrs.push({ tableNumber: i, url, qrCode: qr });
    }
    res.json(qrs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
