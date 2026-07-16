const { validationResult } = require('express-validator');
const scheduleModel = require('../models/scheduleModel');
const roomModel = require('../models/roomModel');

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

function toMinutes(hhmmss) {
  const [h, m] = hhmmss.split(':').map(Number);
  return h * 60 + m;
}

function shapeSchedule(rawRows) {
  const shaped = {};
  DAYS.forEach((d) => { shaped[d] = {}; });
  rawRows.forEach((row) => {
    if (!shaped[row.day]) return;
    shaped[row.day][row.slot_key] = row.subject_code;
  });
  return shaped;
}

async function getFullSchedule(req, res, next) {
  try {
    const [slots, rawSchedule, subjectMap] = await Promise.all([
      scheduleModel.getSlots(),
      scheduleModel.getWeeklySchedule(),
      scheduleModel.getSubjectMapelMap(),
    ]);

    res.json({
      class: scheduleModel.CLASS_NAME,
      days: DAYS,
      slots,
      schedule: shapeSchedule(rawSchedule),
      subjectMapel: subjectMap,
    });
  } catch (err) {
    next(err);
  }
}

// PENTING: hari & jam SELALU dikirim oleh perangkat pengguna (bukan dihitung ulang
// di server), supaya tidak salah zona waktu antara device dan server.
async function getLiveStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Parameter waktu tidak valid.' });
    }

    const { day, hour, minute } = req.query;

    if (!day || !DAYS.includes(day)) {
      // Sabtu/Minggu, atau parameter tidak dikirim -> anggap tidak ada jadwal.
      return res.json({ day: null, slot: null, subjectCode: null, mapel: null, rooms: [] });
    }

    const nowMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10);

    const [slots, rawSchedule, subjectMap] = await Promise.all([
      scheduleModel.getSlots(),
      scheduleModel.getWeeklySchedule(),
      scheduleModel.getSubjectMapelMap(),
    ]);

    const activeSlot = slots.find(
      (s) => nowMinutes >= toMinutes(s.start_time) && nowMinutes < toMinutes(s.end_time)
    );

    if (!activeSlot) {
      return res.json({ day, slot: null, subjectCode: null, mapel: null, rooms: [] });
    }

    const shaped = shapeSchedule(rawSchedule);
    const subjectCode = shaped[day] ? shaped[day][activeSlot.slot_key] : undefined;

    if (subjectCode === undefined || subjectCode === null) {
      return res.json({ day, slot: activeSlot, subjectCode: subjectCode || null, mapel: null, rooms: [] });
    }

    const mapelName = subjectMap[subjectCode] || null;
    const rooms = mapelName ? await roomModel.getRoomsByMapel(mapelName) : [];

    res.json({ day, slot: activeSlot, subjectCode, mapel: mapelName, rooms });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFullSchedule, getLiveStatus };
