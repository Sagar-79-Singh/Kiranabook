// ONE-TIME user setup — proper bcrypt hashes banata hai
// Visit: https://yourapp.vercel.app/api/setup?key=kiranabook_setup_2024
// Iske baad delete karo ya rename karo

const bcrypt = require('bcryptjs');
const { getPool } = require('./_db');
const { cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.query.key !== 'kiranabook_setup_2024') {
    return res.status(403).json({ error: 'Invalid key' });
  }
  try {
    const pool = getPool();
    const ah = await bcrypt.hash('admin123', 10);
    const dh = await bcrypt.hash('dad123', 10);
    await pool.query(
      `INSERT INTO users (username,password_hash,role) VALUES (?,?,'admin') ON DUPLICATE KEY UPDATE password_hash=?`,
      ['admin', ah, ah]
    );
    await pool.query(
      `INSERT INTO users (username,password_hash,role) VALUES (?,?,'user') ON DUPLICATE KEY UPDATE password_hash=?`,
      ['dad', dh, dh]
    );
    res.json({
      success: true,
      message: 'Users ready! Ab login karo.',
      users: [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'dad',   password: 'dad123',   role: 'user'  }
      ]
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
};
