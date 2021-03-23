const { handler, cognito, mysql } = require("../../helpers");
const { getCurrentUserSub } = cognito;
const { internalServerError, success, unauthorized, badRequest } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const { pathParameters } = event;
    const { postid } = pathParameters;
    const body = JSON.parse(event.body);
    if (!(body && postid)) return badRequest(event);
    const { stars = 5, content } = body;
    if (!content) return badRequest(event);
    const review = {
      stars: stars,
      content: content,
      post_id: postid,
    };
    const data = await createReview(review);
    return success(event, {
      affectedRows: data.affectedRows,
      message: data.message,
    });
  } catch (error) {
    return internalServerError(event, error);
  }
};

function createReview(review) {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    const query = `INSERT INTO challengedb.Reviews SET ?`;
    dbContext
      .query(query, review)
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
