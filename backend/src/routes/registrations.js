import { Router } from 'express';
import Joi from 'joi';
import { query, tx } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();

// -------- Helpers --------
function s(v){ return v == null ? null : String(v).trim(); }
function n(v){ const x = Number(v); return Number.isFinite(x) ? x : null; }
function d(v){ if (!v) return null; const dt = new Date(v); return isNaN(+dt) ? null : dt.toISOString().slice(0,10); }
function gender(v){
  const t = String(v ?? '').toLowerCase();
  if (['male','female','nonbinary'].includes(t)) return t;
  throw new Error('gender inválido (male|female|nonbinary)');
}
function position(v){
  const t = s(v)?.toUpperCase() || null;
  const allowed = ['QB','WR','RB','TE','LB','CB','S','DL'];
  return t && allowed.includes(t) ? t : null;
}

const registrationSchema = Joi.object({
  national_id: Joi.string().allow(null, ''),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  gender: Joi.string().valid('male','female','nonbinary').required(),
  position: Joi.string().uppercase().allow(null, ''),
  jersey_number: Joi.number().integer().min(0).max(999).allow(null),
  height_cm: Joi.number().integer().min(100).max(250).allow(null),
  weight_kg: Joi.number().integer().min(30).max(250).allow(null),
  birthdate: Joi.date().allow(null),
  phone: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  emergency_name: Joi.string().allow(null, ''),
  emergency_phone: Joi.string().allow(null, ''),
  emergency_relation: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, '')
});

// -------- Público: crear inscripción --------
router.post('/public', async (req, res) => {
  try {
    const { error, value } = registrationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // normaliza
    const p = {
      national_id: s(value.national_id),
      first_name: s(value.first_name),
      last_name: s(value.last_name),
      gender: gender(value.gender),
      position: position(value.position),
      jersey_number: n(value.jersey_number),
      height_cm: n(value.height_cm),
      weight_kg: n(value.weight_kg),
      birthdate: d(value.birthdate),
      phone: s(value.phone),
      email: s(value.email),
      emergency_name: s(value.emergency_name),
      emergency_phone: s(value.emergency_phone),
      emergency_relation: s(value.emergency_relation),
      notes: s(value.notes)
    };

    const fields = Object.keys(p);
    const vals = fields.map(k => p[k]);
    const ph = fields.map((_, i) => `$${i+1}`).join(',');

    const { rows } = await query(
      `INSERT INTO registrations(${fields.join(',')})
       VALUES(${ph}) RETURNING id, status, created_at`,
      vals
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('registration public error:', e);
    res.status(400).json({ error: e?.message || 'invalid registration' });
  }
});

// -------- Admin: listar por estado --------
router.get('/', requireAdmin, async (req, res) => {
  const status = String(req.query.status || 'pending');
  const { rows } = await query(
    `SELECT * FROM registrations
     WHERE status = $1
     ORDER BY created_at ASC`,
    [status]
  );
  res.json(rows);
});

// -------- Admin: obtener detalle --------
router.get('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await query(`SELECT * FROM registrations WHERE id=$1`, [id]);
  if (!rows[0]) return res.status(404).json({ error:'Not found' });
  res.json(rows[0]);
});

// -------- Admin: marcar invitado (WhatsApp) --------
router.post('/:id/invite', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await query(
    `UPDATE registrations
     SET status='invited', invited_whatsapp_at=NOW(), updated_at=NOW()
     WHERE id=$1 AND status IN ('pending','invited')
     RETURNING id, status, invited_whatsapp_at`, [id]
  );
  if (!rows[0]) return res.status(404).json({ error:'Not found or not allowed' });
  res.json(rows[0]);
});

// Utilidad para formar el link de WhatsApp desde el backend (opcional)
router.get('/:id/whatsapp-link', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await query(`SELECT first_name, last_name, phone FROM registrations WHERE id=$1`, [id]);
  if (!rows[0]) return res.status(404).json({ error:'Not found' });

  const phone = (rows[0].phone || '').replace(/[^0-9+]/g,''); // limpia
  const msg = `Hola ${rows[0].first_name}, te invitamos a la práctica/juego del equipo. Responde este mensaje para confirmar asistencia.`;
  const link = `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(msg)}`;
  res.json({ link });
});

// -------- Admin: aprobar → crea jugador y marca registro --------
router.post('/:id/approve', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const out = await tx(async (c) => {
      const r = (await c.query(`SELECT * FROM registrations WHERE id=$1 FOR UPDATE`, [id])).rows[0];
      if (!r) throw new Error('Not found');
      if (r.status === 'approved') return { already: true };

      // Crea o actualiza player por national_id/email
      const upsert = await c.query(`
        INSERT INTO players (
          national_id, first_name, last_name, gender, position, jersey_number,
          height_cm, weight_kg, birthdate, phone, email,
          emergency_name, emergency_phone, emergency_relation,
          is_active, is_public
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, TRUE, TRUE)
        ON CONFLICT (national_id) WHERE national_id IS NOT NULL
        DO UPDATE SET
          first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, gender=EXCLUDED.gender,
          position=EXCLUDED.position, jersey_number=EXCLUDED.jersey_number,
          height_cm=EXCLUDED.height_cm, weight_kg=EXCLUDED.weight_kg, birthdate=EXCLUDED.birthdate,
          phone=EXCLUDED.phone, email=EXCLUDED.email,
          emergency_name=EXCLUDED.emergency_name, emergency_phone=EXCLUDED.emergency_phone,
          emergency_relation=EXCLUDED.emergency_relation, updated_at=NOW()
        RETURNING id
      `, [
        r.national_id, r.first_name, r.last_name, r.gender, r.position, r.jersey_number,
        r.height_cm, r.weight_kg, r.birthdate, r.phone, r.email,
        r.emergency_name, r.emergency_phone, r.emergency_relation
      ]);

      await c.query(`
        UPDATE registrations
        SET status='approved', approved_at=NOW(), updated_at=NOW()
        WHERE id=$1`, [id]
      );
      return { player_id: upsert.rows[0]?.id || null };
    });

    res.json({ ok:true, ...out });
  } catch (e) {
    console.error('approve registration error:', e);
    res.status(400).json({ error: e?.message || 'approve failed' });
  }
});

// -------- Admin: rechazar --------
router.post('/:id/reject', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const reason = String(req.body?.reason || '').slice(0, 500);
  const { rows } = await query(
    `UPDATE registrations
     SET status='rejected', reject_reason=$2, rejected_at=NOW(), updated_at=NOW()
     WHERE id=$1 AND status IN ('pending','invited')
     RETURNING id, status, reject_reason, rejected_at`, [id, reason]
  );
  if (!rows[0]) return res.status(404).json({ error:'Not found or not allowed' });
  res.json(rows[0]);
});

export default router;
