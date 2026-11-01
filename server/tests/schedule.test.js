// TC-Sched-01: blackout dates are blocked (CM-F-040)
process.env.DB_FILE = ':memory:';
const test = require("node:test");
const assert = require("node:assert");
const app = require("../server");
const db = require("../db");

let server, base;
const tokens = {};
async function call(method, path, token, body) {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
test.before(async () => {
  server = app.listen(0);
  base = "http://localhost:" + server.address().port;
  for (const [u, p] of [["requester", "requester123"], ["cab", "cab123"], ["implementer", "impl123"]]) {
    tokens[u] = (await call("POST", "/login", null, { username: u, password: p })).json.token;
  }
});
test.after(() => server.close());
async function newCR() {
  // inserted directly so these tests do not depend on routes that are not merged yet
  return db
    .prepare("INSERT INTO change_requests (title, description, priority, riskLevel, status, requesterId) VALUES ('Test CR', 'desc', 'Low', 'Low', 'Submitted', 1)")
    .run().lastInsertRowid;
}

test('TC-Sched-01: CAB schedules an approved CR; blackout date is blocked', async () => {
  const id = await newCR();
  // cannot schedule before approval
  assert.strictEqual((await call('PATCH', `/change-requests/${id}/schedule`, tokens.cab, { date: '2026-11-20' })).status, 409);
  await call('POST', `/change-requests/${id}/decision`, tokens.cab, { decision: 'Approve', comments: 'OK' });

  assert.strictEqual((await call('PATCH', `/change-requests/${id}/schedule`, tokens.requester, { date: '2026-11-20' })).status, 403);
  assert.strictEqual((await call('PATCH', `/change-requests/${id}/schedule`, tokens.cab, { date: 'tomorrow' })).status, 400);

  const blocked = await call('PATCH', `/change-requests/${id}/schedule`, tokens.cab, { date: '2026-12-25' });
  assert.strictEqual(blocked.status, 409);
  assert.match(blocked.json.error, /Blackout/);

  const ok = await call('PATCH', `/change-requests/${id}/schedule`, tokens.cab, { date: '2026-11-20' });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(ok.json.status, 'Scheduled');

  const cal = await call('GET', '/calendar', tokens.requester);
  assert.ok(cal.json.some((c) => c.crId === id && c.scheduledDate === '2026-11-20'));
});
