const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { logAction } = require('../utils/audit');

// POST /change-requests/:id/decision  { decision: 'Approve' | 'Reject', comments }  (CAB only)  CM-F-030
router.post('/change-requests/:id/decision', authenticate, requireRole('CAB'), (req, res) => {
  const { decision, comments } = req.body || {};
  if (!['Approve', 'Reject'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid input: decision must be Approve or Reject' });
  }
  if (!comments || !String(comments).trim()) {
    return res.status(400).json({ error: 'Invalid input: a comment is required' });
  }
  const cr = db.prepare('SELECT id FROM change_requests WHERE id = ?').get(req.params.id);
  if (!cr) return res.status(404).json({ error: 'Not found' });

  const status = decision === 'Approve' ? 'Approved' : 'Rejected';
  db.prepare('UPDATE change_requests SET status = ? WHERE id = ?').run(status, cr.id);
  db.prepare('INSERT INTO approvals (crId, approverId, decision, comments, time) VALUES (?, ?, ?, ?, ?)')
    .run(cr.id, req.user.id, decision, String(comments).trim(), new Date().toISOString());
  logAction(req.user.id, 'CR ' + status.toLowerCase(), cr.id);

  res.json({ crId: cr.id, status });
});

module.exports = router;
