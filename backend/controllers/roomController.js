const { validationResult } = require('express-validator');
const roomModel = require('../models/roomModel');

async function listRooms(req, res, next) {
  try {
    const rooms = await roomModel.getAllRooms();
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

async function updateRoom(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Data ruang tidak valid.', details: errors.array() });
    }
    const { id } = req.params;
    const ok = await roomModel.updateRoom(id, req.body);
    if (!ok) return res.status(404).json({ error: 'Ruang tidak ditemukan.' });
    res.json({ message: 'Ruang berhasil diperbarui.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listRooms, updateRoom };
