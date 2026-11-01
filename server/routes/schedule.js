const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { logAction } = require('../utils/audit');

// Blackout dates = days when no change may be scheduled (CM-F-040)
db.exec('CREATE TABLE IF NOT EXISTS blackout_dates (date TEXT PRIMARY KEY, reason TEXT)');
const seed = db.prepare('INSERT OR IGNORE INTO blackout_dates (date, reason) VALUES (?, ?)');
seed.run('2026-11-27', 'Month-end freeze');
seed.run('2026-12-25', 'Christmas freeze');
seed.run('2026-12-31', 'Year-end freeze');

const isRealDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;

// PATCH /change-requests/:id/schedule  { date: 'YYYY-MM-DD' }  (CAB only)
router.patch('/change-requests/:id/schedule', authenticate, requireRole('CAB'), (req, res) => {
  const date = String((req.body || {}).date || '');
  if (!isRealDate(date)) return res.status(400).json({ error: 'Invalid input: date must look like 2026-11-20' });

  const cr = db.prepare('SELECT id, status FROM change_requests WHERE id = ?').get(req.params.id);
  if (!cr) return res.status(404).json({ error: 'Not found' });
  if (!['Approved', 'Scheduled'].includes(cr.status)) {
    return res.status(409).json({ error: 'Only an approved change request can be scheduled' });
  }

  const blackout = db.prepare('SELECT reason FROM blackout_dates WHERE date = ?').get(date);
  if (blackout) return res.status(409).json({ error: 'Blackout date: ' + blackout.reason });

  db.prepare("UPDATE change_requests SET scheduledDate = ?, status = 'Scheduled' WHERE id = ?").run(date, cr.id);
  logAction(req.user.id, 'CR scheduled', cr.id);
  res.json({ crId: cr.id, status: 'Scheduled', scheduledDate: date });
});

// GET /calendar - all scheduled changes in date order (any logged-in user)
router.get('/calendar', authenticate, (req, res) => {
  const rows = db
    .prepare('SELECT id AS crId, title, status, scheduledDate FROM change_requests WHERE scheduledDate IS NOT NULL ORDER BY scheduledDate, id')
    .all();
  res.json(rows);
});

// GET /blackout-dates
router.get('/blackout-dates', authenticate, (req, res) => {
  res.json(db.prepare('SELECT date, reason FROM blackout_dates ORDER BY date').all());
});

module.exports = router;
