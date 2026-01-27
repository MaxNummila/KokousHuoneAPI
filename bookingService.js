const db = require('./database');

const BookingService = {
    // Apufunktio päällekkäisyyden tarkistukseen
    isOverlapping(room, start, end) {
        const row = db.prepare(`
            SELECT COUNT(*) as count FROM bookings 
            WHERE room_name = ? 
            AND NOT (end_time <= ? OR start_time >= ?)
        `).get(room, start, end);
        return row.count > 0;
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

        const info = db.prepare(
            'INSERT INTO bookings (room_name, start_time, end_time) VALUES (?, ?, ?)'
        ).run(room_name, start_time, end_time);

        return { id: info.lastInsertRowid, room_name, start_time, end_time };
    },

    getBookingsByRoom(room_name) {
        return db.prepare('SELECT * FROM bookings WHERE room_name = ? ORDER BY start_time ASC').all(room_name);
    },

    deleteBooking(id) {
        const info = db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
        return info.changes > 0;
    }
};

module.exports = BookingService;