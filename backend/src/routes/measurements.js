import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db.js';

const router = Router();

const measurementSchema = Joi.object({
  taken_at: Joi.date().optional(),
  height_cm: Joi.number().precision(2).optional().allow(null),
  weight_kg: Joi.number().precision(2).optional().allow(null),
  body_fat_pct: Joi.number().precision(2).optional().allow(null),
  resting_hr: Joi.number().integer().optional().allow(null),
  notes: Joi.string().optional().allow('', null)
});

router.get('/:playerId', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM measurements WHERE player_id = $1 ORDER BY taken_at DESC',
      [req.params.playerId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list measurements' });
  }
});

router.post('/:playerId', async (req, res) => {
  try {
    const { error, value } = measurementSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const fields = ['player_id','taken_at','height_cm','weight_kg','body_fat_pct','resting_hr','notes'];
    const vals = [
      req.params.playerId,
      value.taken_at ?? null,
      value.height_cm ?? null,
      value.weight_kg ?? null,
      value.body_fat_pct ?? null,
      value.resting_hr ?? null,
      value.notes ?? null
    ];

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(',');
    const sql = `
      INSERT INTO measurements (${fields.join(',')})
      VALUES (${placeholders})
      RETURNING *
    `;
    const { rows } = await query(sql, vals);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create measurement' });
  }
});

export default router;
