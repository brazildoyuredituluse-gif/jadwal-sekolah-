require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const scheduleRoutes = require('./routes/scheduleRoutes');
const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------
// Keamanan dasar
// ---------------------------------------------------------------
app.disable('x-powered-by');                 // sembunyikan info framework
app.use(helmet());                            // header keamanan standar
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", 'fonts.googleapis.com', "'unsafe-inline'"],
    fontSrc: ["'self'", 'fonts.gstatic.com'],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
  },
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Izinkan request tanpa Origin (mis. curl/health-check) & origin yang terdaftar saja.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin tidak diizinkan oleh kebijakan CORS.'));
  },
}));

app.use(express.json({ limit: '100kb' })); // batasi ukuran body -> cegah payload raksasa
app.use('/api', apiLimiter);

// ---------------------------------------------------------------
// API routes
// ---------------------------------------------------------------
app.use('/api/schedule', scheduleRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---------------------------------------------------------------
// Sajikan frontend statis (publik) & admin (form login publik,
// tapi datanya sendiri hanya bisa diambil setelah login lewat API)
// ---------------------------------------------------------------
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

app.use('/api', notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
