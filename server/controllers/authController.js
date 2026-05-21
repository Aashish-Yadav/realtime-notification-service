const jwt  = require('jsonwebtoken');
const User = require('../models/userModel');

// ─────────────────────────────────────────────────────────────
// HELPER: Generate a JWT token for a given user ID
// ─────────────────────────────────────────────────────────────
//
// HOW JWT WORKS (plain English):
//   jwt.sign() takes 3 things:
//     1. PAYLOAD  — data to embed in the token (we store user's ID)
//     2. SECRET   — a password only your server knows, used to "sign" the token
//     3. OPTIONS  — e.g. expiry time
//
//   It returns a string like: "eyJhbG.eyJ1c2.SflKx"
//
//   Later, jwt.verify() can decode it AND confirm the signature is genuine.
//   If someone tampers with the token (e.g. changes the user ID),
//   the signature won't match and verify() throws an error.
//
// ANALOGY: A government-issued ID card.
//   - Your name/photo = the payload (visible info)
//   - The hologram    = the signature (impossible to fake)
//   - Expiry date     = the expiresIn option
//
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },          // payload — what we embed in the token
    process.env.JWT_SECRET,  // secret — only our server knows this
    { expiresIn: '7d' }      // token expires in 7 days (user must re-login)
  );
};

// ─────────────────────────────────────────────────────────────
// REGISTER  — POST /api/auth/register
// ─────────────────────────────────────────────────────────────
// What it does:
//   1. Reads name, email, password from request body
//   2. Checks if email is already taken
//   3. Creates a new User (password is auto-hashed by the model's pre-save hook)
//   4. Returns the user info + a JWT token
//
// The frontend will store this token and send it with future requests.
//
const register = async (req, res) => {
  try {
    // ── Step 1: Pull data from the request body ───────────────
    // req.body is what the frontend POSTed as JSON
    // Example: { "name": "John", "email": "john@mail.com", "password": "123456" }
    const { name, email, password } = req.body;

    // ── Step 2: Basic validation ──────────────────────────────
    // Never trust the frontend to validate — always check on the server too
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // ── Step 3: Check if email already exists ─────────────────
    // User.findOne() searches the database for ONE document matching the filter
    // If nothing found, it returns null
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({  // 409 = Conflict
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // ── Step 4: Create the user ───────────────────────────────
    // User.create() does two things:
    //   a) Creates a new User instance
    //   b) Saves it to MongoDB
    //
    // The pre('save') hook in User.js automatically hashes the password
    // before it's saved. We don't need to do anything extra here.
    //
    // MongoDB also auto-generates:
    //   - _id (unique document ID)
    //   - apiKey (from the uuidv4 default in the schema)
    //   - createdAt, updatedAt (from timestamps: true)
    const user = await User.create({ name, email, password });

    // ── Step 5: Generate JWT ──────────────────────────────────
    const token = generateToken(user._id);

    // ── Step 6: Send response ─────────────────────────────────
    // 201 = "Created" (something new was created, not just "OK")
    // We send back the token + user info (but NOT the password)
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        apiKey:   user.apiKey,  // frontend needs this to display the script snippet
      },
    });

  } catch (error) {
    // If anything unexpected goes wrong, send a 500 error
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN  — POST /api/auth/login
// ─────────────────────────────────────────────────────────────
// What it does:
//   1. Reads email, password from request body
//   2. Finds the user by email
//   3. Compares the entered password with the stored hash
//   4. If correct → return JWT token
//   5. If wrong   → return error (vague on purpose, security best practice)
//
// WHY BE VAGUE ON LOGIN ERRORS?
//   If we say "email not found" vs "wrong password" separately,
//   an attacker can enumerate valid emails. Saying "invalid credentials"
//   for BOTH cases gives away less information.
//
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Step 1: Validate input ────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // ── Step 2: Find user by email ────────────────────────────
    // IMPORTANT: .select('+password') — remember how we set password's
    // "select: false" in the schema? That means it's excluded by default.
    // Here we explicitly ASK for it back because we need to compare it.
    // The "+" means "include this field even though it's excluded by default"
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({  // 401 = Unauthorized
        success: false,
        message: 'Invalid email or password',  // vague on purpose
      });
    }

    // ── Step 3: Compare password ──────────────────────────────
    // user.comparePassword() is the custom method we added in User.js
    // It runs bcrypt.compare(entered, stored_hash) and returns true/false
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',  // same message as "user not found"
      });
    }

    // ── Step 4: Generate JWT + respond ───────────────────────
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        apiKey: user.apiKey,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET ME  — GET /api/auth/me
// ─────────────────────────────────────────────────────────────
// Returns the currently logged-in user's profile.
// This route will be PROTECTED — only works with a valid token.
//
// WHY IS THIS USEFUL?
//   When the React app loads, it checks localStorage for a saved token,
//   then calls /api/auth/me to verify the token is still valid
//   and to get the user's current info (name, apiKey, etc.)
//
const getMe = async (req, res) => {
  try {
    // req.user is set by the "protect" middleware (see middleware/auth.js)
    // It contains the user ID decoded from the JWT
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        apiKey:    user.apiKey,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// REGENERATE API KEY  — POST /api/auth/regenerate-key
// ─────────────────────────────────────────────────────────────
// Lets a user get a fresh API key (e.g. if their current one is compromised)
// Protected route — must be logged in.
//
const regenerateApiKey = async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');

    // findByIdAndUpdate() finds a document and updates it in one operation
    // { new: true } means "return the UPDATED document, not the old one"
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { apiKey: uuidv4() },
      { new: true }
    );

    res.json({
      success: true,
      message: 'API key regenerated. Update the script on your sites!',
      apiKey: user.apiKey,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export all functions so the route file can use them
module.exports = { register, login, getMe, regenerateApiKey };