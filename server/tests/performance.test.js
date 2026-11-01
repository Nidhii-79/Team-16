// TC-Perf-01: 95% of requests respond within 3 seconds (CM-NF-001)
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

test('TC-Perf-01: 95th percentile response time is 3 seconds or less', async () => {
  const paths = ['/health', '/calendar', '/review-notes', '/blackout-dates'];
  const times = [];
  for (let i = 0; i < 40; i++) {
    const start = Date.now();
    const r = await call('GET', paths[i % paths.length], tokens.cab);
    times.push(Date.now() - start);
    assert.strictEqual(r.status, 200);
  }
  times.sort((a, b) => a - b);
  const p95 = times[Math.ceil(times.length * 0.95) - 1];
  console.log('Requests: ' + times.length + ', slowest: ' + times[times.length - 1] + ' ms, 95th percentile: ' + p95 + ' ms (limit 3000 ms)');
  assert.ok(p95 <= 3000);
});
