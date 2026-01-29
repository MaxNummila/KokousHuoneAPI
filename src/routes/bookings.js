const express = require('express');
const BookingService = require('../services/bookingService');
const AppError = require('../utils/appError');
const rateLimit = require('express-rate-limit');
const adminKey = process.env.ADMIN_KEY || "";

const router = express.Router();

// Booking rate limiter
const bookingsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Liian monta pyyntöä, yritä myöhemmin uudelleen." },
});
// Use limiter on all /bookings routes
router.use(bookingsLimiter);

// POST /bookings
router.post('/', (req, res, next) => {
  try {
    const { room_name, start_time, end_time } = req.body;
    if (!room_name || !start_time || !end_time) {
      throw new AppError(400, "Puuttuvia tietoja.");
    }
    const created_by = req.header("X-User-Id");
    const booking = BookingService.createBooking(room_name, start_time, end_time, created_by);
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
    const userId = req.header("X-User-Id");
    const adminHeader = req.header("X-Admin-Key") || "";
    const isAdmin = adminKey && adminHeader === adminKey;
    
    const success = BookingService.deleteBooking(req.params.id, userId, isAdmin);
    if (!success) {
      throw new AppError(404, "Varausta ei löytynyt.");
    }
    if (!userId && !isAdmin) {
      throw new AppError(401, "X-User-Id tai X-Admin-Key vaaditaan.");
    }

    res.json({ message: "Varaus peruttu." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
