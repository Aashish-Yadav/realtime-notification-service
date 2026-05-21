const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
    userAgent: {
      type: String,
      default: '',
    }, 
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


SubscriptionSchema.index({ endpoint: 1 }, { unique: true });

SubscriptionSchema.index({ site: 1, isActive: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);