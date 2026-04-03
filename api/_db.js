const mysql = require('mysql2/promise');
let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: "sql12.freesqldatabase.com",
      user: "sql12822070",
      password: "7VcWShw8mY",
      database: "sql12822070",
      port: 3306,
      ssl: false
      waitForConnections: true,
      connectionLimit:  3,
      queueLimit:       10,
    });
  }
  return pool;
}
module.exports = { getPool };
