const jwt  = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // If no token was provided at all
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided. Please log in.',
      });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists.',
      });
    }

    req.user = user; // attach the full user object to the request

    // ── Step 4: Pass control to the next handler ──────────────
    // Calling next() means "everything is fine, continue to the route handler"
    next();

  } catch (error) {
    // jwt.verify() throws specific errors we can check:

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — token has expired. Please log in again.',
      });
    }

    // Unexpected error
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { protect };