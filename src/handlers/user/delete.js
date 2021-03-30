const { handler, cognito } = require("../../helpers");
const { validateAcess } = cognito;
const { badRequest, success, internalServerError, unauthorized } = handler;
const AWS = require("aws-sdk");
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
exports.lambdaHandler = async (event) => {
  try {
    console.info("received:", event);
    const { pathParameters, headers } = event;
    const { username } = pathParameters;
    const { accesstoken } = headers;
    if (!accesstoken) return unauthorized(event);
    const hasAccess = await validateAcess(accesstoken, ["admin"]);
    if (!hasAccess) return unauthorized(event);
    if (!username) return badRequest(event);
    const data = await deleteUser(username);
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function deleteUser(userName) {
  return new Promise((resolve, reject) => {
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: userName,
    };
    cognitoServiceProvider.adminDeleteUser(params, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
