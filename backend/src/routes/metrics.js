import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

/**
 * Devuelve:
 *  - players: { total, active, male, female, nonbinary }
 *  - upcoming_events: número (próximos 30 días)
 *  - attendance_series: últimos 8 eventos (asc), con present/late/absent y pct_present
 *  - injuries_by_severity: { severity, count }
 *  - payments_status: { status, count, overdue }
 */
router.get('/summary', async (_req, res) => {
    try {
        // --- Players summary ---
        const playersQ = await query(`
      SELECT
        COUNT(*)::int AS total,
        COALESCE(SUM((is_active)::int),0)::int AS active,
        COALESCE(SUM((gender = 'male')::int),0)::int AS male,
        COALESCE(SUM((gender = 'female')::int),0)::int AS female,
        COALESCE(SUM((gender = 'nonbinary')::int),0)::int AS nonbinary
      FROM players;
    `);
        const players = playersQ.rows[0] || { total: 0, active: 0, male: 0, female: 0, nonbinary: 0 };

        // --- Upcoming events (30 días) ---
        const upcomingQ = await query(`
      SELECT COUNT(*)::int AS n
      FROM events
      WHERE starts_at >= NOW() AND starts_at < NOW() + INTERVAL '30 days';
    `);
        const upcoming_events = upcomingQ.rows[0]?.n ?? 0;

        // --- Attendance series últimos 8 eventos ---
        const attendQ = await query(`
      WITH ev AS (
        SELECT id, starts_at
        FROM events
        ORDER BY starts_at DESC
        LIMIT 8
      )
      SELECT
        e.id,
        e.starts_at,
        COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END),0)::int AS present,
        COALESCE(SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END),0)::int AS late,
        COALESCE(SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END),0)::int AS absent
      FROM ev e
      LEFT JOIN attendance a ON a.event_id = e.id
      GROUP BY e.id, e.starts_at
      ORDER BY e.starts_at ASC;
    `);
        const attendance_series = attendQ.rows.map(r => {
            const total = (r.present || 0) + (r.late || 0) + (r.absent || 0);
            const pct_present = total ? Math.round((r.present / total) * 100) : 0;
            return { ...r, pct_present };
        });

        // --- Injuries by severity ---
        const injQ = await query(`
      SELECT COALESCE(severity, 'unknown') AS severity, COUNT(*)::int AS count
      FROM injuries
      GROUP BY severity
      ORDER BY severity;
    `);
        const injuries_by_severity = injQ.rows;

        // --- Payments status + overdue ---
        const payQ = await query(`
      SELECT status, COUNT(*)::int AS count
      FROM payments
      GROUP BY status
      ORDER BY status;
    `);
        const overdueQ = await query(`
      SELECT COUNT(*)::int AS overdue
      FROM payments
      WHERE (status IS NULL OR status <> 'paid')
        AND due_date IS NOT NULL
        AND due_date < CURRENT_DATE;
    `);

        const payments_status = {
            by_status: payQ.rows,
            overdue: overdueQ.rows[0]?.overdue ?? 0
        };

        res.json({ players, upcoming_events, attendance_series, injuries_by_severity, payments_status });
    } catch (e) {
        console.error('metrics/summary error:', e);
        res.status(500).json({ error: 'metrics failed', detail: e?.message });
    }
});

export default router;
