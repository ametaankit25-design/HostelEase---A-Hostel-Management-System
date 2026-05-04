const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

// ── CORS — must be first, before all routes ─────────────────
// credentials: true is required for cookies to work cross-origin
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
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