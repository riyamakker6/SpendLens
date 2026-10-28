// backend/controllers/subscriptionController.js
// -------------------------------------------------------
// Controller functions for Subscription CRUD operations.
//
// Every operation enforces strict user ownership:
//   - Subscriptions are filtered by `owner: req.user._id`.
//   - A user can NEVER view, edit, or delete another user's data.
//   - `owner` is always derived from the verified JWT in `req.user`.
// -------------------------------------------------------

const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');

// Allowed enum values for validation
const ALLOWED_CYCLES = ['Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Annual'];
const ALLOWED_STATUSES = ['Active', 'Paused', 'Cancelled'];
const ALLOWED_PRIORITIES = ['Essential', 'High Priority', 'Medium Priority', 'Low Priority', 'Optional'];

// ── 1. GET /api/subscriptions ──────────────────────────
// List all subscriptions belonging to the authenticated user
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (err) {
    console.error('Error fetching subscriptions:', err.message);
    res.status(500).json({ error: 'Server error while fetching subscriptions' });
  }
};

// ── 2. GET /api/subscriptions/:id ──────────────────────
// Retrieve a single subscription by ID (only if owned by current user)
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid subscription ID format' });
    }

    const subscription = await Subscription.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (err) {
    console.error('Error fetching subscription by ID:', err.message);
    res.status(500).json({ error: 'Server error while fetching subscription' });
  }
};

// ── 3. POST /api/subscriptions ─────────────────────────
// Create a new subscription owned by the authenticated user
const createSubscription = async (req, res) => {
  try {
    const {
      name,
      category,
      cost,
      billingCycle,
      renewalDate,
      paymentMethod,
      status,
      priority,
      notes,
    } = req.body;

    // 1. Validate required fields
    if (!name || cost === undefined || cost === null || cost === '') {
      return res.status(400).json({
        error: 'Subscription name and cost are required',
      });
    }

    // 2. Validate numeric cost
    const numericCost = Number(cost);
    if (isNaN(numericCost) || numericCost < 0) {
      return res.status(400).json({
        error: 'Cost must be a valid positive number',
      });
    }

    // 3. Validate enums if provided
    if (billingCycle && !ALLOWED_CYCLES.includes(billingCycle)) {
      return res.status(400).json({
        error: `Invalid billing cycle. Allowed: ${ALLOWED_CYCLES.join(', ')}`,
      });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority. Allowed: ${ALLOWED_PRIORITIES.join(', ')}`,
      });
    }

    // 4. Construct subscription (owner is ALWAYS from req.user._id, never from body)
    const subscription = new Subscription({
      owner: req.user._id,
      name: name.trim(),
      category: category ? category.trim() : 'Other',
      cost: numericCost,
      billingCycle: billingCycle || 'Monthly',
      renewalDate: renewalDate || null,
      paymentMethod: paymentMethod ? paymentMethod.trim() : 'Other',
      status: status || 'Active',
      priority: priority || 'Medium Priority',
      notes: notes ? notes.trim() : '',
    });

    // Save document (triggers pre('save') to auto-calculate monthlyCost)
    await subscription.save();

    res.status(201).json(subscription);
  } catch (err) {
    console.error('Error creating subscription:', err.message);
    res.status(500).json({ error: 'Server error while creating subscription' });
  }
};

// ── 4. PUT /api/subscriptions/:id ──────────────────────
// Update an existing subscription (only if owned by current user)
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid subscription ID format' });
    }

    // 2. Locate subscription belonging to this user
    const subscription = await Subscription.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // 3. Extract only allowed update fields (protect owner, _id, timestamps)
    const {
      name,
      category,
      cost,
      billingCycle,
      renewalDate,
      paymentMethod,
      status,
      priority,
      notes,
    } = req.body;

    // 4. Validate and apply updates
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Subscription name cannot be empty' });
      }
      subscription.name = name.trim();
    }

    if (cost !== undefined) {
      const numericCost = Number(cost);
      if (isNaN(numericCost) || numericCost < 0) {
        return res.status(400).json({ error: 'Cost must be a valid positive number' });
      }
      subscription.cost = numericCost;
    }

    if (billingCycle !== undefined) {
      if (!ALLOWED_CYCLES.includes(billingCycle)) {
        return res.status(400).json({
          error: `Invalid billing cycle. Allowed: ${ALLOWED_CYCLES.join(', ')}`,
        });
      }
      subscription.billingCycle = billingCycle;
    }

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
        });
      }
      subscription.status = status;
    }

    if (priority !== undefined) {
      if (!ALLOWED_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          error: `Invalid priority. Allowed: ${ALLOWED_PRIORITIES.join(', ')}`,
        });
      }
      subscription.priority = priority;
    }

    if (category !== undefined) {
      subscription.category = category.trim() || 'Other';
    }

    if (renewalDate !== undefined) {
      subscription.renewalDate = renewalDate || null;
    }

    if (paymentMethod !== undefined) {
      subscription.paymentMethod = paymentMethod.trim() || 'Other';
    }

    if (notes !== undefined) {
      subscription.notes = notes.trim();
    }

    // 5. Save: triggers pre-save hook to re-calculate monthlyCost if cost/cycle changed
    await subscription.save();

    res.json(subscription);
  } catch (err) {
    console.error('Error updating subscription:', err.message);
    res.status(500).json({ error: 'Server error while updating subscription' });
  }
};

// ── 5. DELETE /api/subscriptions/:id ───────────────────
// Delete a subscription (only if owned by current user)
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid subscription ID format' });
    }

    // 2. Find and delete enforcing ownership
    const subscription = await Subscription.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  } catch (err) {
    console.error('Error deleting subscription:', err.message);
    res.status(500).json({ error: 'Server error while deleting subscription' });
  }
};

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
