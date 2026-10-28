// backend/models/Budget.js
// -------------------------------------------------------
// Mongoose Budget model for SpendLens.
//
// Represents a user's monthly target spending limit in INR (₹).
// Each user has at most one budget document, enforced by a unique
// index on the `owner` field.
// -------------------------------------------------------

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    // Reference to the authenticated User
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner (User ID) is required'],
      unique: true, // Guarantees exactly one budget per user
      index: true,
    },

    // Target monthly spending limit in INR (₹)
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget amount cannot be negative'],
      default: 0,
    },
  },
  {
    // Automatic timestamps: createdAt, updatedAt
    timestamps: true,
  }
);

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
