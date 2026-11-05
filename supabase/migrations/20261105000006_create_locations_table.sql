-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 06: Locations Table (Master Data Kampus)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_name VARCHAR(100) NOT NULL, -- e.g. 'Kampus Ketintang', 'Kampus Lidah Wetan'
    building_name VARCHAR(100) NOT NULL, -- e.g. 'Gedung K1 (Rektorat)', 'Gedung E1 (FT)'
    floor VARCHAR(30), -- e.g. 'Lantai 1', 'Lantai 2'
    room_or_area VARCHAR(100) NOT NULL, -- e.g. 'Lab Jaringan', 'Toilet Barat Lt. 1'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_locations_campus ON locations(campus_name);
CREATE INDEX IF NOT EXISTS idx_locations_building ON locations(building_name);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_locations_updated_at ON locations;
CREATE TRIGGER trg_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

