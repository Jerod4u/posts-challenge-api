const { handler } = require("../../helpers");
const { badRequest, success, unauthorized } = handler;
const AWS = require("aws-sdk");
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
exports.lambdaHandler = async (event) => {
  console.info("received:", event);
  const body = JSON.parse(event.body);
  if (!body) return badRequest(event);
  const { user, password } = body;
  if (!(user && password)) return badRequest(event);
  try {
    const data = await login(user, password);
    return success(event, data);
  } catch (error) {
    return unauthorized(event, error);
  }
};

function login(user, password) {
  return new Promise((resolve, reject) => {
    const params = {
      AuthFlow: process.env.AUTH_FLOW,
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: user,
        PASSWORD: password,
      },
    };
    cognitoServiceProvider.initiateAuth(params, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
