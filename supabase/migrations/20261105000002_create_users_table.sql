-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 02: Users Table (NextAuth Adapter + Custom SAFA Attributes)
-- ==============================================================================

-- Reusable timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    role user_role NOT NULL DEFAULT 'student',
    identity_number VARCHAR(50), -- NIM untuk Mahasiswa / NIP untuk Dosen & Staf
    phone_number VARCHAR(25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_identity_number ON users(identity_number);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

