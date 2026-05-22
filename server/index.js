require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes')
const notifyRoutes = require('./routes/notifyRoutes')
const subscribeRoutes = require('./routes/subscribeRoutes')
const siteRoutes = require('./routes/siteRoutes')
const path = require('path')



const app = express();

connectDB();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000',
    'https://realtime-notification-service.vercel.app', // your vercel URL
    /\.vercel\.app$/,  // covers all vercel preview deployments
  ],
}));

app.use(express.json());

// Serve SDK static files
app.use('/sdk', express.static(path.join(__dirname, '../client/public/sdk')));


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