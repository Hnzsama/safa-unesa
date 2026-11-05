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

