const express = require('express');
const router  = express.Router();

const { getVapidPublicKey, subscribe } = require('../controllers/subscribeController');

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/',                subscribe);

module.exports = router;