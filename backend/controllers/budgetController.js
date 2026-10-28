// backend/controllers/budgetController.js
// -------------------------------------------------------
// Controller for Budget operations (GET & PUT).
//
// Enforces strict user ownership:
//   - Owner is derived exclusively from `req.user._id` (JWT).
//   - Upsert strategy guarantees each user has at most one budget.
//   - Validates that budget amounts are finite, non-negative numbers.
// -------------------------------------------------------

const Budget = require('../models/Budget');

// ── 1. GET /api/budget ─────────────────────────────────
// Retrieves the authenticated user's monthly budget
const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ owner: req.user._id });
    if (!budget) {
      // Default response for users who haven't set a budget yet
      return res.json({ amount: 0 });
    }
    res.json(budget);
  } catch (err) {
    console.error('Error fetching budget:', err.message);
    res.status(500).json({ error: 'Server error while fetching budget' });
  }
};

// ── 2. PUT /api/budget ─────────────────────────────────
// Creates or updates the authenticated user's monthly budget (upsert)
const updateBudget = async (req, res) => {
  try {
    const rawAmount =
      req.body.amount !== undefined
        ? req.body.amount
        : req.body.budget !== undefined
        ? req.body.budget
        : req.body.monthlyBudget;

    // 1. Validate presence of amount
    if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
      return res.status(400).json({ error: 'Budget amount is required' });
    }

    // 2. Validate numeric type, finiteness, and non-negativity
    const numericAmount = Number(rawAmount);
    if (isNaN(numericAmount) || !isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        error: 'Budget amount must be a finite, non-negative number',
      });
    }

    // 3. Atomically upsert the single budget document for this user
    const budget = await Budget.findOneAndUpdate(
      { owner: req.user._id },
      { $set: { amount: numericAmount, owner: req.user._id } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(budget);
  } catch (err) {
    if (err.code === 11000) {
      // Concurrent upsert collision on unique owner index: retry update safely
      try {
        const retryBudget = await Budget.findOneAndUpdate(
          { owner: req.user._id },
          { $set: { amount: numericAmount } },
          { new: true, runValidators: true }
        );
        return res.json(retryBudget);
      } catch (retryErr) {
        console.error('Error during budget retry update:', retryErr.message);
      }
    }
    console.error('Error updating budget:', err.message);
    res.status(500).json({ error: 'Server error while updating budget' });
  }
};

module.exports = {
  getBudget,
  updateBudget,
};
