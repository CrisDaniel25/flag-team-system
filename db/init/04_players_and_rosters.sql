-- Extendemos players (cédula/ID, contacto de emergencia, parentesco)
ALTER TABLE players
ADD COLUMN IF NOT EXISTS national_id TEXT UNIQUE, -- cédula/ID
ADD COLUMN IF NOT EXISTS emergency_name TEXT, -- contacto de emergencia
ADD COLUMN IF NOT EXISTS emergency_phone TEXT, -- teléfono del contacto
ADD COLUMN IF NOT EXISTS emergency_relation TEXT; -- parentesco


-- Límite de roster por evento (por defecto 12)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS roster_limit INT NOT NULL DEFAULT 12;


-- Tabla de roster para juegos oficiales
CREATE TABLE IF NOT EXISTS rosters (
id BIGSERIAL PRIMARY KEY,
event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
role TEXT NOT NULL DEFAULT 'starter' CHECK (role IN ('starter','bench','inactive')),
position TEXT, -- opcional: asignación específica (WR/QB/...)
notes TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
UNIQUE(event_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_rosters_event ON rosters(event_id);
CREATE INDEX IF NOT EXISTS idx_rosters_player ON rosters(player_id);