process.env.DB_FILE = ':memory:';
const test = require('node:test');
const assert = require('node:assert');
const { hashPassword, checkPassword } = require('../utils/password');
const db = require('../db');

test('TC-Sec-01: hash is not the plain password and verifies correctly', () => {
  const h = hashPassword('abc123');
  assert.notStrictEqual(h, 'abc123');
  assert.ok(checkPassword('abc123', h));
  assert.ok(!checkPassword('wrong', h));
});

test('TC-Sec-01: database holds only bcrypt hashes', () => {
  const rows = db.prepare('SELECT passwordHash FROM users').all();
  assert.ok(rows.length >= 4);
  rows.forEach((r) => assert.match(r.passwordHash, /^\$2[aby]\$/));
});
