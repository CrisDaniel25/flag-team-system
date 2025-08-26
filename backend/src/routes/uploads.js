import { Router } from 'express';
import Joi from 'joi';
import { presignPut } from '../utils/s3.js';
import { requireAdmin } from '../auth.js';


const router = Router();


const schema = Joi.object({ filename: Joi.string().required(), contentType: Joi.string().required(), folder: Joi.string().optional().allow('',null) });


router.post('/presign', requireAdmin, async (req,res)=>{
const { error, value } = schema.validate(req.body); if(error) return res.status(400).json({ error: error.message });
try { const { key, uploadUrl, publicUrl } = await presignPut({ filename: value.filename, contentType: value.contentType, folder: value.folder || 'uploads' });
res.json({ key, uploadUrl, publicUrl });
} catch { res.status(500).json({ error:'Failed to presign' }); }
});


export default router;