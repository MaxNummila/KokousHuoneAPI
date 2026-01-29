const Database = require('better-sqlite3');
const db = new Database(':memory:');

// Luodaan taulu
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_by TEXT NOT NULL
  )
`);

module.exports = db;
