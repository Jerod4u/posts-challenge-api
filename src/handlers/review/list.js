const { handler, mysql } = require("../../helpers");
const { internalServerError, success, badRequest } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const { pathParameters } = event;
    const { postid } = pathParameters;
    if (!postid) return badRequest(event);
    const data = await getReviews(postid);
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function getReviews(postid) {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    if (isNaN(parseInt(postid))) return reject();
    const query = `SELECT * FROM challengedb.v_reviews WHERE post_id= ?`;
    dbContext
      .query(query, [postid])
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
