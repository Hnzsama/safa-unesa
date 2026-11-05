-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 01: Extensions & Enums
-- ==============================================================================

-- 1. PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enum: user_role
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'facility_staff');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Custom Enum: report_status
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('submitted', 'verified', 'rejected', 'in_progress', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Custom Enum: notification_type
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('new_report', 'report_verified', 'report_rejected', 'status_updated');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

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

-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 05: Verification Tokens Table (NextAuth Adapter)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

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

-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 11: Notifications Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_all ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_report_id ON notifications(report_id);

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

-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 13: Supabase Storage Bucket & RLS Policies
-- ==============================================================================

-- 1. Create bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'report-attachments',
    'report-attachments',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Storage RLS Policies
DO $$ BEGIN
    CREATE POLICY "Public Read Access for Report Attachments"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'report-attachments');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow Upload Report Attachments"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'report-attachments');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 14: Initial Master Data Seed (UNESA)
-- ==============================================================================

-- 1. Facility Categories
INSERT INTO facility_categories (name, description) VALUES
    ('Kelistrikan & AC', 'Masalah pendingin ruangan (AC), stopkontak, saklar lampu, dan panel listrik.'),
    ('Sanitasi & Plumbing', 'Kerusakan wastafel, kran bocor, toilet tersumbat, dan saluran pembuangan.'),
    ('Sarana Belajar & Ruang Kelas', 'Kerusakan proyektor/LCD, layar proyektor, papan tulis, kursi kuliah, meja, dan sound system.'),
    ('Infrastruktur Fisik & Bangunan', 'Pintu rusak, kunci engsel patah, kaca jendela pecah, plafon bocor, dan ubin lantai terangkat.'),
    ('Kebersihan & Sanitasi Lingkungan', 'Tempat sampah penuh/rusak, area kotor, dan tumpahan bahan.'),
    ('Jaringan & IT', 'Koneksi Wi-Fi kampus (Eduroam / UNESA hotspot) bermasalah dan kabel LAN putus.')
ON CONFLICT (name) DO NOTHING;

-- 2. Master Locations (Kampus Ketintang & Kampus Lidah Wetan)
INSERT INTO locations (campus_name, building_name, floor, room_or_area) VALUES
    -- Kampus Ketintang
    ('Kampus Ketintang', 'Gedung K1 (Rektorat)', 'Lantai 1', 'Lobi Utama Pelayanan'),
    ('Kampus Ketintang', 'Gedung K9 (Perpustakaan Pusat)', 'Lantai 2', 'Ruang Baca Referensi'),
    ('Kampus Ketintang', 'Gedung E1 (Fakultas Teknik)', 'Lantai 2', 'Lab Pemrograman Komputer E102'),
    ('Kampus Ketintang', 'Gedung E9 (Fakultas Teknik)', 'Lantai 3', 'Ruang Kuliah Teori E903'),
    ('Kampus Ketintang', 'Gedung C1 (FMIPA)', 'Lantai 1', 'Toilet Pria Sayap Barat'),
    ('Kampus Ketintang', 'Gedung G1 (FEB)', 'Lantai 2', 'Ruang Seminar Soetandyo'),
    -- Kampus Lidah Wetan
    ('Kampus Lidah Wetan', 'Gedung LP3', 'Lantai 1', 'Auditorium Utama'),
    ('Kampus Lidah Wetan', 'Gedung T2 (FBS)', 'Lantai 2', 'Studio Teater & Seni'),
    ('Kampus Lidah Wetan', 'Gedung FIO (Ilmu Keolahragaan)', 'Lantai 1', 'GOR Tenis Meja & Fitness'),
    ('Kampus Lidah Wetan', 'Gedung Asrama Mahasiswa', 'Lantai 2', 'Kamar Mandi Asrama Putra')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SAFA (uneSA FAcility) - Migration 15: Add Password Column & Seed Demo Users
-- ==============================================================================

-- 1. Tambah kolom password untuk autentikasi Credentials
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Seed akun demo civitas UNESA (Password default untuk semua akun demo: 'password123')
INSERT INTO users (name, email, role, identity_number, phone_number, password)
VALUES
    -- Staf Fasilitas / Sarpras
    (
        'Budi Santoso, S.T.',
        'staff@unesa.ac.id',
        'facility_staff',
        '198501152010121002',
        '081234567890',
        '$2b$10$CKdT4V4hk4zFWqebolktd..km5texpI3A9t.Amw6b1JSaVrWh6LUG'
    ),
    -- Mahasiswa (Pelapor)
    (
        'Ahmad Fauzi',
        'mahasiswa@unesa.ac.id',
        'student',
        '21051214001',
        '082345678901',
        '$2b$10$CKdT4V4hk4zFWqebolktd..km5texpI3A9t.Amw6b1JSaVrWh6LUG'
    ),
    -- Dosen (Pelapor)
    (
        'Dr. Hendra Wijaya, M.Kom.',
        'dosen@unesa.ac.id',
        'lecturer',
        '197903202005011003',
        '083456789012',
        '$2b$10$CKdT4V4hk4zFWqebolktd..km5texpI3A9t.Amw6b1JSaVrWh6LUG'
    )
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    identity_number = EXCLUDED.identity_number;
