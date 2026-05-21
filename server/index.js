require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes')
const notifyRoutes = require('./routes/notifyRoutes')
const subscribeRoutes = require('./routes/subscribeRoutes')
const siteRoutes = require('./routes/siteRoutes')



const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/sites',   siteRoutes);
app.use('/api/notify',  notifyRoutes)  ;

// Routes
app.get('/test/health', (req, res) => {
    res.send("server working fine");
});

// PORT
const PORT = process.env.PORT || 8080;

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/test/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});