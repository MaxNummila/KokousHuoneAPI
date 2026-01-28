const express = require('express');
const bookingsRouter = require('./routes/bookings');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.use('/bookings', bookingsRouter);
app.use(errorHandler);

module.exports = app;
