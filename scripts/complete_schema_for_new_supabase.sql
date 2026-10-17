-- =====================================================================
-- COMPLETE HIGH-PERFORMANCE SCHEMA FOR NEW SUPABASE PROJECT
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: Grade
CREATE TABLE IF NOT EXISTS public."Grade" (
  "id" integer NOT NULL,
  "level" integer NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: AcademicYear
CREATE TABLE IF NOT EXISTS public."AcademicYear" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "isCurrent" boolean,
  "startDate" timestamptz,
  "endDate" timestamptz,
  "createdAt" timestamptz,
  PRIMARY KEY ("id")
);

-- Table: StudentStatus
CREATE TABLE IF NOT EXISTS public."StudentStatus" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: LedgerGroup
CREATE TABLE IF NOT EXISTS public."LedgerGroup" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "isSystem" boolean,
  "createdAt" timestamp,
  PRIMARY KEY ("id")
);

-- Table: FeeCategory
CREATE TABLE IF NOT EXISTS public."FeeCategory" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "baseAmount" numeric NOT NULL,
  "gradeId" integer,
  PRIMARY KEY ("id")
);

-- Table: Admin
CREATE TABLE IF NOT EXISTS public."Admin" (
  "id" text NOT NULL,
  "username" text NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Teacher
CREATE TABLE IF NOT EXISTS public."Teacher" (
  "id" text NOT NULL,
  "username" text NOT NULL,
  "name" text NOT NULL,
  "surname" text NOT NULL,
  "email" text,
  "phone" text,
  "address" text NOT NULL,
  "img" text,
  "bloodType" text NOT NULL,
  "sex" text NOT NULL,
  "createdAt" timestamp NOT NULL,
  "birthday" timestamp NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Accountant
CREATE TABLE IF NOT EXISTS public."Accountant" (
  "id" text NOT NULL,
  "username" text NOT NULL,
  "name" text NOT NULL,
  "surname" text NOT NULL,
  "email" text,
  "phone" text,
  "address" text,
  "img" text,
  "bloodType" text,
  "sex" text,
  "birthday" timestamptz,
  PRIMARY KEY ("id")
);

-- Table: Librarian
CREATE TABLE IF NOT EXISTS public."Librarian" (
  "id" text NOT NULL,
  "username" text NOT NULL,
  "name" text NOT NULL,
  "surname" text NOT NULL,
  "email" text,
  "phone" text,
  "address" text,
  "img" text,
  "bloodType" text,
  "sex" text NOT NULL,
  "createdAt" timestamp,
  "birthday" timestamp NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Receptionist
CREATE TABLE IF NOT EXISTS public."Receptionist" (
  "id" text NOT NULL,
  "username" text NOT NULL,
  "name" text NOT NULL,
  "surname" text NOT NULL,
  "email" text,
  "phone" text,
  "address" text NOT NULL,
  "img" text,
  "bloodType" text NOT NULL,
  "sex" text NOT NULL,
  "birthday" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Parent
CREATE TABLE IF NOT EXISTS public."Parent" (
  "id" text NOT NULL,
  "username" text NOT NULL,
  "name" text NOT NULL,
  "surname" text NOT NULL,
  "email" text,
  "phone" text NOT NULL,
  "address" text NOT NULL,
  "createdAt" timestamp NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Class
CREATE TABLE IF NOT EXISTS public."Class" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "capacity" integer NOT NULL,
  "supervisorId" text,
  "gradeId" integer NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Subject
CREATE TABLE IF NOT EXISTS public."Subject" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "teacherId" text,
  PRIMARY KEY ("id")
);

-- Table: _SubjectToTeacher
CREATE TABLE IF NOT EXISTS public."_SubjectToTeacher" (
  "A" integer NOT NULL,
  "B" text NOT NULL,
  PRIMARY KEY ("A", "B")
);

-- Table: Student
CREATE TABLE IF NOT EXISTS public."Student" (
  "id" text NOT NULL,
  "username" text NOT NULL,
  "name" text NOT NULL,
  "surname" text NOT NULL,
  "email" text,
  "phone" text,
  "address" text NOT NULL,
  "img" text,
  "bloodType" text NOT NULL,
  "sex" text NOT NULL,
  "createdAt" timestamp NOT NULL,
  "parentId" text NOT NULL,
  "classId" integer,
  "gradeId" integer,
  "birthday" timestamp NOT NULL,
  "rollNumber" text,
  "motherName" text,
  "aadharNo" text,
  "placeOfBirth" text,
  "taluka" text,
  "district" text,
  "nationality" text,
  "religion" text,
  "caste" text,
  "isST" text,
  "classAdmitted" text,
  "lastDateAttendance" timestamp,
  "examTaken" text,
  "examResult" text,
  "isFailed" text,
  "qualifiedPromotion" text,
  "duesPaidUpTo" text,
  "feeConcession" text,
  "workingDays" text,
  "presentDays" text,
  "isNcc" text,
  "extraCurricular" text,
  "conduct" text,
  "dateApplication" timestamp,
  "dateIssue" timestamp,
  "reasonLeaving" text,
  "remarks" text,
  "stateStudentId" text,
  "pen" text,
  "apaarId" text,
  PRIMARY KEY ("id")
);

-- Table: StudentHistory
CREATE TABLE IF NOT EXISTS public."StudentHistory" (
  "id" integer NOT NULL,
  "studentId" text,
  "academicYearId" integer,
  "gradeId" integer,
  "classId" integer,
  "status" text,
  "remarks" text,
  "createdAt" timestamptz,
  "rollNumber" text,
  "username" text,
  PRIMARY KEY ("id")
);

-- Table: Lesson
CREATE TABLE IF NOT EXISTS public."Lesson" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "day" text NOT NULL,
  "startTime" timestamp NOT NULL,
  "endTime" timestamp NOT NULL,
  "subjectId" integer NOT NULL,
  "classId" integer NOT NULL,
  "teacherId" text NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Exam
CREATE TABLE IF NOT EXISTS public."Exam" (
  "id" integer NOT NULL,
  "title" text NOT NULL,
  "startTime" timestamp NOT NULL,
  "endTime" timestamp NOT NULL,
  "lessonId" integer NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Assignment
CREATE TABLE IF NOT EXISTS public."Assignment" (
  "id" integer NOT NULL,
  "title" text NOT NULL,
  "startDate" timestamp NOT NULL,
  "dueDate" timestamp NOT NULL,
  "lessonId" integer,
  "description" text,
  "classId" integer,
  "subjectId" integer,
  "teacherId" text,
  "pdfUrl" text,
  PRIMARY KEY ("id")
);

-- Table: Result
CREATE TABLE IF NOT EXISTS public."Result" (
  "id" integer NOT NULL,
  "score" integer NOT NULL,
  "examId" integer,
  "assignmentId" integer,
  "studentId" text NOT NULL,
  PRIMARY KEY ("id")
);

-- Table: Attendance
CREATE TABLE IF NOT EXISTS public."Attendance" (
  "id" integer NOT NULL,
  "date" timestamp NOT NULL,
  "present" boolean NOT NULL,
  "studentId" text NOT NULL,
  "lessonId" integer,
  PRIMARY KEY ("id")
);

-- Table: Event
CREATE TABLE IF NOT EXISTS public."Event" (
  "id" integer NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "startTime" timestamp NOT NULL,
  "endTime" timestamp NOT NULL,
  "classId" integer,
  "gradeId" integer,
  PRIMARY KEY ("id")
);

-- Table: Announcement
CREATE TABLE IF NOT EXISTS public."Announcement" (
  "id" integer NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "date" timestamp NOT NULL,
  "classId" integer,
  PRIMARY KEY ("id")
);

-- Table: Book
CREATE TABLE IF NOT EXISTS public."Book" (
  "id" integer NOT NULL,
  "title" text NOT NULL,
  "author" text NOT NULL,
  "status" text NOT NULL,
  "createdAt" timestamp,
  "accession_no" text NOT NULL,
  "category" text,
  "rack_no" text,
  "total_copies" integer,
  "available_copies" integer,
  PRIMARY KEY ("id")
);

-- Table: BookIssue
CREATE TABLE IF NOT EXISTS public."BookIssue" (
  "id" integer NOT NULL,
  "bookId" integer,
  "studentId" text,
  "issueDate" timestamp,
  "dueDate" timestamp NOT NULL,
  "returnDate" timestamp,
  "status" text NOT NULL,
  "fineAmount" numeric,
  PRIMARY KEY ("id")
);

-- Table: StudentFee
CREATE TABLE IF NOT EXISTS public."StudentFee" (
  "id" integer NOT NULL,
  "studentId" text,
  "feeCategoryId" integer,
  "totalAmount" numeric NOT NULL,
  "discount" numeric,
  "paidAmount" numeric,
  "pendingAmount" numeric NOT NULL,
  "status" text,
  "dueDate" timestamptz,
  "createdAt" timestamptz,
  PRIMARY KEY ("id")
);

-- Table: Installment
CREATE TABLE IF NOT EXISTS public."Installment" (
  "id" uuid NOT NULL,
  "studentFeeId" integer,
  "amount" numeric NOT NULL,
  "dueDate" timestamptz NOT NULL,
  "status" text,
  "installmentOrder" integer NOT NULL,
  "created_at" timestamptz,
  PRIMARY KEY ("id")
);

-- Table: Payment
CREATE TABLE IF NOT EXISTS public."Payment" (
  "id" integer NOT NULL,
  "studentFeeId" integer,
  "amount" numeric NOT NULL,
  "paymentDate" timestamptz,
  "paymentMode" text NOT NULL,
  "receiptNumber" text NOT NULL,
  "remarks" text,
  PRIMARY KEY ("id")
);

-- Table: Expense
CREATE TABLE IF NOT EXISTS public."Expense" (
  "id" integer NOT NULL,
  "title" text NOT NULL,
  "amount" numeric NOT NULL,
  "date" timestamptz,
  "category" text,
  PRIMARY KEY ("id")
);

-- Table: Ledger
CREATE TABLE IF NOT EXISTS public."Ledger" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "groupId" integer,
  "openingBalance" numeric,
  "openingBalanceType" text NOT NULL,
  "currentBalance" numeric,
  "isSystem" boolean,
  "createdAt" timestamp,
  PRIMARY KEY ("id")
);

-- Table: Voucher
CREATE TABLE IF NOT EXISTS public."Voucher" (
  "id" integer NOT NULL,
  "voucherNumber" text NOT NULL,
  "date" timestamp NOT NULL,
  "type" text NOT NULL,
  "narration" text,
  "totalAmount" numeric,
  "createdAt" timestamp,
  PRIMARY KEY ("id")
);

-- Table: VoucherEntry
CREATE TABLE IF NOT EXISTS public."VoucherEntry" (
  "id" integer NOT NULL,
  "voucherId" integer,
  "ledgerId" integer,
  "amount" numeric NOT NULL,
  "type" text NOT NULL,
  "createdAt" timestamp,
  PRIMARY KEY ("id")
);

-- Table: AdmissionInquiry
CREATE TABLE IF NOT EXISTS public."AdmissionInquiry" (
  "id" uuid NOT NULL,
  "fullName" text NOT NULL,
  "motherName" text NOT NULL,
  "city" text NOT NULL,
  "currentClass" text NOT NULL,
  "targetClass" text NOT NULL,
  "parentPhone" text NOT NULL,
  "emailId" text NOT NULL,
  "additionalInfo" text,
  "status" text NOT NULL,
  "createdAt" timestamptz NOT NULL,
  PRIMARY KEY ("id")
);

-- =====================================================================
-- HIGH-CONCURRENCY PERFORMANCE INDEXES (Zero lag for concurrent users)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public."Attendance" ("studentId", "date");
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public."Attendance" ("date");
CREATE INDEX IF NOT EXISTS idx_student_class_grade ON public."Student" ("classId", "gradeId");
CREATE INDEX IF NOT EXISTS idx_student_parent ON public."Student" ("parentId");
CREATE INDEX IF NOT EXISTS idx_result_student ON public."Result" ("studentId");
CREATE INDEX IF NOT EXISTS idx_result_exam ON public."Result" ("examId");
CREATE INDEX IF NOT EXISTS idx_result_assignment ON public."Result" ("assignmentId");
CREATE INDEX IF NOT EXISTS idx_lesson_class_teacher ON public."Lesson" ("classId", "teacherId");
CREATE INDEX IF NOT EXISTS idx_assignment_class ON public."Assignment" ("classId");
CREATE INDEX IF NOT EXISTS idx_exam_lesson ON public."Exam" ("lessonId");
CREATE INDEX IF NOT EXISTS idx_studentfee_student ON public."StudentFee" ("studentId");
CREATE INDEX IF NOT EXISTS idx_bookissue_student ON public."BookIssue" ("studentId");
CREATE INDEX IF NOT EXISTS idx_announcement_date ON public."Announcement" ("date");
CREATE INDEX IF NOT EXISTS idx_event_date ON public."Event" ("startTime");

-- =====================================================================
-- ACCESS PERMISSIONS (Smooth API execution)
-- =====================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role, anon, authenticated;
