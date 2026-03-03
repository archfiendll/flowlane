const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  return sendSuccess(res, users);
});

module.exports = {
  listUsers,
};