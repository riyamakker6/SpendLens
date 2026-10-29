
require('dotenv').config({
  path: require('path').join(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const reminderRoutes = require('./routes/reminders');
const budgetRoutes = require('./routes/budget');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is missing from server/.env');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error('ERROR: SESSION_SECRET is missing from server/.env');
  process.exit(1);
}

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json());

// app.use(cors({
//   origin: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5500',
//   credentials: true,
// }));

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://spendlenns.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(session({
  name: 'spendlens.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/budget', budgetRoutes);

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Request error:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: 'Internal server error',
  });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SpendLens server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
