const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Adds an "isRead" flag to the notifications table (safe to run many times)
try { db.exec('ALTER TABLE notifications ADD COLUMN isRead INTEGER DEFAULT 0'); } catch (e) { /* already there */ }

// GET /notifications - the logged-in user's own notifications, newest first (CM-F-050)
router.get('/notifications', authenticate, (req, res) => {
  const rows = db
    .prepare('SELECT id, crId, message, time, isRead FROM notifications WHERE userId = ? ORDER BY id DESC LIMIT 100')
    .all(req.user.id);
  res.json(rows);
});

// POST /notifications/read-all - mark the user's notifications as read
router.post('/notifications/read-all', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
