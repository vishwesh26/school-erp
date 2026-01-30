-- Fix Academic Year for 2026-27
BEGIN;

-- 1. Set 2024-25 as not current
UPDATE "AcademicYear" SET "isCurrent" = false WHERE "name" = '2024-25';

-- 2. Ensure 2026-27 exists and is or becomes the current one
-- First, remove the duplicate "2026-2027" if it exists
DELETE FROM "AcademicYear" WHERE "name" = '2026-2027';

-- Update the clean "2026-27" record to be current and have standard dates
UPDATE "AcademicYear" 
SET 
  "isCurrent" = true,
  "startDate" = '2026-06-01',
  "endDate" = '2027-05-31'
WHERE "name" = '2026-27';

COMMIT;

NOTIFY pgrst, 'reload schema';
