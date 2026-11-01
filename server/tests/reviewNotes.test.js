// TC-Impl-02: review notes saved on the CR (CM-F-042)
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
  const r = await call("POST", "/change-requests", tokens.requester, { title: "Test CR", description: "desc", priority: "Low", riskLevel: "Low" });
  return r.json.crId;
}

test('TC-Impl-02: implementer saves review notes on a Completed CR', async () => {
  const id = await newCR();
  // not finished yet -> 409
  assert.strictEqual((await call('POST', `/change-requests/${id}/review-notes`, tokens.implementer, { notes: 'x' })).status, 409);
  db.prepare("UPDATE change_requests SET status = 'Completed' WHERE id = ?").run(id);

  assert.strictEqual((await call('POST', `/change-requests/${id}/review-notes`, tokens.requester, { notes: 'x' })).status, 403);
  assert.strictEqual((await call('POST', `/change-requests/${id}/review-notes`, tokens.implementer, {})).status, 400);

  const saved = await call('POST', `/change-requests/${id}/review-notes`, tokens.implementer, { notes: 'Went smoothly' });
  assert.strictEqual(saved.status, 200);

  const list = await call('GET', '/review-notes', tokens.cab);
  assert.match(list.json.find((c) => c.crId === id).notes, /Went smoothly/);
});
