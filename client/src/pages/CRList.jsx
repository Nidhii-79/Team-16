import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'list', title: 'Change Requests' };

export default function CRList() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/change-requests').then(setRows).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h2>Change Requests</h2>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && !error && <p>No change requests yet.</p>}
      {rows.length > 0 && (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>ID</th><th>Title</th><th>Priority</th><th>Risk</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.crId}>
                <td>{r.crId}</td><td>{r.title}</td><td>{r.priority}</td><td>{r.riskLevel}</td><td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
