const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /change-requests  (CM-F-012)
// Requesters see only their own CRs; CAB, Implementer and Admin see all.
router.get('/change-requests', authenticate, (req, res) => {
  const cols = 'id AS crId, title, description, priority, riskLevel, rollbackPlan, status';
  const rows =
    req.user.role === 'Requester'
      ? db.prepare(`SELECT ${cols} FROM change_requests WHERE requesterId = ? ORDER BY id DESC`).all(req.user.id)
      : db.prepare(`SELECT ${cols} FROM change_requests ORDER BY id DESC`).all();
  res.json(rows);
});

module.exports = router;
