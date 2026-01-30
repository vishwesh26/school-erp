-- ==========================================================
-- DANGER: DATA CLEANUP SCRIPT (PRODUCTION HANDOVER)
-- ==========================================================
-- This script deletes all test records from the database.
-- Run this in the Supabase SQL Editor.
-- ==========================================================

BEGIN;

-- 1. Clear Accounting Data (Children first)
TRUNCATE TABLE "VoucherEntry" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Voucher" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Ledger" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "LedgerGroup" RESTART IDENTITY CASCADE;

-- 2. Clear Academic Records
TRUNCATE TABLE "Attendance" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Result" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Exam" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Assignment" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Lesson" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Event" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Announcement" RESTART IDENTITY CASCADE;

-- 3. Clear Library Data
TRUNCATE TABLE "BookIssue" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Book" RESTART IDENTITY CASCADE;

-- 4. Clear User Relations
TRUNCATE TABLE "_SubjectToTeacher" RESTART IDENTITY CASCADE;

-- 5. Clear Main Profiles
-- (We use DELETE if TRUNCATE is blocked by complex FKs not covered by CASCADE)
TRUNCATE TABLE "Student" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Teacher" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Parent" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Librarian" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Accountant" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Admin" RESTART IDENTITY CASCADE;

-- 6. Clear Structural Data
TRUNCATE TABLE "Class" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Subject" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Grade" RESTART IDENTITY CASCADE;

COMMIT;

-- ==========================================================
-- NEXT STEP: SUPABASE AUTH CLEANUP
-- ==========================================================
-- After running the above, your login users still exist in Supabase Auth.
-- To delete them ALL (except your current session possibly), you can 
-- run this in the SQL Editor (requires superuser/bypass RLS):
--
-- DELETE FROM auth.users WHERE email NOT LIKE '%your_admin_email%';
-- ==========================================================
