// backend/server.js
// -------------------------------------------------------
// Entry point for the SpendLens Express backend.
// Loads env vars → connects to MongoDB → starts server.
// -------------------------------------------------------

require('dotenv').config();           // reads backend/.env
const express  = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// ── Middleware ──────────────────────────────────────────
// Enable CORS so the frontend (Live Server / file origin) can talk to this API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());             // parse JSON request bodies

// ── Routes ─────────────────────────────────────────────

// Health check: reports both server and database status
app.get('/api/health', (req, res) => {
  // mongoose.connection.readyState: 0=disconnected, 1=connected
  const dbState  = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  res.json({
    status : 'ok',
    message: 'Server is healthy',
    database: dbStatus,
  });
});

// Authentication routes (signup & login)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Subscription routes (protected CRUD operations)
const subscriptionRoutes = require('./routes/subscriptions');
app.use('/api/subscriptions', subscriptionRoutes);

// Budget routes (protected operations)
const budgetRoutes = require('./routes/budget');
app.use('/api/budget', budgetRoutes);

// ── 404 handler for unknown /api/* routes ──────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  next();
});

// ── Centralized error handler ──────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ── Start: connect to DB first, then listen ────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);   // stop the server — don't start without a DB
  });
