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
  const r = await call("POST", "/change-requests", tokens.requester, { title: "Test CR", description: "desc", priority: "Low", riskLevel: "Low" });
  return r.json.crId;
}

test('TC-Perf-01: 95th percentile response time is 3 seconds or less', async () => {
  const paths = ['/health', '/change-requests', '/calendar', '/review-notes'];
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
