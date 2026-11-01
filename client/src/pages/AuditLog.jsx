import { useEffect, useState } from 'react';
import { api } from '../api';

export const page = { id: 'audit-log', title: 'Audit Log', roles: ['Admin'] };

export default function AuditLog() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/audit-log').then(setRows).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h2>Audit Log</h2>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows.length === 0 && !error && <p>No actions recorded yet.</p>}
      {rows.length > 0 && (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Time</th><th>User</th><th>Action</th><th>CR</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.time}</td><td>{r.username}</td><td>{r.action}</td><td>{r.crId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
