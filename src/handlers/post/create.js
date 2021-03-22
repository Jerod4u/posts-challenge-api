const { v4: uuidv4 } = require("uuid");
const { AWS } = require("aws-sdk");
const { handler } = require("../../helpers");
const { badRequest, success } = handler;
exports.lambdaHandler = async (event) => {
  console.info("received:", event);

  const body = JSON.parse(event.body);
  if (!body) return badRequest(event);
  const { title, content } = body;
  if (!(title && content)) return badRequest(event);
  return success(event, body);
};
