import { useState } from 'react';
import { api, saveSession } from '../api';

export const page = { id: 'login', title: 'Login' };

// Demo accounts from the README - click one to fill the form.
const DEMO = [
  ['Requester', 'requester', 'requester123'],
  ['CAB', 'cab', 'cab123'],
  ['Implementer', 'implementer', 'impl123'],
  ['Admin', 'admin', 'admin123'],
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/login', { username, password });
      saveSession(data);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="login-card">
        <h2>Change Management Software</h2>
        <p className="sub">Sign in to continue</p>
        <label>Username <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus /></label>
        <label>Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
        <p className="sub">Demo accounts (click to fill):</p>
        <div className="demo">
          {DEMO.map(([label, u, p]) => (
            <button type="button" key={u} className="ghost" onClick={() => { setUsername(u); setPassword(p); }}>{label}</button>
          ))}
        </div>
      </form>
    </div>
  );
}
