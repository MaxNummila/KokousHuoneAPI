// json virheiden standardointi tiettyyn muotoon.
const jsonError = (res, status, message) => res.status(status).json({ error: message });
module.exports = jsonError;
