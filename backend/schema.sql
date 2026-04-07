-- PostgreSQL: схема для персистентности (MVP API может работать без БД).
-- Один пользователь; при мульти-тенантности добавить user_id везде.

CREATE TABLE IF NOT EXISTS natal_profile (
    id              SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    timezone        TEXT NOT NULL DEFAULT 'Europe/Moscow',
    ayanamsha       TEXT NOT NULL DEFAULT 'lahiri',
    chart_d1_json   JSONB NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS body_signal_day (
    id              BIGSERIAL PRIMARY KEY,
    day_date        DATE NOT NULL,
    ankles_evening  SMALLINT,
    eye_area_morning SMALLINT,
    weight_kg       NUMERIC(5, 2),
    tissue_density SMALLINT,
    head_overload   SMALLINT,
    sleep_quality   SMALLINT,
    sweet_craving   SMALLINT,
    salty_craving   SMALLINT,
    energy_level    SMALLINT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (day_date)
);

CREATE TABLE IF NOT EXISTS nutrition_log_day (
    id              BIGSERIAL PRIMARY KEY,
    day_date        DATE NOT NULL,
    lunch_type      TEXT,
    had_rice        BOOLEAN,
    heaviness       SMALLINT,
    rebound_after_ekadashi_pradosh BOOLEAN,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (day_date)
);

CREATE TABLE IF NOT EXISTS daily_protocol_cache (
    day_date        DATE PRIMARY KEY,
    timezone        TEXT NOT NULL,
    protocol_json   JSONB NOT NULL,
    scales_json     JSONB NOT NULL,
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_subscription (
    id              BIGSERIAL PRIMARY KEY,
    endpoint        TEXT NOT NULL,
    keys_json       JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
