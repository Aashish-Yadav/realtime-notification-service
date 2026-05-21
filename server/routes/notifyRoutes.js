const express = require('express');
const router  = express.Router();

const { sendNotification } = require('../controllers/notifyController');
const { protect }          = require('../middleware/authMiddleware');

router.post('/', protect, sendNotification);

module.exports = router;