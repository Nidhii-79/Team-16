const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

// GET /audit-log  (Admin only)  CM-NF-003
// Every action on a change request is stored by logAction (user, action, CR, time).
router.get('/audit-log', authenticate, requireRole('Admin'), (req, res) => {
  const rows = db
    .prepare(
      `SELECT l.id, u.username, l.action, l.crId, l.time
       FROM audit_log l LEFT JOIN users u ON u.id = l.userId
       ORDER BY l.id DESC LIMIT 200`
    )
    .all();
  res.json(rows);
});

module.exports = router;
