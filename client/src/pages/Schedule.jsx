import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'schedule', title: 'Schedule Changes', roles: ['CAB'] };

export default function Schedule() {
  const [rows, setRows] = useState([]);
  const [blackouts, setBlackouts] = useState([]);
  const [dates, setDates] = useState({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/change-requests')
      .then((all) => setRows(all.filter((r) => r.status === 'Approved' || r.status === 'Scheduled')))
      .catch((e) => setError(e.message));
    api.get('/blackout-dates').then(setBlackouts).catch(() => {});
  };
  useEffect(load, []);

  async function schedule(id) {
    setMsg('');
    setError('');
    try {
      const d = await api.patch('/change-requests/' + id + '/schedule', { date: dates[id] || '' });
      setMsg('Change request #' + id + ' scheduled for ' + d.scheduledDate);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Schedule Approved Changes</h2>
      <p>Blackout dates (cannot be used): {blackouts.map((b) => b.date + ' (' + b.reason + ')').join(', ') || 'none'}</p>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && <p>No approved changes waiting to be scheduled.</p>}
      {rows.map((r) => (
        <div key={r.crId} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, maxWidth: 520 }}>
          <strong>#{r.crId} {r.title}</strong> - status: {r.status}
          <div style={{ marginTop: 6 }}>
            <input type="date" value={dates[r.crId] || ''} onChange={(e) => setDates({ ...dates, [r.crId]: e.target.value })} />{' '}
            <button onClick={() => schedule(r.crId)}>Schedule</button>
          </div>
        </div>
      ))}
    </div>
  );
}
