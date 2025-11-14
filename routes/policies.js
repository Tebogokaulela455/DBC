const express = require('express');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Create policy
router.post('/', async (req, res) => {
  const { client_id, policy_number, type, premium, start_date, end_date } = req.body;
  if (!client_id || !policy_number || !type || !premium || !start_date || !end_date) return res.status(400).json({ error: 'All fields required' });
  try {
    const [result] = await db.execute(
      'INSERT INTO policies (client_id, policy_number, type, premium, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, policy_number, type, premium, start_date, end_date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Policy number already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get all policies
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM policies');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send reminder (placeholder for SMS)
router.post('/reminders', async (req, res) => {
  const { client_id } = req.body;
  if (!client_id) return res.status(400).json({ error: 'Client ID required' });
  try {
    // Placeholder - in prod, send SMS
    console.log(`Reminder sent for client ${client_id}`);
    res.json({ message: 'Reminder sent' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;