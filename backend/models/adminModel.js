const pool = require('../config/db');

async function findByUsername(username) {
  const [rows] = await pool.query(
    `SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

async function updatePassword(id, newHash) {
  await pool.query(`UPDATE admin_users SET password_hash = ? WHERE id = ?`, [newHash, id]);
}

module.exports = { findByUsername, updatePassword };
