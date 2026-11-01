const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { logAction } = require('../utils/audit');

// Allowed moves: Approved/Scheduled -> In Progress -> Completed or Failed
const FLOW = {
  Approved: ['In Progress'],
  Scheduled: ['In Progress'],
  'In Progress': ['Completed', 'Failed'],
};

// PATCH /change-requests/:id/status  { status, notes? }  (Implementer only)  CM-F-041
router.patch('/change-requests/:id/status', authenticate, requireRole('Implementer'), (req, res) => {
  const { status, notes } = req.body || {};
  if (!['In Progress', 'Completed', 'Failed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid input: status must be In Progress, Completed or Failed' });
  }
  const cr = db.prepare('SELECT id, status FROM change_requests WHERE id = ?').get(req.params.id);
  if (!cr) return res.status(404).json({ error: 'Not found' });
  if (!(FLOW[cr.status] || []).includes(status)) {
    return res.status(409).json({ error: 'Cannot change status from ' + cr.status + ' to ' + status });
  }

  const note = notes && String(notes).trim() ? String(notes).trim() : null;
  db.prepare('UPDATE change_requests SET status = ?, notes = COALESCE(?, notes) WHERE id = ?').run(status, note, cr.id);
  logAction(req.user.id, 'CR status ' + status, cr.id);

  res.json({ crId: cr.id, status });
});

module.exports = router;
