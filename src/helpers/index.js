const handler = require("./handler")();
const cognito = require("./cognito")();
module.exports = { handler, cognito };
