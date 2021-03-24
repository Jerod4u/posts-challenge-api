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
    const hasAccess = await validateAcess(Accesstoken, [
      "admin",
      "postCreate",
      "postUpdate",
    ]);
    if (!hasAccess) return unauthorized(event);
    const body = JSON.parse(event.body);
    if (!body) return badRequest(event);
    const { title, content } = body;

    if (!(title && content && postid)) return badRequest(event);
    const currentUserId = await getCurrentUserSub(Accesstoken);
    const item = {
      modified_by: currentUserId,
      title: title,
      content: content,
    };
    const data = await updatePost(postid, item);
    return success(event, {
      affectedRows: data.affectedRows,
      message: data.message,
    });
  } catch (error) {
    return internalServerError(event, error);
  }
};

function updatePost(postid, post) {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    if (isNaN(parseInt(postid))) return reject();
    const query = `UPDATE challengedb.Posts SET ? WHERE id = ?`;
    dbContext
      .query(query, [post, postid])
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
