const Site         = require('../models/siteModel');
const Subscription = require('../models/subscriptionModel');

const getMySites = async (req, res) => {
  try {
    const sites = await Site.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: sites.length, sites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getSiteById = async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id, owner: req.user.id });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });

    res.json({ success: true, site });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateSite = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const site = await Site.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { name, isActive },
      { new: true, runValidators: true }
    );

    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });

    res.json({ success: true, site });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteSite = async (req, res) => {
  try {
    const site = await Site.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });

    await Subscription.deleteMany({ site: site._id });

    res.json({ success: true, message: 'Site and all its subscriptions deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getSiteSubscribers = async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id, owner: req.user.id });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });

    const subscribers = await Subscription.find({ site: site._id, isActive: true })
      .select('endpoint userAgent createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMySites, getSiteById, updateSite, deleteSite, getSiteSubscribers };