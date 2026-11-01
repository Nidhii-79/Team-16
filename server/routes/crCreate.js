const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { logAction } = require('../utils/audit');

const LEVELS = ['Low', 'Medium', 'High'];

// POST /change-requests  (Requester only)
// CM-F-010 submit, CM-F-020 risk level, CM-F-021 rollback plan required when risk is High
router.post('/change-requests', authenticate, requireRole('Requester'), (req, res) => {
  const { title, description, priority, riskLevel, rollbackPlan } = req.body || {};

  if (!title || !String(title).trim() || !description || !String(description).trim()) {
    return res.status(400).json({ error: 'Invalid input: title and description are required' });
  }
  if (!LEVELS.includes(priority)) return res.status(400).json({ error: 'Invalid input: priority must be Low, Medium or High' });
  if (!LEVELS.includes(riskLevel)) return res.status(400).json({ error: 'Invalid input: risk level must be Low, Medium or High' });
  if (riskLevel === 'High' && !(rollbackPlan && String(rollbackPlan).trim())) {
    return res.status(400).json({ error: 'Rollback plan required for High risk' });
  }

  const info = db
    .prepare(`INSERT INTO change_requests (title, description, priority, riskLevel, rollbackPlan, status, requesterId)
              VALUES (?, ?, ?, ?, ?, 'Submitted', ?)`)
    .run(String(title).trim(), String(description).trim(), priority, riskLevel, rollbackPlan ? String(rollbackPlan).trim() : null, req.user.id);

  logAction(req.user.id, 'CR submitted', info.lastInsertRowid);
  res.status(201).json({ crId: info.lastInsertRowid, status: 'Submitted' });
});

module.exports = router;
