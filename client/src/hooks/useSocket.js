// src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from 'react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket({ onEvent, role = 'customer', tableNumber, sessionId } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const io = window.io;
    if (!io) {
      console.warn('Socket.IO not loaded');
      return;
    }

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (role === 'admin') {
        socket.emit('join-admin');
      } else if (role === 'customer' && tableNumber) {
        socket.emit('join-table', { tableNumber, sessionId });
      }
    });

    // Forward all events to handler
    if (onEvent) {
      const events = [
        'session-confirmed', 'session-rejected', 'session-ended',
        'message-from-admin', 'message-from-customer',
        'order-item-update', 'basic-order-item-update',
        'order-status-update', 'order-updated', 'basic-order-updated',
        'new-order', 'new-basic-order', 'new-session-request',
        'session-updated', 'item-received', 'order-update',
      ];
      events.forEach(event => {
        socket.on(event, (data) => onEvent(event, data));
      });
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [role, tableNumber, sessionId]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { emit, socket: socketRef };
}

export default useSocket;
