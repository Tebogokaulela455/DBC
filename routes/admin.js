const express = require('express');
const db = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

router.use(auth);
router.use(adminAuth);

// Get pending users
router.get('/pending-users', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, email FROM users WHERE approved = FALSE');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve user
router.put('/approve/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE users SET approved = TRUE WHERE id = ?', [id]);
    res.json({ message: 'User approved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;