const userService = require('../services/user.service');

/**
 * GET /api/users
 */
const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser({
      userId: req.params.id,
      name: req.body.name,
      role: req.body.role,
      currentAdminId: req.userId,
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser({
      userId: req.params.id,
      currentAdminId: req.userId,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
};
