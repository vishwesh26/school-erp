import { createClient } from "@/lib/supabase/server";
import CertificateGenerator from "@/components/CertificateGenerator";
import GradeSelect from "@/components/drill-down/GradeSelect";
import ClassSelect from "@/components/drill-down/ClassSelect";
import StudentSelect from "@/components/drill-down/StudentSelect";
import Link from "next/link";

const DocumentsPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { gradeId, classId, studentId } = searchParams;
    const supabase = createClient();

    // 1. Grade Selection
    if (!gradeId) {
        return <GradeSelect />;
    }

    // 2. Class Selection
    if (!classId) {
        return <ClassSelect gradeId={gradeId} />;
    }

    // 3. Student Selection
    if (!studentId) {
        return <StudentSelect gradeId={gradeId} classId={classId} />;
    }

    // 4. Document Generation (Final Step)
    let student;
    let fetchError;
    let isFallback = false;

    // Attempt full fetch first
    const fullFetch = await supabase
        .from("Student")
        .select(`
            id, name, surname, rollNumber, birthday, address,
            motherName, aadharNo, placeOfBirth, taluka, district,
            nationality, religion, caste, isST, classAdmitted,
            lastDateAttendance, examTaken, examResult, isFailed,
            qualifiedPromotion, duesPaidUpTo, feeConcession,
            workingDays, presentDays, isNcc, extraCurricular,
            conduct, dateApplication, dateIssue, reasonLeaving,
            remarks, stateStudentId, pen, apaarId,
            class:Class(name),
            parent:Parent(name, surname)
        `)
        .eq("id", studentId)
        .single();

    if (fullFetch.error && fullFetch.error.message.includes("column")) {
        // Fallback to safe fetch if columns are missing
        const safeFetch = await supabase
            .from("Student")
            .select(`
                id, name, surname, rollNumber, birthday, address,
                class:Class(name),
                parent:Parent(name, surname)
            `)
            .eq("id", studentId)
            .single();

        student = safeFetch.data;
        fetchError = safeFetch.error;
        isFallback = true;
    } else {
        student = fullFetch.data;
        fetchError = fullFetch.error;
    }

    // 5. Fetch Attendance Summary
    const { data: attendanceData, error: attendanceError } = await supabase
        .from("Attendance")
        .select("present, date")
        .eq("studentId", studentId);

    if (attendanceError) {
        console.error("Error fetching attendance for documents:", attendanceError);
    }

    // Calculate aggregated attendance
    const totalWorkingDays = attendanceData ? attendanceData.length : 0;
    const presentDays = attendanceData ? attendanceData.filter(a => a.present).length : 0;

    // Sort to find latest attendance date
    const sortedAttendance = attendanceData ? [...attendanceData].sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ) : [];
    const lastAttendanceRecord = sortedAttendance[0];
    const lastDateAttendance = lastAttendanceRecord
        ? new Date(lastAttendanceRecord.date).toISOString().split('T')[0]
        : "";

    // Merge attendance into student object (prefer DB stored values if they exist, else fallback to calculated)
    const enrichedStudent = {
        ...(student as any),
        workingDays: (student as any)?.workingDays || totalWorkingDays.toString(),
        presentDays: (student as any)?.presentDays || presentDays.toString(),
        lastDateAttendance: (student as any)?.lastDateAttendance || lastDateAttendance,
    };

    if (fetchError) {
        console.error("Error fetching student for documents:", fetchError);
        return <div className="p-4 bg-red-50 text-red-500 rounded-md m-4">Error loading student data. Please check the logs.</div>;
    }

    return (
        <div className="p-4 bg-white rounded-md m-4 mt-0 flex-1 shadow-sm">
            {isFallback && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-md">
                    <strong>Note:</strong> Some advanced certificate fields are hidden because the database hasn&apos;t been updated.
                    Please run the SQL migration script in your Supabase dashboard to enable full automation.
                </div>
            )}
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Document Generation</h1>
                    <p className="text-sm text-gray-500">
                        Generating for: <span className="font-bold text-gray-700">{enrichedStudent?.name} {enrichedStudent?.surname}</span>
                    </p>
                </div>
                <Link
                    href={`?gradeId=${gradeId}&classId=${classId}`}
                    className="text-sm text-lamaSky hover:underline flex items-center gap-1 font-medium bg-lamaSkyLight px-3 py-1.5 rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                    Change Student
                </Link>
            </div>

            {enrichedStudent && <CertificateGenerator students={[enrichedStudent]} />}
        </div>
    );
};

export default DocumentsPage;
