const express = require('express');
const BookingService = require('./bookingService');

const app = express();
app.use(express.json());

// REITTITOTEUTUKSET

app.post('/bookings', (req, res) => {
    try {
        const { room_name, start_time, end_time } = req.body;
        if (!room_name || !start_time || !end_time) {
            return res.status(400).json({ error: "Puuttuvia tietoja." });
        }
        const booking = BookingService.createBooking(room_name, start_time, end_time);
        res.status(201).json(booking);
    } catch (err) {
        // Jos virhe johtuu bisneslogiikasta (esim. päällekkäisyys)
        const statusCode = err.message.includes('varattu') ? 409 : 400;
        res.status(statusCode).json({ error: err.message });
    }
});

app.get('/bookings/:room_name', (req, res) => {
    const bookings = BookingService.getBookingsByRoom(req.params.room_name);
    res.json(bookings);
});

app.delete('/bookings/:id', (req, res) => {
    const success = BookingService.deleteBooking(req.params.id);
    if (!success) {
        return res.status(404).json({ error: "Varausta ei löytynyt." });
    }
    res.json({ message: "Varaus peruttu." });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API pystyssä portissa ${PORT}`));