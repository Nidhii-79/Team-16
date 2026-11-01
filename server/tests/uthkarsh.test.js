// Tests for CM-F-031 (request more info), CM-F-041 (implementation status), CM-NF-003 (audit log)
process.env.DB_FILE = ':memory:';
const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

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
  for (const [u, p] of [['requester', 'requester123'], ['cab', 'cab123'], ['implementer', 'impl123'], ['admin', 'admin123']]) {
    tokens[u] = (await call('POST', '/login', null, { username: u, password: p })).json.token;
  }
});
test.after(() => server.close());

test('CM-F-031: CAB sends a CR back, requester resubmits', async () => {
  const created = await call('POST', '/change-requests', tokens.requester, {
    title: 'Patch server', description: 'Apply OS patch', priority: 'Medium', riskLevel: 'Low',
  });
  assert.strictEqual(created.status, 201);
  const id = created.json.crId;

  // requester cannot ask for info; CAB must give a comment
  assert.strictEqual((await call('POST', `/change-requests/${id}/request-info`, tokens.requester, { comments: 'x' })).status, 403);
  assert.strictEqual((await call('POST', `/change-requests/${id}/request-info`, tokens.cab, {})).status, 400);

  const asked = await call('POST', `/change-requests/${id}/request-info`, tokens.cab, { comments: 'Which server?' });
  assert.strictEqual(asked.status, 200);
  assert.strictEqual(asked.json.status, 'Info Requested');

  const waiting = await call('GET', '/change-requests/info-requested', tokens.requester);
  assert.strictEqual(waiting.json[0].question, 'Which server?');

  assert.strictEqual((await call('POST', `/change-requests/${id}/resubmit`, tokens.requester, {})).status, 400);
  const again = await call('POST', `/change-requests/${id}/resubmit`, tokens.requester, { details: 'Server DB-01' });
  assert.strictEqual(again.json.status, 'Submitted');
});

test('CM-F-041: implementer moves an approved CR to Completed', async () => {
  const created = await call('POST', '/change-requests', tokens.requester, {
    title: 'Upgrade DB', description: 'Upgrade to v2', priority: 'High', riskLevel: 'High', rollbackPlan: 'Restore backup',
  });
  const id = created.json.crId;

  // cannot start before approval
  assert.strictEqual((await call('PATCH', `/change-requests/${id}/status`, tokens.implementer, { status: 'In Progress' })).status, 409);
  await call('POST', `/change-requests/${id}/decision`, tokens.cab, { decision: 'Approve', comments: 'OK' });

  // wrong role and bad status are rejected
  assert.strictEqual((await call('PATCH', `/change-requests/${id}/status`, tokens.requester, { status: 'In Progress' })).status, 403);
  assert.strictEqual((await call('PATCH', `/change-requests/${id}/status`, tokens.implementer, { status: 'Done' })).status, 400);

  assert.strictEqual((await call('PATCH', `/change-requests/${id}/status`, tokens.implementer, { status: 'In Progress' })).json.status, 'In Progress');
  assert.strictEqual((await call('PATCH', `/change-requests/${id}/status`, tokens.implementer, { status: 'Completed' })).json.status, 'Completed');

  const list = await call('GET', '/change-requests', tokens.requester);
  assert.strictEqual(list.json.find((c) => c.crId === id).status, 'Completed');
});

test('CM-NF-003: audit log records actions and only Admin can read it', async () => {
  assert.strictEqual((await call('GET', '/audit-log', tokens.requester)).status, 403);
  assert.strictEqual((await call('GET', '/audit-log')).status, 401);
  const log = await call('GET', '/audit-log', tokens.admin);
  assert.strictEqual(log.status, 200);
  const actions = log.json.map((r) => r.action);
  for (const a of ['CR submitted', 'CR info requested', 'CR resubmitted', 'CR approved', 'CR status In Progress', 'CR status Completed']) {
    assert.ok(actions.includes(a), 'missing audit action: ' + a);
  }
  assert.ok(log.json.every((r) => r.username && r.time));
});
