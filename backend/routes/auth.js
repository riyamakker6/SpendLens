// backend/routes/auth.js
// -------------------------------------------------------
// Authentication routes: Signup and Login.
//
// POST /api/auth/signup  → create a new user account
// POST /api/auth/login   → sign in to an existing account
//
// Both return a JWT token on success.
// -------------------------------------------------------

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

const router = express.Router();

// ── Helper: generate a JWT for a given user ────────────
// The token contains the user's id and email in the payload.
// It expires in 7 days (standard for college project demo).
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    { id: user._id, email: user.email },   // payload (public info only)
    process.env.JWT_SECRET,                 // secret from .env
    { expiresIn: '7d' }                     // token lifespan
  );
}

// ────────────────────────────────────────────────────────
// POST /api/auth/signup
// ────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'All fields are required (name, email, password)',
      });
    }

    // 2. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // 3. Normalize email (lowercase and trimmed)
    const normalizedEmail = email.toLowerCase().trim();

    // 4. Check if a user with this email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    // 5. Hash the password (never store plaintext)
    //    Salt rounds = 10 is standard security for bcrypt
    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Create and save the user
    const user = await User.create({
      name:     name.trim(),
      email:    normalizedEmail,
      password: passwordHash,    // hashed, never plaintext
    });

    // 7. Generate a JWT
    const token = generateToken(user);

    // 8. Respond (never include the password hash)
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // 2. Find the user by normalized email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // 3. Verify the password using the model's matchPassword method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // 4. Generate a JWT
    const token = generateToken(user);

    // 5. Respond (never include the password hash)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
