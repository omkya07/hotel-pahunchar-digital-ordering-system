import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Load voices immediately and when they become available
if ('speechSynthesis' in window) {
  let voicesLoaded = false;
  
  const loadVoices = () => {
    if (!voicesLoaded) {
      voicesLoaded = true;
      console.log("Voices loaded:", speechSynthesis.getVoices().length);
    }
  };

  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices(); // Initial load
}
// ── Constants ─────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
const SESSION_KEY = (table) => `pahunchar_session_table_${table}`

const MENU = {
  nonVeg: [
    { id:'mutton-thali',    nameMr:'मटण थाळी',           nameEn:'Mutton Thali',         price:250, emoji:'🍖', inc:'मटण प्लेट, मच्छी प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id:'special-gavran',  nameMr:'स्पेशल गावरान थाळी', nameEn:'Special Gavran Thali', price:200, emoji:'🐔', inc:'गावरान प्लेट, मच्छी प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id:'gavran-thali',    nameMr:'गावरान थाळी',         nameEn:'Gavran Thali',         price:200, emoji:'🍗', inc:'२०० ग्राम गावरान मटण, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id:'special-chicken', nameMr:'स्पेशल चिकन थाळी',   nameEn:'Special Chicken Thali',price:170, emoji:'🍗', inc:'चिकन प्लेट, मच्छी प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id:'chicken-thali',   nameMr:'चिकन थाळी',           nameEn:'Chicken Thali',        price:150, emoji:'🍗', inc:'चिकन प्लेट, अंडाकरी वाटी, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
    { id:'anda-thali',      nameMr:'अंडाकरी थाळी',        nameEn:'Andakari Thali',       price:100, emoji:'🥚', inc:'अंडाकरी प्लेट, तांबडा-पांढरा रस्सा, सोलकढी, भाकरी/वडा, जीरा राईस, कांदा-लिंबू' },
  ],
  veg: [
    { id:'special-shaka', nameMr:'स्पेशल शाकाहारी थाळी', nameEn:'Special Veg Thali',   price:180, emoji:'🌿', inc:'काजू प्लेट, पनीर प्लेट, अक्खा मसूर वाटी, डाळ वाटी, शाकाहारी पांढरा रस्सा, सोलकढी, स्वीट/दही, पापड, लोणचे, जीरा राईस, कांदा-लिंबू' },
    { id:'shaka-thali',   nameMr:'शाकाहारी थाळी',         nameEn:'Vegetarian Thali',    price:150, emoji:'🥗', inc:'काजू प्लेट/पनीर प्लेट, अक्खा मसूर प्लेट, डाळ वाटी, शाकाहारी पांढरा रस्सा, सोलकढी, दही, पापड, लोणचे, जीरा राईस, कांदा-लिंबू' },
    { id:'masoor-thali',  nameMr:'अक्खा मसूर थाळी',       nameEn:'Akkha Masoor Thali',  price:100, emoji:'🍲', inc:'अक्खा मसूर प्लेट, डाळ वाटी, शाकाहारी पांढरा रस्सा, दही, लोणचे, जीरा राईस, कांदा-लिंबू' },
  ],
  basic: [
    { id:'vada',          nameMr:'वडा',           nameEn:'Vada',          emoji:'🫓', unit:'नग' },
    { id:'tambda-rassa',  nameMr:'तांबडा रस्सा', nameEn:'Tambda Rassa',  emoji:'🍜', unit:'वाटी' },
    { id:'pandhara-rassa',nameMr:'पांढरा रस्सा', nameEn:'Pandhara Rassa',emoji:'🍶', unit:'वाटी' },
    { id:'limbu',         nameMr:'लिंबू',         nameEn:'Limbu',         emoji:'🍋', unit:'नग' },
    { id:'kanda',         nameMr:'कांदा',         nameEn:'Kanda',         emoji:'🧅', unit:'प्लेट' },
    { id:'solakadhi',     nameMr:'सोलकढी',       nameEn:'Solakadhi',     emoji:'🥛', unit:'ग्लास' },
    { id:'fish',          nameMr:'मच्छी',         nameEn:'Fish',          emoji:'🐟', unit:'प्लेट' },
    { id:'anda-vati',     nameMr:'अंडा वाटी',    nameEn:'Anda Vati',     emoji:'🥚', unit:'वाटी' },
    { id:'dal',           nameMr:'डाळ',           nameEn:'Dal',           emoji:'🍵', unit:'वाटी' },
    { id:'rice',          nameMr:'भात',           nameEn:'Rice',          emoji:'🍚', unit:'प्लेट' },
    { id:'papad',         nameMr:'पापड',          nameEn:'Papad',         emoji:'🫓', unit:'नग' }
  ]
}

// ── BEST HINDI VOICE SETUP FOR MARATHI TEXT ─────────────────────
let voices = [];

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  console.log(`🎤 Voices loaded: ${voices.length}`);
}

// Main speak function - Best possible Hindi voice (for both Customer & Admin)
function speak(text, preferredLang = 'mr') {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech Synthesis not supported in this browser");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Load voices if not already loaded
  if (voices.length === 0) {
    loadVoices();
    // Small delay for some browsers
    setTimeout(loadVoices, 300);
  }

  let selectedVoice = null;

  // Best Hindi voice selection (handles Marathi text very well)
  if (preferredLang === 'mr' || preferredLang === 'hi') {
    selectedVoice = 
      // 1. Best Microsoft Hindi Female (very natural)
      voices.find(v => v.name.includes('Kalpana')) ||
      // 2. Microsoft Hindi Male
      voices.find(v => v.name.includes('Hemant')) ||
      // 3. Any Microsoft Hindi voice
      voices.find(v => v.name.toLowerCase().includes('microsoft') && v.lang.includes('hi')) ||
      // 4. Google Hindi voice
      voices.find(v => v.name.includes('Google') && v.lang.includes('hi')) ||
      // 5. Any Hindi voice
      voices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi')) ||
      // 6. Fallback to Indian English
      voices.find(v => v.lang === 'en-IN');
  } else {
    // English mode
    selectedVoice = voices.find(v => v.lang === 'en-IN') || voices[0];
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log(`🎤 Using voice → ${selectedVoice.name} (${selectedVoice.lang})`);
  } else {
    console.log("⚠️ No preferred voice found, using default");
  }

  // Optimized settings for natural & clear Hindi/Marathi pronunciation
  utterance.rate = 0.92;      // Slower = better clarity
  utterance.pitch = 1.05;
  utterance.volume = 1.0;

  // Error & completion logging
  utterance.onerror = (e) => console.error("Speech Error:", e);
  utterance.onend = () => console.log("✅ Speech finished playing");

  window.speechSynthesis.speak(utterance);
}

// Auto-load voices properly (Only once)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  // Initial load with small delay (important for some browsers)
  setTimeout(loadVoices, 400);
}
// ── API Helper ────────────────────────────────────────────
async function apiCall(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ════════════════════════════════════════════════════════
// CUSTOMER APP
// ════════════════════════════════════════════════════════
export function CustomerApp({ tableNumber }) {
  const [lang, setLang] = useState('mr')
  const t = (mr, en) => lang === 'mr' ? mr : en

  // ── Restore session from localStorage ────────────────
  const savedRaw = localStorage.getItem(SESSION_KEY(tableNumber))
  const saved = savedRaw ? JSON.parse(savedRaw) : null

  const [phase, setPhase]         = useState(saved?.phase || 'join')
  const [customer, setCustomer]   = useState(saved?.customer || { name: '', phone: '' })
  const [session, setSession]     = useState(saved?.session || null)
  const [orders, setOrders]       = useState(saved?.orders || [])
  const [basicOrders, setBasicOrders] = useState(saved?.basicOrders || [])
  const [messages, setMessages]   = useState(saved?.messages || [])
  const [activeTab, setActiveTab] = useState('menu')
  const [menuCat, setMenuCat]     = useState('nonVeg')
  const [cart, setCart]           = useState([])
  const [basicCart, setBasicCart] = useState([])
  const [msgInput, setMsgInput]   = useState('')
  const [adminNotif, setAdminNotif] = useState(null)
  const [showLeave, setShowLeave] = useState(null)
  const [remindCooldown, setRemindCooldown] = useState({})
  const socketRef = useRef(null)
  const msgEndRef = useRef(null)
  const [historyDetail, setHistoryDetail] = useState(null);

  // ── Persist to localStorage ───────────────────────────
  useEffect(() => {
    if (phase === 'ended') { localStorage.removeItem(SESSION_KEY(tableNumber)); return }
    localStorage.setItem(SESSION_KEY(tableNumber), JSON.stringify({ phase, customer, session, orders, basicOrders, messages }))
  }, [phase, customer, session, orders, basicOrders, messages])

  // ── Socket setup (Updated for Mobile Chat) ──────────────────────────────────────
  useEffect(() => {
    const io = window.io
    if (!io) return console.error("Socket.IO not loaded")

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('✅ Socket Connected on Table', tableNumber)
      if (session?._id) {
        socket.emit('join-table', { tableNumber, sessionId: session._id })
      }
    })

    // Improved Admin Message Listener
    socket.on('message-from-admin', (data) => {
      console.log('📨 Message from Admin Received on Mobile:', data)
      const msg = {
        sender: 'admin',
        text: data.message || data.text,
        type: data.type,
        waitTime: data.waitTime,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, msg])
      showNotif(msg.text, data.type || 'info', data.waitTime)
      // Improved voice call
      speak(msg.text, lang)
    })

    socket.on('session-confirmed', ({ session: s, message }) => {
      setSession(s)
      setPhase('active')
      socket.emit('join-table', { tableNumber, sessionId: s._id })
      showNotif(message || t(`टेबल ${tableNumber} वर स्वागत आहे!`, `Welcome to Table ${tableNumber}!`), 'success')
      speak(message || `स्वागत आहे`, 'mr')
    })

    socket.on('session-rejected', ({ message }) => {
      showNotif(message || t('विनंती नाकारली', 'Request rejected'), 'error')
      setTimeout(() => { setPhase('join'); localStorage.removeItem(SESSION_KEY(tableNumber)) }, 3000)
    })

    socket.on('session-ended', () => {
      setPhase('ended')
      localStorage.removeItem(SESSION_KEY(tableNumber))
      speak('धन्यवाद! पुन्हा या.', 'mr')
    })

    socket.on('order-item-update', ({ orderId, itemIndex, status }) => {
      setOrders(prev => prev.map(o => {
        if (o._id !== orderId) return o
        const items = [...o.items]
        items[itemIndex] = { ...items[itemIndex], status }
        return { ...o, items }
      }))
    })

    socket.on('basic-order-item-update', ({ orderId, itemIndex, status }) => {
      setBasicOrders(prev => prev.map(o => {
        if (o._id !== orderId) return o
        const items = [...o.items]
        items[itemIndex] = { ...items[itemIndex], status }
        return { ...o, items }
      }))
    })

    return () => socket.disconnect()
  }, [tableNumber, session?._id, lang])
  useEffect(() => {
    if (phase === 'active' && session?._id) {
      apiCall(`/orders/session/${session._id}`)
        .then(data => { setOrders(data.orders || []); setBasicOrders(data.basicOrders || []) })
        .catch(() => {})
    }
  }, [session?._id])

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function showNotif(text, type = 'info', waitTime = null) {
    setAdminNotif({ text, type, waitTime })
    if (type !== 'wait') setTimeout(() => setAdminNotif(null), 6000)
  }

  // ── JOIN ──────────────────────────────────────────────
  async function sendJoinRequest() {
    if (!customer.name.trim()) { alert(t('कृपया नाव लिहा', 'Please enter name')); return }
    try {
      const data = await apiCall('/sessions/request', 'POST', {
        tableNumber, customerName: customer.name, customerPhone: customer.phone, language: lang
      })
      setSession(data.session)
      setPhase('waiting')
      socketRef.current?.emit('join-table', { tableNumber, sessionId: data.session._id })
      socketRef.current?.emit('notify-admin-request', { tableNumber, customerName: customer.name })
    } catch (e) { alert('Error: ' + e.message) }
  }

  // ── ORDER ─────────────────────────────────────────────
  function addToCart(item, qty) {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + qty } : c)
      return [...prev, { ...item, qty }]
    })
  }

  async function placeOrder() {
    if (!cart.length) return
    try {
      const items = cart.map(c => ({ name: c.nameEn, nameMarathi: c.nameMr, price: c.price, quantity: c.qty }))
      const order = await apiCall('/orders', 'POST', { sessionId: session._id, tableNumber, customerName: customer.name, items })
      setOrders(prev => [order, ...prev]); setCart([]); setActiveTab('orders')
      socketRef.current?.emit('notify-admin-order', { tableNumber, orderType: 'main', count: items.length })
      speak(t('ऑर्डर दिली! थोड्या वेळात येईल.', 'Order placed!'), lang)
    } catch (e) { alert('Error: ' + e.message) }
  }

  function addToBasicCart(item) {
    setBasicCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  async function placeBasicOrder() {
    if (!basicCart.length) return
    try {
      const items = basicCart.map(c => ({ name: c.nameEn, nameMarathi: c.nameMr, quantity: c.qty, unit: c.unit }))
      const order = await apiCall('/orders/basic', 'POST', {
        sessionId: session._id, mainOrderId: orders[0]?._id, tableNumber, customerName: customer.name, items
      })
      setBasicOrders(prev => [order, ...prev]); setBasicCart([])
      socketRef.current?.emit('notify-admin-order', { tableNumber, orderType: 'basic', count: items.length })
      speak(t(`${items.length} वस्तू मागवल्या`, `${items.length} items ordered`), lang)
    } catch (e) { alert('Error: ' + e.message) }
  }

  async function markItem(orderId, itemIndex, status, isBasic) {
    const url = isBasic ? `/orders/basic/${orderId}/item/${itemIndex}/status` : `/orders/${orderId}/item/${itemIndex}/status`
    await apiCall(url, 'PUT', { status })
    const updater = prev => prev.map(o => {
      if (o._id !== orderId) return o
      const items = [...o.items]; items[itemIndex] = { ...items[itemIndex], status }
      return { ...o, items }
    })
    isBasic ? setBasicOrders(updater) : setOrders(updater)
    socketRef.current?.emit('item-received', { orderId, itemIndex, isBasic })
  }
  // ── REMIND ADMIN ──────────────────────────────────────
  async function remindAdmin(orderId, itemName) {
    if (remindCooldown[orderId]) return

    const msg = t(
      `टेबल ${tableNumber}: ${itemName} अजून आली नाही`,
      `Table ${tableNumber}: ${itemName} not received yet`
    )

    try {
      // Send to admin via socket
      socketRef.current?.emit('send-message-to-admin', { 
        tableNumber, 
        message: msg, 
        sessionId: session._id 
      })

      // Save to database
      await apiCall(`/sessions/${session._id}/message`, 'POST', { 
        sender: 'customer', 
        text: msg 
      })

      // Update local messages
      setMessages(prev => [...prev, { 
        sender: 'customer', 
        text: msg, 
        timestamp: new Date() 
      }])

      // Cooldown
      setRemindCooldown(p => ({ ...p, [orderId]: true }))

      // Speak confirmation using BEST HINDI voice
      speak(
        t('व्यवस्थापकाला आठवण दिली', 'Reminder sent to admin'), 
        'mr'   // 'mr' will use best available Hindi voice
      )

      // Remove cooldown after 1 minute
      setTimeout(() => {
        setRemindCooldown(p => ({ ...p, [orderId]: false }))
      }, 60000)

    } catch (e) {
      console.error('Failed to send reminder:', e)
      alert(t('रिमाइंडर पाठवता आला नाही', 'Could not send reminder'))
      
      // Speak error message too
      speak(t('रिमाइंडर पाठवता आला नाही', 'Could not send reminder'), 'mr')
    }
  }
  async function sendMessage() {
    if (!msgInput.trim() || !session) return
    const msg = { sender: 'customer', text: msgInput, timestamp: new Date() }
    setMessages(prev => [...prev, msg])
    socketRef.current?.emit('send-message-to-admin', { tableNumber, message: msgInput, sessionId: session._id })
    await apiCall(`/sessions/${session._id}/message`, 'POST', { sender: 'customer', text: msgInput })
    setMsgInput('')
  }

async function leaveTable() {
    await apiCall(`/sessions/${session._id}/end`, 'PUT')
    setPhase('ended')
    localStorage.removeItem(SESSION_KEY(tableNumber))
    speak(t('धन्यवाद! पुन्हा या.', 'Thank you! Visit again.'), lang)
  }

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0)

  // ── JOIN SCREEN ───────────────────────────────────────
  if (phase === 'join') return (
    <div style={S.screen}>
      <button style={S.langBtn} onClick={() => setLang(l => l === 'mr' ? 'en' : 'mr')}>{lang === 'mr' ? 'English' : 'मराठी'}</button>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} style={S.joinCard}>
        <div style={{ fontSize:56, textAlign:'center' }}>🍽️</div>
        <h1 style={S.hotelName}>{t('हॉटेल पाहुणचार','Hotel Pahunchar')}</h1>
        <p style={S.tagline}>{t('जिथे चव आणि सेवा भेटतात','Where taste meets service')}</p>
        <div style={S.tableChip}>{t('टेबल','Table')} {tableNumber}</div>
        <div style={{ height:1, background:'rgba(255,255,255,.1)', margin:'16px 0' }}/>
        <input style={S.inp} placeholder={t('आपले नाव *','Your name *')} value={customer.name} onChange={e => setCustomer(p=>({...p,name:e.target.value}))} onKeyPress={e=>e.key==='Enter'&&sendJoinRequest()}/>
        <input style={S.inp} placeholder={t('मोबाईल (ऐच्छिक)','Mobile (optional)')} value={customer.phone} onChange={e => setCustomer(p=>({...p,phone:e.target.value}))}/>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {['mr','en'].map(l=>(
            <button key={l} style={{ ...S.ghostBtn, flex:1, borderColor: lang===l ? '#e8c030':'#444', color: lang===l ? '#e8c030':'#888' }} onClick={()=>setLang(l)}>{l==='mr'?'मराठी':'English'}</button>
          ))}
        </div>
        <motion.button whileTap={{ scale:0.97 }} style={S.primaryBtn} onClick={sendJoinRequest}>
          {t('बसण्याची विनंती पाठवा','Send Seating Request')}
        </motion.button>
      </motion.div>
    </div>
  )

  // ── WAITING ───────────────────────────────────────────
  if (phase === 'waiting') return (
    <div style={S.screen}>
      <motion.div style={S.waitCard} initial={{ scale:0.8 }} animate={{ scale:1 }}>
        <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:2, ease:'linear' }} style={{ fontSize:56 }}>⏳</motion.div>
        <h2 style={{ color:'#e8c030', marginTop:16, fontSize:20 }}>{t('प्रतीक्षा करा...','Please wait...')}</h2>
        <p style={{ color:'#888', textAlign:'center', marginTop:8, fontSize:14 }}>{t('व्यवस्थापक तुमची विनंती तपासत आहेत','Admin is reviewing your request')}</p>
        <div style={{ marginTop:20, background:'rgba(200,165,32,.1)', border:'1px solid rgba(200,165,32,.3)', borderRadius:12, padding:'12px 24px', color:'#e8c030', textAlign:'center' }}>
          <div>{t('टेबल','Table')} {tableNumber}</div>
          <div style={{ fontWeight:700 }}>{customer.name}</div>
        </div>
      </motion.div>
      <AnimatePresence>{adminNotif && <AdminNotif notif={adminNotif} onClose={()=>setAdminNotif(null)} t={t}/>}</AnimatePresence>
    </div>
  )

  // ── ENDED ─────────────────────────────────────────────
  if (phase === 'ended') return (
    <div style={S.screen}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} style={{ textAlign:'center' }}>
        <div style={{ fontSize:80 }}>🙏</div>
        <h2 style={{ color:'#e8c030', fontSize:28, marginTop:16 }}>{t('धन्यवाद! पुन्हा या.','Thank you! Visit again.')}</h2>
        <p style={{ color:'#888', marginTop:8 }}>हॉटेल पाहुणचार</p>
      </motion.div>
    </div>
  )

  // ── ACTIVE SESSION ────────────────────────────────────
  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>{t('हॉटेल पाहुणचार','Hotel Pahunchar')}</div>
          <div style={S.headerSub}>{t('टेबल','Table')} {tableNumber} • {customer.name}</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button style={S.langBtn} onClick={()=>setLang(l=>l==='mr'?'en':'mr')}>{lang==='mr'?'English':'मराठी'}</button>
          <button 
              style={S.leaveBtn} 
              onClick={()=>setShowLeave(true)}
            >
              🚪 {t('सोडा', 'Leave')}
            </button>
        </div>
      </div>

      <AnimatePresence>{adminNotif && <AdminNotif notif={adminNotif} onClose={()=>setAdminNotif(null)} t={t}/>}</AnimatePresence>

      {/* Tabs */}
      <div style={S.tabBar}>
        {[
          { id:'menu',   label:`🍽️ ${t('मेनू','Menu')}` },
          { id:'orders', label:`📋 ${t('ऑर्डर','Orders')}${orders.length?` (${orders.length})`:''}` },
          { id:'basic',  label:`🥣 ${t('इतर','Items')}` },
          { id:'chat',   label:`💬 ${t('संदेश','Chat')}${messages.filter(m=>m.sender==='admin').length?` •`:''}` },
        ].map(tab=>(
          <button key={tab.id} style={{ ...S.tab, ...(activeTab===tab.id?S.tabActive:{}) }} onClick={()=>setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      <div style={S.content}>
        <AnimatePresence mode="wait">

          {/* MENU */}
          {activeTab==='menu' && (
            <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}}>
              <div style={S.catBar}>
                <button style={{...S.catTab,...(menuCat==='nonVeg'?S.catActive:{})}} onClick={()=>setMenuCat('nonVeg')}>🍖 {t('नॉनव्हेज','Non-Veg')}</button>
                <button style={{...S.catTab,...(menuCat==='veg'?{...S.catActive,background:'rgba(22,100,22,.6)',color:'#4ade80'}:{})}} onClick={()=>setMenuCat('veg')}>🌿 {t('व्हेज','Veg')}</button>
              </div>
              <div style={{ paddingBottom:90 }}>
                {MENU[menuCat].map(item=><MenuCard key={item.id} item={item} lang={lang} onAdd={addToCart} t={t}/>)}
              </div>
              {cart.length>0 && (
                <motion.div initial={{y:80}} animate={{y:0}} style={S.cartBar}>
                  <div>
                    <span style={{ fontWeight:700 }}>{cart.reduce((s,c)=>s+c.qty,0)} {t('वस्तू','items')}</span>
                    <span style={{ color:'#e8c030', marginLeft:10 }}>₹{cartTotal}</span>
                  </div>
                  <motion.button whileTap={{scale:0.95}} style={S.orderBtn} onClick={placeOrder}>{t('ऑर्डर द्या','Place Order')} →</motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ORDERS */}
          {activeTab==='orders' && (
            <motion.div key="orders" initial={{opacity:0}} animate={{opacity:1}}>
              {orders.length===0
                ? <div style={S.empty}><div style={{fontSize:40}}>📋</div><p>{t('अजून ऑर्डर नाही','No orders yet')}</p></div>
                : orders.map(order=>(
                  <OrderCard key={order._id} order={order} lang={lang} t={t}
                    onGotIt={(idx)=>markItem(order._id,idx,'received',false)}
                    onNotReceived={(idx)=>markItem(order._id,idx,'not-received',false)}
                    onRemind={(idx)=>remindAdmin(order._id, order.items[idx]?.nameMarathi || order.items[idx]?.name)}
                    remindCooldown={remindCooldown[order._id]}/>
                ))
              }
            </motion.div>
          )}

          {/* BASIC ITEMS */}
          {activeTab==='basic' && (
            <motion.div key="basic" initial={{opacity:0}} animate={{opacity:1}}>
              <p style={{ color:'#888', textAlign:'center', padding:'10px 0 14px', fontSize:13 }}>
                {t('थाळीसोबत लागणाऱ्या वस्तू मागवा','Order items to go with your thali')}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:80 }}>
                {MENU.basic.map(item=>(
                  <BasicItemCard key={item.id} item={item} lang={lang}
                    qty={basicCart.find(c=>c.id===item.id)?.qty||0}
                    onAdd={()=>addToBasicCart(item)}
                    onRemove={()=>setBasicCart(prev=>prev.map(c=>c.id===item.id?{...c,qty:Math.max(0,c.qty-1)}:c).filter(c=>c.qty>0))}/>
                ))}
              </div>
              {basicCart.length>0 && (
                <motion.div initial={{y:80}} animate={{y:0}} style={S.cartBar}>
                  <div>{basicCart.reduce((s,c)=>s+c.qty,0)} {t('वस्तू','items')} • {t('मोफत','FREE')}</div>
                  <motion.button whileTap={{scale:0.95}} style={S.orderBtn} onClick={placeBasicOrder}>{t('मागवा','Order')} →</motion.button>
                </motion.div>
              )}
              {basicOrders.map(order=>(
                <BasicOrderCard key={order._id} order={order} lang={lang} t={t}
                  onGotIt={(idx)=>markItem(order._id,idx,'received',true)}
                  onNotReceived={(idx)=>markItem(order._id,idx,'not-received',true)}
                  onRemind={(idx)=>remindAdmin(order._id, order.items[idx]?.nameMarathi||order.items[idx]?.name)}
                  remindCooldown={remindCooldown[order._id]}/>
              ))}
            </motion.div>
          )}

          {/* CHAT */}
          {activeTab==='chat' && (
            <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} style={S.chatWrap}>
              <div style={S.chatMsgs}>
                {messages.length===0 && <div style={S.empty}><p>{t('कोणताही संदेश नाही','No messages yet')}</p></div>}
                {messages.map((msg,i)=>(
                  <div key={i} style={{...S.chatBubble,...(msg.sender==='customer'?S.bubbleCustomer:S.bubbleAdmin)}}>
                    <div style={S.chatSender}>{msg.sender==='admin'?'👨‍💼 '+t('व्यवस्थापक','Admin'):`🙋 ${customer.name}`}</div>
                    <div>{msg.text}</div>
                    {msg.waitTime&&<div style={{color:'#e8c030',fontSize:12,marginTop:4}}>⏱ {msg.waitTime} {t('मिनिटांत येईल','min wait')}</div>}
                    <div style={S.chatTime}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
                <div ref={msgEndRef}/>
              </div>
              <div style={S.chatInputRow}>
                <input style={S.chatInp} placeholder={t('संदेश लिहा...','Type a message...')} value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&sendMessage()}/>
                <motion.button whileTap={{scale:0.9}} style={S.sendBtn} onClick={sendMessage}>{t('पाठवा','Send')}</motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Leave Confirm */}
      <AnimatePresence>
        {showLeave && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={S.modal}>
            <motion.div initial={{scale:0.8}} animate={{scale:1}} style={S.modalCard}>
              <p style={{color:'#fff',fontSize:17,textAlign:'center',marginBottom:20}}>{t('टेबल सोडणार का?','Leave table?')}</p>
              <div style={{display:'flex',gap:12}}>
                <button style={S.yesBtn} onClick={leaveTable}>{t('होय','Yes')}</button>
                <button style={S.noBtn} onClick={()=>setShowLeave(false)}>{t('नाही','No')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
// ── MenuCard - Same behavior as BasicItemCard ─────────────────────────────
function MenuCard({ item, lang, onAdd, t }) {
  const [qty, setQty] = useState(0);   // Start with 0 (like basic items)
  const [exp, setExp] = useState(false);
  const isVeg = item.id.includes('shaka') || item.id.includes('masoor');

  const handleAdd = () => {
    if (qty === 0) {
      onAdd(item, 1);
      setQty(1);
    } else {
      onAdd(item, 1);
      setQty(q => q + 1);
    }
  };

  const handleRemove = () => {
    if (qty > 0) {
      // We don't have remove from cart here, so just reduce local qty
      setQty(q => Math.max(0, q - 1));
      // Note: Full remove from cart logic can be improved later if needed
    }
  };

  return (
    <motion.div whileHover={{scale:1.005}} style={S.menuCard}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:28}}>{item.emoji}</span>
          <div>
            <div style={{color:'#fff',fontWeight:700,fontSize:15}}>{lang==='mr'?item.nameMr:item.nameEn}</div>
            {lang==='en'&&<div style={{color:'#888',fontSize:11}}>{item.nameMr}</div>}
          </div>
        </div>
        <div style={{color:'#e8c030',fontWeight:800,fontSize:19,background:'rgba(200,165,32,.1)',padding:'4px 10px',borderRadius:8}}>₹{item.price}</div>
      </div>

      <span style={{display:'inline-block',fontSize:11,padding:'2px 8px',borderRadius:10,background:isVeg?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',color:isVeg?'#22c55e':'#ef4444',marginBottom:8}}>
        {isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
      </span>

      <button style={S.incBtn} onClick={()=>setExp(!exp)}>{t('यात आहे','Includes')} {exp?'▲':'▼'}</button>
      {exp && <div style={{color:'#888',fontSize:12,lineHeight:1.6,background:'rgba(255,255,255,.04)',borderRadius:8,padding:'8px 12px',marginBottom:8}}>{item.inc}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <div style={S.qtyCtrl}>
          {qty > 0 ? (
            <>
              <button style={S.qtyBtn} onClick={handleRemove}>−</button>
              <span style={S.qtyNum}>{qty}</span>
              <button style={S.qtyBtn} onClick={handleAdd}>+</button>
            </>
          ) : (
            <button style={{...S.addBtn, width: '100%', padding: '10px 0'}} onClick={handleAdd}>
              + {t('टाका','Add')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
// ── OrderCard ─────────────────────────────────────────────
function OrderCard({ order, lang, t, onGotIt, onNotReceived, onRemind, remindCooldown }) {
  const [timers, setTimers] = useState({})
  useEffect(()=>{
    const iv = setInterval(()=>{
      const now = Date.now()
      const t2 = {}
      order.items.forEach((item,idx)=>{ t2[idx]=(now-new Date(item.orderedAt||order.orderedAt).getTime())>5*60*1000 })
      setTimers(t2)
    },10000)
    return ()=>clearInterval(iv)
  },[order])
  const sc = {pending:'#f59e0b',preparing:'#3b82f6',sent:'#22c55e',received:'#6b7280','not-received':'#ef4444'}
  return (
    <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} style={S.orderCard}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <span style={{color:'#e8c030',fontWeight:700}}>{t('ऑर्डर','Order')} #{order._id?.slice(-4)}</span>
        <span style={{color:'#888',fontSize:11}}>{new Date(order.orderedAt||order.createdAt).toLocaleTimeString()}</span>
        <span style={{color:'#e8c030'}}>₹{order.totalAmount}</span>
      </div>
      {order.items.map((item,idx)=>(
        <div key={idx} style={{padding:'8px 0',borderBottom:'1px solid #2a2a2a'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:6}}>
            <span style={{fontWeight:600}}>{lang==='mr'?item.nameMarathi:item.name}</span>
            <span style={{color:'#888',marginLeft:8}}>x{item.quantity}</span>
            <span style={{color:'#e8c030',marginLeft:8}}>₹{item.price*item.quantity}</span>
            <span style={{marginLeft:'auto',padding:'2px 8px',borderRadius:10,fontSize:11,background:sc[item.status]||'#555',color:'#fff'}}>{item.status}</span>
          </div>
          {item.status==='sent' && (
            <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
              <motion.button whileTap={{scale:0.9}} style={S.gotBtn} onClick={()=>onGotIt(idx)}>✓ {t('मिळाले','Got it')}</motion.button>
              {timers[idx]
                ? <motion.button initial={{opacity:0}} animate={{opacity:1}} whileTap={{scale:0.9}} style={S.notGotBtn} onClick={()=>onNotReceived(idx)}>✗ {t('मिळाले नाही','Not Received')}</motion.button>
                : <span style={{color:'#666',fontSize:11,alignSelf:'center'}}>{t('5 मिनिटांनंतर...','After 5 min...')}</span>
              }
            </div>
          )}
          {item.status==='pending'||item.status==='preparing' ? (
            <motion.button whileTap={{scale:0.9}}
              style={{...S.remindBtn, opacity: remindCooldown?0.5:1}}
              onClick={()=>!remindCooldown&&onRemind(idx)}>
              🔔 {t('व्यवस्थापकाला आठवण द्या','Remind Admin')}{remindCooldown?` (${t('1 मिनिट थांबा','wait 1 min')})`:''}
            </motion.button>
          ):null}
        </div>
      ))}
    </motion.div>
  )
}

// ── BasicItemCard ─────────────────────────────────────────
function BasicItemCard({ item, lang, qty, onAdd, onRemove }) {
  return (
    <div style={S.basicCard}>
      <div style={{fontSize:28,textAlign:'center'}}>{item.emoji}</div>
      <div style={{color:'#fff',fontWeight:700,textAlign:'center',fontSize:13}}>{lang==='mr'?item.nameMr:item.nameEn}</div>
      <div style={{color:'#888',fontSize:11,textAlign:'center'}}>{item.unit}</div>
      <div style={S.qtyCtrl}>
        {qty>0 ? (
          <><button style={S.qtyBtn} onClick={onRemove}>−</button>
          <span style={S.qtyNum}>{qty}</span>
          <button style={S.qtyBtn} onClick={onAdd}>+</button></>
        ) : (
          <button style={{...S.addBtn,width:'100%',padding:'6px 0',fontSize:13}} onClick={onAdd}>+</button>
        )}
      </div>
    </div>
  )
}

// ── BasicOrderCard ────────────────────────────────────────
function BasicOrderCard({ order, lang, t, onGotIt, onNotReceived, onRemind, remindCooldown }) {
  const [timers, setTimers] = useState({})
  useEffect(()=>{
    const iv = setInterval(()=>{
      const now = Date.now()
      const t2 = {}
      order.items.forEach((item,idx)=>{ t2[idx]=(now-new Date(item.orderedAt||order.orderedAt).getTime())>60*1000 })
      setTimers(t2)
    },5000)
    return ()=>clearInterval(iv)
  },[order])
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{...S.orderCard,borderColor:'#22c55e44',marginTop:10}}>
      <div style={{color:'#4ade80',fontWeight:700,marginBottom:8}}>
        {t('इतर मागणी','Basic Items')} #{order._id?.slice(-4)}
        <span style={{color:'#888',fontWeight:400,marginLeft:8,fontSize:11}}>{new Date(order.orderedAt||order.createdAt).toLocaleTimeString()}</span>
      </div>
      {order.items.map((item,idx)=>(
        <div key={idx} style={{padding:'6px 0',borderBottom:'1px solid #2a2a2a'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:4}}>
            <span>{lang==='mr'?item.nameMarathi:item.name}</span>
            <span style={{color:'#888',marginLeft:8}}>x{item.quantity} {item.unit}</span>
          </div>
          {item.status==='sent'&&(
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <motion.button whileTap={{scale:0.9}} style={S.gotBtn} onClick={()=>onGotIt(idx)}>✓ {t('मिळाले','Got it')}</motion.button>
              {timers[idx]
                ? <motion.button initial={{opacity:0}} animate={{opacity:1}} style={S.notGotBtn} onClick={()=>onNotReceived(idx)}>✗ {t('मिळाले नाही','Not Received')}</motion.button>
                : <span style={{color:'#666',fontSize:11,alignSelf:'center'}}>{t('1 मिनिटानंतर...','After 1 min...')}</span>
              }
            </div>
          )}
          {(item.status==='pending')&&(
            <motion.button whileTap={{scale:0.9}}
              style={{...S.remindBtn,opacity:remindCooldown?0.5:1}}
              onClick={()=>!remindCooldown&&onRemind(idx)}>
              🔔 {t('आठवण द्या','Remind')}
            </motion.button>
          )}
        </div>
      ))}
    </motion.div>
  )
}

// ── AdminNotif ────────────────────────────────────────────
function AdminNotif({ notif, onClose, t }) {
  const colors = { success:'#22c55e', error:'#ef4444', info:'#3b82f6', wait:'#f59e0b', inprogress:'#f59e0b' }
  return (
    <motion.div initial={{opacity:0,y:-60}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-60}} style={{...S.notif,borderColor:colors[notif.type]||'#3b82f6'}}>
      <div style={{fontWeight:700,color:colors[notif.type],marginBottom:4}}>{t('व्यवस्थापकाचा संदेश','Admin Message')}</div>
      <div style={{color:'#fff'}}>{notif.text}</div>
      {notif.waitTime&&<div style={{color:'#e8c030',marginTop:4}}>⏱ {notif.waitTime} {t('मिनिटांत येईल','min wait')}</div>}
      <button style={S.closeBtn} onClick={onClose}>✕</button>
    </motion.div>
  )
}

export function AdminApp() {
  const [lang, setLang] = useState('en')
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin-token'))
  const [loginData, setLoginData] = useState({ username:'', password:'' })
  const [adminTab, setAdminTab] = useState('pending')
  const [pendingReqs, setPendingReqs] = useState([])
  const [sessions, setSessions] = useState([])
  const [orders, setOrders] = useState([])
  const [basicOrders, setBasicOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [chatMsg, setChatMsg] = useState('')
  const [histSearch, setHistSearch] = useState('')
  const [qrData, setQrData] = useState([])
  const [notifQueue, setNotifQueue] = useState([])

  const socketRef = useRef(null)

  const t = (en, mr) => lang === 'en' ? en : mr

  // Voice notify
  function voiceNotify(text) {
    speak(text, 'mr')
    setNotifQueue(prev => [...prev, { text, id: Date.now() }])
    setTimeout(() => setNotifQueue(prev => prev.slice(1)), 7000)
  }

  useEffect(() => { if (isLoggedIn) fetchAll() }, [isLoggedIn])

  async function fetchAll() {
    try {
      const [sAll, oData] = await Promise.all([
        apiCall('/sessions'),
        apiCall('/orders/active'),
      ])
      setSessions(sAll)
      setOrders(oData.orders || [])
      setBasicOrders(oData.basicOrders || [])
      setPendingReqs(sAll.filter(s => s.status === 'pending'))
    } catch(e) { console.error(e) }
  }

  async function loadQRCodes() {
    try {
      const data = await apiCall('/qr/all/print')
      setQrData(data)
    } catch(e) { console.error(e) }
  }

  // Socket setup
  useEffect(() => {
    if (!isLoggedIn) return
    const io = window.io
    if (!io) return
    const socket = io(SOCKET_URL)
    socketRef.current = socket
    socket.emit('join-admin')

    socket.on('new-session-request', (data) => {
      setPendingReqs(prev => [data, ...prev])
      voiceNotify(`टेबल ${data.tableNumber} वरून ${data.customerName} यांची बसण्याची विनंती आली आहे`)
    })

    socket.on('new-order', (data) => {
      setOrders(prev => [data.order, ...prev])
      voiceNotify(`टेबल ${data.tableNumber} वरून ऑर्डर आली आहे`)
    })

    socket.on('new-basic-order', (data) => {
      setBasicOrders(prev => [data.order, ...prev])
      voiceNotify(`टेबल ${data.order.tableNumber} वरून वस्तू मागणी आली आहे`)
    })

    socket.on('message-from-customer', ({ tableNumber, message, sessionId }) => {
      voiceNotify(`टेबल ${tableNumber} वरून संदेश आला आहे`)
      setSessions(prev => prev.map(s =>
        s._id === sessionId ? { ...s, messages: [...(s.messages||[]), { sender:'customer', text:message, timestamp:new Date() }] } : s
      ))
      if (selected?._id === sessionId) {
        setSelected(prev => prev ? { ...prev, messages:[...(prev.messages||[]),{sender:'customer',text:message,timestamp:new Date()}] } : prev)
      }
    })

    socket.on('order-updated', o => setOrders(prev=>prev.map(x=>x._id===o._id?o:x)))
    socket.on('basic-order-updated', o => setBasicOrders(prev=>prev.map(x=>x._id===o._id?o:x)))
    socket.on('session-ended', () => fetchAll())

    return () => socket.disconnect()
  }, [isLoggedIn, selected?._id])

  async function login() {
    try {
      const data = await apiCall('/auth/login','POST', loginData)
      if (data.token) {
        localStorage.setItem('admin-token', data.token)
        setIsLoggedIn(true)
      } else {
        alert('Invalid credentials')
      }
    } catch(e) {
      alert('Login failed')
    }
  }

  async function confirmSession(id) {
    await apiCall(`/sessions/${id}/confirm`,'PUT')
    setPendingReqs(prev=>prev.filter(r=>r._id!==id))
    fetchAll()
  }

  async function rejectSession(id) {
    await apiCall(`/sessions/${id}/reject`,'PUT')
    setPendingReqs(prev=>prev.filter(r=>r._id!==id))
  }

  async function sendWaitVoice(tableNumber, sessionId, waitMin) {
    const msg = `तुमचे जेवण ${waitMin} मिनिटांत येईल`
    socketRef.current?.emit('send-message-to-table', { tableNumber, message: msg, type: 'wait', waitTime: waitMin })
    await apiCall(`/sessions/${sessionId}/message`, 'POST', { sender: 'admin', text: msg, type: 'voice', waitTime: waitMin })
    speak(msg, 'mr')
  }

  async function updateItemStatus(orderId, idx, status, isBasic) {
    const url = isBasic ? `/orders/basic/${orderId}/item/${idx}/status` : `/orders/${orderId}/item/${idx}/status`
    await apiCall(url,'PUT',{status})
    const up = prev=>prev.map(o => o._id!==orderId ? o : {...o, items: o.items.map((item,i) => i===idx ? {...item,status} : item)})
    isBasic ? setBasicOrders(up) : setOrders(up)
  }

  async function sendAdminMsg(sessionId, tableNumber) {
    if(!chatMsg.trim()) return
    const msg = {sender:'admin',text:chatMsg,timestamp:new Date()}
    socketRef.current?.emit('send-message-to-table',{tableNumber,message:chatMsg,type:'text'})
    await apiCall(`/sessions/${sessionId}/message`,'POST',{sender:'admin',text:chatMsg})
    setSelected(prev => prev? {...prev, messages:[...(prev.messages||[]),msg]} : prev)
    setSessions(prev => prev.map(s => s._id===sessionId ? {...s, messages:[...(s.messages||[]),msg]} : s))
    setChatMsg('')
  }

  async function endSession(sessionId) {
    if (!sessionId) return
    try {
      await apiCall(`/sessions/${sessionId}/end`, 'PUT')
      setSessions(prev => prev.map(s => s._id === sessionId ? {...s, status: 'completed'} : s))
      if (selected?._id === sessionId) setSelected(null)
      fetchAll()
      voiceNotify('टेबल संपवले')
    } catch (err) {
      alert('Failed to end table')
    }
  }

  // ── LOGIN SCREEN ───────────────────────────────────────
  if (!isLoggedIn) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0a0a,#1a0000)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(200,165,32,.3)',borderRadius:24,padding:'40px 32px',width:'100%',maxWidth:380}}>
        <div style={{fontSize:48,textAlign:'center',marginBottom:8}}>👨‍💼</div>
        <h2 style={{color:'#e8c030',textAlign:'center',marginBottom:24,fontFamily:'serif'}}>Admin Login</h2>
        <input style={S.inp} placeholder="Username" value={loginData.username} onChange={e=>setLoginData(p=>({...p,username:e.target.value}))}/>
        <input style={S.inp} type="password" placeholder="Password" value={loginData.password} onChange={e=>setLoginData(p=({...p,password:e.target.value}))} onKeyPress={e=>e.key==='Enter'&&login()}/>
        <button style={S.primaryBtn} onClick={login}>Login</button>
      </motion.div>
    </div>
  )

  const activeSessions = sessions.filter(s => s.status === 'active')

  // ── ADMIN DASHBOARD ───────────────────────────────────
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',flexDirection:'column',color:'#fff',fontFamily:'Mukta,sans-serif'}}>
      {/* Voice Notification Bar */}
      <AnimatePresence>
        {notifQueue[0] && (
          <motion.div initial={{opacity:0,y:-40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-40}}
            style={{background:'#7b1111',padding:'10px 20px',textAlign:'center',color:'#e8c030',fontWeight:700,fontSize:15,position:'sticky',top:0,zIndex:1000}}>
            🔊 {notifQueue[0].text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#1a0000,#0a0000)',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(200,165,32,.3)'}}>
        <div>
          <div style={{color:'#e8c030',fontWeight:800,fontSize:17}}>🏨 Hotel Pahunchar Admin</div>
          <div style={{color:'#888',fontSize:12}}>{activeSessions.length} active tables • {pendingReqs.length} pending</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          {pendingReqs.length>0&&<motion.div animate={{scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:1}} style={{background:'#ef4444',color:'#fff',borderRadius:20,padding:'4px 12px',fontWeight:700,fontSize:13}}>🔔 {pendingReqs.length}</motion.div>}
          <button style={S.langBtn} onClick={()=>setLang(l=>l==='en'?'mr':'en')}>{lang==='en'?'मराठी':'English'}</button>
          <button style={{...S.leaveBtn,fontSize:12,padding:'6px 12px'}} onClick={()=>{setIsLoggedIn(false);localStorage.removeItem('admin-token')}}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',background:'#111',borderBottom:'1px solid #222',overflowX:'auto'}}>
        {[
          {id:'pending',label:`🔔 ${t('Requests','विनंत्या')} ${pendingReqs.length>0?`(${pendingReqs.length})`:''}`},
          {id:'live',   label:`📋 ${t('Live Orders','लाइव ऑर्डर')}`},
          {id:'tables', label:`🪑 ${t('Tables','टेबल')}`},
          {id:'qr',     label:`📱 ${t('QR Codes','QR कोड')}`},
          {id:'history',label:`📚 ${t('History','इतिहास')}`},
        ].map(tab=>(
          <button key={tab.id} style={{...S.tab,...(adminTab===tab.id?S.tabActive:{}),flex:'none',padding:'11px 16px'}} onClick={()=>{setAdminTab(tab.id);if(tab.id==='qr')loadQRCodes()}}>{tab.label}</button>
        ))}
      </div>

      {/* Full Width Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 20px 12px' }}>

        {/* PENDING */}
        {adminTab==='pending' && (
          <div>
            <div style={{color:'#e8c030',fontWeight:800,fontSize:15,marginBottom:12}}>{t('New Seating Requests','नवीन बसण्याच्या विनंत्या')}</div>
            {pendingReqs.length===0
              ? <div style={S.empty}><div style={{fontSize:36}}>🟢</div><p>{t('No pending requests','कोणतीही विनंती नाही')}</p></div>
              : pendingReqs.map((req,i)=>{
                const s = req.session || req
                return (
                  <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} style={{background:'rgba(200,165,32,.05)',border:'1px solid rgba(200,165,32,.2)',borderRadius:12,padding:14,marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{color:'#e8c030',fontWeight:700}}>{t('Table','टेबल')} {s.tableNumber||req.tableNumber}</span>
                      <span style={{color:'#888',fontSize:11}}>{new Date(s.createdAt||Date.now()).toLocaleTimeString()}</span>
                    </div>
                    <div style={{color:'#fff',marginBottom:4}}>👤 {s.customerName||req.customerName}</div>
                    {(s.customerPhone||req.customerPhone)&&<div style={{color:'#888',fontSize:12,marginBottom:4}}>📞 {s.customerPhone||req.customerPhone}</div>}
                    <div style={{color:'#888',fontSize:12,marginBottom:10}}>🌐 {s.language==='mr'?'मराठी':'English'}</div>
                    <div style={{display:'flex',gap:10}}>
                      <button style={{flex:1,padding:10,background:'#16a34a',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700}} onClick={()=>confirmSession(s._id||req._id)}>✓ {t('Confirm','मंजूर')}</button>
                      <button style={{flex:1,padding:10,background:'#dc2626',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700}} onClick={()=>rejectSession(s._id||req._id)}>✗ {t('Reject','नाकार')}</button>
                    </div>
                  </motion.div>
                )
              })
            }
          </div>
        )}

        {/* LIVE ORDERS - Full Width + Clean Chat Below + End Button */}
        {adminTab === 'live' && (
          <div style={{ paddingBottom: 100 }}>
            <div style={{ color: '#e8c030', fontWeight: 800, fontSize: 17, marginBottom: 16 }}>
              {t('Active Live Orders', 'सक्रिय लाइव ऑर्डर')}
            </div>

            {activeSessions.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 48 }}>🟢</div>
                <p>{t('No active orders right now', 'सध्या कोणतीही सक्रिय ऑर्डर नाही')}</p>
              </div>
            ) : (
              activeSessions.map(session => {
                const sessionMainOrders = orders.filter(o => 
                  String(o.session) === String(session._id) && o.status !== 'completed'
                );
                const sessionBasicOrders = basicOrders.filter(o => 
                  String(o.session) === String(session._id) && o.status !== 'served'
                );

                const isChatOpen = selected?._id === session._id;

                if (sessionMainOrders.length === 0 && sessionBasicOrders.length === 0) return null;

                return (
                  <motion.div 
                    key={session._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      background: '#1c1c1c', 
                      borderRadius: 16, 
                      padding: 16, 
                      marginBottom: 24,
                      border: '1px solid rgba(200,165,32,.25)'
                    }}
                  >
                    {/* Header with Chat + End Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                      <div>
                        <span style={{ color: '#e8c030', fontWeight: 700, fontSize: 17 }}>
                          टेबल {session.tableNumber} — {session.customerName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          onClick={() => setSelected(isChatOpen ? null : session)}
                          style={{ 
                            padding: '10px 18px', 
                            background: isChatOpen ? '#ef4444' : '#7b1111', 
                            color: '#e8c030', 
                            border: 'none', 
                            borderRadius: 10, 
                            fontSize: 14,
                            fontWeight: 600 
                          }}
                        >
                          {isChatOpen ? '✕ बंद करा' : '💬 चॅट'}
                        </button>

                        {session.status === 'active' && (
                          <button 
                            onClick={() => endSession(session._id)}
                            style={{ 
                              padding: '10px 18px', 
                              background: '#dc2626', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: 10, 
                              fontSize: 14,
                              fontWeight: 600 
                            }}
                          >
                            🚪 संपवा
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Main Orders */}
                    {sessionMainOrders.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 8 }}>मुख्य ऑर्डर</div>
                        {sessionMainOrders.map(order => (
                          <AdminOrderCard 
                            key={order._id}
                            order={order}
                            lang={lang}
                            t={t}
                            onUpdateItem={(idx, status) => updateItemStatus(order._id, idx, status, false)}
                            onWaitVoice={(min) => sendWaitVoice(order.tableNumber, session._id, min)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Basic Items */}
                    {sessionBasicOrders.length > 0 && (
                      <div style={{ marginBottom: isChatOpen ? 20 : 0 }}>
                        <div style={{ color: '#4ade80', fontWeight: 600, marginBottom: 8 }}>इतर वस्तू</div>
                        {sessionBasicOrders.map(order => (
                          <AdminBasicCard 
                            key={order._id}
                            order={order}
                            lang={lang}
                            t={t}
                            onUpdateItem={(idx, status) => updateItemStatus(order._id, idx, status, true)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Chat Box */}
                    <AnimatePresence>
                      {isChatOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          style={{ 
                            marginTop: 24, 
                            padding: 18, 
                            background: '#161616', 
                            borderRadius: 12,
                            border: '1px solid #555'
                          }}
                        >
                          <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: 14 }}>💬 संभाषण</div>
                          
                          <div style={{ 
                            maxHeight: '300px', 
                            overflowY: 'auto', 
                            marginBottom: 16, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 12 
                          }}>
                            {(session.messages || []).map((msg, i) => (
                              <div key={i} style={{
                                ...S.chatBubble,
                                alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'admin' ? 'rgba(123,17,17,.8)' : 'rgba(34,197,94,.2)',
                                padding: '14px 16px'
                              }}>
                                <div style={S.chatSender}>
                                  {msg.sender === 'admin' ? '👨‍💼 Admin' : `🙋 ${session.customerName}`}
                                </div>
                                <div style={{ marginTop: 6 }}>{msg.text}</div>
                                <div style={S.chatTime}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <input 
                              style={S.chatInp} 
                              placeholder="संदेश लिहा..." 
                              value={chatMsg} 
                              onChange={e => setChatMsg(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && sendAdminMsg(session._id, session.tableNumber)}
                            />
                            <button 
                              style={S.sendBtn} 
                              onClick={() => sendAdminMsg(session._id, session.tableNumber)}
                            >
                              पाठवा
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* QR CODES */}
        {adminTab==='qr' && (
          <div>
            <div style={{color:'#e8c030',fontWeight:800,fontSize:15,marginBottom:6}}>{t('QR Codes — Print & Place on Tables','QR कोड — प्रत्येक टेबलवर ठेवा')}</div>
            <p style={{color:'#888',fontSize:13,marginBottom:16}}>{t('Each QR links to that table\'s order page. Print and laminate for each table.','प्रत्येक QR त्या टेबलच्या ऑर्डर पेजशी जोडलेला आहे.')}</p>
            {qrData.length===0
              ? <button style={{...S.primaryBtn,width:'auto',padding:'12px 24px'}} onClick={loadQRCodes}>{t('Load QR Codes','QR कोड लोड करा')}</button>
              : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
                  {qrData.map(({tableNumber:tn,qrCode,url})=>(
                    <div key={tn} style={{background:'#1c1c1c',border:'1px solid #333',borderRadius:12,padding:14,textAlign:'center'}}>
                      <div style={{fontWeight:800,color:'#e8c030',marginBottom:8,fontSize:15}}>{t('Table','टेबल')} {tn}</div>
                      <div style={{background:'#fff',borderRadius:8,padding:8,display:'inline-block',marginBottom:8}}>
                        <img src={qrCode} alt={`Table ${tn} QR`} style={{width:100,height:100,display:'block'}}/>
                      </div>
                      <div style={{color:'#666',fontSize:10,wordBreak:'break-all',marginBottom:8}}>{url}</div>
                      <a href={qrCode} download={`table-${tn}-qr.png`}
                        style={{display:'block',padding:'7px',background:'#7b1111',color:'#e8c030',borderRadius:8,textDecoration:'none',fontSize:12,fontWeight:700}}>
                        ⬇ {t('Download','डाउनलोड')}
                      </a>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* TABLES TAB */}
        {adminTab === 'tables' && (
          <div style={{ padding: '16px 12px' }}>
            <div style={{ color: '#e8c030', fontWeight: 800, fontSize: 16, marginBottom: 16 }}>
              {t('Table Status', 'टेबल स्थिती')} ({activeSessions.length} सक्रिय)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
              gap: 12
            }}>
              {Array.from({ length: 15 }, (_, i) => i + 1).map(num => {
                const session = activeSessions.find(s => s.tableNumber === num);
                return (
                  <motion.div
                    key={num}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => session && (setSelected(session), setAdminTab('live'))}
                    style={{
                      background: session ? '#1c1c1c' : '#161616',
                      border: `2px solid ${session ? '#22c55e' : '#444'}`,
                      borderRadius: 14,
                      padding: '16px 10px',
                      textAlign: 'center',
                      cursor: session ? 'pointer' : 'default',
                      minHeight: 92,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 800, color: session ? '#e8c030' : '#666', marginBottom: 4 }}>
                      T{num}
                    </div>
                    {session ? (
                      <>
                        <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
                          🟢 {session.customerName?.split(' ')[0] || 'Occupied'}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                          {orders.filter(o => String(o.session) === String(session._id) && o.status !== 'completed').length} orders
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#555', fontSize: 13 }}>रिकामे</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <p style={{ color: '#666', textAlign: 'center', fontSize: 13, marginTop: 24 }}>
              टेबलवर टॅप करा → लाइव ऑर्डर पहा
            </p>
          </div>
        )}

        {/* HISTORY TAB - Click to show full history details */}
{adminTab==='history' && !historyDetail && (
  <div>
    <div style={{color:'#e8c030',fontWeight:800,fontSize:15,marginBottom:10}}>{t('Session History','सत्र इतिहास')}</div>
    
    <input 
      style={{...S.inp,marginBottom:12}} 
      placeholder={t('Search name, table...','नाव, टेबल शोधा...')} 
      value={histSearch} 
      onChange={e=>setHistSearch(e.target.value)}
    />

    {sessions
      .filter(s => !histSearch || 
        s.customerName?.toLowerCase().includes(histSearch.toLowerCase()) || 
        s.tableNumber?.toString().includes(histSearch))
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(session => (
        <motion.div 
          key={session._id} 
          whileHover={{scale:1.005}} 
          style={{background:'#1c1c1c',border:'1px solid #333',borderRadius:12,padding:14,marginBottom:10,cursor:'pointer'}}
          onClick={() => setHistoryDetail(session)}
        >
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <span style={{color:'#e8c030',fontWeight:700}}>{t('Table','टेबल')} {session.tableNumber}</span>
            <span style={{padding:'2px 10px',borderRadius:10,fontSize:11,fontWeight:700,
              background: session.status === 'active' ? 'rgba(34,197,94,.2)' : 'rgba(100,100,100,.2)',
              color: session.status === 'active' ? '#22c55e' : '#888'}}>
              {session.status}
            </span>
          </div>
          <div style={{color:'#fff',marginBottom:4}}>👤 {session.customerName}</div>
          <div style={{color:'#888',fontSize:12}}>📅 {new Date(session.startTime || session.createdAt).toLocaleString()}</div>
          <div style={{color:'#e8c030',fontSize:13,marginTop:4}}>
            ₹{session.totalAmount || 0} • {session.orders?.length || 0} orders
          </div>
        </motion.div>
      ))
    }
  </div>
)}

          {/* HISTORY DETAIL VIEW */}
          {adminTab === 'history' && historyDetail && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button 
                  onClick={() => setHistoryDetail(null)}
                  style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 8 }}
                >
                  ← Back to History
                </button>
                <div style={{ color: '#e8c030', fontWeight: 700 }}>
                  टेबल {historyDetail.tableNumber} — {historyDetail.customerName}
                </div>
              </div>

              {/* Orders */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 12 }}>ऑर्डर इतिहास</div>
                {historyDetail.orders && historyDetail.orders.map((order, idx) => (
                  <div key={idx} style={{ background: '#1c1c1c', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                    <div style={{ color: '#e8c030', fontWeight: 700, marginBottom: 8 }}>
                      ऑर्डर #{order._id?.slice(-4)} — ₹{order.totalAmount}
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #333' }}>
                        <span>{item.nameMarathi || item.name} x{item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Conversation */}
              <div>
                <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: 12 }}>💬 संभाषण इतिहास</div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(historyDetail.messages || []).map((msg, i) => (
                    <div key={i} style={{
                      ...S.chatBubble,
                      alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'admin' ? 'rgba(123,17,17,.8)' : 'rgba(34,197,94,.2)',
                      padding: '14px 16px'
                    }}>
                      <div style={S.chatSender}>
                        {msg.sender === 'admin' ? '👨‍💼 Admin' : `🙋 ${historyDetail.customerName}`}
                      </div>
                      <div style={{ marginTop: 6 }}>{msg.text}</div>
                      <div style={S.chatTime}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
// ── Admin Order Card ──────────────────────────────────────
function AdminOrderCard({ order, lang, t, onSelectSession, onUpdateItem, onWaitVoice }) {
  const [exp, setExp] = useState(true)
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{...S.orderCard,marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',marginBottom:exp?10:0}} onClick={()=>setExp(!exp)}>
        <span style={{color:'#e8c030',fontWeight:700}}>{t('Table','टेबल')} {order.tableNumber} — {order.customerName}</span>
        <span style={{color:'#e8c030'}}>₹{order.totalAmount}</span>
        <span style={{color:'#888',fontSize:11}}>{new Date(order.orderedAt||order.createdAt).toLocaleTimeString()}</span>
        <span style={{color:'#888'}}>{exp?'▲':'▼'}</span>
      </div>
      {exp && (
        <>
          {order.items.map((item,idx)=>(
            <div key={idx} style={{display:'flex',alignItems:'center',padding:'5px 0',borderBottom:'1px solid #2a2a2a',gap:8,fontSize:13}}>
              <span style={{flex:1}}>{item.nameMarathi||item.name} x{item.quantity}</span>
              <span style={{color:'#e8c030',marginRight:4}}>₹{item.price*item.quantity}</span>
              <select style={{padding:'3px 7px',background:'#252525',border:'1px solid #555',color:'#fff',borderRadius:6,fontSize:11,cursor:'pointer'}}
                value={item.status} onChange={e=>onUpdateItem(idx,e.target.value)}>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="sent">Sent ✓</option>
                <option value="received">Received ✅</option>
              </select>
            </div>
          ))}
          <div style={{display:'flex',gap:7,marginTop:10,flexWrap:'wrap'}}>
            {[2,3,5].map(m=>(
              <button key={m} style={{padding:'5px 10px',background:'#d97706',color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:700}} onClick={()=>onWaitVoice(m)}>🔊 {m}min</button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

function AdminBasicCard({ order, lang, t, onUpdateItem }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{...S.orderCard,borderColor:'#22c55e44',marginBottom:10}}>
      <div style={{color:'#4ade80',fontWeight:700,marginBottom:8}}>
        {t('Table','टेबल')} {order.tableNumber} — {t('Basic Items','इतर मागणी')}
        <span style={{color:'#888',fontWeight:400,marginLeft:8,fontSize:11}}>{new Date(order.orderedAt||order.createdAt).toLocaleTimeString()}</span>
      </div>
      {order.items.map((item,idx)=>(
        <div key={idx} style={{display:'flex',alignItems:'center',padding:'5px 0',borderBottom:'1px solid #2a2a2a',gap:8,fontSize:13}}>
          <span style={{flex:1}}>{item.nameMarathi||item.name} x{item.quantity} {item.unit}</span>
          <select style={{padding:'3px 7px',background:'#252525',border:'1px solid #555',color:'#fff',borderRadius:6,fontSize:11,cursor:'pointer'}}
            value={item.status} onChange={e=>onUpdateItem(idx,e.target.value)}>
            <option value="pending">Pending</option>
            <option value="sent">Sent ✓</option>
            <option value="received">Received ✅</option>
          </select>
        </div>
      ))}
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════
const S = {
  screen:    { minHeight:'100vh', background:'linear-gradient(135deg,#1a0000,#0d0d0d)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative' },
  joinCard:  { background:'rgba(255,255,255,.05)', backdropFilter:'blur(20px)', border:'1px solid rgba(200,165,32,.3)', borderRadius:24, padding:'36px 28px', width:'100%', maxWidth:400 },
  waitCard:  { background:'rgba(255,255,255,.05)', border:'1px solid rgba(200,165,32,.3)', borderRadius:24, padding:'48px 32px', display:'flex', flexDirection:'column', alignItems:'center', maxWidth:360, width:'100%' },
  hotelName: { color:'#e8c030', fontWeight:900, textAlign:'center', fontSize:26, fontFamily:'serif', margin:'8px 0 4px' },
  tagline:   { color:'#888', textAlign:'center', fontSize:14, marginBottom:16 },
  tableChip: { background:'rgba(200,165,32,.2)', border:'1px solid rgba(200,165,32,.4)', borderRadius:20, padding:'4px 18px', color:'#e8c030', textAlign:'center', margin:'0 auto 18px', display:'block', width:'fit-content' },
  inp:       { width:'100%', padding:'13px 15px', borderRadius:11, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.08)', color:'#fff', fontSize:15, marginBottom:12, outline:'none', boxSizing:'border-box' },
  primaryBtn:{ width:'100%', padding:16, borderRadius:14, background:'linear-gradient(135deg,#7b1111,#a01515)', color:'#e8c030', fontWeight:800, fontSize:16, border:'1px solid rgba(200,165,32,.4)', cursor:'pointer' },
  ghostBtn:  { padding:'9px 14px', background:'none', border:'1px solid #444', color:'#888', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:600 },
  langBtn:   { background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.2)', borderRadius:16, padding:'5px 12px', color:'#e8c030', cursor:'pointer', fontSize:12, fontWeight:600 },
  leaveBtn:  { background:'rgba(239,68,68,.15)', border:'1px solid #ef444466', borderRadius:12, padding:'10px 16px', color:'#ef4444', cursor:'pointer', fontSize:15, fontWeight:700, display: 'flex', alignItems: 'center', gap: 6},
  app:       { minHeight:'100vh', background:'#0d0d0d', display:'flex', flexDirection:'column', color:'#fff', maxWidth:500, margin:'0 auto', paddingBottom: 'env(safe-area-inset-bottom)',fontSize: '15px' },
  header:    { background:'linear-gradient(135deg,#1a0000,#3b0000)', padding:'13px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(200,165,32,.3)', flexShrink:0 },
  headerTitle:{ color:'#e8c030', fontWeight:800, fontSize:17, fontFamily:'serif' },
  headerSub: { color:'#888', fontSize:12, marginTop:2 },
  tabBar:    { display:'flex', background:'#111', borderBottom:'1px solid #333', overflowX:'auto', flexShrink:0 },
  tab:       { flex:1, padding:'11px 6px', background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:11, fontWeight:700, borderBottom:'2px solid transparent', whiteSpace:'nowrap' },
  tabActive: { color:'#e8c030', borderBottomColor:'#e8c030', background:'rgba(200,165,32,.07)' },
  content: { 
  flex: 1, 
  overflowY: 'auto', 
  padding: '14px 14px 220px 14px', 
},
  catBar:    { display:'flex', gap:8, marginBottom:14, background:'#1a1a1a', borderRadius:13, padding:6 },
  catTab:    { flex:1, padding:10, borderRadius:9, border:'none', background:'none', color:'#888', cursor:'pointer', fontWeight:700, fontSize:13 },
  catActive: { background:'rgba(123,17,17,.8)', color:'#e8c030' },
  menuCard:  { background:'linear-gradient(145deg,#1c1c1c,#242424)', borderRadius:15, padding:14, border:'1px solid #333', marginBottom:12 },
  incBtn:    { background:'none', border:'1px solid #444', color:'#888', borderRadius:8, padding:'3px 10px', cursor:'pointer', fontSize:12, marginBottom:6 },
  qtyCtrl:   { display:'flex', alignItems:'center', gap:12, background: 'rgba(255,255,255,0.08)', padding: '6px 10px',borderRadius: 10 },
  qtyBtn:    { width:36, height:36, borderRadius:8, border:'1px solid #555', background:'#222', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:18 },
  qtyNum:    { color:'#e8c030', fontWeight:700, fontSize:16, minWidth:22, textAlign:'center' },
  addBtn:    { padding:'10px 18px', background:'linear-gradient(135deg,#7b1111,#a01515)', color:'#e8c030', border:'1px solid rgba(200,165,32,.3)', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:15 },
  cartBar: { 
  position: 'fixed', 
  bottom: 0, 
  left: 0,                    // Changed to left: 0
  right: 0,                   // Added right: 0 for full width
  width: '100%', 
  maxWidth: 500, 
  background: 'linear-gradient(135deg,#7b1111,#a01515)', 
  padding: '18px 20px', 
  paddingBottom: 'max(32px, env(safe-area-inset-bottom))', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  zIndex: 300,
  boxShadow: '0 -10px 35px rgba(0,0,0,0.9)',
  borderTop: '2px solid #e8c030'
},
  orderBtn: { 
  background: '#e8c030', 
  color: '#1a0000', 
  padding: '16px 32px', 
  borderRadius: 14, 
  border: 'none', 
  fontWeight: 800, 
  fontSize: 17,
  cursor: 'pointer',
  minWidth: 180,
  boxShadow: '0 4px 20px rgba(232, 192, 48, 0.6)'
},
  orderCard: { background:'#1c1c1c', borderRadius:16, padding:16, border:'1px solid #333', marginBottom:16 , fontSize: 15},
  gotBtn:    { padding:'10px 16px', background:'#16a34a', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14 ,minWidth: 90 },
  notGotBtn: { padding:'6px 13px', background:'#dc2626', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:12 },
  remindBtn: { marginTop:6, padding:'5px 11px', background:'rgba(234,179,8,.15)', border:'1px solid rgba(234,179,8,.4)', color:'#fbbf24', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600 },
  basicCard: { background:'#1c1c1c', borderRadius:11, padding:'11px 8px', border:'1px solid #333', display:'flex', flexDirection:'column', gap:7, alignItems:'center' },
  chatWrap:  { display:'flex', flexDirection:'column', height:'calc(100vh - 200px)' },
  chatMsgs:  { flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingBottom:8 },
  chatBubble: { 
  maxWidth: '82%', 
  padding: '10px 13px', 
  borderRadius: 13, 
  wordBreak: 'break-word',
  fontSize: 14 
},
  bubbleCustomer:{ alignSelf:'flex-end', background:'rgba(123,17,17,.65)', border:'1px solid rgba(200,165,32,.2)' },
  bubbleAdmin:   { alignSelf:'flex-start', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.25)' },
  chatSender:{ fontSize:11, color:'#888', marginBottom:3, fontWeight:600 },
  chatTime:  { fontSize:10, color:'#555', marginTop:3, textAlign:'right' },
  chatInputRow:{ display:'flex', gap:8, padding:'10px 0', borderTop:'1px solid #333', flexShrink:0, background:'#0d0d0d', position:'sticky', bottom:0 },
  chatInp:   { flex:1, padding:'11px 14px', borderRadius:11, border:'1px solid #444', background:'#1c1c1c', color:'#fff', fontSize:14, outline:'none' },
  sendBtn:   { padding:'11px 18px', background:'#7b1111', color:'#e8c030', border:'1px solid rgba(200,165,32,.3)', borderRadius:11, cursor:'pointer', fontWeight:700 },
  notif:     { position:'fixed', top:70, left:'50%', transform:'translateX(-50%)', background:'#1c1c1c', border:'2px solid', borderRadius:15, padding:'14px 18px', zIndex:1000, maxWidth:360, width:'90%', boxShadow:'0 10px 40px rgba(0,0,0,.6)' },
  closeBtn:  { position:'absolute', top:8, right:10, background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:15 },
  modal:     { position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modalCard: { background:'#1c1c1c', border:'1px solid #444', borderRadius:20, padding:'30px 26px', display:'flex', flexDirection:'column', alignItems:'center' },
  yesBtn:    { flex:1, padding:12, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:15 },
  noBtn:     { flex:1, padding:12, background:'#333', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:15 },
  empty:     { textAlign:'center', color:'#555', padding:'40px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 },
}
