const webpush      = require('web-push');
const Site         = require('../models/siteModel');
const Subscription = require('../models/subscriptionModel');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendNotification = async (req, res) => {
  try {
    const { siteId, title, description, icon, url } = req.body;

    if (!siteId || !title || !description) {
      return res.status(400).json({ success: false, message: 'siteId, title and description are required.' });
    }

    const site = await Site.findOne({ _id: siteId, owner: req.user.id });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });

    if (!site.isActive) {
      return res.status(400).json({ success: false, message: 'This site is paused.' });
    }

    const subscriptions = await Subscription.find({ site: siteId, isActive: true });
    if (subscriptions.length === 0) {
      return res.status(400).json({ success: false, message: 'No active subscribers for this site.' });
    }

    const payload = JSON.stringify({ title, description, icon: icon || '', url: url || '/' });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
          payload
        )
      )
    );

    const expired = [];
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const statusCode = result.reason?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          expired.push(subscriptions[i]._id);
        }
      }
    });

    if (expired.length > 0) {
      await Subscription.updateMany({ _id: { $in: expired } }, { isActive: false });
      await Site.findByIdAndUpdate(siteId, { $inc: { subscriberCount: -expired.length } });
    }

    const sent   = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Notification sent to ${sent} subscriber(s).`,
      stats: { total: subscriptions.length, sent, failed, expiredRemoved: expired.length },
    });
  } catch (error) {
    console.error('Notify error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { sendNotification };