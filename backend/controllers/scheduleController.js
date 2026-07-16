const { validationResult } = require('express-validator');
const scheduleModel = require('../models/scheduleModel');
const roomModel = require('../models/roomModel');

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

function toMinutes(hhmmss) {
  const [h, m] = hhmmss.split(':').map(Number);
  return h * 60 + m;
}

// Mengubah jadwal mentah (hasil query) menjadi struktur { day: { slotKey: subjectCode } }
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
      subjectMapel: subjectMap, // dipakai frontend untuk resolusi ruang bila perlu
    });
  } catch (err) {
    next(err);
  }
}

// Menentukan jam & mapel yang sedang berlangsung "sekarang", lalu mencari ruang
// yang harus menyala. Klien boleh mengirim ?now=<ISO string> (waktu lokal HP)
// supaya sinkron dengan jam perangkat pengguna, bukan jam server.
async function getLiveStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Parameter waktu tidak valid.' });
    }

    const now = req.query.now ? new Date(req.query.now) : new Date();
    if (Number.isNaN(now.getTime())) {
      return res.status(400).json({ error: 'Format waktu tidak dikenali.' });
    }

    const jsDay = now.getDay(); // 0=Minggu .. 6=Sabtu
    if (jsDay === 0 || jsDay === 6) {
      return res.json({ day: null, slot: null, subjectCode: null, mapel: null, rooms: [] });
    }
    const day = DAYS[jsDay - 1];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

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
      return res.json({
        day,
        slot: activeSlot,
        subjectCode: subjectCode || null,
        mapel: null,
        rooms: [],
      });
    }

    const mapelName = subjectMap[subjectCode] || null;
    const rooms = mapelName ? await roomModel.getRoomsByMapel(mapelName) : [];

    res.json({ day, slot: activeSlot, subjectCode, mapel: mapelName, rooms });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFullSchedule, getLiveStatus };
