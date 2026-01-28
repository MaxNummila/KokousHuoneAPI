const express = require('express');
const BookingService = require('../services/bookingService');
const AppError = require('../utils/appError');

const router = express.Router();

// POST /bookings
router.post('/', (req, res, next) => {
  try {
    const { room_name, start_time, end_time } = req.body;
    if (!room_name || !start_time || !end_time) {
      throw new AppError(400, "Puuttuvia tietoja.");
    }
    const booking = BookingService.createBooking(room_name, start_time, end_time);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// GET /bookings/:room_name
router.get('/:room_name', (req, res, next) => {
  try {
    const bookings = BookingService.getBookingsByRoom(req.params.room_name);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// DELETE /bookings/:id
router.delete('/:id', (req, res, next) => {
  try {
    const success = BookingService.deleteBooking(req.params.id);
    if (!success) {
      throw new AppError(404, "Varausta ei löytynyt.");
    }
    res.json({ message: "Varaus peruttu." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
