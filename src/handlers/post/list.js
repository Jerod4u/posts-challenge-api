const { handler, mysql } = require("../../helpers");
const { internalServerError, success } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const data = await getPosts();
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function getPosts() {
  return new Promise((resolve, reject) => {
    const dbContext = new mysql.DBContext();
    const query = `SELECT P.*, 
                    avg(R.stars) AS review FROM 
                    challengedb.Posts AS P
                  LEFT JOIN challengedb.Reviews R ON R.post_id = P.id
                  GROUP BY P.id
                  ORDER BY P.created DESC`;
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
