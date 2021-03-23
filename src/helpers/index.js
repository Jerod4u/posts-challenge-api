const handler = require("./handler")();
const cognito = require("./cognito")();
const mysql = require("./mysql")();
module.exports = { handler, cognito, mysql };
