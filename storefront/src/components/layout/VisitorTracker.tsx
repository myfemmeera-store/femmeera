'use client';

import { useEffect } from 'react';

export function VisitorTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Generate or retrieve persistent visitor session ID
    let sessionId = localStorage.getItem('femmeera_visitor_session_id');
    if (!sessionId) {
      sessionId = 'vs_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('femmeera_visitor_session_id', sessionId);
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.femmeera.com/api/v1';

    const sendHeartbeat = () => {
      fetch(`${apiBaseUrl}/visitor/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(() => {});
    };

    // Initial heartbeat on page load
    sendHeartbeat();

    // Send heartbeat every 15 seconds
    const interval = setInterval(sendHeartbeat, 15000);

    // Send leave notification immediately when window/tab closes
    const handleLeave = () => {
      if (!sessionId) return;
      const url = `${apiBaseUrl}/visitor/leave`;
      const payload = JSON.stringify({ session_id: sessionId });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, []);

  return null;
}
