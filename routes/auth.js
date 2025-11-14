const express = require('express');
const db = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const router = express.Router();

// Register (pending approval)
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const hashedPass = await hashPassword(password);
    const [result] = await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPass]);
    res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND approved = TRUE', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials or not approved' });
    const user = rows[0];
    const validPass = await comparePassword(password, user.password);
    if (!validPass) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;