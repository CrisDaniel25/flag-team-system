import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/players', async (_req, res) => {
    const { rows } = await query(`SELECT id, first_name, last_name, gender, position, jersey_number, height_cm, weight_kg FROM players WHERE is_public AND is_active ORDER BY last_name, first_name`);
    res.json(rows);
});

router.get('/events/upcoming', async (req, res) => {
    const limit = Number(req.query.limit || 10);
    const { rows } = await query(`SELECT id, type, starts_at, ends_at, location, opponent, notes FROM events WHERE is_public AND starts_at >= NOW() - INTERVAL '1 day' ORDER BY starts_at ASC LIMIT $1`, [limit]);
    res.json(rows);
});

router.get('/sponsors', async (_req, res) => {
    const { rows } = await query(`SELECT * FROM sponsors WHERE active ORDER BY sort_order DESC, name`);
    res.json(rows);
});

router.get('/ads', async (req, res) => {
    const placement = String(req.query.placement || 'hero');
    const { rows } = await query(`SELECT * FROM ads WHERE active AND placement = $1 AND (start_at IS NULL OR start_at <= NOW()) AND (end_at IS NULL OR end_at >= NOW()) ORDER BY created_at DESC LIMIT 10`, [placement]);
    res.json(rows);
});

router.get('/events/range', async (req,res)=>{
  // ?from=YYYY-MM-DD&to=YYYY-MM-DD
  const from = req.query.from;
  const to = req.query.to;
  if (!from || !to) return res.status(400).json({ error: 'from/to requeridos' });
  const { rows } = await query(
    `SELECT id, type, starts_at, ends_at, location, opponent, notes
     FROM events
     WHERE is_public AND starts_at >= $1 AND starts_at < ($2::date + INTERVAL '1 day')
     ORDER BY starts_at ASC`, [from, to]);
  res.json(rows);
});

export default router;