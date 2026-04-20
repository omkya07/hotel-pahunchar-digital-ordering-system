import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CustomerApp, AdminApp } from './App.jsx'
import './index.css'

function CustomerPage() {
  const { tableNumber } = useParams()
  return <CustomerApp tableNumber={parseInt(tableNumber)} />
}

function Home() {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg,#0d0d0d,#1a0000)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20, fontFamily: 'Mukta,sans-serif'
    }}>
      <div style={{ fontSize: 72 }}>🍽️</div>
      <h1 style={{ color: '#e8c030', fontFamily: 'Noto Serif Devanagari,serif', fontSize: 32 }}>
        हॉटेल पाहुणचार
      </h1>
      <p style={{ color: '#888', fontSize: 15 }}>जिथे चव आणि सेवा भेटतात</p>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/admin" style={{
          color: '#e8c030', border: '1px solid #e8c030', padding: '11px 28px',
          borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16
        }}>
          👨‍💼 Admin Panel
        </a>
        <a href="/table/1" style={{
          color: '#aaa', border: '1px solid #444', padding: '11px 28px',
          borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 15
        }}>
          📱 Table 1 Demo
        </a>
      </div>
      <p style={{ color: '#555', fontSize: 12, marginTop: 16 }}>
        Customer pages: /table/1 through /table/15
      </p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster
      position="top-center"
      toastOptions={{
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #444' }
      }}
    />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/table/:tableNumber" element={<CustomerPage />} />
      <Route path="/admin" element={<AdminApp />} />
    </Routes>
  </BrowserRouter>
)
