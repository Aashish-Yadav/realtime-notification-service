const webpush      = require('web-push');
const User         = require('../models/userModel');
const Site         = require('../models/siteModel');
const Subscription = require('../models/subscriptionModel');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const getVapidPublicKey = (req, res) => {
  res.json({ success: true, publicKey: process.env.VAPID_PUBLIC_KEY });
};

const subscribe = async (req, res) => {
  try {
    const { subscription, apiKey, domain, siteName } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ success: false, message: 'Invalid subscription object.' });
    }

    if (!apiKey || !domain) {
      return res.status(400).json({ success: false, message: 'apiKey and domain are required.' });
    }

    const owner = await User.findOne({ apiKey });
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Invalid API key.' });
    }

    const site = await Site.findOneAndUpdate(
      { owner: owner._id, domain },
      { $setOnInsert: { owner: owner._id, domain, name: siteName || domain, isActive: true } },
      { new: true, upsert: true }
    );

    const isNew = !(await Subscription.findOne({ endpoint: subscription.endpoint }));

    await Subscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        site:      site._id,
        owner:     owner._id,
        endpoint:  subscription.endpoint,
        keys:      { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
        userAgent: req.headers['user-agent'] || '',
        isActive:  true,
      },
      { upsert: true, new: true }
    );

    if (isNew) {
      await Site.findByIdAndUpdate(site._id, { $inc: { subscriberCount: 1 } });
    }

    res.status(201).json({ success: true, message: 'Subscribed successfully.', siteId: site._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getVapidPublicKey, subscribe };