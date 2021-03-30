const { handler, cognito } = require("../../helpers");
const { validateAcess } = cognito;
const AWS = require("aws-sdk");
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const { internalServerError, success, unauthorized } = handler;

exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const { headers } = event;
    const { accesstoken } = headers;
    if (!accesstoken) return unauthorized(event);
    const hasAccess = await validateAcess(accesstoken, ["admin"]);
    if (!hasAccess) return unauthorized(event);
    const data = await getUsers();
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function getUsers() {
  return new Promise((resolve, reject) => {
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      AttributesToGet: ["email", "sub", "custom:accessGroups"],
      Filter: 'status = "Enabled"',
    };
    cognitoServiceProvider.listUsers(params, (error, data) => {
      if (error) {
        reject(error);
      } else {
        const constructedData = data.Users.map((user) => {
          return {
            username: user.Username,
            Attributes: user.Attributes,
          };
        });
        resolve(constructedData);
      }
    });
  });
}
