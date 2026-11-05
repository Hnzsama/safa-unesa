-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 04: Sessions Table (NextAuth Adapter)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions("sessionToken");

