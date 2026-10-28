// backend/middleware/auth.js
// -------------------------------------------------------
// JWT Authentication Middleware.
//
// Inspects incoming requests for an "Authorization" header:
//   Authorization: Bearer <token>
//
// If valid:
//   1. Verifies the token using process.env.JWT_SECRET.
//   2. Finds the user in MongoDB Atlas.
//   3. Attaches the user document to `req.user` (excluding password).
//   4. Calls `next()` to continue to the route handler.
//
// If invalid or missing:
//   Returns HTTP 401 Unauthorized with a clear JSON error message.
// -------------------------------------------------------

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (authHeader) {
      // In case client sends raw token without "Bearer "
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No authentication token provided.',
      });
    }

    // 2. Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in environment variables');
      return res.status(500).json({ error: 'Server authentication configuration error' });
    }

    // 3. Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Verify user still exists in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed. User account no longer exists.',
      });
    }

    // 5. Attach user to request object for downstream controllers
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      error: 'Invalid authentication token.',
    });
  }
};

module.exports = protect;
