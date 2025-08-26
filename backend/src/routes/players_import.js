import { Router } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { query, tx } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- Helpers ---
function s(v){ return v == null ? null : String(v).trim(); }
function n(v){ const x = Number(v); return Number.isFinite(x) ? x : null; }
function b(v){
  if (v === true || v === false) return v;
  const t = String(v ?? '').toLowerCase();
  return t === '1' || t === 'true' || t === 'yes' || t === 'si' || t === 'sí';
}
function d(v){
  if (!v) return null;
  // Soporta fecha Excel (número) o string ISO/locale
  if (typeof v === 'number') {
    // Excel serial date -> JS date
    const jsDate = XLSX.SSF.parse_date_code(v);
    if (!jsDate) return null;
    const dt = new Date(Date.UTC(jsDate.y, jsDate.m - 1, jsDate.d));
    return isNaN(+dt) ? null : dt.toISOString();
  }
  const dt = new Date(v);
  return isNaN(+dt) ? null : dt.toISOString();
}
function gender(v){
  const t = String(v ?? '').toLowerCase();
  return ['male','female','nonbinary'].includes(t) ? t : null;
}
function position(v){
  const t = s(v)?.toUpperCase() || null;
  const allowed = ['QB','WR','RB','TE','LB','CB','S','DL'];
  return allowed.includes(t) ? t : null;
}
function normalizeRow(o){
  return {
    national_id:      s(o['national_id'] ?? o['cedula'] ?? o['id']),
    first_name:       s(o['first_name'] ?? o['nombre']),
    last_name:        s(o['last_name'] ?? o['apellido']),
    gender:           gender(o['gender'] ?? o['genero']),
    position:         position(o['position'] ?? o['posicion']),
    jersey_number:    n(o['jersey_number'] ?? o['numero']),
    height_cm:        n(o['height_cm'] ?? o['altura_cm']),
    weight_kg:        n(o['weight_kg'] ?? o['peso_kg']),
    birthdate:        d(o['birthdate'] ?? o['fecha_nacimiento']),
    phone:            s(o['phone'] ?? o['telefono']),
    email:            s(o['email']),
    emergency_name:   s(o['emergency_name'] ?? o['contacto_emergencia']),
    emergency_phone:  s(o['emergency_phone'] ?? o['telefono_emergencia']),
    emergency_relation:s(o['emergency_relation'] ?? o['parentesco']),
    is_active:        b(o['is_active'] ?? true),
    is_public:        b(o['is_public'] ?? true),
  };
}
function validatePlayer(p){
  if (!p.first_name || !p.last_name) return { ok:false, error:'first_name/last_name requeridos' };
  if (!p.gender) return { ok:false, error:'gender inválido (male|female|nonbinary)' };
  if (p.jersey_number != null && (p.jersey_number < 0 || p.jersey_number > 999)) return { ok:false, error:'jersey_number inválido' };
  return { ok:true };
}

// --- GET plantilla Excel ---
router.get('/template.xlsx', requireAdmin, async (_req, res) => {
  const HEAD = [
    'national_id','first_name','last_name','gender','position','jersey_number',
    'height_cm','weight_kg','birthdate','phone','email',
    'emergency_name','emergency_phone','emergency_relation',
    'is_active','is_public'
  ];
  const SAMPLE = [
    ['V-12345678','María','Pérez','female','WR',12,165,58,'1998-06-10','+58-412-1111111','maria@example.com','Ana Pérez','+58-424-2222222','Madre',true,true],
    ['E-87654321','José','García','male','QB',  7,178,78,'1996-02-21','+58-414-3333333','jose@example.com','Luis García','+58-426-4444444','Padre',true,true]
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([HEAD, ...SAMPLE]);
  ws1['!cols'] = HEAD.map(h => ({ wch: Math.max(12, h.length + 2) }));
  XLSX.utils.book_append_sheet(wb, ws1, 'PLAYERS');

  const ws2 = XLSX.utils.aoa_to_sheet([
    ['Campos obligatorios: first_name, last_name, gender'],
    ['gender permitidos: male, female, nonbinary'],
    ['position sugeridos: QB, WR, RB, TE, LB, CB, S, DL'],
    ['birthdate formato: YYYY-MM-DD'],
    ['Valores booleanos: true/false o 1/0 o yes/no o si/no']
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, 'INSTRUCTIONS');

  const buf = XLSX.write(wb, { type:'buffer', bookType:'xlsx' });
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename="players_template.xlsx"');
  res.send(buf);
});

// --- POST importar Excel ---
router.post('/import', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error:'file requerido (xlsx)' });

  try {
    const wb = XLSX.read(req.file.buffer, { type:'buffer' });
    const sheet = wb.Sheets['PLAYERS'] || wb.Sheets[wb.SheetNames[0]];
    if (!sheet) return res.status(400).json({ error:'Hoja PLAYERS no encontrada' });

    const arr = XLSX.utils.sheet_to_json(sheet, { defval:null }); // [{col:val}, ...]
    const results = { inserted:0, updated:0, skipped:0, errors:[] };

    await tx(async (c) => {
      for (let i = 0; i < arr.length; i++){
        const rownum = i + 2; // 1=header
        const p = normalizeRow(arr[i]);
        const chk = validatePlayer(p);
        if (!chk.ok) {
          results.errors.push({ row: rownum, error: chk.error });
          results.skipped++;
          continue;
        }

        // Busca por national_id o email (si alguno existe)
        const { rows: existing } = await c.query(
          `SELECT id FROM players WHERE 
             ($1 IS NOT NULL AND national_id = $1) OR
             ($2 IS NOT NULL AND email = $2)
           LIMIT 1`,
          [p.national_id, p.email]
        );

        if (existing[0]) {
          await c.query(`
            UPDATE players SET
              first_name=$1, last_name=$2, gender=$3, position=$4,
              jersey_number=$5, height_cm=$6, weight_kg=$7, birthdate=$8,
              phone=$9, email=$10, emergency_name=$11, emergency_phone=$12,
              emergency_relation=$13, is_active=$14, is_public=$15, updated_at=NOW()
            WHERE id=$16
          `, [
            p.first_name,p.last_name,p.gender,p.position,
            p.jersey_number,p.height_cm,p.weight_kg,p.birthdate,
            p.phone,p.email,p.emergency_name,p.emergency_phone,
            p.emergency_relation,p.is_active,p.is_public, existing[0].id
          ]);
          results.updated++;
        } else {
          await c.query(`
            INSERT INTO players
              (national_id,first_name,last_name,gender,position,jersey_number,
               height_cm,weight_kg,birthdate,phone,email,
               emergency_name,emergency_phone,emergency_relation,is_active,is_public)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          `, [
            p.national_id,p.first_name,p.last_name,p.gender,p.position,p.jersey_number,
            p.height_cm,p.weight_kg,p.birthdate,p.phone,p.email,
            p.emergency_name,p.emergency_phone,p.emergency_relation,p.is_active,p.is_public
          ]);
          results.inserted++;
        }
      }
    });

    res.json(results);
  } catch (e) {
    console.error('players import error:', e);
    res.status(400).json({ error:'import failed', detail: e.message });
  }
});

export default router;
