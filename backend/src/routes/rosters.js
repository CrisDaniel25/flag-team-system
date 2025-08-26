import { Router } from 'express';
import Joi from 'joi';
import { query, tx } from '../db.js';
import { requireAdmin } from '../auth.js';
import { validateCounts } from '../utils/roster-rules.js';

const router = Router();

const itemSchema = Joi.object({
    player_id: Joi.number().integer().required(),
    role: Joi.string().valid('starter', 'bench', 'inactive').required(),
    position: Joi.string().optional().allow('', null),
    notes: Joi.string().optional().allow('', null)
});


// GET roster de un evento (con info básica del jugador)
router.get('/:eventId', async (req, res) => {
    try {
        const { rows } = await query(`
            SELECT r.*, p.first_name, p.last_name, p.gender, p.jersey_number
            FROM rosters r
            JOIN players p ON p.id = r.player_id
            WHERE r.event_id = $1
            ORDER BY r.role DESC, p.last_name, p.first_name`, [req.params.eventId]);
        res.json(rows);
    } catch { res.status(500).json({ error: 'Failed to load roster' }); }
});


// BULK upsert
router.post('/:eventId/bulk', requireAdmin, async (req, res) => {
    const eventId = Number(req.params.eventId);
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    try {
        const valid = items.map(it => {
            const { error, value } = itemSchema.validate(it);
            if (error) throw new Error(error.message);
            return value;
        });

        const ev = (await query('SELECT type, roster_limit, roster_policy FROM events WHERE id=$1', [eventId])).rows[0];
        if (!ev) return res.status(404).json({ error: 'Event not found' });

        const ids = [...new Set(valid.map(v => v.player_id))];
        const ps = (await query(`SELECT id, gender, position FROM players WHERE id = ANY($1)`, [ids])).rows;
        const players = new Map(ps.map(p => [p.id, p]));

        const { ok, reason } = validateCounts({ entries: valid, players, policy: ev.roster_policy, roster_limit: ev.roster_limit });
        if (!ok) return res.status(400).json({ error: reason });

        await tx(async (c) => {
            for (const it of valid) {
                await c.query(`
          INSERT INTO rosters(event_id, player_id, role, position, notes)
          VALUES($1,$2,$3,$4,$5)
          ON CONFLICT(event_id, player_id)
          DO UPDATE SET role=EXCLUDED.role, position=EXCLUDED.position, notes=EXCLUDED.notes, updated_at=NOW()`,
                    [eventId, it.player_id, it.role, it.position ?? null, it.notes ?? null]);
            }
        });

        res.json({ ok: true, count: valid.length });
    } catch (e) { res.status(400).json({ error: e.message || 'Bulk save failed' }); }
});


// DELETE de un jugador del roster
router.delete('/:eventId/:playerId', requireAdmin, async (req, res) => {
    try {
        await query('DELETE FROM rosters WHERE event_id=$1 AND player_id=$2', [req.params.eventId, req.params.playerId]);
        res.json({ ok: true });
    } catch { res.status(500).json({ error: 'Failed to remove from roster' }); }
});


export default router;