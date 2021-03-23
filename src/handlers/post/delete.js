const { handler, cognito, mysql } = require("../../helpers");
const { validateAcess, getCurrentUserSub } = cognito;
const { internalServerError, success, unauthorized, badRequest } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const { headers, pathParameters } = event;
    const { Accesstoken } = headers;
    if (!Accesstoken) return unauthorized(event);
    const { postid } = pathParameters;
    const hasAccess = await validateAcess(Accesstoken, ["admin", "postCreate"]);
    if (!hasAccess) return unauthorized(event);
    if (!postid) return badRequest(event);
    const data = await deletePost(postid);
    return success(event, {
      affectedRows: data.affectedRows,
      message: data.message,
    });
  } catch (error) {
    return internalServerError(event, error);
  }
};

function deletePost(postid) {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    const query = `DELETE FROM challengedb.Posts WHERE id =${postid}`;
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
