// ─────────────────────────────────────────────────────────────
//  server/index.js  —  Mayank Sharma Portfolio Backend
// ─────────────────────────────────────────────────────────────
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const contactRouter = require('./routes/contact');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.SITE_URL
    : '*',
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting (global) ────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,   // 15 minutes
  max      : 100,
  message  : { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ── Serve static frontend ─────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/contact', contactRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Catch-all: serve index.html for any unknown route ─────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Mayank Sharma Portfolio running at http://localhost:${PORT}`);
  console.log(`    ENV : ${process.env.NODE_ENV || 'development'}\n`);
});
