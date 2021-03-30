const { handler, cognito, mysql } = require("../../helpers");
const { validateAcess } = cognito;
const { internalServerError, success, unauthorized } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const { headers } = event;
    const { Accesstoken } = headers;
    if (!Accesstoken) return unauthorized(event);
    const hasAccess = await validateAcess(Accesstoken, ["admin"]);
    if (!hasAccess) return unauthorized(event);
    const data = await getLogs();
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function getLogs() {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    const query = "SELECT * FROM challengedb.Posts_logs";
    dbContext
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        dbContext.destroy();
      });
  });
}
