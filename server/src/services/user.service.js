const User = require('../models/User');

/**
 * List all registered users (excluding password hashes).
 */
const listUsers = async () => {
  const users = await User.find()
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return users;
};

/**
 * Update a user's role or name.
 */
const updateUser = async ({ userId, name, role, currentAdminId }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Prevent demoting the last administrator
  if (role && role !== 'admin' && user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      const error = new Error('Cannot demote the only administrator in the system.');
      error.statusCode = 400;
      throw error;
    }
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (role !== undefined) {
    user.role = role;
  }

  await user.save();
  return user;
};

/**
 * Delete a user from the system.
 */
const deleteUser = async ({ userId, currentAdminId }) => {
  if (userId.toString() === currentAdminId.toString()) {
    const error = new Error('You cannot delete your own active administrator account.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Prevent deleting the last administrator
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      const error = new Error('Cannot delete the only administrator in the system.');
      error.statusCode = 400;
      throw error;
    }
  }

  await User.findByIdAndDelete(userId);

  return { success: true, message: `User '${user.name}' (${user.email}) deleted successfully.` };
};

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
};
