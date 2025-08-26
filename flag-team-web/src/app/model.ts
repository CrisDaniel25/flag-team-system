export type Role = 'admin' | 'coach' | 'viewer';
export interface User { id: number; email: string; role: Role; }

export interface Player {
  id?: number; first_name: string; last_name: string; gender: 'male' | 'female' | 'nonbinary';
  birthdate?: string | null; email?: string | null; phone?: string | null; position?: string | null;
  jersey_number?: number | null; height_cm?: number | null; weight_kg?: number | null;
  is_active?: boolean; notes?: string | null;
  national_id?: string | null; // NEW (cédula/ID)
  emergency_name?: string | null; // NEW (contacto)
  emergency_phone?: string | null; // NEW (tel del contacto)
  emergency_relation?: string | null; // NEW (parentesco)
}

export type RosterRole = 'starter'|'bench'|'inactive';
export interface RosterEntry { id?: number; event_id: number; player_id: number; role: RosterRole; position?: string|null; notes?: string|null; }

export interface Event { id?: number; type: 'practice' | 'game'; starts_at: string; ends_at?: string | null; location?: string | null; opponent?: string | null; notes?: string | null; }
export type AttendanceStatus = 'present' | 'absent' | 'late';
export interface Attendance { id?: number; event_id: number; player_id: number; status: AttendanceStatus; notes?: string | null; }

export interface Injury { id?: number; player_id: number; date: string; kind: string; severity: 'minor' | 'moderate' | 'severe'; notes?: string | null; return_to_play?: string | null; }

export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export interface Payment { id?: number; player_id: number; amount: number; currency: 'USD' | 'DOP' | 'EUR'; status: PaymentStatus; due_date?: string | null; paid_at?: string | null; notes?: string | null; }

export interface MetricsSummary {
  totals: { players: number; active: number; male: number; female: number; nonbinary: number };
  attendance7: { label: string; rate: number }[]; // last 7 events or weeks
  injuriesByKind: { kind: string; count: number }[];
  payments: { pending: number; overdue: number; paid: number; outstandingTotal: number };
}