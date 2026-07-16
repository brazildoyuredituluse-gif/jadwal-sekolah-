const pool = require('../config/db');

async function getAllRooms() {
  const [rows] = await pool.query(
    `SELECT id, grid_area, label, mapel, category, teacher, is_facility FROM rooms`
  );
  return rows;
}

async function getRoomsByMapel(mapelName) {
  if (!mapelName) return [];
  const [rows] = await pool.query(
    `SELECT id, label FROM rooms WHERE LOWER(mapel) = LOWER(?)`,
    [mapelName]
  );
  return rows;
}

async function updateRoom(id, { label, mapel, category, teacher, is_facility }) {
  const [result] = await pool.query(
    `UPDATE rooms SET label = ?, mapel = ?, category = ?, teacher = ?, is_facility = ? WHERE id = ?`,
    [label, mapel || null, category || null, teacher || null, is_facility ? 1 : 0, id]
  );
  return result.affectedRows > 0;
}

module.exports = { getAllRooms, getRoomsByMapel, updateRoom };
