// TC-Notif-01: in-app notification on status change (CM-F-050)
process.env.DB_FILE = ':memory:';
const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');
const db = require('../db');
const { logAction } = require('../utils/audit');

let server, base;
const tokens = {};
async function call(method, path, token, body) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
test.before(async () => {
  server = app.listen(0);
  base = 'http://localhost:' + server.address().port;
  for (const [u, p] of [['requester', 'requester123'], ['cab', 'cab123'], ['implementer', 'impl123']]) {
    tokens[u] = (await call('POST', '/login', null, { username: u, password: p })).json.token;
  }
});
test.after(() => server.close());

test('TC-Notif-01: requester is notified when the CAB approves; others are not', async () => {
  const requesterId = db.prepare("SELECT id FROM users WHERE username = 'requester'").get().id;
  const id = db
    .prepare("INSERT INTO change_requests (title, description, priority, riskLevel, status, requesterId) VALUES ('Patch server', 'desc', 'Low', 'Low', 'Submitted', ?)")
    .run(requesterId).lastInsertRowid;

  assert.strictEqual((await call('GET', '/notifications')).status, 401);

  await call('POST', `/change-requests/${id}/decision`, tokens.cab, { decision: 'Approve', comments: 'OK' });

  const mine = await call('GET', '/notifications', tokens.requester);
  assert.strictEqual(mine.status, 200);
  assert.ok(mine.json.some((n) => n.crId === id && /approved/.test(n.message) && !n.isRead));

  assert.strictEqual((await call('GET', '/notifications', tokens.implementer)).json.length, 0);

  await call('POST', '/notifications/read-all', tokens.requester);
  const after = await call('GET', '/notifications', tokens.requester);
  assert.ok(after.json.every((n) => n.isRead === 1));
});

test('TC-Notif-01: CAB is notified when a request is submitted', async () => {
  const id = db
    .prepare("INSERT INTO change_requests (title, description, priority, riskLevel, status, requesterId) VALUES ('Upgrade DB', 'desc', 'Low', 'Low', 'Submitted', 1)")
    .run().lastInsertRowid;
  logAction(1, 'CR submitted', id);
  const cab = await call('GET', '/notifications', tokens.cab);
  assert.ok(cab.json.some((n) => n.crId === id && /waiting for review/.test(n.message)));
});
