const { handler, mysql } = require("../../helpers");
const moment = require("moment");
const { internalServerError, success, badRequest } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const { queryStringParameters } = event;
    const { fromDate = null, toDate = null } = queryStringParameters || {};
    if (!(validateDateFormat(fromDate) && validateDateFormat(toDate)))
      return badRequest(event);
    const params = [fromDate, toDate];
    const data = await getPosts(params);
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function validateDateFormat(date) {
  return !date || moment(date, "yyyy-MM-DD", true).isValid();
}

function getPosts(params) {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    const query = `CALL sp_get_posts(? , ?)`;
    dbContext
      .query(query, params)
      .then((result) => {
        resolve(result[0]);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        dbContext.destroy();
      });
  });
}
