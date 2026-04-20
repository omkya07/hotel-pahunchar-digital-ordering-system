const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'hotel-pahunchar-secret-2024';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin: { id: admin._id, username, name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Setup admin (first time)
router.post('/setup', async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) return res.status(400).json({ error: 'Admin already exists' });
    const { username, password, name } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, password: hashed, name });
    res.json({ message: 'Admin created', admin: { id: admin._id, username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
