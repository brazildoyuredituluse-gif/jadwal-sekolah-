// Jalankan sekali di server: node utils/createAdmin.js
// Skrip ini MEMBUAT / MEMPERBARUI satu akun admin dengan password ter-hash bcrypt.
// Password TIDAK PERNAH disimpan sebagai teks biasa di database.

const readline = require('readline');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  try {
    const username = (await ask('Username admin: ')).trim();
    const password = await ask('Password admin (min 10 karakter): ');
    const fullName = (await ask('Nama lengkap (opsional): ')).trim() || null;

    if (!username || password.length < 10) {
      console.error('Username kosong atau password kurang dari 10 karakter. Dibatalkan.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO admin_users (username, password_hash, full_name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name)`,
      [username, hash, fullName]
    );

    console.log(`Akun admin "${username}" berhasil dibuat/diperbarui.`);
    process.exit(0);
  } catch (err) {
    console.error('Gagal membuat admin:', err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
})();
