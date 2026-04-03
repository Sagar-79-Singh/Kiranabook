const bcrypt = require('bcryptjs');
const { getPool } = require('./_db');
const { cors } = require('./_auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.query.key !== 'kiranabook_init_2024') return res.status(403).json({ error: 'Invalid key' });
  const pool = getPool();
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role ENUM('admin','user') DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS units (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL, base_unit_id INT DEFAULT NULL, conversion_qty DECIMAL(10,3) DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (base_unit_id) REFERENCES units(id) ON DELETE SET NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS groups_master (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS items (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200) NOT NULL, group_id INT DEFAULT NULL, unit_id INT DEFAULT NULL, purchase_price DECIMAL(10,2) DEFAULT 0, sale_price DECIMAL(10,2) DEFAULT 0, opening_stock DECIMAL(10,3) DEFAULT 0, current_stock DECIMAL(10,3) DEFAULT 0, low_stock_alert DECIMAL(10,3) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (group_id) REFERENCES groups_master(id) ON DELETE SET NULL, FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200) NOT NULL, phone VARCHAR(15) DEFAULT NULL, address TEXT DEFAULT NULL, balance DECIMAL(10,2) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS suppliers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200) NOT NULL, phone VARCHAR(15) DEFAULT NULL, address TEXT DEFAULT NULL, balance DECIMAL(10,2) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS sales (id INT AUTO_INCREMENT PRIMARY KEY, sale_date DATE NOT NULL, customer_id INT DEFAULT NULL, customer_name VARCHAR(200) DEFAULT NULL, total_amount DECIMAL(10,2) DEFAULT 0, paid_amount DECIMAL(10,2) DEFAULT 0, payment_mode ENUM('cash','credit','partial') DEFAULT 'cash', notes TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS sale_items (id INT AUTO_INCREMENT PRIMARY KEY, sale_id INT NOT NULL, item_id INT DEFAULT NULL, item_name VARCHAR(200) NOT NULL, qty DECIMAL(10,3) NOT NULL, unit_name VARCHAR(50) DEFAULT '', rate DECIMAL(10,2) NOT NULL, FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE, FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS purchases (id INT AUTO_INCREMENT PRIMARY KEY, purchase_date DATE NOT NULL, supplier_id INT DEFAULT NULL, supplier_name VARCHAR(200) DEFAULT NULL, total_amount DECIMAL(10,2) DEFAULT 0, paid_amount DECIMAL(10,2) DEFAULT 0, payment_mode ENUM('cash','credit','partial') DEFAULT 'cash', notes TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS purchase_items (id INT AUTO_INCREMENT PRIMARY KEY, purchase_id INT NOT NULL, item_id INT DEFAULT NULL, item_name VARCHAR(200) NOT NULL, qty DECIMAL(10,3) NOT NULL, unit_name VARCHAR(50) DEFAULT '', rate DECIMAL(10,2) NOT NULL, FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE, FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ledger_entries (id INT AUTO_INCREMENT PRIMARY KEY, entry_date DATE NOT NULL, party_type ENUM('customer','supplier') NOT NULL, party_id INT NOT NULL, entry_type ENUM('sale','purchase','payment_received','payment_made','adjustment') NOT NULL, reference_id INT DEFAULT NULL, debit DECIMAL(10,2) DEFAULT 0, credit DECIMAL(10,2) DEFAULT 0, balance DECIMAL(10,2) DEFAULT 0, notes TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    // Seed units
    for (const u of ['Pcs','Kg','Gram','Litre','Metre','Bundle','Roll','Ream']) {
      await pool.query(`INSERT IGNORE INTO units (name) VALUES (?)`, [u]);
    }
    const compounds = [['Pkt (20 Pcs)',20],['Pkt (10 Pcs)',10],['Box (12 Pcs)',12],['Dozen (12 Pcs)',12],['Ream (500)',500]];
    for (const [name, qty] of compounds) {
      const [[base]] = await pool.query(`SELECT id FROM units WHERE name='Pcs'`);
      if (base) await pool.query(`INSERT IGNORE INTO units (name,base_unit_id,conversion_qty) VALUES (?,?,?)`, [name, base.id, qty]);
    }
    // Seed groups
    for (const g of ['Pen & Pencil','Paper & Notebook','File & Folder','Ink & Refill','Stationery Misc','Computer Accessories']) {
      await pool.query(`INSERT IGNORE INTO groups_master (name) VALUES (?)`, [g]);
    }
    // Users
    const ah = await bcrypt.hash('admin123', 10);
    const dh = await bcrypt.hash('dad123', 10);
    await pool.query(`INSERT INTO users (username,password_hash,role) VALUES (?,?,'admin') ON DUPLICATE KEY UPDATE password_hash=?`, ['admin',ah,ah]);
    await pool.query(`INSERT INTO users (username,password_hash,role) VALUES (?,?,'user') ON DUPLICATE KEY UPDATE password_hash=?`, ['dad',dh,dh]);

    res.json({ success: true, message: 'KiranaBook database ready!', users: [{username:'admin',password:'admin123'},{username:'dad',password:'dad123'}] });
  } catch(e) { res.status(500).json({ error: e.message }); }
};
