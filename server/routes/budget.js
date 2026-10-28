const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('budget');
    res.json({ budget: user?.budget || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const { budget } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { budget },
      { new: true, fields: 'budget' },
    );
    res.json({ budget: user?.budget || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
