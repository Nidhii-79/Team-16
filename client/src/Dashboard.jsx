import { useEffect, useState } from 'react';
import { api } from './api';

const STEPS = [
  { icon: '📝', title: 'Request', who: 'Requester', text: 'Describe the change, its risk and a rollback plan.' },
  { icon: '✅', title: 'Review', who: 'CAB', text: 'Approve, reject or ask for more information.' },
  { icon: '🗓️', title: 'Schedule', who: 'CAB', text: 'Pick a date that avoids blackout periods.' },
  { icon: '🛠️', title: 'Implement', who: 'Implementer', text: 'Carry out the change and update its status.' },
  { icon: '🔍', title: 'Review & log', who: 'Implementer / Admin', text: 'Write review notes; every action is logged.' },
];

const HINTS = {
  Requester: 'Submit change requests and follow their status.',
  CAB: 'Review, approve and schedule changes.',
  Implementer: 'Carry out approved changes and record how they went.',
  Admin: 'Oversee everything and read the audit log.',
};

const icon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('submit')) return '📝';
  if (t.includes('info')) return '💬';
  if (t.includes('approv')) return '✅';
  if (t.includes('schedul')) return '🗓️';
  if (t.includes('calendar')) return '📅';
  if (t.includes('implement')) return '🛠️';
  if (t.includes('review')) return '🗒️';
  if (t.includes('audit')) return '🔍';
  return '📋';
};
export { icon };

export default function Dashboard({ user, visible, onOpen }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api.get('/change-requests').then(setRows).catch(() => setRows([]));
  }, []);

  const count = (...s) => (rows || []).filter((r) => s.includes(r.status)).length;
  const stats = [
    { n: (rows || []).length, label: 'Total requests', cls: 'blue' },
    { n: count('Submitted', 'Info Requested'), label: 'Waiting for review', cls: 'amber' },
    { n: count('Approved', 'Scheduled', 'In Progress'), label: 'Approved / in flight', cls: 'violet' },
    { n: count('Completed'), label: 'Completed', cls: 'green' },
  ];

  return (
    <div>
      <div className="hero">
        <h2>Welcome, {user.username} 👋</h2>
        <p>{HINTS[user.role] || 'Pick an option to get started.'}</p>
        <p className="what">
          Change management means nobody changes a live IT system without approval, a plan and a record.
          This app runs that process from request to review.
        </p>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className={'stat ' + s.cls}>
            <div className="num">{rows === null ? '…' : s.n}</div>
            <div>{s.label}</div>
          </div>
        ))}
      </div>

      <h3>How a change moves through the system</h3>
      <div className="flow">
        {STEPS.map((s, i) => (
          <div key={s.title} className={'step' + (s.who.includes(user.role) ? ' mine' : '')}>
            <div className="ico">{s.icon}</div>
            <strong>{i + 1}. {s.title}</strong>
            <small>{s.who}</small>
            <span>{s.text}</span>
          </div>
        ))}
      </div>

      <h3>Your shortcuts</h3>
      <div className="tiles">
        {visible.map((p) => (
          <button key={p.id} className="tile" onClick={() => onOpen(p.id)}>
            <span className="ico">{icon(p.title)}</span> {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}
