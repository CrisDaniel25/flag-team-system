-- Enable bcrypt
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Players (base table you had)
CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male','female','nonbinary')) NOT NULL,
  birthdate DATE,
  email TEXT UNIQUE,
  phone TEXT,
  position TEXT,
  jersey_number INT,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional seed players
INSERT INTO players (first_name,last_name,gender,position,jersey_number,height_cm,weight_kg,email)
VALUES
('Alex','Garcia','male','WR',11,178,78,'alex@example.com'),
('María','Lopez','female','QB',9,165,62,'maria@example.com')
ON CONFLICT DO NOTHING;
