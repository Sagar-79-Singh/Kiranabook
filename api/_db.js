const mysql = require('mysql2/promise');
let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "sql12.freesqldatabase.com",  // ← Use env var or actual host
      user: process.env.DB_USER || "sql12822070",                // ← Your actual username
      password: process.env.DB_PASS || "7VcWShw8mY",              // ← Your actual password
      database: process.env.DB_NAME || "sq12l822070",            // ← Your actual database
      port: 3306,
      ssl: { rejectUnauthorized: false },  // ← Changed from false to proper SSL config
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 10,
    });
  }
  return pool;
}
module.exports = { getPool };
