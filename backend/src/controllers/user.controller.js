const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  return res.status(200).json({ ok: true, data: users });
});

module.exports = {
  listUsers,
};
