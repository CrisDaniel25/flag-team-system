-- Visibilidad pública
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;


-- Política de roster a nivel de evento (JSONB)
-- Ejemplo JSON: {"min_by_position":{"QB":1,"WR":2,"CB":2},"min_by_gender":{"male":5,"female":5}}
ALTER TABLE events ADD COLUMN IF NOT EXISTS roster_policy JSONB;


-- Sponsors
CREATE TABLE IF NOT EXISTS sponsors (
id BIGSERIAL PRIMARY KEY,
name TEXT NOT NULL,
tier TEXT NOT NULL DEFAULT 'gold', -- gold/silver/bronze/partner
logo_url TEXT,
link_url TEXT,
active BOOLEAN NOT NULL DEFAULT TRUE,
sort_order INT NOT NULL DEFAULT 0,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Ads (anuncios)
CREATE TABLE IF NOT EXISTS ads (
id BIGSERIAL PRIMARY KEY,
title TEXT NOT NULL,
body TEXT,
image_url TEXT,
link_url TEXT,
placement TEXT NOT NULL CHECK (placement IN ('hero','banner','sidebar')),
active BOOLEAN NOT NULL DEFAULT TRUE,
start_at TIMESTAMPTZ,
end_at TIMESTAMPTZ,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active);


-- Semilla opcional para sponsors/ads
INSERT INTO sponsors (name, tier, logo_url, link_url, sort_order)
VALUES ('Acme Sports', 'gold', NULL, 'https://example.com', 10)
ON CONFLICT DO NOTHING;


INSERT INTO ads (title, body, placement, active)
VALUES ('¡Nos vemos el domingo!', 'Apoya al equipo este fin de semana.', 'hero', TRUE)
ON CONFLICT DO NOTHING;