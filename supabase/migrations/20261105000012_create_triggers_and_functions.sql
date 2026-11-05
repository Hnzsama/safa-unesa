-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 12: Triggers & Functions (Audit Trail & Notifications)
-- ==============================================================================

-- 1. Function: Auto Log Status Change (Audit Trail)
CREATE OR REPLACE FUNCTION log_report_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_changed_by UUID;
    v_notes TEXT;
BEGIN
    BEGIN
        v_changed_by := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_changed_by := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO report_status_logs (
            report_id,
            previous_status,
            new_status,
            changed_by,
            notes
        ) VALUES (
            NEW.id,
            NULL,
            NEW.current_status,
            COALESCE(v_changed_by, NEW.reporter_id),
            'Laporan fasilitas baru berhasil dibuat dan diajukan ke sistem.'
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
            IF NEW.current_status = 'rejected' THEN
                v_notes := 'Laporan diverifikasi dan DITOLAK oleh staf fasilitas. Alasan: ' || COALESCE(NEW.rejection_reason, '-');
            ELSIF NEW.current_status = 'verified' THEN
                v_notes := 'Laporan telah diverifikasi VALID oleh staf fasilitas dan dijadwalkan untuk penanganan.';
            ELSIF NEW.current_status = 'in_progress' THEN
                v_notes := 'Laporan sedang dalam proses penanganan / perbaikan teknisi fasilitas.';
            ELSIF NEW.current_status = 'resolved' THEN
                v_notes := 'Penanganan fasilitas telah SELESAI dilaksanakan.';
            ELSE
                v_notes := 'Perubahan status laporan menjadi ' || NEW.current_status::text;
            END IF;

            INSERT INTO report_status_logs (
                report_id,
                previous_status,
                new_status,
                changed_by,
                notes
            ) VALUES (
                NEW.id,
                OLD.current_status,
                NEW.current_status,
                v_changed_by,
                v_notes
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reports_status_audit_trail ON reports;
CREATE TRIGGER trg_reports_status_audit_trail
    AFTER INSERT OR UPDATE OF current_status ON reports
    FOR EACH ROW
    EXECUTE FUNCTION log_report_status_change();

-- 2. Function: Automated Notification Dispatch
CREATE OR REPLACE FUNCTION notify_report_events()
RETURNS TRIGGER AS $$
DECLARE
    staff_record RECORD;
BEGIN
    IF TG_OP = 'INSERT' THEN
        FOR staff_record IN 
            SELECT id FROM users WHERE role = 'facility_staff'
        LOOP
            INSERT INTO notifications (
                user_id,
                report_id,
                title,
                message,
                type
            ) VALUES (
                staff_record.id,
                NEW.id,
                'Laporan Fasilitas Baru',
                'Terdapat laporan masuk: "' || NEW.title || '" menunggu verifikasi staf.',
                'new_report'
            );
        END LOOP;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
            IF NEW.current_status = 'verified' THEN
                INSERT INTO notifications (
                    user_id,
                    report_id,
                    title,
                    message,
                    type
                ) VALUES (
                    NEW.reporter_id,
                    NEW.id,
                    'Laporan Diverifikasi',
                    'Laporan Anda "' || NEW.title || '" telah diverifikasi VALID oleh tim sarpras.',
                    'report_verified'
                );
            ELSIF NEW.current_status = 'rejected' THEN
                INSERT INTO notifications (
                    user_id,
                    report_id,
                    title,
                    message,
                    type
                ) VALUES (
                    NEW.reporter_id,
                    NEW.id,
                    'Laporan Ditolak',
                    'Laporan Anda "' || NEW.title || '" ditolak. Alasan: ' || COALESCE(NEW.rejection_reason, 'Tidak memenuhi kriteria.'),
                    'report_rejected'
                );
            ELSIF NEW.current_status = 'in_progress' THEN
                INSERT INTO notifications (
                    user_id,
                    report_id,
                    title,
                    message,
                    type
                ) VALUES (
                    NEW.reporter_id,
                    NEW.id,
                    'Status Laporan: Dalam Penanganan',
                    'Fasilitas pada laporan "' || NEW.title || '" sedang dalam pengerjaan teknisi.',
                    'status_updated'
                );
            ELSIF NEW.current_status = 'resolved' THEN
                INSERT INTO notifications (
                    user_id,
                    report_id,
                    title,
                    message,
                    type
                ) VALUES (
                    NEW.reporter_id,
                    NEW.id,
                    'Status Laporan: Telah Selesai',
                    'Perbaikan fasilitas pada laporan "' || NEW.title || '" telah tuntas dikerjakan.',
                    'status_updated'
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reports_notification_dispatch ON reports;
CREATE TRIGGER trg_reports_notification_dispatch
    AFTER INSERT OR UPDATE OF current_status ON reports
    FOR EACH ROW
    EXECUTE FUNCTION notify_report_events();

