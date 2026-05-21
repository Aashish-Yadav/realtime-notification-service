const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  getMe,
  regenerateApiKey,
} = require('../controllers/authController');


const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/regenerate-key', protect, regenerateApiKey);


module.exports = router;