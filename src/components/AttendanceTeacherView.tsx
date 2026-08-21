"use strict";
"use client";


import { useState, useEffect } from "react";
import { getClassStudents, getAttendance, bulkUpdateAttendance, getTeacherLessons } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AttendanceDownloadButton from "./AttendanceDownloadButton";
import { formatClassName } from "@/lib/utils";

type ClassType = {
    id: number;
    name: string;
};

type LessonType = {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
};

type StudentType = {
    id: string;
    name: string;
    surname: string;
    rollNumber?: string;
};


const AttendanceTeacherView = ({
    classId,
    teacherId,
    initialDate,
}: {
    classId: number;
    teacherId: string;
    initialDate?: string;
}) => {
    const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split("T")[0]);
    const [students, setStudents] = useState<StudentType[]>([]);
    const [attendance, setAttendance] = useState<{ [studentId: string]: boolean }>({});
    const [className, setClassName] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // Fetch Class Name, Students and Attendance when Class or Date changes
    useEffect(() => {
        const supabase = createClient();
        if (classId && date) {
            const fetchData = async () => {
                setLoading(true);
                // Fetch Class Name
                const { data: clsData } = await supabase.from('Class').select('name').eq('id', classId).single();
                if (clsData) {
                    setClassName(clsData.name);
                }

                // Fetch Students in this class
                const { data: stdData } = await supabase
                    .from("Student")
                    .select("id, name, surname, rollNumber")
                    .eq("classId", classId)
                    .order("rollNumber", { ascending: true });

                setStudents(stdData || []);

                // Fetch existing attendance for this class and date
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                const studentIds = (stdData || []).map((s: any) => s.id);
                const initialAttendance: { [studentId: string]: boolean } = {};

                if (studentIds.length > 0) {
                    const { data: attendanceRes } = await supabase
                        .from("Attendance")
                        .select("studentId, present")
                        .in("studentId", studentIds)
                        .gte("date", startOfDay.toISOString())
                        .lte("date", endOfDay.toISOString())
                        .is("lessonId", null);

                    if (attendanceRes) {
                        attendanceRes.forEach((rec: any) => {
                            initialAttendance[rec.studentId] = rec.present;
                        });
                    }
                }
                setAttendance(initialAttendance);
                setLoading(false);
            };
            fetchData();
        } else {
            setStudents([]);
            setAttendance({});
        }
    }, [classId, date]);

    const handleToggle = (studentId: string) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);

        const fullDataToSubmit = students.map(student => ({
            studentId: student.id,
            present: !!attendance[student.id]
        }));

        // Pass null for lessonId
        const res = await bulkUpdateAttendance(null, date, fullDataToSubmit);

        if (res.success) {
            toast.success("Attendance saved successfully!");
            router.refresh();
        } else {
            toast.error("Failed to save attendance.");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-2xl m-4 mt-0 shadow-sm border border-gray-100/80">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">Mark Daily Attendance</h1>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                {/* DATE SELECTOR */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Attendance Date</label>
                    <input
                        type="date"
                        className="p-2.5 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-lamaSky bg-white shadow-2xs"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
                    <AttendanceDownloadButton
                        students={students}
                        attendance={attendance}
                        date={date}
                        className={formatClassName(className) || `${classId}`}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || students.length === 0}
                        className="bg-lamaSky text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                    >
                        {loading ? "Saving..." : "Save Attendance"}
                    </button>
                </div>
            </div>

            {/* STUDENT LIST */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {students.map((student) => (
                        <div key={student.id} className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${attendance[student.id] ? "bg-emerald-50/80 border-emerald-200/80 shadow-2xs" : "bg-rose-50/80 border-rose-200/80 shadow-2xs"}`}>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800 leading-tight">{student.name} {student.surname}</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5 tracking-wider">{attendance[student.id] ? "Present" : "Absent"}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle(student.id)}
                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shadow-xs active:scale-95 ${attendance[student.id] ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}`}
                            >
                                {attendance[student.id] ? (
                                    // Tick Icon
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                ) : (
                                    // Cross Icon
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {students.length === 0 && !loading && (
                    <div className="text-gray-400 p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl font-medium text-sm">No students found in this class.</div>
                )}
            </div>
        </div>
    );
};

export default AttendanceTeacherView;
