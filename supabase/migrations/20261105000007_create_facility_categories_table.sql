-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 07: Facility Categories Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS facility_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_facility_categories_active ON facility_categories(is_active);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_categories_updated_at ON facility_categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON facility_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

