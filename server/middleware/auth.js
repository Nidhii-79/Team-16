const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Checks the login token on every protected endpoint.
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET); // { id, username, role }
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { authenticate, SECRET };
