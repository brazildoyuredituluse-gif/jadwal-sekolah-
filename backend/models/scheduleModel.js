const pool = require('../config/db');

const CLASS_NAME = 'XI TKJ 1'; // Proyek ini sengaja hanya melayani satu kelas.

async function getClassId() {
  const [rows] = await pool.query(`SELECT id FROM classes WHERE name = ? LIMIT 1`, [CLASS_NAME]);
  if (!rows.length) throw Object.assign(new Error(`Kelas "${CLASS_NAME}" belum ada di database.`), { status: 500 });
  return rows[0].id;
}

async function getSlots() {
  const [rows] = await pool.query(
    `SELECT slot_key, label, start_time, end_time FROM schedule_slots ORDER BY sort_order ASC`
  );
  return rows;
}

async function getWeeklySchedule() {
  const classId = await getClassId();
  const [rows] = await pool.query(
    `SELECT day, slot_key, subject_code FROM schedule WHERE class_id = ?`,
    [classId]
  );
  return rows;
}

async function getSubjectMapelMap() {
  const [rows] = await pool.query(`SELECT code, mapel_name FROM subject_codes`);
  const map = {};
  rows.forEach((r) => { map[r.code] = r.mapel_name; });
  return map;
}

async function upsertScheduleEntry(day, slotKey, subjectCode) {
  const classId = await getClassId();
  await pool.query(
    `INSERT INTO schedule (class_id, day, slot_key, subject_code)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE subject_code = VALUES(subject_code)`,
    [classId, day, slotKey, subjectCode || null]
  );
}

module.exports = { CLASS_NAME, getSlots, getWeeklySchedule, getSubjectMapelMap, upsertScheduleEntry };
