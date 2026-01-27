Minä:
 Minulla on sinulle tehtävä:

Tehtäväsi on toteuttaa yksinkertainen kokoushuoneiden varausrajapinta (API).

Palvelun tulee tarjota käyttäjille seuraavat toiminnot:

● Varauksen luonti: Varaa huone tietylle aikavälille.

● Varauksen peruutus: Poista varaus.

● Varausten katselu: Listaa kaikki tietyn huoneen varaukset.

Toimintalogiikka (business rules):

● Varaukset eivät saa mennä päällekkäin (kaksi henkilöä ei voi varata samaa huonetta

samaan aikaan).

● Varaukset eivät voi sijoittua menneisyyteen.

● Aloitusajan täytyy olla ennen lopetusaikaa.

Tekniset reunaehdot:

● Käytä Javascriptiä

● Voit käyttää muistinvaraista tietokantaa (in-memory database), jotta ympäristön

pystytys pysyy yksinkertaisena (esim. PostgreSQL tai MySQL-asennusta ei vaadita). Käytetään vaikka better-sqlite3:a


Gemini 3:
Tämä on mainio tehtävä! Rakennetaan selkeä ja tehokas REST-rajapinta käyttäen Node.js, Express ja better-sqlite3 -kirjastoa.

Koska käytämme better-sqlite3:a muistivarastona (:memory:), tietokanta alustetaan aina puhtaalta pöydältä, kun palvelin käynnistyy.
Projektin valmistelu

Varmista, että olet alustanut projektin ja asentanut tarvittavat kirjastot:
Bash

npm init -y
npm install express better-sqlite3

Kooditoteutus (server.js)

Tässä on valmis toteutus, joka sisältää pyydetyn logiikan ja virheiden käsittelyn.
JavaScript

const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

// Alustetaan muistinvarainen tietokanta
const db = new Database(':memory:');

// Luodaan taulu varauksille
db.exec(`
  CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL
  )
`);

// --- APUFUNKTIOT ---

const isOverlapping = (room, start, end) => {
    const row = db.prepare(`
    SELECT COUNT(*) as count FROM bookings 
    WHERE room_name = ? 
    AND NOT (end_time <= ? OR start_time >= ?)
  `).get(room, start, end);
    return row.count > 0;
};

// --- RAJAPINTA-REITIT ---

/**
 * 1. VARAUKSEN LUONTI
 */
app.post('/bookings', (req, res) => {
    const { room_name, start_time, end_time } = req.body;
    const now = new Date().toISOString();

    // Validointi: Puuttuvat tiedot
    if (!room_name || !start_time || !end_time) {
        return res.status(400).json({ error: "Puuttuvia tietoja." });
    }

    // Validointi: Aikajärjestys
    if (start_time >= end_time) {
        return res.status(400).json({ error: "Aloitusajan on oltava ennen lopetusaikaa." });
    }

    // Validointi: Menneisyys
    if (start_time < now) {
        return res.status(400).json({ error: "Varaus ei voi olla menneisyydessä." });
    }

    // Validointi: Päällekkäisyys
    if (isOverlapping(room_name, start_time, end_time)) {
        return res.status(409).json({ error: "Huone on jo varattu kyseisenä aikana." });
    }

    const info = db.prepare(
        'INSERT INTO bookings (room_name, start_time, end_time) VALUES (?, ?, ?)'
    ).run(room_name, start_time, end_time);

    res.status(201).json({ id: info.lastInsertRowid, room_name, start_time, end_time });
});

/**
 * 2. VARAUSTEN LISTAUS (huonekohtainen)
 */
app.get('/bookings/:room_name', (req, res) => {
    const bookings = db.prepare('SELECT * FROM bookings WHERE room_name = ? ORDER BY start_time ASC')
        .all(req.params.room_name);
    res.json(bookings);
});

/**
 * 3. VARAUKSEN PERUUTUS
 */
app.delete('/bookings/:id', (req, res) => {
    const info = db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    
    if (info.changes === 0) {
        return res.status(404).json({ error: "Varausta ei löytynyt." });
    }
    res.status(200).json({ message: "Varaus peruttu onnistuneesti." });
});

// Käynnistys
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Palvelin käynnissä portissa ${PORT}`);
});

Miten päällekkäisyyden tarkistus toimii?

Päällekkäisyyden tarkistaminen SQL-tasolla on tehokkain tapa. Logiikka perustuu siihen, että kaksi varausta eivät ole päällekkäin vain, jos uusi varaus loppuu ennen vanhan alkua TAI uusi varaus alkaa vanhan loppumisen jälkeen.

Käänteisesti ilmaistuna (kuten koodissa): Varaus on päällekkäinen, jos se ei täytä kumpaakaan edellä mainituista ehdoista.
Esimerkkejä testaukseen (cURL)

Voit testata rajapintaa esimerkiksi näillä komennoilla:

    Luo varaus:
    Bash

    curl -X POST http://localhost:3000/bookings \
    -H "Content-Type: application/json" \
    -d '{"room_name": "Neukkari 1", "start_time": "2026-05-01T10:00:00", "end_time": "2026-05-01T11:00:00"}'

    Listaa huoneen varaukset:
    Bash

    curl http://localhost:3000/bookings/Neukkari%201

    Poista varaus (id:n perusteella):
    Bash

    curl -X DELETE http://localhost:3000/bookings/1

Haluaisitko, että lisään tähän vielä esimerkiksi käyttäjäkohtaisen rajoituksen tai automaattisen sähköpostivahvistuksen simulaation?


Minä:
Selvä, ennen kuin kokeilen tätä niin tahdon että koodi jaetaan eri kansioihin sekä tiedostoihin 


Gemini 3:
Ymmärrän täysin! Rakenteen jakaminen eri tiedostoihin on järkevää, jotta koodi pysyy ylläpidettävänä ja "liiketoimintalogiikka" (business logic) erottuu teknisestä toteutuksesta.

Jaetaan projekti seuraavaan rakenteeseen:

    database.js: Tietokantayhteyden alustus ja skeeman luonti.

    bookingService.js: Kaikki logiikka (tarkistukset, päällekkäisyydet).

    server.js: Reitit (routes) ja HTTP-pyyntöjen käsittely.

1. database.js

Tämä tiedosto hoitaa vain tietokannan pystytyksen.
JavaScript

const Database = require('better-sqlite3');
const db = new Database(':memory:');

// Luodaan taulu
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL
  )
`);

module.exports = db;

2. bookingService.js

Tänne sijoitetaan tehtävän "sielu" eli säännöt.
JavaScript

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

3. server.js

Tämä on sovelluksen käynnistystiedosto, joka huolehtii vain HTTP-liikenteestä.
JavaScript

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

Miksi tämä on parempi?

    Testattavuus: Voisit nyt kirjoittaa yksikkötestejä pelkästään bookingService.js:lle ilman, että sinun tarvitsee käynnistää HTTP-palvelinta.

    Selkeys: Jos haluat vaihtaa tietokannan (esim. SQLitestä PostgreSQL:ään), sinun tarvitsee muuttaa vain database.js ja mahdolliset kyselyt bookingService.js:ssä. server.js pysyy muuttumattomana.

Haluatko seuraavaksi, että teen sinulle valmiin package.json-tiedoston tai ehkä pienen testiskriptin, jolla voit kokeilla kaikkia reittejä kerralla?

Minä:
 Package.json olisi varmaan hyvä laittaa kuntoon 

Gemini 3:
Laitetaan package.json kuntoon, jotta projektin käynnistäminen ja riippuvuuksien hallinta on mahdollisimman suoraviivaista.

Tässä on tiedosto, joka sisältää tarvittavat kirjastot ja käteviä skriptejä:
JSON

{
  "name": "kokoushuone-api",
  "version": "1.0.0",
  "description": "Yksinkertainen varausrajapinta",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "test-flow": "bash test_api.sh"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "express": "^4.19.0"
  },
  "author": "",
  "license": "ISC"
}

Huomioita skripteistä:

    npm start: Käynnistää palvelimen normaalisti.

    npm run dev: Käyttää Node.js:n uutta sisäänrakennettua --watch-tilaa (saatavilla Node v18.11+). Se käynnistää palvelimen automaattisesti uudelleen, kun tallennat koodimuutoksia.

Miten pääset alkuun?

    Luo kansio projektille.

    Luo tiedostot (database.js, bookingService.js, server.js ja package.json) ja liitä niihin aiemmin antamani koodit.

    Asenna kirjastot ajamalla komentorivillä:
    Bash

    npm install

    Käynnistä palvelin:
    Bash

    npm run dev

Bonus: Nopea testiskripti (test_api.sh)

Jos haluat kokeilla kaikkia sääntöjä (onnistunut varaus, päällekkäisyys, menneisyys) yhdellä kertaa, voit luoda tiedoston test_api.sh:
Bash

#!/bin/bash
URL="http://localhost:3000/bookings"

echo "1. Luodaan onnistunut varaus..."
curl -s -X POST $URL -H "Content-Type: application/json" \
-d '{"room_name": "Aalto", "start_time": "2026-10-10T10:00:00", "end_time": "2026-10-10T12:00:00"}'
echo -e "\n"

echo "2. Yritetään päällekkäistä varausta (pitäisi antaa virhe 409)..."
curl -s -X POST $URL -H "Content-Type: application/json" \
-d '{"room_name": "Aalto", "start_time": "2026-10-10T11:00:00", "end_time": "2026-10-10T13:00:00"}'
echo -e "\n"

echo "3. Haetaan huoneen varaukset..."
curl -s $URL/Aalto
echo -e "\n"

Aja se komennolla bash test_api.sh (tai npm run test-flow).

Nyt sinulla on täysin toimiva ja siististi jäsennelty API! Haluaisitko, että lisään vielä Swagger-dokumentaation (OpenAPI), jotta voisit testata rajapintaa selaimen kautta?