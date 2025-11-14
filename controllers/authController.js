// controllers/authController.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const User = require('../models/userModel');

// User Registration
async function register(req, res) {
  const { username, email, password } = req.body;
  try {
    const result = await User.createUser(username, email, password);
    res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user.' });
  }
}

// User Login
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.getUserByEmail(email);
    if (!user || !(await User.checkPassword(user.password, password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account pending approval.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.' });
  }
}

// Admin Approve User
async function approveUser(req, res) {
  const userId = req.params.id;
  try {
    const result = await User.approveUser(userId);
    res.status(200).json({ message: 'User approved.' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving user.' });
  }
}

module.exports = { register, login, approveUser };