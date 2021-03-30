const mysql = require("mysql");
module.exports = () => {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  };
  let dbConnection;

  class DBContext {
    constructor() {
      this.createConnection();
    }

    createConnection = () => {
      dbConnection = mysql.createConnection(config);
    };

    destroy = () => {
      dbConnection.destroy();
      dbConnection = null;
    };

    query = (queryString, params = {}) => {
      return new Promise((resolve, reject) => {
        if (!dbConnection) this.createConnection();
        dbConnection.connect();
        dbConnection.query(queryString, params, (error, result, fields) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    };

    getConnection = () => {
      return dbConnection;
    };
  }

  return { DBContext: DBContext };
};
