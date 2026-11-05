-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 08: Reports Table (Entitas Laporan Utama)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES facility_categories(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    current_status report_status NOT NULL DEFAULT 'submitted',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Constraint: Alasan penolakan wajib diisi jika status = 'rejected'
    CONSTRAINT chk_rejection_reason_mandatory 
        CHECK (current_status != 'rejected' OR (rejection_reason IS NOT NULL AND length(trim(rejection_reason)) > 0))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_location_id ON reports(location_id);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_current_status ON reports(current_status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

