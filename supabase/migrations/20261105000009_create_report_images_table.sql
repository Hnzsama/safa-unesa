-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 09: Report Images Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS report_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_size INTEGER, -- Ukuran dalam bytes
    mime_type VARCHAR(100), -- Contoh: 'image/jpeg', 'image/png'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON report_images(report_id);

