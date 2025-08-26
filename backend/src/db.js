import pkg from 'pg';
const { Pool } = pkg;


const connectionString = process.env.DATABASE_URL || 'postgres://flaguser:flagpass@localhost:5432/flagdb';
export const pool = new Pool({ connectionString });


export async function query(text, params) { return pool.query(text, params); }
export async function tx(fn){
const client = await pool.connect();
try { await client.query('BEGIN'); const res = await fn(client); await client.query('COMMIT'); return res; }
catch(e){ await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}