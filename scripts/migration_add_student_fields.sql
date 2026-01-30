-- Migration script to add certificate and official identifier fields to the Student table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "motherName" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "aadharNo" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "placeOfBirth" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "taluka" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "district" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "nationality" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "religion" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "caste" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "isST" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "classAdmitted" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "lastDateAttendance" timestamp;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "examTaken" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "examResult" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "isFailed" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "qualifiedPromotion" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "duesPaidUpTo" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "feeConcession" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "workingDays" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "presentDays" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "isNcc" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "extraCurricular" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "conduct" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "dateApplication" timestamp;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "dateIssue" timestamp;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "reasonLeaving" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "remarks" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "stateStudentId" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "pen" text;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "apaarId" text;

-- Notify PostgREST that the schema has changed
NOTIFY pgrst, 'reload schema';
