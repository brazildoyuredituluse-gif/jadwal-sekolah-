const express = require('express');
const { body, param } = require('express-validator');
const roomController = require('../controllers/roomController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Publik: siapa saja boleh membaca daftar ruang (bukan data rahasia).
router.get('/', roomController.listRooms);

// Hanya admin yang login boleh mengubah data ruang.
router.put(
  '/:id',
  requireAuth,
  [
    param('id').trim().isLength({ min: 1, max: 30 }).escape(),
    body('label').trim().isLength({ min: 1, max: 100 }).escape(),
    body('mapel').optional({ nullable: true }).trim().isLength({ max: 100 }).escape(),
    body('category').optional({ nullable: true }).trim().isLength({ max: 30 }).escape(),
    body('is_facility').optional().isBoolean(),
  ],
  roomController.updateRoom
);

module.exports = router;
