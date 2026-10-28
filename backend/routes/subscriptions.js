// backend/routes/subscriptions.js
// -------------------------------------------------------
// Subscription API Routes.
//
// All routes are protected by the `protect` JWT middleware.
// Only authenticated requests with a valid Bearer token can
// access these endpoints.
//
// Endpoints:
//   GET    /api/subscriptions      → List user's subscriptions
//   POST   /api/subscriptions      → Create new subscription
//   GET    /api/subscriptions/:id  → Get single subscription
//   PUT    /api/subscriptions/:id  → Update subscription
//   DELETE /api/subscriptions/:id  → Delete subscription
// -------------------------------------------------------

const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');

// Protect all subscription endpoints
router.use(protect);

// Collection routes: /api/subscriptions
router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

// Item routes: /api/subscriptions/:id
router.route('/:id')
  .get(getSubscriptionById)
  .put(updateSubscription)
  .delete(deleteSubscription);

module.exports = router;
