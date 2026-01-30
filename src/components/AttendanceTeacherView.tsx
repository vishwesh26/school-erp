"use strict";
"use client";


import { useState, useEffect } from "react";
import { getClassStudents, getAttendance, bulkUpdateAttendance, getTeacherLessons } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // Fetch Students and Attendance when Class or Date changes
    useEffect(() => {
        if (classId && date) {
            const fetchData = async () => {
                setLoading(true);
                // 1. Fetch Students
                const studentsRes = await getClassStudents(classId);
                setStudents(studentsRes || []);

                // 2. Fetch Existing Attendance (Daily Attendance -> lessonId = null)
                // Pass null for lessonId
                const attendanceRes = await getAttendance(null, date);

                // Map existing attendance to state
                const initialAttendance: { [key: string]: boolean } = {};
                if (attendanceRes) {
                    attendanceRes.forEach((rec: any) => {
                        // Only map if student belongs to this class (security/sanity check)
                        initialAttendance[rec.studentId] = rec.present;
                    });
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
        <div className="bg-white p-4 rounded-md m-4 mt-0 h-full">
            <h1 className="text-xl font-semibold mb-4">Mark Daily Attendance</h1>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* DATE SELECTOR */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-500">Date</label>
                    <input
                        type="date"
                        className="p-2 ring-[1.5px] ring-gray-300 rounded-md text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* STUDENT LIST */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {students.map((student) => (
                        <div key={student.id} className={`p-4 rounded-md border flex items-center justify-between ${attendance[student.id] ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                            <div className="flex flex-col">
                                <span className="font-semibold">{student.name} {student.surname}</span>
                                <span className="text-xs text-gray-500">{attendance[student.id] ? "Present" : "Absent"}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle(student.id)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${attendance[student.id] ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
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
                    <div className="text-gray-500">No students found in this class.</div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading || students.length === 0}
                    className="self-end bg-lamaSky text-white px-6 py-2 rounded-md hover:bg-lamaSkyLight disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Saving..." : "Save Attendance"}
                </button>
            </div>
        </div>
    );
};

export default AttendanceTeacherView;
