import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/routes.auth.js';
import snowflakeRoutes from './routes/routes.snowflake.js';
import metricsRoutes from './routes/routes.metrics.js';
import { startBackgroundMonitoring } from './services/services.monitoring.js';

const app = express();

// CORS - Allow Next.js frontend to call this backend
app.use(cors({
  origin: 'http://localhost:3000',  // Your Next.js app
  credentials: true  // Allow cookies/sessions
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/snowflake', snowflakeRoutes);
app.use('/api/metrics', metricsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

startBackgroundMonitoring();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Background monitoring active`);
});