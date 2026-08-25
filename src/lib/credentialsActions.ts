"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export interface StudentCredentialItem {
  id: string;
  name: string;
  surname?: string;
  username: string;
  password?: string | null;
  rollNumber?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  classId?: number;
  className: string;
  gradeLevel?: number;
}

export interface ClassGroup {
  classId: number | string;
  className: string;
  gradeLevel?: number;
  students: StudentCredentialItem[];
}

export async function fetchStudentsForCredentials(classId?: string | number): Promise<{
  success: boolean;
  classes: { id: number; name: string }[];
  groupedByClass: ClassGroup[];
  totalStudents: number;
  error?: string;
}> {
  try {
    const supabase = createClient();

    // 0. Authorization check: Admin only
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (role !== "admin") {
      return {
        success: false,
        classes: [],
        groupedByClass: [],
        totalStudents: 0,
        error: "Unauthorized: Access restricted to administrators only.",
      };
    }

    // 1. Fetch active classes for filter dropdown
    const { data: classList, error: classErr } = await supabase
      .from("Class")
      .select("id, name")
      .order("name", { ascending: true });

    if (classErr) throw classErr;

    // 2. Fetch students with Class and Grade info
    let query = supabase
      .from("Student")
      .select("id, name, surname, username, rollNumber, email, phone, birthday, classId, Class(id, name), grade:Grade!gradeId(level)");

    if (classId && classId !== "all") {
      const parsedId = typeof classId === "string" ? parseInt(classId, 10) : classId;
      if (!isNaN(parsedId)) {
        query = query.eq("classId", parsedId);
      }
    }

    const { data: studentList, error: studentErr } = await query;
    if (studentErr) throw studentErr;

    // Format & map students
    const formattedStudents: StudentCredentialItem[] = (studentList || []).map((s: any) => ({
      id: s.id,
      name: s.name || "",
      surname: s.surname || "",
      username: s.username || s.rollNumber || "N/A",
      password: s.password || null,
      rollNumber: s.rollNumber || "N/A",
      email: s.email || (s.username ? `${s.username.toLowerCase()}@dcpems.internal` : "N/A"),
      phone: s.phone || "",
      birthday: s.birthday || "",
      classId: s.classId,
      className: s.Class?.name || "Unassigned",
      gradeLevel: s.grade?.level,
    }));

    // Group students class-wise
    const groupMap: { [key: string]: ClassGroup } = {};

    formattedStudents.forEach((st) => {
      const cName = st.className || "Unassigned";
      const cId = st.classId || "unassigned";

      if (!groupMap[cName]) {
        groupMap[cName] = {
          classId: cId,
          className: cName,
          gradeLevel: st.gradeLevel,
          students: [],
        };
      }
      groupMap[cName].students.push(st);
    });

    // Sort students within each class: by rollNumber (numeric if possible), then surname/name
    const sortedGroups = Object.values(groupMap).map((grp) => {
      grp.students.sort((a, b) => {
        const rollA = parseInt(a.rollNumber || "0", 10);
        const rollB = parseInt(b.rollNumber || "0", 10);
        if (!isNaN(rollA) && !isNaN(rollB) && rollA !== rollB) {
          return rollA - rollB;
        }
        return (a.name || "").localeCompare(b.name || "");
      });
      return grp;
    });

    // Sort classes naturally (e.g. 1st, 2nd, 3rd...)
    sortedGroups.sort((a, b) =>
      a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: "base" })
    );

    return {
      success: true,
      classes: classList || [],
      groupedByClass: sortedGroups,
      totalStudents: formattedStudents.length,
    };
  } catch (err: any) {
    console.error("Error fetching students for credentials:", err);
    return {
      success: false,
      classes: [],
      groupedByClass: [],
      totalStudents: 0,
      error: err?.message || "Failed to fetch student credentials.",
    };
  }
}

/**
 * Sync / Set all student login passwords in Supabase Auth & Database in 1 click
 */
export async function syncStudentAuthPasswords(params: {
  classId?: string | number;
  passwordFormat: "fixed" | "roll" | "dob";
  defaultPassword?: string;
}): Promise<{
  success: boolean;
  updatedCount: number;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (role !== "admin") {
      return { success: false, updatedCount: 0, error: "Unauthorized: Admin access required." };
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = adminClient
      .from("Student")
      .select("id, rollNumber, birthday, username");

    if (params.classId && params.classId !== "all") {
      const cid = typeof params.classId === "string" ? parseInt(params.classId, 10) : params.classId;
      if (!isNaN(cid)) {
        query = query.eq("classId", cid);
      }
    }

    const { data: students, error } = await query;
    if (error) throw error;
    if (!students || students.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    let count = 0;
    for (const st of students) {
      let targetPassword = params.defaultPassword || "dcpems@123";

      if (params.passwordFormat === "roll" && st.rollNumber && st.rollNumber !== "N/A") {
        targetPassword = `pass@${st.rollNumber}`;
      } else if (params.passwordFormat === "dob" && st.birthday) {
        try {
          const d = new Date(st.birthday);
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const yyyy = d.getFullYear();
          targetPassword = `${dd}${mm}${yyyy}`;
        } catch {
          targetPassword = params.defaultPassword || "dcpems@123";
        }
      }

      if (targetPassword.length < 6) {
        targetPassword = `${targetPassword}123`;
      }

      // 1. Update Supabase Auth Password
      try {
        await adminClient.auth.admin.updateUserById(st.id, {
          password: targetPassword,
        });
      } catch (authErr) {
        console.warn(`Could not update Auth password for user ${st.id}:`, authErr);
      }

      // 2. Update Student Table password if column exists
      try {
        await adminClient.from("Student").update({ password: targetPassword }).eq("id", st.id);
      } catch (dbErr) {
        // Safe fallback if column doesn't exist
      }

      count++;
    }

    return { success: true, updatedCount: count };
  } catch (err: any) {
    console.error("Error syncing student passwords in Supabase Auth:", err);
    return { success: false, updatedCount: 0, error: err?.message || "Failed to sync student passwords." };
  }
}
