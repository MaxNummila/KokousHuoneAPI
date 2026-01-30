require('dotenv').config();
const app = require('./app');

// Serveri, valitsee portin sekä aloittaa kuuntelun
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API pystyssä portissa ${PORT}`));
