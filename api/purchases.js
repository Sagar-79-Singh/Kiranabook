const { getPool } = require('./_db');
const { requireAuth, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const user = requireAuth(req, res); if (!user) return;
  const pool = getPool();

  try {
    // GET — list purchases
    if (req.method === 'GET') {
      const { from, to } = req.query;
      let q = `SELECT p.*, s.name AS supplier_display
               FROM purchases p
               LEFT JOIN suppliers s ON p.supplier_id = s.id
               WHERE 1=1`;
      const params = [];
      if (from) { q += ' AND p.purchase_date >= ?'; params.push(from); }
      if (to)   { q += ' AND p.purchase_date <= ?'; params.push(to); }
      q += ' ORDER BY p.purchase_date DESC, p.id DESC';
      const [rows] = await pool.query(q, params);
      return res.json(rows);
    }

    // DELETE — admin only
    if (req.method === 'DELETE') {
      if (user.role !== 'admin') return res.status(403).json({ error: 'Sirf admin delete kar sakta hai' });
      await pool.query(`DELETE FROM purchase_items WHERE purchase_id=?`, [req.query.id]);
      await pool.query(`DELETE FROM purchases WHERE id=?`, [req.query.id]);
      return res.json({ ok: true });
    }

    // POST — new purchase
    if (req.method === 'POST') {
      const { purchase_date, supplier_id, supplier_name, items, paid_amount, notes } = req.body;
      if (!items || !items.length) return res.status(400).json({ error: 'Koi item nahi' });

      const total = items.reduce((s, i) => s + (i.qty * i.rate), 0);
      const paid  = parseFloat(paid_amount) || 0;
      const mode  = paid >= total ? 'cash' : paid > 0 ? 'partial' : 'credit';

      // Insert purchase — supplier_id stored but no FK constraint
      const [pr] = await pool.query(
        `INSERT INTO purchases (purchase_date,supplier_id,supplier_name,total_amount,paid_amount,payment_mode,notes) VALUES (?,?,?,?,?,?,?)`,
        [purchase_date, supplier_id||null, supplier_name||null, total, paid, mode, notes||null]
      );
      const purchaseId = pr.insertId;

      // Insert items + update stock
      for (const item of items) {
        await pool.query(
          `INSERT INTO purchase_items (purchase_id,item_id,item_name,qty,unit_name,rate) VALUES (?,?,?,?,?,?)`,
          [purchaseId, item.item_id||null, item.item_name, item.qty, item.unit_name||'', item.rate]
        );
        if (item.item_id) {
          await pool.query(`UPDATE items SET current_stock = current_stock + ? WHERE id=?`, [item.qty, item.item_id]);
        }
      }

      // Ledger entry if supplier selected
      if (supplier_id) {
        const [[s]] = await pool.query(`SELECT balance FROM suppliers WHERE id=?`, [supplier_id]);
        const newBal = (parseFloat(s.balance) || 0) + (total - paid);
        await pool.query(`UPDATE suppliers SET balance=? WHERE id=?`, [newBal, supplier_id]);
        await pool.query(
          `INSERT INTO ledger_entries (entry_date,party_type,party_id,entry_type,reference_id,debit,credit,balance,notes) VALUES (?,?,?,?,?,?,?,?,?)`,
          [purchase_date, 'supplier', supplier_id, 'purchase', purchaseId, paid, total, newBal, notes||null]
        );
      }

      return res.json({ id: purchaseId, total });
    }

    res.status(405).end();
  } catch(e) { res.status(500).json({ error: e.message }); }
};
