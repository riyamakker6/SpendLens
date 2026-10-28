// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    req.session.userId = user._id;
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.session.userId = user._id;

req.session.save((err) => {
  if (err) {
    console.error("Session save error:", err);
    return res.status(500).json({ message: "Could not save login session" });
  }

  res.json({ id: user._id, name: user.name, email: user.email });
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    const isProduction = process.env.NODE_ENV === 'production';

res.clearCookie('spendlens.sid', {
  path: '/',
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
});
    res.json({ message: 'Logged out' });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const user = await User.findById(req.session.userId).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

module.exports = router;
