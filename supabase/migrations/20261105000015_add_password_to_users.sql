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
