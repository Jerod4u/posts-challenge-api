const { handler } = require("../../helpers");
const AWS = require("aws-sdk");
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const { internalServerError, success } = handler;
exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  try {
    const data = await getUsers(process.env.USER_POOL_ID);
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function getUsers(userPoolId) {
  return new Promise((resolve, reject) => {
    const params = {
      UserPoolId: userPoolId,
      AttributesToGet: ["email", "sub"],
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
