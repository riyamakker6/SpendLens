// backend/routes/budget.js
// -------------------------------------------------------
// Budget API Routes.
//
// All routes are protected by the `protect` JWT middleware.
// Owner is derived exclusively from `req.user._id`.
//
// Endpoints:
//   GET /api/budget  → Retrieve the logged-in user's monthly budget
//   PUT /api/budget  → Create or update the logged-in user's monthly budget (upsert)
// -------------------------------------------------------

const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getBudget, updateBudget } = require('../controllers/budgetController');

// All budget endpoints require authentication
router.use(protect);

router.route('/')
  .get(getBudget)
  .put(updateBudget);

module.exports = router;
