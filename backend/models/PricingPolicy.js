const mongoose = require('mongoose');

const pricingPolicySchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true,
    default: 20
  },
  multipliers: {
    compact: { type: Number, default: 0.8 },
    standard: { type: Number, default: 1.0 },
    handicapped: { type: Number, default: 0.5 },
    ev_charging: { type: Number, default: 1.5 }
  },
  weekendMultiplier: {
    type: Number,
    default: 1.2
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PricingPolicy', pricingPolicySchema);
