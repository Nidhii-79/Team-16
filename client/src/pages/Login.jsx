import { useState } from 'react';
import { api, saveSession } from '../api';

export const page = { id: 'login', title: 'Login' };

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
    <form onSubmit={submit} style={{ maxWidth: 320, margin: '60px auto', display: 'grid', gap: 8 }}>
      <h2>Change Management Software</h2>
      <label>Username <input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
      <label>Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <button type="submit">Login</button>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
    </form>
  );
}
