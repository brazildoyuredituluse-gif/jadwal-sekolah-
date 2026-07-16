const express = require('express');
const { query, body } = require('express-validator');
const scheduleController = require('../controllers/scheduleController');
const scheduleModel = require('../models/scheduleModel');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', scheduleController.getFullSchedule);

router.get(
  '/live',
  [
    query('day').optional().isString().isLength({ max: 20 }),
    query('hour').optional().isInt({ min: 0, max: 23 }),
    query('minute').optional().isInt({ min: 0, max: 59 }),
  ],
  scheduleController.getLiveStatus
);

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
