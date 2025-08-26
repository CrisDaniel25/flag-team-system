import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change';


export function signToken(user){
return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}


export function requireAuth(req,res,next){
const header = req.headers.authorization || '';
const [, token] = header.split(' ');
if (!token) return res.status(401).json({ error: 'Missing token' });
try {
const payload = jwt.verify(token, JWT_SECRET);
req.user = payload; // {sub, role, email}
next();
} catch {
return res.status(401).json({ error: 'Invalid token' });
}
}


export function requireAdmin(req,res,next){
if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
next();
}