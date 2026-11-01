import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'request-info', title: 'Request More Info', roles: ['CAB'] };

export default function RequestInfo() {
  const [rows, setRows] = useState([]);
  const [comments, setComments] = useState({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    api.get('/change-requests')
      .then((all) => setRows(all.filter((r) => r.status === 'Submitted')))
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  async function ask(id) {
    setError('');
    setMsg('');
    try {
      await api.post('/change-requests/' + id + '/request-info', { comments: comments[id] || '' });
      setMsg('Change request #' + id + ' sent back for more information');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Request More Information</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && <p>No submitted requests.</p>}
      {rows.map((r) => (
        <div key={r.crId} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, maxWidth: 520 }}>
          <strong>#{r.crId} {r.title}</strong> (Risk: {r.riskLevel})
          <p>{r.description}</p>
          <input
            placeholder="What information is needed? (required)"
            value={comments[r.crId] || ''}
            onChange={(e) => setComments({ ...comments, [r.crId]: e.target.value })}
          />{' '}
          <button onClick={() => ask(r.crId)}>Request info</button>
        </div>
      ))}
    </div>
  );
}
