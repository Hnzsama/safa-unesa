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

