// backend/models/Subscription.js
// -------------------------------------------------------
// Mongoose Subscription model for SpendLens.
//
// A Mongoose model maps to a MongoDB collection.
// When we call mongoose.model('Subscription', subscriptionSchema),
// Mongoose creates or uses the "subscriptions" collection in Atlas.
//
// In SpendLens, each subscription document represents a recurring
// payment (e.g., Netflix, Spotify, Gym membership) and belongs
// to a specific registered user via the `owner` field.
// -------------------------------------------------------

const mongoose = require('mongoose');

// ── 1. Define the Subscription Schema ──────────────────
const subscriptionSchema = new mongoose.Schema(
  {
    // Owner: references the User model's _id.
    // Every subscription MUST be linked to an authenticated user.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner (User ID) is required'],
      index: true, // index for fast queries by user
    },

    // Name of the service (e.g., "Netflix", "Spotify", "Amazon Prime")
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
    },

    // Category for expense breakdown and overlap detection
    // (e.g., "Entertainment", "Music", "Productivity", "Cloud Storage")
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Other',
    },

    // Price/cost amount as entered by the user (in INR ₹)
    cost: {
      type: Number,
      required: [true, 'Cost amount is required'],
      min: [0, 'Cost cannot be negative'],
    },

    // Frequency of billing: Weekly, Monthly, Quarterly, or Yearly
    billingCycle: {
      type: String,
      required: [true, 'Billing cycle is required'],
      enum: {
        values: ['Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Annual'],
        message: '{VALUE} is not a supported billing cycle',
      },
      default: 'Monthly',
    },

    // Normalized monthly expense used for budget calculations and analytics
    monthlyCost: {
      type: Number,
      default: 0,
      min: [0, 'Monthly cost cannot be negative'],
    },

    // Next renewal / billing date (optional)
    // Converts empty strings to null so optional HTML date inputs won't fail
    renewalDate: {
      type: Date,
      default: null,
      set: (val) => (val === '' ? null : val),
    },

    // Payment method used (e.g., "Credit Card", "UPI", "Debit Card")
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Other',
    },

    // Current subscription status
    status: {
      type: String,
      enum: {
        values: ['Active', 'Paused', 'Cancelled'],
        message: '{VALUE} is not a supported status',
      },
      default: 'Active',
    },

    // Subscription priority (used by Cost Leak Detector & Optimizer)
    priority: {
      type: String,
      enum: {
        values: ['Essential', 'High Priority', 'Medium Priority', 'Low Priority', 'Optional'],
        message: '{VALUE} is not a supported priority level',
      },
      default: 'Medium Priority',
    },

    // Optional user notes (e.g., "Shared with family", "Annual discount")
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    // ── 2. Automatic Timestamps ──────────────────────────
    // Adds createdAt and updatedAt ISO date fields automatically
    timestamps: true,
  }
);

// ── 3. Helper: calculate monthly equivalent cost ────────
function computeMonthlyCost(cost, billingCycle) {
  const numericCost = Number(cost) || 0;
  const cycle = String(billingCycle || 'Monthly').toLowerCase();

  switch (cycle) {
    case 'weekly':
      return Math.round(((numericCost * 52) / 12) * 100) / 100;
    case 'monthly':
      return numericCost;
    case 'quarterly':
      return Math.round((numericCost / 3) * 100) / 100;
    case 'yearly':
    case 'annual':
      return Math.round((numericCost / 12) * 100) / 100;
    default:
      return numericCost;
  }
}

// ── 4. Pre-save hook: auto-compute monthlyCost ──────────
// In Mongoose 9+, middleware functions must be async/promise-based or synchronous.
// The `next` callback has been removed and must not be called.
subscriptionSchema.pre('save', async function () {
  if (this.cost !== undefined && this.billingCycle) {
    this.monthlyCost = computeMonthlyCost(this.cost, this.billingCycle);
  }
});

// ── 5. Export the Subscription model ────────────────────
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
