const request = require('supertest');
const app = require('../app'); // Tuodaan Express-sovellus
const db = require('../db');   // Tuodaan tietokanta tyhjennystä varten

// Määritellään Admin-avain, joka vastaa package.jsonin test-komentoa
process.env.ADMIN_KEY = 'sala-avain';

describe('Booking API Integration Tests', () => {

  // Tyhjennetään tietokanta ennen jokaista testiä, jotta testit eivät häiritse toisiaan
  beforeEach(() => {
    db.prepare('DELETE FROM bookings').run();
  });

  // Apufunktio tulevaisuuden ajanhetkille (ISO string)
  const getFutureDate = (hoursToAdd) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursToAdd);
    return date.toISOString();
  };

  /**
   * --- 1. VARAUKSEN LUONTI (POST) ---
   */
  describe('POST /bookings', () => {
    
    it('pitäisi luoda varaus onnistuneesti kun tiedot ovat oikein', async () => {
      const startTime = getFutureDate(24); // Huomenna
      const endTime = getFutureDate(26);

      const res = await request(app)
        .post('/bookings')
        .set('X-User-Id', 'user123') // Header asetettu
        .send({
          room_name: 'Neukkari A',
          start_time: startTime,
          end_time: endTime
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.room_name).toBe('Neukkari A');
    });

    it('pitäisi estää varaus ilman X-User-Id headeria', async () => {
        // Huom: Koska service heittää virheen "Varaus on luotava käyttäjätiedolla"
        // jos created_by puuttuu.
        const startTime = getFutureDate(24);
        const endTime = getFutureDate(26);
  
        const res = await request(app)
          .post('/bookings')
          .send({
            room_name: 'Neukkari A',
            start_time: startTime,
            end_time: endTime
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/käyttäjätiedolla/);
    });

    it('pitäisi estää päällekkäinen varaus (409 Conflict)', async () => {
      const startTime = getFutureDate(24);
      const endTime = getFutureDate(26);

      // 1. Luodaan pohjavaraus
      await request(app).post('/bookings').set('X-User-Id', 'user1').send({
        room_name: 'Neukkari A', start_time: startTime, end_time: endTime
      });

      // 2. Yritetään varata sama aika päälle
      const res = await request(app)
        .post('/bookings')
        .set('X-User-Id', 'user2')
        .send({
          room_name: 'Neukkari A',
          start_time: startTime, // Sama aloitusaika
          end_time: endTime
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toMatch(/Huone on jo varattu/);
    });

    it('pitäisi estää varaus menneisyydessä', async () => {
      const pastStart = new Date(Date.now() - 10000000).toISOString();
      const pastEnd = new Date(Date.now() - 5000000).toISOString();

      const res = await request(app)
        .post('/bookings')
        .set('X-User-Id', 'user1')
        .send({
          room_name: 'Neukkari A',
          start_time: pastStart,
          end_time: pastEnd
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/menneisyydessä/);
    });

    it('pitäisi estää varaus jos aloitus on lopetuksen jälkeen', async () => {
      const start = getFutureDate(5);
      const end = getFutureDate(3); // Loppuu ennen alkua

      const res = await request(app)
        .post('/bookings')
        .set('X-User-Id', 'user1')
        .send({ room_name: 'Neukkari A', start_time: start, end_time: end });

      expect(res.statusCode).toBe(400);
    });

    // Date.parse testit

    it('pitäisi estää varaus jos start_time ei ole validi datetime', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('X-User-Id', 'user1')
        .send({
          room_name: 'Neukkari A',
          start_time: 'not-a-date',
          end_time: getFutureDate(2)
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Virheellinen aikamuoto|aikamuoto/i);
    });

    it('pitäisi estää varaus jos end_time ei ole validi datetime', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('X-User-Id', 'user1')
        .send({
          room_name: 'Neukkari A',
          start_time: getFutureDate(2),
          end_time: 'bad'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Virheellinen aikamuoto|aikamuoto/i);
    });
  });

  /**
   * --- 2. VARAUSTEN HAKU (GET) ---
   */
  describe('GET /bookings/:room_name', () => {
    it('pitäisi palauttaa lista tietyn huoneen varauksista', async () => {
      // Luodaan kaksi varausta eri huoneisiin
      await request(app).post('/bookings').set('X-User-Id', 'u1').send({
        room_name: 'Huone 1', start_time: getFutureDate(1), end_time: getFutureDate(2)
      });
      await request(app).post('/bookings').set('X-User-Id', 'u2').send({
        room_name: 'Huone 2', start_time: getFutureDate(1), end_time: getFutureDate(2)
      });

      const room = encodeURIComponent('Huone 1');
      const res = await request(app).get(`/bookings/${room}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].room_name).toBe('Huone 1');
    });
  });

  /**
   * --- 3. VARAUKSEN POISTO (DELETE) ---
   */
  describe('DELETE /bookings/:id', () => {
    
    let bookingId;

    // Luodaan apuvaraus ennen poistotestejä
    beforeEach(async () => {
      const res = await request(app)
        .post('/bookings')
        .set('X-User-Id', 'omistaja')
        .send({
          room_name: 'DeleteRoom',
          start_time: getFutureDate(10),
          end_time: getFutureDate(11)
        });
      bookingId = res.body.id;
    });

    it('pitäisi antaa omistajan poistaa oma varaus', async () => {
      const res = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set('X-User-Id', 'omistaja'); // Sama ID kuin luodessa

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Varaus peruttu.');
    });

    it('pitäisi estää toista käyttäjää poistamasta varausta (403)', async () => {
      const res = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set('X-User-Id', 'jokuToinen'); // Eri ID

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatch(/oikeutta/);
    });

    it('pitäisi antaa ADMINin poistaa minkä tahansa varauksen', async () => {
      const res = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set('X-Admin-Key', 'sala-avain'); // Oikea admin-avain

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Varaus peruttu.');
    });

    it('pitäisi palauttaa 404 jos ID:tä ei löydy', async () => {
      const res = await request(app)
        .delete('/bookings/99999')
        .set('X-Admin-Key', 'sala-avain');

      expect(res.statusCode).toBe(404);
    });
  });
});
