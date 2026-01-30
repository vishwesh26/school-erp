import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const StudentSelect = async ({ gradeId, classId }: { gradeId: string | number; classId: string | number }) => {
    const supabase = createClient();
    const { data: students, error } = await supabase
        .from('Student')
        .select('id, name, surname, rollNumber')
        .eq('classId', classId)
        .order('name', { ascending: true });

    if (error) {
        return <div className="text-red-500">Error loading students.</div>;
    }

    return (
        <div className="p-4 bg-white rounded-md m-4 mt-0">
            <div className="flex items-center gap-4 mb-4">
                <Link href={`?gradeId=${gradeId}`} className="text-blue-500 hover:underline">← Back to Classes</Link>
                <h1 className="text-xl font-semibold">Select Student</h1>
            </div>

            {students?.length === 0 ? (
                <div className="text-gray-500 italic">No students found for this class.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students?.map((student) => (
                        <Link
                            key={student.id}
                            href={`?gradeId=${gradeId}&classId=${classId}&studentId=${student.id}`}
                            className="p-4 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex items-center justify-between cursor-pointer shadow-sm border border-gray-100"
                        >
                            <div className="flex flex-col">
                                <span className="text-base font-bold text-gray-700">
                                    {student.name} {student.surname}
                                </span>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    Roll No: {student.rollNumber || "N/A"}
                                </span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 group-hover:text-purple-600">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentSelect;
