const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { logAction } = require('../utils/audit');

// POST /change-requests/:id/request-info  { comments }  (CAB only)  CM-F-031
// Sends a Submitted change request back to the requester asking for more information.
router.post('/change-requests/:id/request-info', authenticate, requireRole('CAB'), (req, res) => {
  const { comments } = req.body || {};
  if (!comments || !String(comments).trim()) {
    return res.status(400).json({ error: 'Invalid input: say what information is needed' });
  }
  const cr = db.prepare('SELECT id, status FROM change_requests WHERE id = ?').get(req.params.id);
  if (!cr) return res.status(404).json({ error: 'Not found' });
  if (cr.status !== 'Submitted') {
    return res.status(409).json({ error: 'Only a Submitted request can be sent back for more information' });
  }

  db.prepare("UPDATE change_requests SET status = 'Info Requested' WHERE id = ?").run(cr.id);
  db.prepare('INSERT INTO approvals (crId, approverId, decision, comments, time) VALUES (?, ?, ?, ?, ?)')
    .run(cr.id, req.user.id, 'Info Requested', String(comments).trim(), new Date().toISOString());
  logAction(req.user.id, 'CR info requested', cr.id);

  res.json({ crId: cr.id, status: 'Info Requested' });
});

// GET /change-requests/info-requested  (Requester only)
// The requester's own CRs that are waiting for more information, with the CAB question.
router.get('/change-requests/info-requested', authenticate, requireRole('Requester'), (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.id AS crId, c.title, c.description, c.rollbackPlan,
        (SELECT a.comments FROM approvals a
          WHERE a.crId = c.id AND a.decision = 'Info Requested' ORDER BY a.id DESC LIMIT 1) AS question
       FROM change_requests c
       WHERE c.requesterId = ? AND c.status = 'Info Requested'
       ORDER BY c.id DESC`
    )
    .all(req.user.id);
  res.json(rows);
});

// POST /change-requests/:id/resubmit  { details }  (Requester, own CR only)
// Adds the extra information and puts the CR back to Submitted for the CAB.
router.post('/change-requests/:id/resubmit', authenticate, requireRole('Requester'), (req, res) => {
  const { details } = req.body || {};
  if (!details || !String(details).trim()) {
    return res.status(400).json({ error: 'Invalid input: please add the requested information' });
  }
  const cr = db.prepare('SELECT id, description, status, requesterId FROM change_requests WHERE id = ?').get(req.params.id);
  if (!cr) return res.status(404).json({ error: 'Not found' });
  if (cr.requesterId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (cr.status !== 'Info Requested') {
    return res.status(409).json({ error: 'This request is not waiting for more information' });
  }

  const description = cr.description + '\n\nAdditional information: ' + String(details).trim();
  db.prepare("UPDATE change_requests SET description = ?, status = 'Submitted' WHERE id = ?").run(description, cr.id);
  logAction(req.user.id, 'CR resubmitted', cr.id);

  res.json({ crId: cr.id, status: 'Submitted' });
});

module.exports = router;
