"use server";

import { createClient } from "@/lib/supabase/server";

export interface StudentCalendarDay {
    day: number;
    dateStr: string; // YYYY-MM-DD
    dayOfWeek: string; // Sun, Mon, Tue...
    isSunday: boolean;
    isToday: boolean;
    isFuture: boolean;
    status: "present" | "absent" | "sunday" | "future" | "unrecorded";
    present?: boolean;
    lessonName?: string;
}

export interface StudentCalendarStats {
    monthWorkingDays: number;
    monthPresentDays: number;
    monthAbsentDays: number;
    monthSundays: number;
    monthPercentage: number;
    yearlyWorkingDays: number;
    yearlyPresentDays: number;
    yearlyAbsentDays: number;
    yearlyPercentage: number;
}

export interface StudentAttendanceCalendarData {
    success: boolean;
    studentId: string;
    studentName?: string;
    className?: string;
    rollNumber?: string;
    year: number;
    month: number; // 1 to 12
    monthName: string;
    daysInMonth: number;
    firstDayOfWeek: number; // 0 = Sun, 1 = Mon ...
    days: StudentCalendarDay[];
    stats: StudentCalendarStats;
    error?: string;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function fetchStudentAttendanceCalendar(
    studentId: string,
    year?: number,
    month?: number // 1 to 12
): Promise<StudentAttendanceCalendarData> {
    try {
        const supabase = createClient();

        const now = new Date();
        const targetYear = year || now.getFullYear();
        const targetMonth = month || now.getMonth() + 1;
        const monthName = MONTH_NAMES[targetMonth - 1];

        // 1. Fetch Student profile
        const { data: student } = await supabase
            .from("Student")
            .select("id, name, surname, rollNumber, class:Class(name)")
            .eq("id", studentId)
            .maybeSingle();

        const studentName = student
            ? `${student.name || ""} ${student.surname || ""}`.trim()
            : undefined;
        const className = (student?.class as any)?.name || undefined;
        const rollNumber = student?.rollNumber || undefined;

        // 2. Month details
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const firstDayOfWeek = new Date(targetYear, targetMonth - 1, 1).getDay();

        // 3. Fetch Month attendance records
        const pad = (n: number) => String(n).padStart(2, "0");
        const startDateStr = `${targetYear}-${pad(targetMonth)}-01`;
        const endDateStr = `${targetYear}-${pad(targetMonth)}-${pad(daysInMonth)}T23:59:59.999Z`;

        const { data: monthRecords, error: mErr } = await supabase
            .from("Attendance")
            .select("id, date, present, lesson:Lesson(name)")
            .eq("studentId", studentId)
            .gte("date", startDateStr)
            .lte("date", endDateStr);

        if (mErr) {
            console.error("Error fetching month attendance:", mErr);
        }

        // Map records by day number
        const recordsMap = new Map<number, { present: boolean; lessonName?: string }>();
        for (const r of monthRecords || []) {
            if (!r.date) continue;
            const dateStr = typeof r.date === "string" ? r.date.slice(0, 10) : "";
            if (dateStr) {
                const [y, m, d] = dateStr.split("-").map(Number);
                if (y === targetYear && m === targetMonth && d >= 1 && d <= daysInMonth) {
                    const current = recordsMap.get(d);
                    const lessonName = (r.lesson as any)?.name || undefined;
                    // If multiple lessons on same day, present takes priority or keep first
                    if (!current) {
                        recordsMap.set(d, { present: Boolean(r.present), lessonName });
                    } else if (r.present) {
                        recordsMap.set(d, { present: true, lessonName: lessonName || current.lessonName });
                    }
                }
            }
        }

        // 4. Build Days array
        const days: StudentCalendarDay[] = [];
        let monthPresentDays = 0;
        let monthAbsentDays = 0;
        let monthSundays = 0;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(targetYear, targetMonth - 1, d);
            const dow = dateObj.getDay();
            const isSunday = dow === 0;
            const isToday =
                now.getFullYear() === targetYear &&
                now.getMonth() + 1 === targetMonth &&
                now.getDate() === d;
            const isFuture =
                new Date(targetYear, targetMonth - 1, d, 23, 59, 59) > now && !isToday;

            const record = recordsMap.get(d);

            let status: StudentCalendarDay["status"];
            if (isSunday) {
                status = "sunday";
                monthSundays++;
            } else if (record !== undefined) {
                if (record.present) {
                    status = "present";
                    monthPresentDays++;
                } else {
                    status = "absent";
                    monthAbsentDays++;
                }
            } else if (isFuture) {
                status = "future";
            } else {
                status = "unrecorded";
            }

            days.push({
                day: d,
                dateStr: `${targetYear}-${pad(targetMonth)}-${pad(d)}`,
                dayOfWeek: DAY_NAMES[dow],
                isSunday,
                isToday,
                isFuture,
                status,
                present: record?.present,
                lessonName: record?.lessonName,
            });
        }

        const monthWorkingDays = monthPresentDays + monthAbsentDays;
        const monthPercentage =
            monthWorkingDays > 0 ? (monthPresentDays / monthWorkingDays) * 100 : 0;

        // 5. Fetch Yearly Stats (from Jan 1 of targetYear)
        const yearStart = `${targetYear}-01-01`;
        const { data: yearRecords } = await supabase
            .from("Attendance")
            .select("present")
            .eq("studentId", studentId)
            .gte("date", yearStart);

        const yearlyWorkingDays = yearRecords?.length || 0;
        const yearlyPresentDays = yearRecords?.filter((r) => r.present).length || 0;
        const yearlyAbsentDays = yearlyWorkingDays - yearlyPresentDays;
        const yearlyPercentage =
            yearlyWorkingDays > 0 ? (yearlyPresentDays / yearlyWorkingDays) * 100 : 0;

        return {
            success: true,
            studentId,
            studentName,
            className,
            rollNumber,
            year: targetYear,
            month: targetMonth,
            monthName,
            daysInMonth,
            firstDayOfWeek,
            days,
            stats: {
                monthWorkingDays,
                monthPresentDays,
                monthAbsentDays,
                monthSundays,
                monthPercentage: parseFloat(monthPercentage.toFixed(1)),
                yearlyWorkingDays,
                yearlyPresentDays,
                yearlyAbsentDays,
                yearlyPercentage: parseFloat(yearlyPercentage.toFixed(1)),
            },
        };
    } catch (err: any) {
        console.error("fetchStudentAttendanceCalendar error:", err);
        return {
            success: false,
            studentId,
            year: year || new Date().getFullYear(),
            month: month || new Date().getMonth() + 1,
            monthName: "",
            daysInMonth: 0,
            firstDayOfWeek: 0,
            days: [],
            stats: {
                monthWorkingDays: 0,
                monthPresentDays: 0,
                monthAbsentDays: 0,
                monthSundays: 0,
                monthPercentage: 0,
                yearlyWorkingDays: 0,
                yearlyPresentDays: 0,
                yearlyAbsentDays: 0,
                yearlyPercentage: 0,
            },
            error: err?.message || "Failed to load attendance calendar",
        };
    }
}
