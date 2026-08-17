const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, role?: string }} data
 * @returns {{ user: object, token: string }}
 */
const register = async ({ name, email, password, role }) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('A user with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
  });

  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Authenticate a user with email and password.
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Generate a JWT for a given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

module.exports = { register, login };
