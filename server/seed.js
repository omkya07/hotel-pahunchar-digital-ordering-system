require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin, Table } = require('./models');
const QRCode = require('qrcode');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Create Admin
    if (!(await Admin.findOne({ username: 'admin' }))) {
      const password = await bcrypt.hash('pahunchar2024', 10);
      await Admin.create({ 
        username: 'admin', 
        password, 
        name: 'Hotel Pahunchar Admin' 
      });
      console.log('✅ Admin created: admin / pahunchar2024');
    } else {
      console.log('✅ Admin already exists');
    }

    // Create/Update Tables with QR Codes
    const clientUrl = process.env.CLIENT_URL || 'https://hotel-pahunchar-digital-ordering-system.vercel.app';

    console.log(`\nUsing CLIENT_URL for QR codes: ${clientUrl}\n`);

    for (let i = 1; i <= 15; i++) {
      const url = `${clientUrl}/table/${i}`;
      const qrCode = await QRCode.toDataURL(url, { 
        width: 320, 
        margin: 2, 
        color: { dark: '#7b1111', light: '#fff9f0' } 
      });

      await Table.findOneAndUpdate(
        { number: i }, 
        { 
          number: i, 
          qrCode, 
          isOccupied: false 
        }, 
        { upsert: true, new: true }
      );

      console.log(`✅ Table ${i} QR code updated`);
    }

    console.log('\n🎉 Seed Completed Successfully!');
    console.log(`Frontend URL used: ${clientUrl}`);

  } catch (err) {
    console.error('❌ Seed Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();