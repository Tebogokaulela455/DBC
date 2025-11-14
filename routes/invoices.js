const express = require('express');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Create invoice
router.post('/', async (req, res) => {
  const { client_id, policy_id, amount, type } = req.body;
  if (!client_id || !amount || !type) return res.status(400).json({ error: 'Client ID, amount, and type required' });
  try {
    const invoiceNumber = `INV-${Date.now()}`;
    const [result] = await db.execute(
      'INSERT INTO invoices (client_id, policy_id, amount, type, invoice_number) VALUES (?, ?, ?, ?, ?)',
      [client_id, policy_id || null, amount, type, invoiceNumber]
    );
    res.status(201).json({ id: result.insertId, invoice_number: invoiceNumber });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Invoice number already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM invoices ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;