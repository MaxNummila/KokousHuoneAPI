const express = require('express');
const BookingService = require('../services/bookingService');

const router = express.Router();

// POST /bookings
router.post('/', (req, res) => {
  try {
    const { room_name, start_time, end_time } = req.body;
    if (!room_name || !start_time || !end_time) {
      return res.status(400).json({ error: "Puuttuvia tietoja." });
    }
    const booking = BookingService.createBooking(room_name, start_time, end_time);
    res.status(201).json(booking);
  } catch (err) {
    const statusCode = err.message.includes('varattu') ? 409 : 400;
    res.status(statusCode).json({ error: err.message });
  }
});

// GET /bookings/:room_name
router.get('/:room_name', (req, res) => {
  const bookings = BookingService.getBookingsByRoom(req.params.room_name);
  res.json(bookings);
});

// DELETE /bookings/:id
router.delete('/:id', (req, res) => {
  const success = BookingService.deleteBooking(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Varausta ei löytynyt." });
  }
  res.json({ message: "Varaus peruttu." });
});

module.exports = router;
