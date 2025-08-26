import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/public', async (req, res) => {
  // ?slug=team-rules
  const slug = String(req.query.slug || 'team-rules');
  const { rows } = await query(
    `SELECT slug, title, body_html, updated_at FROM regulations
     WHERE slug=$1 AND is_public = TRUE`, [slug]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Reglamento no encontrado' });
  res.json(rows[0]);
});

// ADMIN — listar todos
router.get('/', requireAdmin, async (_req, res) => {
  const { rows } = await query(`SELECT * FROM regulations ORDER BY updated_at DESC`);
  res.json(rows);
});

// ADMIN — upsert por slug
const regSchema = Joi.object({
  slug: Joi.string().lowercase().required(),
  title: Joi.string().required(),
  body_html: Joi.string().required(),
  is_public: Joi.boolean().default(true)
});

router.post('/', requireAdmin, async (req, res) => {
  const { error, value } = regSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const { slug, title, body_html, is_public } = value;
  const { rows } = await query(`
    INSERT INTO regulations (slug, title, body_html, is_public, updated_by, updated_at)
    VALUES ($1,$2,$3,$4, NULL, NOW())
    ON CONFLICT (slug)
    DO UPDATE SET title=EXCLUDED.title, body_html=EXCLUDED.body_html, is_public=EXCLUDED.is_public, updated_at=NOW()
    RETURNING *`,
    [slug, title, body_html, is_public]
  );
  res.json(rows[0]);
});

export default router;
