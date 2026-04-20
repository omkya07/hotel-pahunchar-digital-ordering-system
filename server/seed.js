require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin, Table } = require('./models');
const QRCode = require('qrcode');

const CLIENT_URL = process.env.CLIENT_URL || 'http://172.20.10.2:3000';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Admin
    if (!(await Admin.findOne({ username: 'admin' }))) {
      const password = await bcrypt.hash('pahunchar2024', 10);
      await Admin.create({ username: 'admin', password, name: 'Hotel Pahunchar Admin' });
      console.log('✅ Admin created: admin / pahunchar2024');
    }

    // Tables + QR
    for (let i = 1; i <= 15; i++) {
      const url = `${CLIENT_URL}/table/${i}`;
      const qrCode = await QRCode.toDataURL(url, { width: 320, margin: 2, color: { dark: '#7b1111', light: '#fff9f0' } });
      await Table.findOneAndUpdate({ number: i }, { number: i, qrCode, isOccupied: false }, { upsert: true, new: true });
      console.log(`✅ Table ${i} QR updated`);
    }

    console.log('\n🎉 Setup Complete! Use CLIENT_URL:', CLIENT_URL);
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();