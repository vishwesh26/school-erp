"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  LessonSchema,
  ResultSchema,
  EventSchema,
  AnnouncementSchema,
  ParentSchema,
  AssignmentSchema,
  LibrarianSchema,
  AdmissionInquirySchema,
} from "./formValidationSchemas";
import { createClient } from "@supabase/supabase-js";
import { sendNotificationEmail } from "./mail";



type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Create Subject
    const { data: subject, error } = await supabase.from('Subject').insert({
      name: data.name,
    }).select('id').single();

    if (error) throw error;

    // 2. Insert Teachers (if any)
    if (data.teachers && data.teachers.length > 0) {
      const relations = data.teachers.map(teacherId => ({
        A: subject.id, // Subject ID
        B: teacherId   // Teacher ID
      }));
      const { error: relError } = await supabase.from('_SubjectToTeacher').insert(relations);
      if (relError) throw relError;
    }

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Update Subject Name
    const { error } = await supabase.from('Subject').update({
      name: data.name,
    }).eq('id', data.id);

    if (error) throw error;

    // 2. Sync Teachers
    // We replace all existing relations with the new list
    if (data.teachers) {
      // Clear existing
      await supabase.from('_SubjectToTeacher').delete().eq('A', data.id);

      // Insert new
      if (data.teachers.length > 0) {
        const relations = data.teachers.map(teacherId => ({
          A: data.id,
          B: teacherId
        }));
        const { error: relError } = await supabase.from('_SubjectToTeacher').insert(relations);
        if (relError) throw relError;
      }
    }

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Delete Assignments linked to this Subject
    // We must delete Results first
    const { data: assignments } = await supabase.from('Assignment').select('id').eq('subjectId', parseInt(id));
    if (assignments && assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.id);
      await supabase.from('Result').delete().in('assignmentId', assignmentIds);
      await supabase.from('Assignment').delete().in('id', assignmentIds);
    }

    // 2. Fetch Lessons to Identify Dependencies
    const { data: lessons, error: lessonFetchError } = await supabase.from('Lesson').select('id').eq('subjectId', parseInt(id));
    if (lessonFetchError) throw lessonFetchError;

    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map(l => l.id);

      // 3. Delete other dependents (Attendance, Exams) linked to Lessons

      // Delete Attendance
      await supabase.from('Attendance').delete().in('lessonId', lessonIds);

      // Delete Exams linked to Lessons
      // But first, delete Results linked to those Exams
      const { data: examsPayload, error: examFetchError } = await supabase.from('Exam').select('id').in('lessonId', lessonIds);
      if (examFetchError) throw examFetchError;

      if (examsPayload && examsPayload.length > 0) {
        const examIds = examsPayload.map(e => e.id);
        // Delete Results
        await supabase.from('Result').delete().in('examId', examIds);
        // Delete Exams
        await supabase.from('Exam').delete().in('id', examIds);
      }

      // 4. Delete Lessons
      const { error: lessonDeleteError } = await supabase.from('Lesson').delete().in('id', lessonIds);
      if (lessonDeleteError) throw lessonDeleteError;
    }

    // 5. Delete Subject to Teacher relations
    await supabase.from('_SubjectToTeacher').delete().eq('A', parseInt(id));

    // 6. Delete Subject
    const { error } = await supabase.from('Subject').delete().eq('id', parseInt(id));
    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Class').insert(data);

    if (error) throw error;

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Class').update(data).eq('id', data.id);

    if (error) throw error;

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const increaseClassStrength = async (classId: number, increment: number = 5) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get current capacity
    const { data: classData, error: fetchError } = await supabase
      .from('Class')
      .select('capacity')
      .eq('id', classId)
      .single();

    if (fetchError || !classData) throw fetchError || new Error("Class not found");

    // 2. Update capacity
    const newCapacity = (classData.capacity || 0) + increment;
    const { error: updateError } = await supabase
      .from('Class')
      .update({ capacity: newCapacity })
      .eq('id', classId);

    if (updateError) throw updateError;

    return { success: true, newCapacity };
  } catch (err) {
    console.error("Failed to increase class strength:", err);
    return { success: false, error: "Failed to update capacity" };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Conflict cleanup
    // 1. Academic relations
    await supabase.from('Lesson').delete().eq('classId', parseInt(id));
    await supabase.from('Event').delete().eq('classId', parseInt(id));
    await supabase.from('Announcement').delete().eq('classId', parseInt(id));

    // 2. Unlink Students
    await supabase.from('Student').update({ classId: null }).eq('classId', parseInt(id));

    const { error } = await supabase.from('Class').delete().eq('id', parseInt(id));

    if (error) throw error;

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: data.email || undefined,
      password: data.password,
      user_metadata: { role: "teacher" },
      email_confirm: true
    });

    let userId;
    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error("[CREATE_TEACHER_LIST_ERROR]", listError);
          return { success: false, error: true };
        }
        const existingUser = users.find(u => u.email === data.email);
        if (existingUser) {
          userId = existingUser.id;
          // Update role to teacher to be safe
          await supabase.auth.admin.updateUserById(userId, { user_metadata: { role: 'teacher' } });
        } else {
          console.error("[CREATE_TEACHER_AUTH_ERROR]", error);
          return { success: false, error: true };
        }
      } else {
        console.error("[CREATE_TEACHER_AUTH_ERROR]", error);
        return { success: false, error: true };
      }
    } else {
      userId = user.user.id;
    }

    const { error: dbError } = await supabase.from('Teacher').insert({
      id: userId,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      // subjects relation omitted
    });

    if (dbError) throw dbError;

    // Handle Subjects Relation (Many-to-Many)
    // Table: _SubjectToTeacher (A: integer [SubjectId], B: text [TeacherId]) - based on Prisma default
    // Or check column names. Usually Prisma uses "A" and "B". Let's assume standard Prisma migration structure.
    // If Supabase created it differently? We can check column names but standard is A (Subject.id int) and B (Teacher.id string).

    if (data.subjects && data.subjects.length > 0) {
      const subjectInserts = data.subjects.map(subjectId => ({
        A: parseInt(subjectId),
        B: userId
      }));

      const { error: relError } = await supabase.from('_SubjectToTeacher').insert(subjectInserts);

      if (relError) {
        console.error("Error inserting subjects:", relError);
        // We might want to throw or just log? 
        // If relation fails, teacher is still created.
      }
    }

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Supabase Auth update logic omitted

    const { error } = await supabase.from('Teacher').update({
      ...(data.password !== "" && { password: data.password }),
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      // subjects relation omitted
    }).eq('id', data.id);

    if (error) throw error;

    // Handle Subjects Relation Update
    if (data.subjects) {
      // First delete existing
      await supabase.from('_SubjectToTeacher').delete().eq('B', data.id);

      // Then insert new
      if (data.subjects.length > 0) {
        const subjectInserts = data.subjects.map(subjectId => ({
          A: parseInt(subjectId),
          B: data.id
        }));
        await supabase.from('_SubjectToTeacher').insert(subjectInserts);
      }
    }

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.auth.admin.deleteUser(id);

    // Conflict cleanup
    await supabase.from('Lesson').delete().eq('teacherId', id);
    await supabase.from('Class').update({ supervisorId: null }).eq('supervisorId', id);
    await supabase.from('_SubjectToTeacher').delete().eq('B', id);

    // Delete Assignments (and their results)
    const { data: teacherAssignments } = await supabase.from('Assignment').select('id').eq('teacherId', id);
    if (teacherAssignments && teacherAssignments.length > 0) {
      const taIds = teacherAssignments.map(a => a.id);
      await supabase.from('Result').delete().in('assignmentId', taIds);
      await supabase.from('Assignment').delete().in('id', taIds);
    }

    const { error } = await supabase.from('Teacher').delete().eq('id', id);

    if (error) throw error;

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Capacity Check
    const { data: classData, error: classError } = await supabase
      .from('Class')
      .select('capacity')
      .eq('id', data.classId)
      .single();

    if (classData) {
      const { count } = await supabase
        .from('Student')
        .select('*', { count: 'exact', head: true })
        .eq('classId', data.classId);

      if (count != null && count >= classData.capacity) {
        return { success: false, error: true };
      }
    }

    const { data: user, error } = await supabase.auth.admin.createUser({
      email: data.email || undefined,
      password: data.password,
      user_metadata: { role: "student" },
      email_confirm: true
    });

    let userId;
    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error("[CREATE_STUDENT_LIST_ERROR]", listError);
          return { success: false, error: true };
        }
        const existingUser = users.find(u => u.email === data.email);
        if (existingUser) {
          userId = existingUser.id;
          // Update role to student
          await supabase.auth.admin.updateUserById(userId, { user_metadata: { role: 'student' } });
        } else {
          console.error("[CREATE_STUDENT_AUTH_ERROR]", error);
          return { success: false, error: true };
        }
      } else {
        console.error("[CREATE_STUDENT_AUTH_ERROR]", error);
        return { success: false, error: true };
      }
    } else {
      userId = user.user.id;
    }

    const { error: dbError } = await supabase.from('Student').insert({
      id: userId,
      username: data.username,
      name: data.name,
      surname: data.surname,
      rollNumber: data.rollNumber,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId,
      motherName: data.motherName,
      aadharNo: data.aadharNo,
      placeOfBirth: data.placeOfBirth,
      taluka: data.taluka,
      district: data.district,
      nationality: data.nationality,
      religion: data.religion,
      caste: data.caste,
      isST: data.isST,
      classAdmitted: data.classAdmitted,
      lastDateAttendance: data.lastDateAttendance,
      examTaken: data.examTaken,
      examResult: data.examResult,
      isFailed: data.isFailed,
      qualifiedPromotion: data.qualifiedPromotion,
      duesPaidUpTo: data.duesPaidUpTo,
      feeConcession: data.feeConcession,
      workingDays: data.workingDays,
      presentDays: data.presentDays,
      isNcc: data.isNcc,
      extraCurricular: data.extraCurricular,
      conduct: data.conduct,
      dateApplication: data.dateApplication,
      dateIssue: data.dateIssue,
      reasonLeaving: data.reasonLeaving,
      remarks: data.remarks,
      stateStudentId: data.stateStudentId,
      pen: data.pen,
      apaarId: data.apaarId,
    });

    if (dbError) throw dbError;

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Supabase update logic omitted

    // If password is provided, update it via Auth API
    if (data.password && data.password !== "") {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        data.id,
        { password: data.password }
      );
      if (authError) {
        console.error("[UPDATE_STUDENT_AUTH_ERROR]", authError);
        return { success: false, error: true };
      }
    }

    const { error } = await supabase.from('Student').update({
      username: data.username,
      name: data.name,
      surname: data.surname,
      rollNumber: data.rollNumber,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId,
      motherName: data.motherName,
      aadharNo: data.aadharNo,
      placeOfBirth: data.placeOfBirth,
      taluka: data.taluka,
      district: data.district,
      nationality: data.nationality,
      religion: data.religion,
      caste: data.caste,
      isST: data.isST,
      classAdmitted: data.classAdmitted,
      lastDateAttendance: data.lastDateAttendance,
      examTaken: data.examTaken,
      examResult: data.examResult,
      isFailed: data.isFailed,
      qualifiedPromotion: data.qualifiedPromotion,
      duesPaidUpTo: data.duesPaidUpTo,
      feeConcession: data.feeConcession,
      workingDays: data.workingDays,
      presentDays: data.presentDays,
      isNcc: data.isNcc,
      extraCurricular: data.extraCurricular,
      conduct: data.conduct,
      dateApplication: data.dateApplication,
      dateIssue: data.dateIssue,
      reasonLeaving: data.reasonLeaving,
      remarks: data.remarks,
      stateStudentId: data.stateStudentId,
      pen: data.pen,
      apaarId: data.apaarId,
    }).eq('id', data.id);

    if (error) throw error;

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // 1. Fetch Parent ID before deleting student
    const { data: student } = await supabase.from('Student').select('parentId').eq('id', id).single();
    const parentId = student?.parentId;

    await supabase.auth.admin.deleteUser(id);

    // Conflict cleanup: Delete related records first
    // 1. Finance related
    const { data: fees } = await supabase.from('StudentFee').select('id').eq('studentId', id);
    if (fees && fees.length > 0) {
      const feeIds = fees.map(f => f.id);
      await supabase.from('Payment').delete().in('studentFeeId', feeIds);
      await supabase.from('Installment').delete().in('studentFeeId', feeIds);
      await supabase.from('StudentFee').delete().in('id', feeIds);
    }

    // 2. Academic related
    await supabase.from('Attendance').delete().eq('studentId', id);
    await supabase.from('Result').delete().eq('studentId', id);
    await supabase.from('StudentHistory').delete().eq('studentId', id);

    // 3. Library related
    await supabase.from('BookIssue').delete().eq('studentId', id);

    const { error } = await supabase.from('Student').delete().eq('id', id);

    if (error) throw error;

    // 2. Attempt to delete Parent if exists
    // (We wrap in try-catch because if the parent has OTHER children, this might fail due to FK constraints, 
    // or we might want to only delete if no other children exist. For now, we attempt delete as requested.)
    if (parentId) {
      try {
        // Check if parent has other children?
        const { count } = await supabase
          .from('Student')
          .select('*', { count: 'exact', head: true })
          .eq('parentId', parentId);

        // Only delete if NO students remaining (count is 0 because we just deleted the current one)
        if (count === 0) {
          await supabase.auth.admin.deleteUser(parentId);
          await supabase.from('Parent').delete().eq('id', parentId);
        }
      } catch (parentError) {
        console.error("Failed to auto-delete parent:", parentError);
      }
    }

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Role check logic commented out just like before

    const { error } = await supabase.from('Exam').insert({
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      lessonId: data.lessonId,
    });

    if (error) {
      console.log(error);
      return { success: false, error: true };
    }

    // revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteBook = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Conflict cleanup
    await supabase.from('BookIssue').delete().eq('bookId', parseInt(id));

    const { error } = await supabase.from('Book').delete().eq('id', parseInt(id));
    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLibrarian = async (
  currentState: CurrentState,
  data: LibrarianSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.createUser({
      email: data.email || "",
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "librarian" },
    });

    let userId = user?.id;

    if (userError) {
      if (userError.code === 'email_exists' && data.email) {
        // Recover by finding the existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === data.email);
        if (existingUser) {
          userId = existingUser.id;
          // Update role just in case
          await supabase.auth.admin.updateUserById(userId, { user_metadata: { role: 'librarian' } });
        } else {
          console.log(userError);
          return { success: false, error: true };
        }
      } else {
        console.log(userError);
        return { success: false, error: true };
      }
    }

    const { error } = await supabase.from("Librarian").insert({
      id: userId || "",
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || "",
      phone: data.phone || "",
      address: data.address,
      img: data.img || "",
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
    });

    if (error) {
      console.log(error);
      return { success: false, error: true };
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLibrarian = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user, error: userError } =
      await supabase.auth.admin.updateUserById(data.id, {
        email: data.email || "",
        password: data.password,
        user_metadata: { role: "librarian" },
      });

    if (userError) {
      console.log(userError);
      return { success: false, error: true };
    }

    const { error } = await supabase
      .from("Librarian")
      .update({
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address,
        img: data.img || "",
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
      })
      .eq("id", data.id);

    if (error) {
      console.log(error);
      return { success: false, error: true };
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLibrarian = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from("Librarian").delete().eq("id", id);
    await supabase.auth.admin.deleteUser(id);

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Exam').update({
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      lessonId: data.lessonId,
    }).eq('id', data.id);

    if (error) throw error;

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Exam').delete().eq('id', parseInt(id));

    if (error) throw error;

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Lesson').insert(data);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Lesson').update(data).eq('id', data.id);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const lessonId = parseInt(id);

    // Conflict cleanup
    // 1. Attendance
    await supabase.from('Attendance').delete().eq('lessonId', lessonId);

    // 2. Exams and Results
    const { data: exams } = await supabase.from('Exam').select('id').eq('lessonId', lessonId);
    if (exams && exams.length > 0) {
      const examIds = exams.map(e => e.id);
      await supabase.from('Result').delete().in('examId', examIds);
      await supabase.from('Exam').delete().in('id', examIds);
    }

    // 3. Assignments and Results
    const { data: assignments } = await supabase.from('Assignment').select('id').eq('lessonId', lessonId);
    if (assignments && assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.id);
      await supabase.from('Result').delete().in('assignmentId', assignmentIds);
      await supabase.from('Assignment').delete().in('id', assignmentIds);
    }

    const { error } = await supabase.from('Lesson').delete().eq('id', lessonId);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Result').insert(data);

    if (error) throw error;

    // Send Notification Email
    try {
      const { data: student } = await supabase.from('Student').select('email, name').eq('id', data.studentId).single();
      if (student?.email) {
        await sendNotificationEmail(
          student.email,
          student.name,
          "New Result Published",
          `A new result has been published for you. You can check your scores in the portal.`,
          "/list/results",
          "View Result"
        );
      }
    } catch (mailErr) {
      console.error("Failed to send result notification:", mailErr);
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Result').update(data).eq('id', data.id);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Conflict cleanup
    await supabase.from('Result').delete().eq('examId', parseInt(id));

    const { error } = await supabase.from('Exam').delete().eq('id', parseInt(id));

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Logic for Multi-Select Grades / "All Students"
    const { gradeIds, classId, ...eventData } = data; // classId coming from schema might be used if direct class selection was possible, but form now works on grades.

    if (gradeIds && gradeIds.includes(-1)) {
      // "All Students" -> classId = null
      const { error } = await supabase.from('Event').insert({
        ...eventData,
        classId: null,
      });
      if (error) throw error;
    } else if (gradeIds && gradeIds.length > 0) {
      // Fetch classes for selected grades
      const { data: classes, error: classError } = await supabase
        .from('Class')
        .select('id')
        .in('gradeId', gradeIds);

      if (classError) throw classError;

      if (classes && classes.length > 0) {
        const inserts = classes.map(c => ({
          ...eventData,
          classId: c.id,
        }));
        const { error } = await supabase.from('Event').insert(inserts);
        if (error) throw error;
      } else {
        // No classes found for selected grades? Maybe just don't insert or insert with null?
        // User intention was targeting specific grades. If no classes, nothing to target.
        // But maybe they want to target future classes?
        // For now, if no classes found, we insert nothing or log warning. 
        // We'll proceed with success = true (no-op).
      }
    } else {
      // Fallback or if Single Item Update logic was kept. 
      // If existing form validation allows empty, we might default to null (All) or fail.
      // Schema says classId optional.
      // Let's assume classId if present (legacy) or default to null?
      // If data.classId is present, use it.
      const { error } = await supabase.from('Event').insert({
        ...eventData,
        classId: classId || null,
      });
      if (error) throw error;
    }

    // Send Notification Emails
    try {
      const { gradeIds, classId } = data;
      let studentQuery = supabase.from('Student').select('email, name');

      if (gradeIds && gradeIds.includes(-1)) {
        // All students
      } else if (gradeIds && gradeIds.length > 0) {
        studentQuery = studentQuery.in('gradeId', gradeIds);
      } else if (classId) {
        studentQuery = studentQuery.eq('classId', classId);
      }

      const { data: students } = await studentQuery;
      if (students && students.length > 0) {
        await Promise.all(students.map(s => {
          if (s.email) {
            return sendNotificationEmail(
              s.email,
              s.name,
              `New Event: ${data.title}`,
              `A new event "${data.title}" has been scheduled. Check the events section for more details.`,
              "/list/events",
              "View Events"
            );
          }
          return Promise.resolve();
        }));
      }
    } catch (mailErr) {
      console.error("Failed to send event notifications:", mailErr);
    }

    // revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Remove gradeIds from update payload
    const { gradeIds, classId, ...eventData } = data;
    let targetClassId = classId;

    if (gradeIds && gradeIds.includes(-1)) {
      targetClassId = undefined; // Set to NULL? 'undefined' ignores update. 'null' updates to NULL.
      // We likely want NULL if "All Students" selected. But Supabase needs explicit null.
      // And Spread ...eventData doesn't include classId.
      // So we need to add explicitly if we want to update it.
      // Let's decide: Update ONLY updates title/desc/time unless logic overrides.
      // If user picks "All Students", we set classId to null.
      // If user picks specific Grade, we find first class?
    }

    // Simplification for Update: Ignore target audience change logic for now to fix crash, 
    // OR support simple "All Students" switch. 
    // If we just remove gradeIds, the crash is fixed. 
    // The classId will remain whatever it was, OR if classId is in 'data' (it is filtered out), 
    // it won't be updated.

    // Better: If gradeIds has -1, force classId: null. 
    // Else if gradeIds has values, find first class and set classId.
    // Else preserve existing (don't send classId).

    let updatePayload: any = { ...eventData };

    if (gradeIds) {
      if (gradeIds.includes(-1)) {
        updatePayload.classId = null;
      } else if (gradeIds.length > 0) {
        // Find first class of first grade
        const { data: cls } = await supabase.from('Class').select('id').eq('gradeId', gradeIds[0]).limit(1).single();
        if (cls) updatePayload.classId = cls.id;
      }
    }

    const { error } = await supabase.from('Event').update(updatePayload).eq('id', data.id);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Event').delete().eq('id', parseInt(id));

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Logic for Multi-Select Grades / "All Students"
    const { gradeIds, classId, ...announcementData } = data;

    if (gradeIds && gradeIds.includes(-1)) {
      // "All Students" -> classId = null
      const { error } = await supabase.from('Announcement').insert({
        ...announcementData,
        classId: null,
      });
      if (error) throw error;
    } else if (gradeIds && gradeIds.length > 0) {
      // Fetch classes for selected grades
      const { data: classes, error: classError } = await supabase
        .from('Class')
        .select('id')
        .in('gradeId', gradeIds);

      if (classError) throw classError;

      if (classes && classes.length > 0) {
        const inserts = classes.map(c => ({
          ...announcementData,
          classId: c.id,
        }));
        const { error } = await supabase.from('Announcement').insert(inserts);
        if (error) throw error;
      }
    } else {
      // Fallback
      const { error } = await supabase.from('Announcement').insert({
        ...announcementData,
        classId: classId || null,
      });
      if (error) throw error;
    }

    // Send Notification Emails
    try {
      const { gradeIds, classId } = data;
      let studentQuery = supabase.from('Student').select('email, name');

      if (gradeIds && gradeIds.includes(-1)) {
        // All students
      } else if (gradeIds && gradeIds.length > 0) {
        studentQuery = studentQuery.in('gradeId', gradeIds);
      } else if (classId) {
        studentQuery = studentQuery.eq('classId', classId);
      }

      const { data: students } = await studentQuery;
      if (students && students.length > 0) {
        await Promise.all(students.map(s => {
          if (s.email) {
            return sendNotificationEmail(
              s.email,
              s.name,
              `New Announcement: ${data.title}`,
              `A new announcement "${data.title}" has been posted. Please check the announcements section.`,
              "/list/announcements",
              "View Announcements"
            );
          }
          return Promise.resolve();
        }));
      }
    } catch (mailErr) {
      console.error("Failed to send announcement notifications:", mailErr);
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { gradeIds, classId, ...announcementData } = data;

    let updatePayload: any = { ...announcementData };

    if (gradeIds) {
      if (gradeIds.includes(-1)) {
        updatePayload.classId = null;
      } else if (gradeIds.length > 0) {
        const { data: cls } = await supabase.from('Class').select('id').eq('gradeId', gradeIds[0]).limit(1).single();
        if (cls) updatePayload.classId = cls.id;
      }
    }

    const { error } = await supabase.from('Announcement').update(updatePayload).eq('id', data.id);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Announcement').delete().eq('id', parseInt(id));

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ATTENDANCE ACTIONS

export const getTeacherClasses = async (teacherId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // Fetch all classes as requested, or could filter by lessons.
  // For now, fetching all classes is simplest and fulfills "see all classes".
  const { data, error } = await supabase.from('Class').select('id, name');
  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
  return data;
};

export const getTeacherLessons = async (teacherId: string, classId: number, date: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  // Day enum in DB might be MONDAY, TUESDAY... check schema or assumptions. 
  // Usually standard is Uppercase Full Day.

  const { data: lessons, error } = await supabase
    .from('Lesson')
    .select('id, name, startTime, endTime')
    .eq('classId', classId)
    .eq('teacherId', teacherId) // Only see own lessons
    .eq('day', dayOfWeek);

  if (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
  return lessons;
}

export const getClassStudents = async (classId: number) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('Student')
    .select('id, name, surname')
    .eq('classId', classId);

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }
  return data;
}


export const getAttendance = async (lessonId: number | null, date: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let query = supabase
    .from('Attendance')
    .select('studentId, present')
    .gte('date', startOfDay.toISOString())
    .lte('date', endOfDay.toISOString());

  if (lessonId) {
    query = query.eq('lessonId', lessonId);
  } else {
    query = query.is('lessonId', null);
  }

  const { data: attendanceData, error: attendanceError } = await query;

  if (attendanceError) {
    console.error("Error fetching attendance:", attendanceError);
    return [];
  }
  return attendanceData;
}

export const bulkUpdateAttendance = async (
  lessonId: number | null,
  date: string,
  attendanceData: { studentId: string, present: boolean }[]
) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Delete existing for this date range (and specific lesson or generic)
  let deleteQuery = supabase
    .from('Attendance')
    .delete()
    .gte('date', startOfDay.toISOString())
    .lte('date', endOfDay.toISOString());

  if (lessonId) {
    deleteQuery = deleteQuery.eq('lessonId', lessonId);
  } else {
    deleteQuery = deleteQuery.is('lessonId', null);
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    console.error("Error clearing old attendance:", deleteError);
    return { success: false, error: true };
  }

  // 2. Insert new records
  const records = attendanceData.map(r => ({
    date: new Date(date).toISOString(),
    present: r.present,
    studentId: r.studentId,
    lessonId: lessonId || null
  }));

  if (records.length > 0) {
    const { error: insertError } = await supabase
      .from('Attendance')
      .insert(records);

    if (insertError) {
      console.error("Error inserting attendance:", insertError);
      return { success: false, error: true };
    }
  }

  return { success: true, error: false };
}

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user, error } = await supabase.auth.admin.createUser({
      email: data.email || undefined,
      password: data.password,
      user_metadata: { role: "parent" },
      email_confirm: true
    });

    let userId;
    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error("[CREATE_PARENT_LIST_ERROR]", listError);
          return { success: false, error: true };
        }
        const existingUser = users.find(u => u.email === data.email);
        if (existingUser) {
          userId = existingUser.id;
          // Update role to parent
          await supabase.auth.admin.updateUserById(userId, { user_metadata: { role: 'parent' } });
        } else {
          console.error("[CREATE_PARENT_AUTH_ERROR]", error);
          return { success: false, error: true };
        }
      } else {
        console.error("[CREATE_PARENT_AUTH_ERROR]", error);
        return { success: false, error: true };
      }
    } else {
      userId = user.user.id;
    }

    const { error: dbError } = await supabase.from('Parent').insert({
      id: userId,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    });

    if (dbError) throw dbError;

    // Handle student relations if provided (optional)
    if (data.students && data.students.length > 0) {
      const { error: studentError } = await supabase.from('Student').update({ parentId: userId }).in('id', data.students);
      if (studentError) console.error("Error linking students:", studentError);
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (data.password && data.password !== "") {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        data.id,
        { password: data.password }
      );
      if (authError) {
        console.error("[UPDATE_PARENT_AUTH_ERROR]", authError);
        return { success: false, error: true };
      }
    }

    const { error } = await supabase.from('Parent').update({
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    }).eq('id', data.id);

    if (error) throw error;

    if (data.students && data.students.length > 0) {
      // This logic only ADDS students to the parent, it doesn't remove them if unselected
      // Re-implement if strict M2M/One-To-Many sync is needed.
      const { error: studentError } = await supabase.from('Student').update({ parentId: data.id }).in('id', data.students);
      if (studentError) console.error("Error linking students:", studentError);
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.auth.admin.deleteUser(id);

    // Conflict cleanup
    await supabase.from('Student').update({ parentId: null }).eq('parentId', id);

    const { error } = await supabase.from('Parent').delete().eq('id', id);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};



export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Get current user to assign as teacher
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('Assignment').insert({
      title: data.title,
      startDate: data.startDate,
      dueDate: data.dueDate,
      lessonId: data.lessonId || null,
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: user?.id, // Auto-assign creator
      description: data.description,
    });
    if (error) throw error;

    // Send Notification Emails
    try {
      const { data: students } = await supabase.from('Student').select('email, name').eq('classId', data.classId);
      if (students && students.length > 0) {
        await Promise.all(students.map(s => {
          if (s.email) {
            return sendNotificationEmail(
              s.email,
              s.name,
              `New Assignment: ${data.title}`,
              `A new assignment "${data.title}" has been uploaded for your class.`,
              "/list/assignments",
              "View Assignments"
            );
          }
          return Promise.resolve();
        }));
      }
    } catch (mailErr) {
      console.error("Failed to send assignment notifications:", mailErr);
    }

    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabase.from('Assignment').update({
      title: data.title,
      startDate: data.startDate,
      dueDate: data.dueDate,
      lessonId: data.lessonId || null,
      classId: data.classId,
      subjectId: data.subjectId,
      description: data.description,
    }).eq("id", data.id);
    if (error) throw error;
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Conflict cleanup
    await supabase.from('Result').delete().eq('assignmentId', parseInt(id));

    const { error } = await supabase.from('Assignment').delete().eq('id', parseInt(id));
    if (error) throw error;
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAdmissionInquiry = async (
  currentState: CurrentState,
  data: AdmissionInquirySchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("AdmissionInquiry").insert({
      fullName: data.fullName,
      motherName: data.motherName,
      city: data.city,
      currentClass: data.currentClass,
      targetClass: data.targetClass,
      parentPhone: data.parentPhone,
      emailId: data.emailId,
      additionalInfo: data.additionalInfo,
      status: data.status || "PENDING",
    });

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.error("[CREATE_INQUIRY_ERROR]", err);
    return { success: false, error: true };
  }
};

export const updateAdmissionInquiry = async (
  currentState: CurrentState,
  data: AdmissionInquirySchema
) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("AdmissionInquiry")
      .update({
        fullName: data.fullName,
        motherName: data.motherName,
        city: data.city,
        currentClass: data.currentClass,
        targetClass: data.targetClass,
        parentPhone: data.parentPhone,
        emailId: data.emailId,
        additionalInfo: data.additionalInfo,
        status: data.status,
      })
      .eq("id", data.id);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.error("[UPDATE_INQUIRY_ERROR]", err);
    return { success: false, error: true };
  }
};

export const deleteAdmissionInquiry = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("AdmissionInquiry")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true, error: false };
  } catch (err) {
    console.error("[DELETE_INQUIRY_ERROR]", err);
    return { success: false, error: true };
  }
};
