// routes/subscriptions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subscription = require('../models/Subscription');

// Get all subscriptions for current user
router.get('/', auth, async (req, res) => {
  try {
    const subs = await Subscription.find({ userId: req.userId }).lean();
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new subscription
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    const sub = await Subscription.create({ ...data, userId: req.userId });
    res.status(201).json(sub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single subscription
router.get('/:id', auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!sub) return res.status(404).json({ message: 'Not found' });
    res.json(sub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subscription
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true },
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subscription
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Subscription.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
