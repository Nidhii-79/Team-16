const db = require('../db');

// What the requester is told when a change request changes status (CM-F-050)
const REQUESTER_MESSAGES = {
  'CR approved': 'was approved',
  'CR rejected': 'was rejected',
  'CR info requested': 'needs more information from you',
  'CR scheduled': 'has been scheduled',
  'CR status In Progress': 'is now In Progress',
  'CR status Completed': 'was completed',
  'CR status Failed': 'failed',
};

function notify(userId, crId, message) {
  db.prepare('INSERT INTO notifications (userId, crId, message, time) VALUES (?, ?, ?, ?)')
    .run(userId, crId, message, new Date().toISOString());
}

// Records who did what (and on which change request) and when.
// Also creates the in-app notifications for status changes.
function logAction(userId, action, crId = null) {
  db.prepare('INSERT INTO audit_log (userId, action, crId, time) VALUES (?, ?, ?, ?)')
    .run(userId, action, crId, new Date().toISOString());

  if (!crId) return;
  const cr = db.prepare('SELECT title, requesterId FROM change_requests WHERE id = ?').get(crId);
  if (!cr) return;

  const verb = REQUESTER_MESSAGES[action];
  if (verb && cr.requesterId) {
    notify(cr.requesterId, crId, 'Your change request #' + crId + ' “' + cr.title + '” ' + verb + '.');
  }
  if (action === 'CR submitted' || action === 'CR resubmitted') {
    db.prepare("SELECT id FROM users WHERE role = 'CAB'").all()
      .forEach((u) => notify(u.id, crId, 'Change request #' + crId + ' “' + cr.title + '” is waiting for review.'));
  }
}

module.exports = { logAction };
