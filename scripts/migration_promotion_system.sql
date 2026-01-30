-- Migration: Student Promotion System
-- Introduces AcademicYear and StudentHistory tracking

BEGIN;

-- 1. Create AcademicYear Table
CREATE TABLE IF NOT EXISTS "AcademicYear" (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    "isCurrent" BOOLEAN DEFAULT false,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create StudentHistory Table
-- This table tracks which student was in which class during which academic year.
CREATE TABLE IF NOT EXISTS "StudentStatus" (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO "StudentStatus" (name) VALUES 
('Active'), ('Promoted'), ('Repeat'), ('Passed Out'), ('Transferred')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "StudentHistory" (
    id SERIAL PRIMARY KEY,
    "studentId" TEXT REFERENCES "Student"(id) ON DELETE CASCADE,
    "academicYearId" INTEGER REFERENCES "AcademicYear"(id) ON DELETE CASCADE,
    "gradeId" INTEGER REFERENCES "Grade"(id),
    "classId" INTEGER REFERENCES "Class"(id),
    "status" TEXT DEFAULT 'Active',
    "remarks" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("studentId", "academicYearId")
);

-- 3. Initialize first Academic Year
INSERT INTO "AcademicYear" (name, "isCurrent", "startDate", "endDate")
VALUES ('2024-25', true, '2024-06-01', '2025-05-31')
ON CONFLICT DO NOTHING;

-- 4. Initial Migration: Move current Student Class/Grade data to StudentHistory
-- This assumes the current data in Student table represents the 2024-25 session.
INSERT INTO "StudentHistory" ("studentId", "academicYearId", "gradeId", "classId", "status")
SELECT 
    s.id, 
    (SELECT id FROM "AcademicYear" WHERE name = '2024-25'),
    s."gradeId",
    s."classId",
    'Active'
FROM "Student" s;

-- Note: We do NOT drop Student."classId" or Student."gradeId" yet 
-- to avoid breaking existing code immediately. 
-- We will transition the code to read from StudentHistory instead.

COMMIT;

NOTIFY pgrst, 'reload schema';
