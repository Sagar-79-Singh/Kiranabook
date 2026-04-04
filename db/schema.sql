-- ============================================
-- KiranaBook Database Schema
-- freesqldatabase.com / phpMyAdmin mein
-- poora paste karo aur "Go" press karo
-- NO foreign key constraints (compatibility)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  base_unit_id INT DEFAULT NULL,
  conversion_qty DECIMAL(10,3) DEFAULT NULL,
  base_unit_name VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  group_id INT DEFAULT NULL,
  unit_id INT DEFAULT NULL,
  purchase_price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2) DEFAULT 0,
  opening_stock DECIMAL(10,3) DEFAULT 0,
  current_stock DECIMAL(10,3) DEFAULT 0,
  low_stock_alert DECIMAL(10,3) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(15) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(15) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_date DATE NOT NULL,
  customer_id INT DEFAULT NULL,
  customer_name VARCHAR(200) DEFAULT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_mode ENUM('cash','credit','partial') DEFAULT 'cash',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  item_id INT DEFAULT NULL,
  item_name VARCHAR(200) NOT NULL,
  qty DECIMAL(10,3) NOT NULL,
  unit_name VARCHAR(50) DEFAULT '',
  rate DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_date DATE NOT NULL,
  supplier_id INT DEFAULT NULL,
  supplier_name VARCHAR(200) DEFAULT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_mode ENUM('cash','credit','partial') DEFAULT 'cash',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  item_id INT DEFAULT NULL,
  item_name VARCHAR(200) NOT NULL,
  qty DECIMAL(10,3) NOT NULL,
  unit_name VARCHAR(50) DEFAULT '',
  rate DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_date DATE NOT NULL,
  party_type ENUM('customer','supplier') NOT NULL,
  party_id INT NOT NULL,
  entry_type ENUM('sale','purchase','payment_received','payment_made','adjustment') NOT NULL,
  reference_id INT DEFAULT NULL,
  debit DECIMAL(10,2) DEFAULT 0,
  credit DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── DEFAULT DATA ──────────────────────────────────────

-- Simple Units
INSERT IGNORE INTO units (name) VALUES
  ('Pcs'), ('Kg'), ('Gram'), ('Litre'), ('Metre'),
  ('Bundle'), ('Roll'), ('Ream'), ('Packet'), ('Box'), ('Dozen');

-- Compound Units (1 Pkt = 20 Pcs etc.)
INSERT IGNORE INTO units (name, base_unit_id, conversion_qty, base_unit_name)
  SELECT 'Pkt (20 Pcs)', id, 20, 'Pcs' FROM units WHERE name = 'Pcs';
INSERT IGNORE INTO units (name, base_unit_id, conversion_qty, base_unit_name)
  SELECT 'Pkt (10 Pcs)', id, 10, 'Pcs' FROM units WHERE name = 'Pcs';
INSERT IGNORE INTO units (name, base_unit_id, conversion_qty, base_unit_name)
  SELECT 'Box (12 Pcs)', id, 12, 'Pcs' FROM units WHERE name = 'Pcs';
INSERT IGNORE INTO units (name, base_unit_id, conversion_qty, base_unit_name)
  SELECT 'Dozen (12 Pcs)', id, 12, 'Pcs' FROM units WHERE name = 'Pcs';
INSERT IGNORE INTO units (name, base_unit_id, conversion_qty, base_unit_name)
  SELECT 'Ream (500 Pcs)', id, 500, 'Pcs' FROM units WHERE name = 'Pcs';

-- Item Groups
INSERT IGNORE INTO groups_master (name) VALUES
  ('Pen & Pencil'), ('Paper & Notebook'), ('File & Folder'),
  ('Ink & Refill'), ('Stationery Misc'), ('Computer Accessories');

-- Default Users
-- admin password: admin123
INSERT INTO users (username, password_hash, role) VALUES
  ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
  ON DUPLICATE KEY UPDATE username=username;

-- dad password: dad123
INSERT INTO users (username, password_hash, role) VALUES
  ('dad', '$2b$10$YEpRG0yVGMc6v4NKQpK.F.LJpvUCuVDJOOWjHJmilTLAfbHfNqhLi', 'user')
  ON DUPLICATE KEY UPDATE username=username;

-- NOTE: The above password hashes are demo hashes.
-- After first login, visit /api/setup?key=kiranabook_init_2024 
-- to regenerate proper bcrypt hashes for both users.
