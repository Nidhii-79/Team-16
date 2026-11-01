import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'implementation', title: 'Implementation', roles: ['Implementer'] };

const NEXT = {
  Approved: ['In Progress'],
  Scheduled: ['In Progress'],
  'In Progress': ['Completed', 'Failed'],
};

export default function Implementation() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/change-requests')
      .then((all) => setRows(all.filter((r) => NEXT[r.status])))
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  async function update(id, status) {
    setError('');
    try {
      await api.patch('/change-requests/' + id + '/status', { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Implementation</h2>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && <p>No approved changes to implement.</p>}
      {rows.map((r) => (
        <div key={r.crId} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, maxWidth: 520 }}>
          <strong>#{r.crId} {r.title}</strong> - status: {r.status}
          <p>{r.description}</p>
          {NEXT[r.status].map((s) => (
            <button key={s} onClick={() => update(r.crId, s)} style={{ marginRight: 8 }}>
              {s === 'In Progress' ? 'Start' : 'Mark ' + s}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
