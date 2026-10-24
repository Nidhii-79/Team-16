// Role check on the server (CM-SR-003). Use after authenticate:
//   router.post('/x', authenticate, requireRole('CAB'), handler)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireRole };
