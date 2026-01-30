const express = require('express');
const bookingsRouter = require('./routes/bookings');
const errorHandler = require('./middleware/errorHandler');

// Express app:in erottelu serveristä, helpottaa testausta
const app = express();
app.use(express.json());

app.use('/bookings', bookingsRouter);
app.use(errorHandler);

module.exports = app;
