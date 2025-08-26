import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
import { query } from './db.js';
import { requireAuth } from './auth.js';


import authRouter from './routes/auth.js';
import playersRouter from './routes/players.js';
import playersImportRouter from './routes/players_import.js';
import eventsRouter from './routes/events.js';
import attendanceRouter from './routes/attendance.js';
import injuriesRouter from './routes/injuries.js';
import paymentsRouter from './routes/payments.js';
import uploadsRouter from './routes/uploads.js';
import metricsRouter from './routes/metrics.js';
import rostersRouter from './routes/rosters.js';
import sponsorsRouter from './routes/sponsors.js';
import adsRouter from './routes/ads.js';
import publicRouter from './routes/public.js';
import regulationsRouter from './routes/regulations.js';
import registrationsRouter from './routes/registrations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '';


if (CORS_ORIGIN) app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '5mb' }));


app.get('/api/health', async (_req, res) => {
    try { await query('SELECT 1'); res.json({ ok: true }); } catch { res.status(500).json({ ok: false }); }
});

app.use('/api/public', publicRouter);
app.use('/api/public/regulations', regulationsRouter);     // GET /api/public/regulations?slug=team-rules
app.use('/api/public/registrations', registrationsRouter); // POST /api/public/registrations/public

// Public auth
app.use('/api/auth', authRouter);
app.use('/api/regulations', regulationsRouter);     // admin CRUD
app.use('/api/registrations', registrationsRouter); // admin queue

// Protected below
app.use('/api', requireAuth);
app.use('/api/players', playersRouter);
app.use('/api/players', playersImportRouter); 
app.use('/api/events', eventsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/injuries', injuriesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/rosters', rostersRouter);
app.use('/api/sponsors', sponsorsRouter);
app.use('/api/ads', adsRouter);

// Global error handler fallback
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Unexpected error' });
});


app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));