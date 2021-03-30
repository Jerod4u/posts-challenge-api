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
    const body = JSON.parse(event.body);
    if (!body) return badRequest(event);
    const { attributes } = body;
    if (!(username && attributes)) return badRequest(event);
    const data = await updateUser(username, attributes);
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function updateUser(userName, attributes) {
  return new Promise((resolve, reject) => {
    if (attributes.length === 0) return reject();
    const params = {
      UserAttributes: attributes,
      UserPoolId: process.env.USER_POOL_ID,
      Username: userName,
    };
    cognitoServiceProvider.adminUpdateUserAttributes(
      params,
      function (err, data) {
        if (err) reject(err, err.stack);
        else resolve(data);
      }
    );
  });
}
