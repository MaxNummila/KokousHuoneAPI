const bookingsData = require('../data/bookings');

const BookingService = {
  // Apufunktio päällekkäisyyden tarkistukseen
  isOverlapping(room, start, end) {
    return bookingsData.isOverlapping(room, start, end);
  },

  createBooking(room_name, start_time, end_time) {
    const now = new Date().toISOString();

    if (start_time >= end_time) {
      throw new Error("Aloitusajan on oltava ennen lopetusaikaa.");
    }
    if (start_time < now) {
      throw new Error("Varaus ei voi olla menneisyydessä.");
    }
    if (this.isOverlapping(room_name, start_time, end_time)) {
      throw new Error("Huone on jo varattu kyseisenä aikana.");
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
