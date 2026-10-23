const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { checkPassword } = require('../utils/password');
const { SECRET } = require('../middleware/auth');

// POST /login  { username, password } -> { token, role, username }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username || ''));
  if (!user || !checkPassword(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '8h' });
  res.json({ token, role: user.role, username: user.username });
});

module.exports = router;
