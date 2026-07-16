const express = require('express');
const { query, body } = require('express-validator');
const scheduleController = require('../controllers/scheduleController');
const scheduleModel = require('../models/scheduleModel');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Publik: jadwal seminggu penuh untuk XI TKJ 1.
router.get('/', scheduleController.getFullSchedule);

// Publik: status "sedang berlangsung sekarang" + ruang yang harus menyala.
router.get(
  '/live',
  [query('now').optional().isISO8601()],
  scheduleController.getLiveStatus
);

// Hanya admin: ubah satu sel jadwal (hari + jam -> kode mapel).
router.put(
  '/',
  requireAuth,
  [
    body('day').isIn(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']),
    body('slotKey').trim().isLength({ min: 1, max: 20 }).escape(),
    body('subjectCode').optional({ nullable: true }).trim().isLength({ max: 40 }).escape(),
  ],
  async (req, res, next) => {
    try {
      const { day, slotKey, subjectCode } = req.body;
      await scheduleModel.upsertScheduleEntry(day, slotKey, subjectCode || null);
      res.json({ message: 'Jadwal berhasil diperbarui.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
