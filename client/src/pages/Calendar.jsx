import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'calendar', title: 'Change Calendar' };

export default function Calendar() {
  const [rows, setRows] = useState([]);
  const [blackouts, setBlackouts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/calendar').then(setRows).catch((e) => setError(e.message));
    api.get('/blackout-dates').then(setBlackouts).catch(() => {});
  }, []);

  return (
    <div>
      <h2>Change Calendar</h2>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && !error && <p>Nothing scheduled yet.</p>}
      {rows.length > 0 && (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>Date</th><th>ID</th><th>Title</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.crId}><td>{r.scheduledDate}</td><td>{r.crId}</td><td>{r.title}</td><td>{r.status}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Blackout dates</h3>
      <ul>{blackouts.map((b) => <li key={b.date}>{b.date} - {b.reason}</li>)}</ul>
    </div>
  );
}
