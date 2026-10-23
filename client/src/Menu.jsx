// Role-based menu: each role only sees the pages listed for it (CM-F-002).
export default function Menu({ pages, user, current, onSelect, onLogout }) {
  const visible = pages.filter((p) => !p.roles || p.roles.includes(user.role));
  return (
    <nav style={{ display: 'flex', gap: 8, padding: 12, borderBottom: '1px solid #ccc', alignItems: 'center' }}>
      <strong>CMS</strong>
      {visible.map((p) => (
        <button key={p.id} onClick={() => onSelect(p.id)} disabled={current === p.id}>
          {p.title}
        </button>
      ))}
      <span style={{ marginLeft: 'auto' }}>
        {user.username} ({user.role})
      </span>
      <button onClick={onLogout}>Logout</button>
    </nav>
  );
}
