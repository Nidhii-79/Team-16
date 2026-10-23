const Database = require('better-sqlite3');
const path = require('path');
const { hashPassword } = require('./utils/password');

const db = new Database(process.env.DB_FILE || path.join(__dirname, 'cms.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS change_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT,
  riskLevel TEXT,
  rollbackPlan TEXT,
  status TEXT NOT NULL DEFAULT 'Submitted',
  scheduledDate TEXT,
  notes TEXT,
  requesterId INTEGER
);
CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crId INTEGER, approverId INTEGER, decision TEXT, comments TEXT, time TEXT
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER, crId INTEGER, message TEXT, time TEXT
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER, action TEXT, crId INTEGER, time TEXT
);
`);

// Seeded users (passwords are stored hashed)
const seed = [
  ['requester', 'requester123', 'Requester'],
  ['cab', 'cab123', 'CAB'],
  ['implementer', 'impl123', 'Implementer'],
  ['admin', 'admin123', 'Admin'],
];
const insert = db.prepare('INSERT OR IGNORE INTO users (username, passwordHash, role) VALUES (?, ?, ?)');
seed.forEach(([u, p, r]) => insert.run(u, hashPassword(p), r));

module.exports = db;
