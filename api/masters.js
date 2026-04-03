const { getPool } = require('./_db');
const { requireAuth, cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const user = requireAuth(req, res); if (!user) return;
  const pool = getPool();
  const { type, id } = req.query;

  try {
    if (type === 'units') {
      if (req.method === 'GET') {
        const [rows] = await pool.query(`SELECT * FROM units ORDER BY name`);
        return res.json(rows);
      }
      if (req.method === 'POST') {
        const { name, base_unit_id, conversion_qty, base_unit_name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });
        const [r] = await pool.query(
          `INSERT INTO units (name,base_unit_id,conversion_qty,base_unit_name) VALUES (?,?,?,?)`,
          [name, base_unit_id||null, conversion_qty||null, base_unit_name||null]
        );
        return res.json({ id: r.insertId });
      }
      if (req.method === 'DELETE') {
        await pool.query(`DELETE FROM units WHERE id=?`, [id]);
        return res.json({ ok: true });
      }
    }

    if (type === 'groups') {
      if (req.method === 'GET') {
        const [rows] = await pool.query(`SELECT * FROM groups_master ORDER BY name`);
        return res.json(rows);
      }
      if (req.method === 'POST') {
        const { name } = req.body;
        const [r] = await pool.query(`INSERT INTO groups_master (name) VALUES (?)`, [name]);
        return res.json({ id: r.insertId });
      }
      if (req.method === 'DELETE') {
        await pool.query(`DELETE FROM groups_master WHERE id=?`, [id]);
        return res.json({ ok: true });
      }
    }

    res.status(400).json({ error: 'type=units or type=groups required' });
  } catch(e) { res.status(500).json({ error: e.message }); }
};
