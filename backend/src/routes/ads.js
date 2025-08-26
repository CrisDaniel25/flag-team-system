import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';


const router = Router();
const schema = Joi.object({ title:Joi.string().required(), body:Joi.string().allow('',null), image_url:Joi.string().allow('',null), link_url:Joi.string().allow('',null), placement:Joi.string().valid('hero','banner','sidebar').required(), active:Joi.boolean().optional(), start_at:Joi.date().allow(null), end_at:Joi.date().allow(null) });


router.get('/', async (_req,res)=>{ const { rows } = await query('SELECT * FROM ads ORDER BY created_at DESC'); res.json(rows); });
router.post('/', requireAdmin, async (req,res)=>{ const { error, value } = schema.validate(req.body); if(error) return res.status(400).json({ error:error.message }); const fields=Object.keys(value); const vals=fields.map(k=>value[k]); const ph=fields.map((_,i)=>`$${i+1}`).join(','); const { rows } = await query(`INSERT INTO ads(${fields.join(',')}) VALUES(${ph}) RETURNING *`, vals); res.status(201).json(rows[0]); });
router.put('/:id', requireAdmin, async (req,res)=>{ const { error, value } = schema.validate(req.body, { stripUnknown:true }); if(error) return res.status(400).json({ error:error.message }); const ent=Object.entries(value); if(!ent.length) return res.status(400).json({ error:'No fields' }); const set=ent.map(([k],i)=>`${k}=$${i+1}`).join(', '); const vals=ent.map(([,v])=>v); vals.push(req.params.id); const { rows } = await query(`UPDATE ads SET ${set}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals); if(!rows[0]) return res.status(404).json({ error:'Not found' }); res.json(rows[0]); });
router.delete('/:id', requireAdmin, async (req,res)=>{ await query('DELETE FROM ads WHERE id=$1',[req.params.id]); res.json({ ok:true }); });
export default router;