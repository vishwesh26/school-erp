import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  supervisorId: z.string().optional().nullable().transform(val => val === "" ? null : val),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const librarianSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
});

export type LibrarianSchema = z.infer<typeof librarianSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  rollNumber: z.string().min(3, { message: "Roll Number is required!" }),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
  // Certificate Fields
  motherName: z.string().optional(),
  aadharNo: z.string().optional(),
  placeOfBirth: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  isST: z.string().optional(),
  classAdmitted: z.string().optional(),
  lastDateAttendance: z.coerce.date().optional().nullable(),
  examTaken: z.string().optional(),
  examResult: z.string().optional(),
  isFailed: z.string().optional(),
  qualifiedPromotion: z.string().optional(),
  duesPaidUpTo: z.string().optional(),
  feeConcession: z.string().optional(),
  workingDays: z.string().optional(),
  presentDays: z.string().optional(),
  isNcc: z.string().optional(),
  extraCurricular: z.string().optional(),
  conduct: z.string().optional(),
  dateApplication: z.coerce.date().optional().nullable(),
  dateIssue: z.coerce.date().optional().nullable(),
  reasonLeaving: z.string().optional(),
  remarks: z.string().optional(),
  stateStudentId: z.string().optional(),
  pen: z.string().optional(),
  apaarId: z.string().optional(),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number().optional().nullable().transform(val => val === 0 || !val ? null : val),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).optional(),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0, { message: "Score must be positive!" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  classId: z.coerce.number().optional(), // Made optional for multi-select logic
  gradeIds: z.array(z.coerce.number()).optional(), // Add gradeIds for multi-selection
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  classId: z.coerce.number().optional(), // Made optional for multi-select logic
  gradeIds: z.array(z.coerce.number()).optional(), // Add gradeIds for multi-selection
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number().optional(),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  description: z.string().optional(),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;




export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  students: z.array(z.string()).optional(), // Student IDs
});

export type ParentSchema = z.infer<typeof parentSchema>;




export const studentRegistrationSchema = z.object({
  // Student Info
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  img: z.instanceof(File, { message: "Image is required" }).optional(),

  // Academic
  grade: z.coerce.number().min(1, { message: "Grade is required!" }),

  // Official Identifiers
  aadharNo: z.string().optional(),
  stateStudentId: z.string().optional(),
  pen: z.string().optional(),
  apaarId: z.string().optional(),

  // Parent Info
  parentName: z.string().min(1, { message: "Parent First Name is required!" }),
  parentSurname: z.string().min(1, { message: "Parent Last Name is required!" }),
  parentEmail: z.string().email(),
  parentPhone: z.string().min(1, { message: "Parent Phone is required!" }),
  parentAddress: z.string().min(1, { message: "Parent Address is required!" }),
});

export type StudentRegistrationSchema = z.infer<typeof studentRegistrationSchema>;

export const bookSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  author: z.string().min(1, { message: "Author is required!" }),
  accession_no: z.string().min(1, { message: "Accession No is required!" }),
  category: z.string().optional(),
  rack_no: z.string().optional(),
  total_copies: z.coerce.number().min(1, { message: "At least 1 copy required!" }),
  available_copies: z.coerce.number().optional(), // Usually set to total on create
});

export type BookSchema = z.infer<typeof bookSchema>;

export const adminSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
});

export type AdminSchema = z.infer<typeof adminSchema>;

export const generalRegistrationSchema = z.object({
  role: z.enum(["admin", "teacher", "librarian", "student", "parent"]),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  phone: z.string().optional(),
  password: z.string().optional(),
  // Optional fields based on role
  address: z.string().optional(),
  grade: z.coerce.number().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  bloodType: z.string().optional(),
  birthday: z.coerce.date().optional(),
});

export type GeneralRegistrationSchema = z.infer<typeof generalRegistrationSchema>;

export const feeCategorySchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  baseAmount: z.coerce.number().min(1, { message: "Amount is required!" }),
  gradeId: z.coerce.number().optional().nullable().transform(val => val === 0 || !val ? null : val),
});
export type FeeCategorySchema = z.infer<typeof feeCategorySchema>;

export const studentFeeSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  feeCategoryId: z.coerce.number().min(1, { message: "Category is required!" }),
  totalAmount: z.coerce.number().min(1, { message: "Amount is required!" }),
  discount: z.coerce.number().optional(),
  dueDate: z.coerce.date().optional(),
});
export type StudentFeeSchema = z.infer<typeof studentFeeSchema>;

export const expenseSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  amount: z.coerce.number().min(1, { message: "Amount is required!" }),
  category: z.string().min(1, { message: "Category is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
});
export type ExpenseSchema = z.infer<typeof expenseSchema>;

export const bulkFeeSchema = z.object({
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  feeCategoryId: z.coerce.number().min(1, { message: "Category is required!" }),
  totalAmount: z.coerce.number().min(1, { message: "Amount is required!" }),
  discount: z.coerce.number().optional(),
  dueDate: z.coerce.date().optional(),
  installments: z.array(z.object({
    amount: z.coerce.number(),
    dueDate: z.coerce.date(),
    installmentOrder: z.coerce.number(),
  })).optional(),
});
export type BulkFeeSchema = z.infer<typeof bulkFeeSchema>;

export const academicYearSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Academic Year name is required!" }),
  startDate: z.coerce.date({ message: "Start Date is required!" }),
  endDate: z.coerce.date({ message: "End Date is required!" }),
  isCurrent: z.boolean().default(false),
});
export type AcademicYearSchema = z.infer<typeof academicYearSchema>;

export const studentPromotionSchema = z.object({
  previousYearId: z.coerce.number(),
  nextYearId: z.coerce.number(),
  classId: z.coerce.number().optional().nullable(), // Source class (optional for all)
  students: z.array(z.object({
    studentId: z.string(),
    status: z.enum(['Promoted', 'Repeat', 'Passed Out', 'Transferred']),
    nextGradeId: z.coerce.number().optional().nullable(),
    nextClassId: z.coerce.number().optional().nullable(),
    nextRollNumber: z.string().optional().nullable(),
    nextUsername: z.string().optional().nullable(),
    remarks: z.string().optional(),
  })),
});
export type StudentPromotionSchema = z.infer<typeof studentPromotionSchema>;

export const admissionInquirySchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, { message: "Full Name is required!" }),
  motherName: z.string().min(1, { message: "Mother's Name is required!" }),
  city: z.string().min(1, { message: "City is required!" }),
  currentClass: z.string().min(1, { message: "Current Class is required!" }),
  targetClass: z.string().min(1, { message: "Target Class is required!" }),
  parentPhone: z.string().min(1, { message: "Parent Phone is required!" }),
  emailId: z.string().email({ message: "Invalid email address!" }),
  additionalInfo: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});
export type AdmissionInquirySchema = z.infer<typeof admissionInquirySchema>;
