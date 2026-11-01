const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { logAction } = require('../utils/audit');

// POST /change-requests/:id/review-notes  { notes }  (Implementer only)  CM-F-042
// Adds a post-implementation review note to a Completed or Failed change request.
router.post('/change-requests/:id/review-notes', authenticate, requireRole('Implementer'), (req, res) => {
  const text = String((req.body || {}).notes || '').trim();
  if (!text) return res.status(400).json({ error: 'Invalid input: notes are required' });

  const cr = db.prepare('SELECT id, status, notes FROM change_requests WHERE id = ?').get(req.params.id);
  if (!cr) return res.status(404).json({ error: 'Not found' });
  if (!['Completed', 'Failed'].includes(cr.status)) {
    return res.status(409).json({ error: 'Review notes can only be added after the change is Completed or Failed' });
  }

  const line = 'Post-implementation review: ' + text;
  const notes = cr.notes ? cr.notes + '\n\n' + line : line;
  db.prepare('UPDATE change_requests SET notes = ? WHERE id = ?').run(notes, cr.id);
  logAction(req.user.id, 'CR review notes added', cr.id);
  res.json({ crId: cr.id, notes });
});

// GET /review-notes - Completed and Failed CRs with their notes (any logged-in user)
router.get('/review-notes', authenticate, (req, res) => {
  const rows = db
    .prepare("SELECT id AS crId, title, status, notes FROM change_requests WHERE status IN ('Completed', 'Failed') ORDER BY id DESC")
    .all();
  res.json(rows);
});

module.exports = router;
