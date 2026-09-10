"use server";

import { createClient } from "@/lib/supabase/server";
import { formatClassName } from "@/lib/utils";

export interface MonthlyDayDetail {
    day: number;
    dayOfWeek: string;
    isSunday: boolean;
}

export interface StudentMonthlyAttendanceItem {
    id: string;
    name: string;
    surname: string;
    rollNumber: string;
    dailyStatus: { [day: number]: "P" | "A" | "Sun" | "-" };
    totalPresent: number;
    totalAbsent: number;
    workingDays: number;
    percentage: number;
}

export interface MonthlyAttendanceReportResult {
    success: boolean;
    classId: number;
    className: string;
    supervisorName?: string;
    year: number;
    month: number;
    monthName: string;
    daysInMonth: number;
    dayDetails: MonthlyDayDetail[];
    students: StudentMonthlyAttendanceItem[];
    dailyTotals: {
        [day: number]: {
            present: number;
            absent: number;
        };
    };
    classStats: {
        totalStudents: number;
        totalClassWorkingDays: number;
        averageAttendancePercentage: number;
    };
    classes: { id: number; name: string }[];
    error?: string;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function fetchMonthlyAttendanceReport(params: {
    classId?: number | string;
    year?: number;
    month?: number; // 1 to 12
}): Promise<MonthlyAttendanceReportResult> {
    try {
        const supabase = createClient();

        // 1. Fetch available classes for selector
        const { data: classList, error: classErr } = await supabase
            .from("Class")
            .select("id, name")
            .order("name", { ascending: true });

        if (classErr) throw classErr;

        const classes = classList || [];
        const targetClassId = params.classId
            ? typeof params.classId === "string"
                ? parseInt(params.classId, 10)
                : params.classId
            : classes[0]?.id;

        const now = new Date();
        const year = params.year || now.getFullYear();
        const month = params.month || (now.getMonth() + 1);
        const monthName = MONTH_NAMES[month - 1] || "Month";

        if (!targetClassId) {
            return {
                success: false,
                classId: 0,
                className: "N/A",
                year,
                month,
                monthName,
                daysInMonth: 0,
                dayDetails: [],
                students: [],
                dailyTotals: {},
                classStats: { totalStudents: 0, totalClassWorkingDays: 0, averageAttendancePercentage: 0 },
                classes,
                error: "No class selected or available.",
            };
        }

        // 2. Fetch Class Information & Supervisor
        const { data: clsData } = await supabase
            .from("Class")
            .select("id, name, supervisor:Teacher(name, surname)")
            .eq("id", targetClassId)
            .maybeSingle();

        const rawClassName = clsData?.name || `Class ${targetClassId}`;
        const supervisorObj: any = clsData?.supervisor;
        const supervisorName = supervisorObj
            ? `${supervisorObj.name || ""} ${supervisorObj.surname || ""}`.trim()
            : undefined;

        // 3. Days in month & Day details (Sundays)
        const daysInMonth = new Date(year, month, 0).getDate();
        const dayDetails: MonthlyDayDetail[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const dow = dateObj.getDay();
            dayDetails.push({
                day: d,
                dayOfWeek: DAY_NAMES[dow],
                isSunday: dow === 0,
            });
        }

        // 4. Fetch Students in the Class
        const { data: rawStudents, error: stdErr } = await supabase
            .from("Student")
            .select("id, name, surname, rollNumber")
            .eq("classId", targetClassId);

        if (stdErr) throw stdErr;

        const students = (rawStudents || []).map((s) => ({
            id: s.id,
            name: s.name || "",
            surname: s.surname || "",
            rollNumber: s.rollNumber || "N/A",
        }));

        // Sort students by numeric roll number, then name
        students.sort((a, b) => {
            const rollA = parseInt(a.rollNumber || "0", 10);
            const rollB = parseInt(b.rollNumber || "0", 10);
            if (!isNaN(rollA) && !isNaN(rollB) && rollA !== rollB) {
                return rollA - rollB;
            }
            return a.name.localeCompare(b.name);
        });

        // 5. Fetch Attendance records for this class & month
        const studentIds = students.map((s) => s.id);
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

        const attendanceMap = new Map<string, boolean>();

        if (studentIds.length > 0) {
            const { data: attRecords, error: attErr } = await supabase
                .from("Attendance")
                .select("studentId, date, present")
                .in("studentId", studentIds)
                .gte("date", startDate.toISOString().slice(0, 10))
                .lte("date", `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59`)
                .is("lessonId", null);

            if (attErr) console.warn("Could not fetch attendance records:", attErr);

            for (const r of attRecords || []) {
                const dateStr = typeof r.date === "string" ? r.date.slice(0, 10) : "";
                if (dateStr) {
                    const [y, m, d] = dateStr.split("-").map((num: string) => parseInt(num, 10));
                    if (y === year && m === month) {
                        attendanceMap.set(`${r.studentId}_${d}`, r.present);
                    }
                }
            }
        }

        // 6. Aggregate Student Data & Daily Totals
        const dailyTotals: { [day: number]: { present: number; absent: number } } = {};
        for (let d = 1; d <= daysInMonth; d++) {
            dailyTotals[d] = { present: 0, absent: 0 };
        }

        let totalPercentageSum = 0;
        let studentsWithAttendanceCount = 0;
        let maxClassWorkingDays = 0;

        const studentItems: StudentMonthlyAttendanceItem[] = students.map((st) => {
            const dailyStatus: { [day: number]: "P" | "A" | "Sun" | "-" } = {};
            let totalPresent = 0;
            let totalAbsent = 0;

            for (const { day, isSunday } of dayDetails) {
                if (isSunday) {
                    dailyStatus[day] = "Sun";
                } else if (attendanceMap.has(`${st.id}_${day}`)) {
                    const isPresent = attendanceMap.get(`${st.id}_${day}`);
                    if (isPresent) {
                        dailyStatus[day] = "P";
                        totalPresent++;
                        dailyTotals[day].present++;
                    } else {
                        dailyStatus[day] = "A";
                        totalAbsent++;
                        dailyTotals[day].absent++;
                    }
                } else {
                    dailyStatus[day] = "-";
                }
            }

            const workingDays = totalPresent + totalAbsent;
            if (workingDays > maxClassWorkingDays) {
                maxClassWorkingDays = workingDays;
            }

            const percentage = workingDays > 0 ? Math.round((totalPresent / workingDays) * 100) : 0;
            if (workingDays > 0) {
                totalPercentageSum += percentage;
                studentsWithAttendanceCount++;
            }

            return {
                id: st.id,
                name: st.name,
                surname: st.surname,
                rollNumber: st.rollNumber,
                dailyStatus,
                totalPresent,
                totalAbsent,
                workingDays,
                percentage,
            };
        });

        const averageAttendancePercentage = studentsWithAttendanceCount > 0
            ? Math.round(totalPercentageSum / studentsWithAttendanceCount)
            : 0;

        return {
            success: true,
            classId: targetClassId,
            className: rawClassName,
            supervisorName,
            year,
            month,
            monthName,
            daysInMonth,
            dayDetails,
            students: studentItems,
            dailyTotals,
            classStats: {
                totalStudents: students.length,
                totalClassWorkingDays: maxClassWorkingDays,
                averageAttendancePercentage,
            },
            classes,
        };
    } catch (err: any) {
        console.error("Error generating monthly attendance report:", err);
        return {
            success: false,
            classId: 0,
            className: "Error",
            year: params.year || new Date().getFullYear(),
            month: params.month || new Date().getMonth() + 1,
            monthName: "Error",
            daysInMonth: 0,
            dayDetails: [],
            students: [],
            dailyTotals: {},
            classStats: { totalStudents: 0, totalClassWorkingDays: 0, averageAttendancePercentage: 0 },
            classes: [],
            error: err?.message || "Failed to generate monthly attendance report.",
        };
    }
}
