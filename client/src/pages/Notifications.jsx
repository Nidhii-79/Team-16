import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'notifications', title: 'Notifications' };

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/notifications').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function readAll() {
    await api.post('/notifications/read-all', {});
    load();
  }

  const unread = rows.filter((n) => !n.isRead).length;

  return (
    <div>
      <h2>Notifications {unread > 0 && '(' + unread + ' new)'}</h2>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && !error && <p>No notifications yet.</p>}
      {unread > 0 && <p><button onClick={readAll}>Mark all as read</button></p>}
      {rows.map((n) => (
        <div key={n.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, maxWidth: 560, fontWeight: n.isRead ? 400 : 700 }}>
          {!n.isRead && '● '}{n.message}
          <div style={{ fontWeight: 400, color: '#666', fontSize: 13 }}>{new Date(n.time).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
