const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { updateUserSchema } = require('../validators/user.validator');

const router = express.Router();

// All user management routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

// GET /api/users — List all users
router.get('/', userController.listUsers);

// PATCH /api/users/:id — Update user name or role
router.patch('/:id', validate(updateUserSchema), userController.updateUser);

// DELETE /api/users/:id — Delete a user
router.delete('/:id', userController.deleteUser);

module.exports = router;
