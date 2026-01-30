const bookingsData = require('../data/bookings');
const appError = require('../utils/appError');

// Toiminto ajan validointia varten. Standardisointi muodolle jossa aika tulee syöttää
const parseDateTime = (value, fieldName) => {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)){
    throw new appError(400, `Virheellinen aikamuoto kentässä ${fieldName}. Käytä esim. 2026-10-10T10:00:00.`);
  }
  return ms;
}

// 
const BookingService = {
  // Apufunktio päällekkäisyyden tarkistukseen
  isOverlapping(room, start, end) {
    return bookingsData.isOverlapping(room, start, end);
  },
  // Varauksen luonnin funktio
  createBooking(room_name, start_time, end_time, created_by) {
    const nowMs = Date.now();
    const startMs = parseDateTime(start_time, "start_time");
    const endMs = parseDateTime(end_time, "end_time");

    if (startMs >= endMs) {
      throw new appError(400, "Aloitusajan on oltava ennen lopetusaikaa.");
    }
    if (startMs < nowMs) {
      throw new appError(400, "Varaus ei voi olla menneisyydessä.");
    }
    if (this.isOverlapping(room_name, start_time, end_time)) {
      throw new appError(409, "Huone on jo varattu kyseisenä aikana.");
    }
    if (!created_by) {
      throw new appError(400, "Varaus on luotava käyttäjätiedolla.");
    }

    const info = bookingsData.createBooking(room_name, start_time, end_time, created_by);
    return { id: info.lastInsertRowid, room_name, start_time, end_time };
  },
  // Funktio honeen hakuun nimellä
  getBookingsByRoom(room_name) {
    return bookingsData.getBookingsByRoom(room_name);
  },

  // Varauksen poisto toiminto, toimii varauksen id:llä
  deleteBooking(id, userId, isAdmin) {
    const booking = bookingsData.getBookingById(id);

    if (!booking) {
      throw new appError(404, "Varausta ei löydy.");
    }

    if (!isAdmin && booking.created_by !== userId) {
      throw new appError(403, "Sinulla ei ole oikeutta poistaa tätä varausta.");
    }

    const info = bookingsData.deleteBooking(id);
    return info.changes > 0;
  }
};

module.exports = BookingService;
