import { Router } from 'express';
import Joi from 'joi';
import { query } from '../db.js';
import { signToken } from '../auth.js';
import bcrypt from 'bcryptjs';


const router = Router();


const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });


router.post('/login', async (req,res) => {
const { error, value } = loginSchema.validate(req.body);
if (error) return res.status(400).json({ error: error.message });
const { rows } = await query('SELECT * FROM users WHERE email = $1', [value.email]);
const user = rows[0];
if (!user) return res.status(401).json({ error: 'Invalid credentials' });
const ok = await bcrypt.compare(value.password, user.password_hash);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
const token = signToken(user);
res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});


export default router;