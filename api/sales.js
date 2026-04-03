const { getPool } = require('./_db');
const { requireAuth, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const user = requireAuth(req, res); if (!user) return;
  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const { from, to } = req.query;
      let q = `SELECT s.*, c.name as customer_display FROM sales s LEFT JOIN customers c ON s.customer_id=c.id WHERE 1=1`;
      const p = [];
      if (from) { q += ' AND s.sale_date>=?'; p.push(from); }
      if (to)   { q += ' AND s.sale_date<=?'; p.push(to); }
      q += ' ORDER BY s.sale_date DESC, s.id DESC';
      const [rows] = await pool.query(q, p);
      return res.json(rows);
    }

    if (req.method === 'DELETE') {
      if (user.role !== 'admin') return res.status(403).json({ error: 'Sirf admin delete kar sakta hai' });
      await pool.query(`DELETE FROM sales WHERE id=?`, [req.query.id]);
      return res.json({ ok: true });
    }

    if (req.method === 'POST') {
      const { sale_date, customer_id, customer_name, items, paid_amount, notes } = req.body;
      if (!items?.length) return res.status(400).json({ error: 'Koi item nahi' });
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        // Stock check
        for (const item of items) {
          if (item.item_id) {
            const [[st]] = await conn.query(`SELECT current_stock, name FROM items WHERE id=?`, [item.item_id]);
            if (st && parseFloat(st.current_stock) < parseFloat(item.qty)) {
              await conn.rollback(); conn.release();
              return res.status(400).json({ error: `"${st.name}" ka stock kam hai! Available: ${st.current_stock}, Maanga: ${item.qty}` });
            }
          }
        }
        const total = items.reduce((s,i)=>s+(i.qty*i.rate),0);
        const paid  = parseFloat(paid_amount)||0;
        const mode  = paid>=total?'cash':paid>0?'partial':'credit';
        const [sr]  = await conn.query(
          `INSERT INTO sales (sale_date,customer_id,customer_name,total_amount,paid_amount,payment_mode,notes) VALUES (?,?,?,?,?,?,?)`,
          [sale_date, customer_id||null, customer_name||null, total, paid, mode, notes||null]
        );
        for (const item of items) {
          await conn.query(`INSERT INTO sale_items (sale_id,item_id,item_name,qty,unit_name,rate) VALUES (?,?,?,?,?,?)`,
            [sr.insertId, item.item_id||null, item.item_name, item.qty, item.unit_name||'', item.rate]);
          if (item.item_id) await conn.query(`UPDATE items SET current_stock=current_stock-? WHERE id=?`, [item.qty, item.item_id]);
        }
        if (customer_id) {
          const [[c]] = await conn.query(`SELECT balance FROM customers WHERE id=?`, [customer_id]);
          const nb = (parseFloat(c.balance)||0)+(total-paid);
          await conn.query(`UPDATE customers SET balance=? WHERE id=?`, [nb, customer_id]);
          await conn.query(`INSERT INTO ledger_entries (entry_date,party_type,party_id,entry_type,reference_id,debit,credit,balance,notes) VALUES (?,?,?,?,?,?,?,?,?)`,
            [sale_date,'customer',customer_id,'sale',sr.insertId,total,paid,nb,notes||null]);
        }
        await conn.commit();
        return res.json({ id: sr.insertId, total });
      } catch(e) { await conn.rollback(); throw e; }
      finally { conn.release(); }
    }
    res.status(405).end();
  } catch(e) { res.status(500).json({ error: e.message }); }
};
