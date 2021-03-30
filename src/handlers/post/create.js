const { handler, cognito, mysql } = require("../../helpers");
const { validateAcess, getCurrentUserSub } = cognito;
const { internalServerError, success, unauthorized, badRequest } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const { headers } = event;
    const { Accesstoken } = headers;
    if (!Accesstoken) return unauthorized(event);
    const hasAccess = await validateAcess(Accesstoken, ["admin", "postCreate"]);
    if (!hasAccess) return unauthorized(event);
    const body = JSON.parse(event.body);
    if (!body) return badRequest(event);
    const { title, content } = body;

    if (!(title && content)) return badRequest(event);
    const currentUserId = await getCurrentUserSub(Accesstoken);
    const item = {
      user_id: currentUserId,
      modified_by: currentUserId,
      title: title,
      content: content,
    };
    const data = await createPost(item);
    return success(event, {
      affectedRows: data.affectedRows,
      message: data.message,
    });
  } catch (error) {
    return internalServerError(event, error);
  }
};

function createPost(post) {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    const query = `INSERT INTO challengedb.Posts SET ?`;
    dbContext
      .query(query, post)
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
