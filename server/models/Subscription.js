// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String },
  cost: { type: Number },
  billingCycle: { type: String, enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Annual'], default: 'Monthly' },
  monthlyCost: { type: Number },
  renewalDate: { type: String }, // store as YYYY-MM-DD string
  status: { type: String, default: 'Active' },
  paymentMethod: { type: String },
  priority: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
