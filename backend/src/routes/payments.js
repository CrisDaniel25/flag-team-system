import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';


const router = Router();


const schema = Joi.object({
player_id: Joi.number().integer().required(),
amount: Joi.number().precision(2).positive().required(),
currency: Joi.string().valid('USD','DOP','EUR').required(),
status: Joi.string().valid('pending','paid','overdue').required(),
due_date: Joi.date().optional().allow(null),
paid_at: Joi.date().optional().allow(null),
notes: Joi.string().optional().allow('',null)
});


router.get('/', async (_req,res)=>{
try { const { rows } = await query('SELECT * FROM payments ORDER BY created_at DESC'); res.json(rows); }
catch { res.status(500).json({ error:'Failed to list payments' }); }
});


router.post('/', requireAdmin, async (req,res)=>{
const { error, value } = schema.validate(req.body); if(error) return res.status(400).json({ error: error.message });
const fields = ['player_id','amount','currency','status','due_date','paid_at','notes'];
const vals = fields.map(f=> value[f] ?? null); const placeholders = fields.map((_,i)=>`$${i+1}`).join(',');
try { const { rows } = await query(`INSERT INTO payments(${fields.join(',')}) VALUES(${placeholders}) RETURNING *`, vals); res.status(201).json(rows[0]); }
catch { res.status(500).json({ error:'Failed to create payment' }); }
});


router.put('/:id', requireAdmin, async (req,res)=>{
const { error, value } = schema.validate(req.body, { stripUnknown:true }); if(error) return res.status(400).json({ error: error.message });
const entries = Object.entries(value); if(!entries.length) return res.status(400).json({ error:'No fields' });
const setSql = entries.map(([k],i)=>`${k}=$${i+1}`).join(', '); const vals = entries.map(([,v])=>v); vals.push(req.params.id);
try { const { rows } = await query(`UPDATE payments SET ${setSql}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals); if(!rows[0]) return res.status(404).json({ error:'Not found' }); res.json(rows[0]); }
catch { res.status(500).json({ error:'Failed to update payment' }); }
});


export default router;