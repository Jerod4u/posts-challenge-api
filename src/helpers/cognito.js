const AWS = require("aws-sdk");
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

module.exports = () => {
  const getCurrentUser = (accessToken) => {
    return new Promise((resolve, reject) => {
      const params = {
        AccessToken: accessToken,
      };
      cognitoServiceProvider.getUser(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  };

  const getCurrentUserSub = async (accessToken) => {
    const currentUser = await getCurrentUser(accessToken);
    const userSub = currentUser.UserAttributes.find(
      (attr) => attr.Name === "sub"
    );
    return userSub.Value;
  };

  const validateAcess = async (accessToken, roles) => {
    try {
      const currentUser = await getCurrentUser(accessToken);
      const accessGroups = currentUser.UserAttributes.find(
        (attr) => attr.Name === "custom:accessGroups"
      );
      if (
        !accessGroups.Value.split(",").some((access) => roles.includes(access))
      )
        return false;
    } catch (error) {
      return false;
    }
    return true;
  };
  return { validateAcess, getCurrentUserSub };
};
