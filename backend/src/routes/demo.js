import { Router } from 'express';

const router = Router();

const players = [
  { id: 1, full_name: 'Alex Rivera', gender: 'male', position: 'QB', active: true },
  { id: 2, full_name: 'Mia Santos', gender: 'female', position: 'WR', active: true },
  { id: 3, full_name: 'Jordan Peña', gender: 'nonbinary', position: 'CB', active: true },
  { id: 4, full_name: 'Camila Reyes', gender: 'female', position: 'S', active: true },
  { id: 5, full_name: 'Daniel Cruz', gender: 'male', position: 'LB', active: true }
];

const events = [
  { id: 11, type: 'practice', starts_at: '2026-12-02T22:00:00Z', location: 'Demo Sports Complex', opponent: null },
  { id: 12, type: 'game', starts_at: '2026-12-06T20:00:00Z', location: 'Portfolio Field', opponent: 'North Stars' },
  { id: 13, type: 'practice', starts_at: '2026-12-09T22:00:00Z', location: 'Demo Sports Complex', opponent: null }
];

const sponsors = [
  { id: 1, name: 'Demo Athletics', tier: 'gold', active: true, link_url: '#' },
  { id: 2, name: 'Sample Hydration', tier: 'silver', active: true, link_url: '#' },
  { id: 3, name: 'Portfolio Sports Lab', tier: 'partner', active: true, link_url: '#' }
];

const ads = [{
  id: 1,
  placement: 'hero',
  title: 'Flag Team Manager — Portfolio Demo',
  body: 'Explore fictional roster, attendance, events and operational metrics in a safe demonstration environment.',
  image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1400&q=80',
  link_url: '/eventos'
}];

const metrics = {
  players: { total: 28, active: 24, male: 13, female: 10, nonbinary: 1 },
  upcoming_events: 3,
  attendance_series: [
    { id: 1, starts_at: '2026-10-10', present: 19, late: 2, absent: 3, pct_present: 79 },
    { id: 2, starts_at: '2026-10-17', present: 21, late: 1, absent: 2, pct_present: 88 },
    { id: 3, starts_at: '2026-10-24', present: 20, late: 2, absent: 2, pct_present: 83 },
    { id: 4, starts_at: '2026-11-07', present: 22, late: 1, absent: 1, pct_present: 92 }
  ],
  injuries_by_severity: [
    { severity: 'low', count: 3 },
    { severity: 'medium', count: 1 },
    { severity: 'high', count: 0 }
  ],
  payments_status: { by_status: [{ status: 'paid', count: 19 }, { status: 'pending', count: 5 }], overdue: 2 }
};

router.get('/health', (_req, res) => res.json({ ok: true, mode: 'portfolio-demo' }));
router.post('/auth/login', (_req, res) => res.json({
  token: 'portfolio-demo-token',
  user: { id: 1, name: 'Portfolio Demo', email: 'demo@portfolio.local', role: 'admin' }
}));
router.get('/public/ads', (_req, res) => res.json(ads));
router.get('/public/events/upcoming', (_req, res) => res.json(events));
router.get('/public/events/range', (_req, res) => res.json(events));
router.get('/public/sponsors', (_req, res) => res.json(sponsors));
router.get('/public/players', (_req, res) => res.json(players));
router.get('/public/regulations', (_req, res) => res.json([{ id: 1, slug: 'team-rules', title: 'Demo team rules', content_html: '<p>Sample regulations for portfolio review.</p>', is_public: true }]));
router.get('/metrics/summary', (_req, res) => res.json(metrics));
router.get('/players', (_req, res) => res.json(players));
router.get('/events', (_req, res) => res.json(events));
router.get('/sponsors', (_req, res) => res.json(sponsors));
router.get('/injuries', (_req, res) => res.json([{ id: 1, player_name: 'Sample Player', severity: 'low', status: 'recovering' }]));
router.get('/payments', (_req, res) => res.json([{ id: 1, player_name: 'Sample Player', status: 'paid', amount: 25 }]));
router.get('/registrations', (_req, res) => res.json([{ id: 1, full_name: 'Demo Applicant', status: 'pending' }]));
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(403).json({ error: 'Read-only portfolio demo' });
  }
  next();
});

export default router;
