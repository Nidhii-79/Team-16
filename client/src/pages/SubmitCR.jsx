import { useState } from 'react';
import { api } from '../api';

export const page = { id: 'submit', title: 'Submit Change Request', roles: ['Requester'] };

const empty = { title: '', description: '', priority: 'Medium', riskLevel: 'Low', rollbackPlan: '' };

export default function SubmitCR() {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const d = await api.post('/change-requests', form);
      setMsg('Change request #' + d.crId + ' submitted (status: ' + d.status + ')');
      setForm(empty);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 480, display: 'grid', gap: 8 }}>
      <h2>Submit a Change Request</h2>
      <label>Title <input value={form.title} onChange={set('title')} /></label>
      <label>Description <textarea value={form.description} onChange={set('description')} /></label>
      <label>Priority
        <select value={form.priority} onChange={set('priority')}>
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
      </label>
      <label>Risk level
        <select value={form.riskLevel} onChange={set('riskLevel')}>
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
      </label>
      <label>Rollback plan {form.riskLevel === 'High' ? '(required for High risk)' : '(optional)'}
        <textarea value={form.rollbackPlan} onChange={set('rollbackPlan')} />
      </label>
      <button type="submit">Submit</button>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
    </form>
  );
}
