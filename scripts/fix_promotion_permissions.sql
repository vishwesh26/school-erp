-- Fix Permissions for Promotion System Tables
BEGIN;

-- Grant permissions to existing roles
GRANT ALL ON TABLE "AcademicYear", "StudentHistory", "StudentStatus" TO "anon", "authenticated", "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO "anon", "authenticated", "service_role";

-- Disable RLS or add policies if needed (assuming simple model for now)
ALTER TABLE "AcademicYear" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentHistory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentStatus" DISABLE ROW LEVEL SECURITY;

COMMIT;

NOTIFY pgrst, 'reload schema';
