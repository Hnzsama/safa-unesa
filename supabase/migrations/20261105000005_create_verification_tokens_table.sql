-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 05: Verification Tokens Table (NextAuth Adapter)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

