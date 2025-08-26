import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';


const router = Router();


const playerSchema = Joi.object({
first_name: Joi.string().trim().required(),
last_name: Joi.string().trim().required(),
gender: Joi.string().valid('male','female','nonbinary').required(),
birthdate: Joi.date().optional().allow(null),
email: Joi.string().email().optional().allow(null,''),
phone: Joi.string().optional().allow(null,''),
position: Joi.string().optional().allow(null,''),
jersey_number: Joi.number().integer().optional().allow(null),
height_cm: Joi.number().precision(2).optional().allow(null),
weight_kg: Joi.number().precision(2).optional().allow(null),
is_active: Joi.boolean().optional(),
notes: Joi.string().optional().allow('',null),
national_id: Joi.string().optional().allow('',null), 
emergency_name: Joi.string().optional().allow('',null), 
emergency_phone: Joi.string().optional().allow('',null), 
emergency_relation: Joi.string().optional().allow('',null) 
});


router.get('/', async (req, res) => {
try {
const { search = '', gender, is_active, limit = 100, offset = 0 } = req.query;
const clauses = []; const vals = [];
if (search) { vals.push(`%${search}%`); clauses.push(`(first_name ILIKE $${vals.length} OR last_name ILIKE $${vals.length})`); }
if (gender) { vals.push(gender); clauses.push(`gender = $${vals.length}`); }
if (is_active !== undefined) { vals.push(is_active === 'true'); clauses.push(`is_active = $${vals.length}`); }
const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
vals.push(limit, offset);
const sql = `SELECT * FROM players ${where} ORDER BY last_name, first_name LIMIT $${vals.length-1} OFFSET $${vals.length}`;
const { rows } = await query(sql, vals);
res.json(rows);
} catch (e) { res.status(500).json({ error: 'Failed to list players' }); }
});


router.get('/:id', async (req,res)=>{
try { const { rows } = await query('SELECT * FROM players WHERE id=$1',[req.params.id]);
if(!rows[0]) return res.status(404).json({ error: 'Not found' }); res.json(rows[0]);
} catch { res.status(500).json({ error: 'Failed to get player' }); }
});


router.post('/', requireAdmin, async (req,res)=>{
const { error, value } = playerSchema.validate(req.body);
if (error) return res.status(400).json({ error: error.message });
const fields = ['first_name','last_name','gender','birthdate','email','phone','position','jersey_number','height_cm','weight_kg','is_active','notes'];
const vals = fields.map(f=> value[f] ?? null); const placeholders = fields.map((_,i)=>`$${i+1}`).join(',');
try {
const { rows } = await query(`INSERT INTO players(${fields.join(',')}) VALUES(${placeholders}) RETURNING *`, vals);
res.status(201).json(rows[0]);
} catch { res.status(500).json({ error: 'Failed to create player' }); }
});


router.put('/:id', requireAdmin, async (req,res)=>{
const { error, value } = playerSchema.validate(req.body, { stripUnknown: true });
if (error) return res.status(400).json({ error: error.message });
const entries = Object.entries(value); if(!entries.length) return res.status(400).json({ error: 'No fields' });
const setSql = entries.map(([k],i)=>`${k}=$${i+1}`).join(', '); const vals = entries.map(([,v])=>v); vals.push(req.params.id);
try {
const { rows } = await query(`UPDATE players SET ${setSql}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals);
if(!rows[0]) return res.status(404).json({ error:'Not found' }); res.json(rows[0]);
} catch { res.status(500).json({ error: 'Failed to update player' }); }
});


router.delete('/:id', requireAdmin, async (req,res)=>{
try {
const { rows } = await query('UPDATE players SET is_active=FALSE, updated_at=NOW() WHERE id=$1 RETURNING *', [req.params.id]);
if(!rows[0]) return res.status(404).json({ error:'Not found' });
res.json({ ok:true, player: rows[0] });
} catch { res.status(500).json({ error: 'Failed to deactivate player' }); }
});


export default router;