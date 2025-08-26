-- 06_regulations_registrations.sql

-- Tabla de reglamentos (editable por admin; uno por slug)
CREATE TABLE IF NOT EXISTS regulations (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,             -- ej: 'team-rules'
  title         TEXT NOT NULL,
  body_html     TEXT NOT NULL,                    -- almacenamos HTML seguro (sanitizado por el admin)
  is_public     BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by    INTEGER,                          -- opcional: id de users
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice útil para búsquedas por slug
CREATE INDEX IF NOT EXISTS idx_regulations_slug ON regulations(slug);

-- Tabla de inscripciones (aplicantes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE registration_status AS ENUM ('pending','invited','approved','rejected');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS registrations (
  id                  SERIAL PRIMARY KEY,
  -- Datos del aplicante (coinciden con players en su mayoría)
  national_id         TEXT,                      -- cédula
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  gender              TEXT CHECK (gender IN ('male','female','nonbinary')) NOT NULL,
  position            TEXT,                      -- QB/WR/...
  jersey_number       INTEGER,
  height_cm           INTEGER,
  weight_kg           INTEGER,
  birthdate           DATE,
  phone               TEXT,
  email               TEXT,
  emergency_name      TEXT,
  emergency_phone     TEXT,
  emergency_relation  TEXT,
  notes               TEXT,

  status              registration_status NOT NULL DEFAULT 'pending',
  invited_whatsapp_at TIMESTAMP,
  approved_by         INTEGER,                  -- users.id
  approved_at         TIMESTAMP,
  rejected_by         INTEGER,
  rejected_at         TIMESTAMP,
  reject_reason       TEXT,

  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- índices útiles
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);

-- Semilla opcional del reglamento
INSERT INTO regulations (slug, title, body_html, is_public)
VALUES (
  'team-rules',
  'Reglamento del Equipo',
  '<h2>Reglamento del Equipo</h2><ol><li>Respeto y puntualidad.</li><li>Uso obligatorio de equipo de protección en prácticas y juegos.</li><li>Código de conducta dentro y fuera de la cancha.</li></ol>',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;
