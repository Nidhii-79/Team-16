import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'approvals', title: 'Approvals', roles: ['CAB'] };

export default function Approvals() {
  const [rows, setRows] = useState([]);
  const [comments, setComments] = useState({});
  const [error, setError] = useState('');

  const load = () =>
    api.get('/change-requests')
      .then((all) => setRows(all.filter((r) => r.status === 'Submitted')))
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  async function decide(id, decision) {
    setError('');
    try {
      await api.post('/change-requests/' + id + '/decision', { decision, comments: comments[id] || '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Pending Approvals</h2>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && <p>Nothing waiting for approval.</p>}
      {rows.map((r) => (
        <div key={r.crId} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, maxWidth: 520 }}>
          <strong>#{r.crId} {r.title}</strong> (Risk: {r.riskLevel}, Priority: {r.priority})
          <p>{r.description}</p>
          {r.rollbackPlan && <p>Rollback plan: {r.rollbackPlan}</p>}
          <input
            placeholder="Comment (required)"
            value={comments[r.crId] || ''}
            onChange={(e) => setComments({ ...comments, [r.crId]: e.target.value })}
          />{' '}
          <button onClick={() => decide(r.crId, 'Approve')}>Approve</button>{' '}
          <button onClick={() => decide(r.crId, 'Reject')}>Reject</button>
        </div>
      ))}
    </div>
  );
}
