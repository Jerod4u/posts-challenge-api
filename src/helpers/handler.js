module.exports = () => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Content-Type": "application/json",
  };
  const customResponse = {
    headers: headers,
  };
  const badRequestMessage = "Bad request syntax";
  const badRequest = (event, error = badRequestMessage) => {
    const response = {
      ...customResponse,
      statusCode: 400,
      body: `{ "error": ${JSON.stringify(error)} }`,
    };
    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  };

  const internalServerError = (event, error) => {
    const response = {
      ...customResponse,
      statusCode: 500,
      body: `{ "error": ${JSON.stringify(error)} }`,
    };
    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  };
  const success = (event, data) => {
    const response = {
      ...customResponse,
      statusCode: 200,
      body: JSON.stringify(data),
    };
    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  };
  return { badRequest, internalServerError, success };
};
