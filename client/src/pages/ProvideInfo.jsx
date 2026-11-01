import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'provide-info', title: 'Info Requests', roles: ['Requester'] };

export default function ProvideInfo() {
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/change-requests/info-requested').then(setRows).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  async function resubmit(id) {
    setError('');
    setMsg('');
    try {
      await api.post('/change-requests/' + id + '/resubmit', { details: details[id] || '' });
      setMsg('Change request #' + id + ' resubmitted');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Change Requests Waiting For Your Information</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && <p>Nothing waiting for more information.</p>}
      {rows.map((r) => (
        <div key={r.crId} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, maxWidth: 520 }}>
          <strong>#{r.crId} {r.title}</strong>
          <p>CAB asks: {r.question}</p>
          <textarea
            placeholder="Add the requested information"
            value={details[r.crId] || ''}
            onChange={(e) => setDetails({ ...details, [r.crId]: e.target.value })}
            style={{ width: '100%' }}
          />
          <button onClick={() => resubmit(r.crId)}>Resubmit</button>
        </div>
      ))}
    </div>
  );
}
