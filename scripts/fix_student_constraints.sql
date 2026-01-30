-- Fix Student Table Constraints for Promotion System
BEGIN;

-- Make gradeId and classId nullable in Student table
-- This allows students who have passed out or transferred to be "unassigned" from current classes
ALTER TABLE "Student" ALTER COLUMN "gradeId" DROP NOT NULL;
ALTER TABLE "Student" ALTER COLUMN "classId" DROP NOT NULL;

COMMIT;

NOTIFY pgrst, 'reload schema';
