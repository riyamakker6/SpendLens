const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subscription = require('../models/Subscription');

// GET /api/reminders/renewals
// Returns active subscriptions renewing within the next 30 days
router.get('/renewals', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscriptions = await Subscription.find({
      userId: req.userId,
      status: 'Active',
      renewalDate: { $exists: true, $ne: '' }
    }).lean();

    const upcoming = subscriptions
      .map((subscription) => {
        const [year, month, day] = String(subscription.renewalDate).split('-');

        const renewalDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );

        renewalDate.setHours(0, 0, 0, 0);

        const diff = Math.ceil(
          (renewalDate - today) / (1000 * 60 * 60 * 24)
        );

        return {
          ...subscription,
          daysUntil: diff
        };
      })
      .filter(
        (subscription) =>
          subscription.daysUntil >= 0 &&
          subscription.daysUntil <= 30
      )
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .map((subscription) => ({
        id: subscription._id,
        name: subscription.name,
        category: subscription.category,
        renewalDate: subscription.renewalDate,
        cost: subscription.cost,
        billingCycle: subscription.billingCycle,
        monthlyCost: subscription.monthlyCost,
        daysUntil: subscription.daysUntil,
        status:
          subscription.daysUntil === 0
            ? 'today'
            : subscription.daysUntil <= 3
              ? 'due soon'
              : 'upcoming'
      }));

    res.json(upcoming);
  } catch (error) {
    console.error('Renewal reminder error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;