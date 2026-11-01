import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'review', title: 'Review Notes', roles: ['Implementer'] };

export default function ReviewNotes() {
  const [rows, setRows] = useState([]);
  const [text, setText] = useState({});
  const [error, setError] = useState('');

  const load = () => api.get('/review-notes').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function save(id) {
    setError('');
    try {
      await api.post('/change-requests/' + id + '/review-notes', { notes: text[id] || '' });
      setText({ ...text, [id]: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Post-Implementation Review Notes</h2>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && <p>No completed or failed changes yet.</p>}
      {rows.map((r) => (
        <div key={r.crId} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, maxWidth: 520 }}>
          <strong>#{r.crId} {r.title}</strong> - {r.status}
          {r.notes && <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 6 }}>{r.notes}</pre>}
          <textarea
            placeholder="What went well / what went wrong?"
            value={text[r.crId] || ''}
            onChange={(e) => setText({ ...text, [r.crId]: e.target.value })}
            style={{ width: '100%' }}
          />
          <button onClick={() => save(r.crId)}>Save note</button>
        </div>
      ))}
    </div>
  );
}
