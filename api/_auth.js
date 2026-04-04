const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'kiranabook_secret';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function requireAuth(req, res) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!token) { res.status(401).json({ error: 'Login karo pehle' }); return null; }
  try { return jwt.verify(token, SECRET); }
  catch { res.status(401).json({ error: 'Session expire ho gaya, wapas login karo' }); return null; }
}

module.exports = { cors, requireAuth, SECRET };
