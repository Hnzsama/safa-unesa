-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 03: Accounts Table (NextAuth Adapter)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(255),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    CONSTRAINT uq_accounts_provider_account_id UNIQUE (provider, "providerAccountId")
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");

