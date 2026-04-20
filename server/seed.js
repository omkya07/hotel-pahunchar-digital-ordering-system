require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin, Table } = require('./models');
const QRCode = require('qrcode');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Force Reset Admin
    const ADMIN_USERNAME = "Admin";
    const ADMIN_PASSWORD = "Pahunchar2k26";

    await Admin.deleteMany({});

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await Admin.create({
      username: ADMIN_USERNAME,
      password: hashedPassword,
      name: "Hotel Pahunchar Admin"
    });

    console.log("✅ ADMIN FORCE RESET COMPLETE");
    console.log(`   Username : ${ADMIN_USERNAME}`);
    console.log(`   Password : ${ADMIN_PASSWORD}`);

    // Tables & QR Codes
    const clientUrl = process.env.CLIENT_URL || 'https://hotel-pahunchar-digital-ordering-sy.vercel.app';

    console.log(`\nUsing CLIENT_URL: ${clientUrl}\n`);

    for (let i = 1; i <= 15; i++) {
      const url = `${clientUrl}/table/${i}`;
      const qrCode = await QRCode.toDataURL(url, { 
        width: 320, 
        margin: 2, 
        color: { dark: '#7b1111', light: '#fff9f0' } 
      });

      await Table.findOneAndUpdate(
        { number: i },
        { number: i, qrCode, isOccupied: false },
        { upsert: true, new: true }
      );

      console.log(`✅ Table ${i} QR updated`);
    }

    console.log('\n🎉 Seed Completed Successfully!');

  } catch (err) {
    console.error('❌ Seed Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();