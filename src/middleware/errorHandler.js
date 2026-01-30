const jsonError = require("../utils/jsonError");

// Virheiden käsittely toiminto, jos virhe on appError.js muodossa niin sitä käytetään, muulloin palauttaa error 500
module.exports = (err, req, res, next) => {
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = err.message || "Tuntematon virhe";
  jsonError(res, status, message);
};
