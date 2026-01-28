const bookingsData = require('../data/bookings');
const AppError = require('../utils/appError');

const BookingService = {
    // Apufunktio päällekkäisyyden tarkistukseen
  isOverlapping(room, start, end) {
    return bookingsData.isOverlapping(room, start, end);
  },

  createBooking(room_name, start_time, end_time) {
    const now = new Date().toISOString();

    if (start_time >= end_time) {
      throw new AppError(400, "Aloitusajan on oltava ennen lopetusaikaa.");
    }
    if (start_time < now) {
      throw new AppError(400, "Varaus ei voi olla menneisyydessä.");
    }
    if (this.isOverlapping(room_name, start_time, end_time)) {
      throw new AppError(409, "Huone on jo varattu kyseisenä aikana.");
    }

    const info = bookingsData.createBooking(room_name, start_time, end_time);
    return { id: info.lastInsertRowid, room_name, start_time, end_time };
  },

  getBookingsByRoom(room_name) {
    return bookingsData.getBookingsByRoom(room_name);
  },

  deleteBooking(id) {
    const info = bookingsData.deleteBooking(id);
    return info.changes > 0;
  }
};

module.exports = BookingService;
