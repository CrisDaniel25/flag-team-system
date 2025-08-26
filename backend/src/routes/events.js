import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';


const router = Router();


const schema = Joi.object({
type: Joi.string().valid('practice','game').required(),
starts_at: Joi.date().required(),
ends_at: Joi.date().optional().allow(null),
location: Joi.string().optional().allow('',null),
opponent: Joi.string().optional().allow('',null),
notes: Joi.string().optional().allow('',null),
roster_limit: Joi.number().integer().min(1).max(60).optional(),
roster_policy: Joi.object().unknown(true).optional(),
is_public: Joi.boolean().optional()
});


router.get('/', async (_req,res)=>{
try { const { rows } = await query('SELECT * FROM events ORDER BY starts_at DESC'); res.json(rows); }
catch { res.status(500).json({ error:'Failed to list events' }); }
});


router.post('/', requireAdmin, async (req,res)=>{
const { error, value } = schema.validate(req.body); if(error) return res.status(400).json({ error: error.message });
const fields = ['type','starts_at','ends_at','location','opponent','notes'];
const vals = fields.map(f=> value[f] ?? null); const placeholders = fields.map((_,i)=>`$${i+1}`).join(',');
try { const { rows } = await query(`INSERT INTO events(${fields.join(',')}) VALUES(${placeholders}) RETURNING *`, vals); res.status(201).json(rows[0]); }
catch { res.status(500).json({ error:'Failed to create event' }); }
});


router.put('/:id', requireAdmin, async (req,res)=>{
const { error, value } = schema.validate(req.body, { stripUnknown:true }); if(error) return res.status(400).json({ error: error.message });
const entries = Object.entries(value); if(!entries.length) return res.status(400).json({ error:'No fields' });
const setSql = entries.map(([k],i)=>`${k}=$${i+1}`).join(', '); const vals = entries.map(([,v])=>v); vals.push(req.params.id);
try { const { rows } = await query(`UPDATE events SET ${setSql}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals); if(!rows[0]) return res.status(404).json({ error:'Not found' }); res.json(rows[0]); }
catch { res.status(500).json({ error:'Failed to update event' }); }
});


export default router;