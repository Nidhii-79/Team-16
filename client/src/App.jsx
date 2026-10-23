import { useState } from 'react';
import { getUser, clearSession } from './api';
import Menu from './Menu';

// Every file in /pages is picked up automatically. Each page exports:
//   export const page = { id, title, roles }  and a default React component.
const modules = import.meta.glob('./pages/*.jsx', { eager: true });
const all = Object.values(modules)
  .filter((m) => m.page)
  .map((m) => ({ ...m.page, Component: m.default }));

export default function App() {
  const [user, setUser] = useState(getUser());
  const [current, setCurrent] = useState(null);

  const login = all.find((p) => p.id === 'login');
  if (!user) {
    return login ? <login.Component onLogin={setUser} /> : <p>CMS is running. Login page not added yet.</p>;
  }

  const pages = all.filter((p) => p.id !== 'login');
  const page = pages.find((p) => p.id === current && (!p.roles || p.roles.includes(user.role)));

  function logout() {
    clearSession();
    setUser(null);
    setCurrent(null);
  }

  return (
    <div>
      <Menu pages={pages} user={user} current={current} onSelect={setCurrent} onLogout={logout} />
      <main style={{ padding: 16 }}>
        {page ? <page.Component user={user} /> : <p>Welcome, {user.username}. Pick an option from the menu.</p>}
      </main>
    </div>
  );
}
