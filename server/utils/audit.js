const db = require('../db');

// Records who did what (and on which change request) and when.
function logAction(userId, action, crId = null) {
  db.prepare('INSERT INTO audit_log (userId, action, crId, time) VALUES (?, ?, ?, ?)')
    .run(userId, action, crId, new Date().toISOString());
}

module.exports = { logAction };
