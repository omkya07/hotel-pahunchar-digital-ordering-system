// src/context/LanguageContext.js
import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  mr: {
    welcome: 'हॉटेल पाहुणचार मध्ये स्वागत आहे!',
    enterName: 'आपले नाव लिहा',
    enterPhone: 'मोबाईल नंबर (ऐच्छिक)',
    joinRequest: 'बसण्याची विनंती पाठवा',
    waitingApproval: 'प्रतीक्षा करा... व्यवस्थापक तुमची विनंती तपासत आहेत',
    menu: 'मेनू',
    nonVeg: 'नॉनव्हेज थाळी',
    veg: 'व्हेज थाळी',
    basicItems: 'इतर मागणी',
    addToCart: 'कार्टमध्ये टाका',
    cart: 'कार्ट',
    placeOrder: 'ऑर्डर द्या',
    orderPlaced: 'ऑर्डर दिली!',
    gotIt: 'मिळाले ✓',
    notReceived: 'मिळाले नाही',
    totalAmount: 'एकूण रक्कम',
    table: 'टेबल',
    myOrders: 'माझ्या ऑर्डर',
    chat: 'संदेश',
    sendMessage: 'संदेश पाठवा',
    quantity: 'संख्या',
    preparing: 'तयार होत आहे...',
    sent: 'पाठवले',
    received: 'मिळाले',
    pending: 'प्रतीक्षा',
    leaveTable: 'टेबल सोडा',
    includes: 'यात समाविष्ट',
    askMore: 'अजून मागवा',
    sessionEnded: 'धन्यवाद! पुन्हा या.',
    noOrders: 'अजून कोणतीही ऑर्डर नाही',
    typeMessage: 'संदेश लिहा...',
  },
  en: {
    welcome: 'Welcome to Hotel Pahunchar!',
    enterName: 'Enter your name',
    enterPhone: 'Mobile number (optional)',
    joinRequest: 'Send Seating Request',
    waitingApproval: 'Waiting... Admin is reviewing your request',
    menu: 'Menu',
    nonVeg: 'Non-Veg Thali',
    veg: 'Veg Thali',
    basicItems: 'Additional Items',
    addToCart: 'Add to Cart',
    cart: 'Cart',
    placeOrder: 'Place Order',
    orderPlaced: 'Order Placed!',
    gotIt: 'Got it ✓',
    notReceived: 'Not Received',
    totalAmount: 'Total Amount',
    table: 'Table',
    myOrders: 'My Orders',
    chat: 'Messages',
    sendMessage: 'Send Message',
    quantity: 'Quantity',
    preparing: 'Preparing...',
    sent: 'Sent',
    received: 'Received',
    pending: 'Pending',
    leaveTable: 'Leave Table',
    includes: 'Includes',
    askMore: 'Order More',
    sessionEnded: 'Thank you! Visit again.',
    noOrders: 'No orders yet',
    typeMessage: 'Type a message...',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('mr');
  const t = (key) => translations[lang][key] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
