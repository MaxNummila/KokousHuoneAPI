const jsonError = require("../utils/jsonError");

module.exports = (err, req, res, next) => {
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = err.message || "Tuntematon virhe";
  jsonError(res, status, message);
};
