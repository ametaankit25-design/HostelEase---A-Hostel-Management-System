const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

// ── CORS — must be first, before all routes ─────────────────
// Production-ready CORS configuration with credentials support
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
}));

// ── Middleware ──────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
const studentRoutes   = require('./routes/student.routes');
const roomRoutes      = require('./routes/room.routes');
const allotmentRoutes = require('./routes/allotment.routes');
const paymentRoutes   = require('./routes/payment.routes');
const authRoutes      = require('./routes/auth.routes');
const reportRoutes    = require('./routes/report.routes');

app.use('/api/students', studentRoutes);
app.use('/api/rooms',    roomRoutes);
app.use('/api/allot',    allotmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/reports',  reportRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HostelEase API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ── Environment Check (for debugging) ───────────────────────
app.get('/api/health', (req, res) => {
  const envCheck = {
    mongoUri: !!process.env.MONGO_URI,
    jwtSecret: !!process.env.JWT_SECRET,
    emailUser: !!process.env.EMAIL_USER,
    emailPass: !!process.env.EMAIL_PASS,
    clientUrl: process.env.CLIENT_URL || 'not set',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000
  };
  
  res.json({
    success: true,
    message: 'Environment variables check',
    env: envCheck,
    dbStatus: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

module.exports = app;