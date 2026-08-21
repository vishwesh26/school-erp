import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

const StudentSelect = async ({ gradeId, classId }: { gradeId: string | number; classId: string | number }) => {
    const supabase = createClient();
    const { data: students, error } = await supabase
        .from('Student')
        .select('id, name, surname, rollNumber, img')
        .eq('classId', classId)
        .order('name', { ascending: true });

    if (error) {
        return <div className="text-red-500 p-6">Error loading students.</div>;
    }

    return (
        <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl m-4 mt-0 shadow-sm border border-gray-100/80 animate-fade-in">
            <div className="flex items-center gap-4 mb-6 pb-2 border-b border-gray-100">
                <Link
                    href={`?gradeId=${gradeId}`}
                    className="text-xs font-bold text-lamaSky hover:underline flex items-center gap-1 bg-lamaSkyLight px-3 py-1.5 rounded-lg transition-colors"
                >
                    ← Back to Classes
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Select Student</h1>
            </div>

            {students?.length === 0 ? (
                <div className="text-gray-400 italic p-6 text-center bg-gray-50 rounded-xl">
                    No students found for this class.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {students?.map((student) => (
                        <Link
                            key={student.id}
                            href={`?gradeId=${gradeId}&classId=${classId}&studentId=${student.id}`}
                            className="p-4 bg-gradient-to-br from-white to-purple-50/50 rounded-2xl hover:from-purple-50 hover:to-purple-100/60 transition-all duration-200 flex items-center gap-3.5 cursor-pointer shadow-xs hover:shadow-md border border-purple-100/80 hover-lift group"
                        >
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs flex-shrink-0 bg-slate-100">
                                <Image
                                    src={student.img || "/noAvatar.png"}
                                    alt={student.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-black text-slate-800 group-hover:text-purple-900 transition-colors truncate">
                                    {student.name} {student.surname || ""}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                    Roll No: {student.rollNumber || "N/A"}
                                </span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0">
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
