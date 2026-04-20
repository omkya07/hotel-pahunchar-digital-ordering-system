// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://172.20.10.2:5000/api';

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE_URL}${path.startsWith('/') ? path : '/' + path}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path.startsWith('/') ? path : '/' + path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  put: async (path, body = {}) => {
    const res = await fetch(`${BASE_URL}${path.startsWith('/') ? path : '/' + path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

export default api;