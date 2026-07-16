const rateLimit = require('express-rate-limit');

// Membatasi percobaan login: maksimal 8 kali per 15 menit per IP.
// Mencegah brute-force menebak password admin.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.' },
});

// Pembatas umum untuk seluruh API publik (anti-scraping/DoS ringan).
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' },
});

module.exports = { loginLimiter, apiLimiter };
