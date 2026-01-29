const db = require('../db');

// Apufunktio päällekkäisyyden tarkistukseen
const isOverlapping = (room, start, end) => {
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM bookings 
    WHERE room_name = ? 
    AND NOT (end_time <= ? OR start_time >= ?)
  `).get(room, start, end);

  return row.count > 0;
};

// Insert
const createBooking = (room_name, start_time, end_time, created_by) => {
  return db.prepare(
    'INSERT INTO bookings (room_name, start_time, end_time, created_by) VALUES (?, ?, ?, ?)'
  ).run(room_name, start_time, end_time, created_by);
};

// List
const getBookingsByRoom = (room_name) => {
  return db.prepare(
    'SELECT * FROM bookings WHERE room_name = ? ORDER BY start_time ASC'
  ).all(room_name);
};

const getBookingById = (id) => {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
};

// Delete
const deleteBooking = (id) => {
  return db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
};

module.exports = {
  isOverlapping,
  createBooking,
  getBookingsByRoom,
  deleteBooking,
  getBookingById
};
