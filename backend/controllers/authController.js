const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const adminModel = require('../models/adminModel');
const { signToken } = require('../utils/jwt');

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Username/password tidak valid.' });
    }

    const { username, password } = req.body;
    const admin = await adminModel.findByUsername(username);

    // Selalu bandingkan hash walau user tidak ditemukan (mencegah timing attack
    // yang membocorkan apakah username terdaftar atau tidak).
    const hashToCompare = admin ? admin.password_hash : '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!admin || !isValid) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const token = signToken({ id: admin.id, username: admin.username });
    res.json({ token, username: admin.username });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ id: req.admin.id, username: req.admin.username });
}

async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Password baru minimal 10 karakter.' });
    }
    const { currentPassword, newPassword } = req.body;
    const admin = await adminModel.findByUsername(req.admin.username);
    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Password saat ini salah.' });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await adminModel.updatePassword(admin.id, newHash);
    res.json({ message: 'Password berhasil diperbarui.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, changePassword };
