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

