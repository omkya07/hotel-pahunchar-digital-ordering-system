// routes/menu.js
const express = require('express');
const router = express.Router();

const MENU = {
  nonVeg: [
    { id: 'mutton-thali', name: 'Mutton Thali', nameMarathi: 'मटण थाळी', price: 250, category: 'nonveg-main',
      includes: 'मटण प्लेट, मच्छी प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id: 'special-gavran', name: 'Special Gavran Thali', nameMarathi: 'स्पेशल गावरान थाळी', price: 200, category: 'nonveg-main',
      includes: 'गावरान प्लेट, मच्छी प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id: 'gavran-thali', name: 'Gavran Thali', nameMarathi: 'गावरान थाळी', price: 200, category: 'nonveg-main',
      includes: '२०० ग्राम गावरान मटण, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id: 'special-chicken', name: 'Special Chicken Thali', nameMarathi: 'स्पेशल चिकन थाळी', price: 170, category: 'nonveg-main',
      includes: 'चिकन प्लेट, मच्छी प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id: 'chicken-thali', name: 'Chicken Thali', nameMarathi: 'चिकन थाळी', price: 150, category: 'nonveg-main',
      includes: 'चिकन प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id: 'anda-thali', name: 'Andakari Thali', nameMarathi: 'अंडाकरी थाळी', price: 100, category: 'nonveg-main',
      includes: 'अंडाकरी प्लेट, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
  ],
  veg: [
    { id: 'special-shaka', name: 'Special Vegetarian Thali', nameMarathi: 'स्पेशल शाकाहारी थाळी', price: 180, category: 'veg-main',
      includes: 'काजू प्लेट, पनीर प्लेट, अक्खा मसूर वाटी, डाळ वाटी, शाकाहारी पांढरा रस्सा, सोलकढी, स्वीट/दही, पापड, लोणचे, जीरा राईस, कांदा-लिंबू' },
    { id: 'shaka-thali', name: 'Vegetarian Thali', nameMarathi: 'शाकाहारी थाळी', price: 150, category: 'veg-main',
      includes: 'काजू प्लेट/पनीर प्लेट, अक्खा मसूर प्लेट, डाळ वाटी, शाकाहारी पांढरा रस्सा, सोलकढी, दही, पापड, लोणचे, जीरा राईस, कांदा-लिंबू' },
    { id: 'masoor-thali', name: 'Akkha Masoor Thali', nameMarathi: 'अक्खा मसूर थाळी', price: 100, category: 'veg-main',
      includes: 'अक्खा मसूर प्लेट, डाळ वाटी, शाकाहारी पांढरा रस्सा, दही, लोणचे, जीरा राईस, कांदा-लिंबू' },
  ],
  basic: [
    { id: 'vada', name: 'Vada', nameMarathi: 'वडा', price: 0, category: 'basic', unit: 'piece', isBasic: true },
    { id: 'tambda-rassa', name: 'Tambda Rassa', nameMarathi: 'तांबडा रस्सा', price: 0, category: 'basic', unit: 'vati', isBasic: true },
    { id: 'pandhara-rassa', name: 'Pandhara Rassa', nameMarathi: 'पांढरा रस्सा', price: 0, category: 'basic', unit: 'vati', isBasic: true },
    { id: 'limbu', name: 'Limbu', nameMarathi: 'लिंबू', price: 0, category: 'basic', unit: 'piece', isBasic: true },
    { id: 'kanda', name: 'Kanda', nameMarathi: 'कांदा', price: 0, category: 'basic', unit: 'plate', isBasic: true },
    { id: 'solakadhi', name: 'Solakadhi', nameMarathi: 'सोलकढी', price: 0, category: 'basic', unit: 'glass', isBasic: true },
    { id: 'fish', name: 'Fish', nameMarathi: 'मच्छी', price: 0, category: 'basic', unit: 'plate', isBasic: true },
    { id: 'anda-vati', name: 'Anda Vati', nameMarathi: 'अंडा वाटी', price: 0, category: 'basic', unit: 'vati', isBasic: true },
    { id: 'dal', name: 'Dal', nameMarathi: 'डाळ', price: 0, category: 'basic', unit: 'vati', isBasic: true },
    { id: 'rice', name: 'Rice', nameMarathi: 'भात', price: 0, category: 'basic', unit: 'plate', isBasic: true },
    { id: 'papad', name: 'Papad', nameMarathi: 'पापड', price: 0, category: 'basic', unit: 'piece', isBasic: true },
    { id: 'lonche', name: 'Lonche', nameMarathi: 'लोणचे', price: 0, category: 'basic', unit: 'vati', isBasic: true },
    { id: 'dahi', name: 'Dahi', nameMarathi: 'दही', price: 0, category: 'basic', unit: 'vati', isBasic: true },
  ]
};

router.get('/', (req, res) => res.json(MENU));
module.exports = router;

// routes/qr.js - separate file
