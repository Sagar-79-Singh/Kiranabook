const { getPool } = require('./_db');
const { requireAuth, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const user = requireAuth(req, res); if (!user) return;
  if (req.method !== 'POST') return res.status(405).end();

  const { type, party_id, amount, date, notes } = req.body;
  if (!party_id || !amount || !type) return res.status(400).json({ error: 'Required fields missing' });

  const pool = getPool();
  const amt = parseFloat(amount);

  try {
    if (type === 'received') {
      // Customer ne paisa diya — balance kam karo
      const [[c]] = await pool.query(`SELECT balance FROM customers WHERE id=?`, [party_id]);
      const newBal = (parseFloat(c.balance) || 0) - amt;
      await pool.query(`UPDATE customers SET balance=? WHERE id=?`, [newBal, party_id]);
      await pool.query(
        `INSERT INTO ledger_entries (entry_date,party_type,party_id,entry_type,debit,credit,balance,notes) VALUES (?,?,?,?,?,?,?,?)`,
        [date, 'customer', party_id, 'payment_received', 0, amt, newBal, notes||null]
      );
    } else {
      // Humne supplier ko diya — balance kam karo
      const [[s]] = await pool.query(`SELECT balance FROM suppliers WHERE id=?`, [party_id]);
      const newBal = (parseFloat(s.balance) || 0) - amt;
      await pool.query(`UPDATE suppliers SET balance=? WHERE id=?`, [newBal, party_id]);
      await pool.query(
        `INSERT INTO ledger_entries (entry_date,party_type,party_id,entry_type,debit,credit,balance,notes) VALUES (?,?,?,?,?,?,?,?)`,
        [date, 'supplier', party_id, 'payment_made', amt, 0, newBal, notes||null]
      );
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
};
