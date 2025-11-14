const express = require('express');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Create client
router.post('/', async (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  try {
    const [result] = await db.execute('INSERT INTO clients (name, phone, email, address) VALUES (?, ?, ?, ?)', [name, phone, email, address]);
    res.status(201).json({ id: result.insertId, message: 'Client created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all clients
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM clients');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;