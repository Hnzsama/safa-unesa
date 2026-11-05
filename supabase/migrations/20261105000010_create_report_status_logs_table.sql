-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 10: Report Status Logs Table (Audit Trail)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS report_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    previous_status report_status,
    new_status report_status NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_report_status_logs_report_id ON report_status_logs(report_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_report_status_logs_changed_by ON report_status_logs(changed_by);

