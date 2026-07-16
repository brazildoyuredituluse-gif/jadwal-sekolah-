// Error handler terpusat — memastikan detail teknis (stack trace, query SQL, dll)
// tidak pernah bocor ke client, hanya dicatat di log server.

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Terjadi kesalahan pada server.' : err.message });
}

module.exports = { notFoundHandler, errorHandler };
