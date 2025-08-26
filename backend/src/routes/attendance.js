import { Router } from 'express';
import Joi from 'joi';
import { query, tx } from '../db.js';
import { requireAdmin } from '../auth.js';


const router = Router();


const itemSchema = Joi.object({
event_id: Joi.number().integer().required(),
player_id: Joi.number().integer().required(),
status: Joi.string().valid('present','absent','late').required(),
notes: Joi.string().optional().allow('',null)
});


router.post('/', requireAdmin, async (req,res)=>{
const { error, value } = itemSchema.validate(req.body); if(error) return res.status(400).json({ error: error.message });
try {
const sql = `INSERT INTO attendance(event_id, player_id, status, notes)
VALUES($1,$2,$3,$4)
ON CONFLICT(event_id, player_id)
DO UPDATE SET status=EXCLUDED.status, notes=EXCLUDED.notes, updated_at=NOW()
RETURNING *`;
const { rows } = await query(sql, [value.event_id, value.player_id, value.status, value.notes ?? null]);
res.status(201).json(rows[0]);
} catch { res.status(500).json({ error:'Failed to save attendance' }); }
});


router.post('/bulk', requireAdmin, async (req,res)=>{
const items = Array.isArray(req.body.items) ? req.body.items : [];
try {
await tx(async (c)=>{
for (const it of items){
const { error, value } = itemSchema.validate(it); if(error) throw new Error(error.message);
await c.query(`INSERT INTO attendance(event_id, player_id, status, notes)
VALUES($1,$2,$3,$4)
ON CONFLICT(event_id, player_id)
DO UPDATE SET status=EXCLUDED.status, notes=EXCLUDED.notes, updated_at=NOW()`,
[value.event_id, value.player_id, value.status, value.notes ?? null]);
}
});
res.json({ ok:true, count: items.length });
} catch(e) { res.status(400).json({ error: e.message || 'Bulk failed' }); }
});


export default router;