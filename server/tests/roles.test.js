const test = require('node:test');
const assert = require('node:assert');
const { requireRole } = require('../middleware/requireRole');

function run(role, allowed) {
  let status = null;
  let called = false;
  const res = { status(c) { status = c; return this; }, json() { return this; } };
  requireRole(...allowed)({ user: { role } }, res, () => { called = true; });
  return { status, called };
}

test('TC-Sec-02: allowed role passes', () => {
  assert.deepStrictEqual(run('CAB', ['CAB']), { status: null, called: true });
});

test('TC-Sec-02: wrong role gets 403', () => {
  assert.deepStrictEqual(run('Requester', ['CAB']), { status: 403, called: false });
});
