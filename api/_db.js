const mysql = require('mysql2/promise');
let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:             process.env.DB_HOST,
      port:             3306,
      user:             process.env.DB_USER,
      password:         process.env.DB_PASS,
      database:         process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit:  3,
      queueLimit:       10,
      ssl: false
    });
  }
  return pool;
}
module.exports = { getPool };
