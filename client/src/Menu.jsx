import { icon } from './Dashboard';

// Role-based menu: each role only sees the pages listed for it (CM-F-002).
export default function Menu({ pages, user, current, onSelect, onLogout }) {
  const visible = pages.filter((p) => !p.roles || p.roles.includes(user.role));
  return (
    <nav className="topbar">
      <span className="brand">CMS</span>
      {visible.map((p) => (
        <button key={p.id} className={'tab' + (current === p.id ? ' active' : '')} onClick={() => onSelect(p.id)}>
          {icon(p.title)} {p.title}
        </button>
      ))}
      <span className="who">
        <span className="chip">{user.username} · {user.role}</span>
        <button className="ghost" onClick={onLogout}>Logout</button>
      </span>
    </nav>
  );
}
