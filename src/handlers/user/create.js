const { handler, cognito } = require("../../helpers");
const { validateAcess } = cognito;
const { badRequest, success, internalServerError, unauthorized } = handler;
const AWS = require("aws-sdk");
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
exports.lambdaHandler = async (event) => {
  try {
    console.info("received:", event);
    const { headers } = event;
    const { accesstoken } = headers;
    if (!accesstoken) return unauthorized(event);
    const hasAccess = await validateAcess(accesstoken, ["admin"]);
    if (!hasAccess) return unauthorized(event);
    const body = JSON.parse(event.body);
    if (!body) return badRequest(event);
    const { attributes, username, password } = body;
    if (!(username && attributes && password)) return badRequest(event);
    const hasRolesDefined = attributes.find(
      (attr) => attr.Name === "custom:accessGroups"
    );
    if (!hasRolesDefined)
      return badRequest(
        event,
        "Node 'attributes' has to have 'custom:accessGroups' attribute item"
      );
    const data = await createUser(username, password, attributes);
    return success(event, data);
  } catch (error) {
    return internalServerError(event, error);
  }
};

function createUser(username, password, attributes) {
  return new Promise((resolve, reject) => {
    if (attributes.length === 0) return reject();
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: username,
      DesiredDeliveryMediums: ["EMAIL"],
      TemporaryPassword: password,
      UserAttributes: attributes,
    };
    cognitoServiceProvider.adminCreateUser(params, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
