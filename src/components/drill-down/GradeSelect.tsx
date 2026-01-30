import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const GradeSelect = async () => {
    const supabase = createClient();
    const { data: grades, error } = await supabase.from('Grade').select('*').order('level', { ascending: true });

    if (error) {
        return <div className="text-red-500">Error loading grades.</div>;
    }

    return (
        <div className="p-4 bg-white rounded-md m-4 mt-0">
            <h1 className="text-xl font-semibold mb-4">Select Grade</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {grades?.map((grade) => (
                    <Link
                        key={grade.id}
                        href={`?gradeId=${grade.id}`}
                        className="p-6 bg-lamaSkyLight rounded-md hover:bg-lamaSky transition-colors flex items-center justify-center cursor-pointer shadow-sm border border-gray-100"
                    >
                        <span className="text-2xl font-bold text-gray-700">Grade {grade.level}</span>
                    </Link>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Special Records</h2>
                <Link
                    href={`?view=alumni`}
                    className="p-6 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col items-center justify-center cursor-pointer shadow-sm border border-purple-100 group w-full md:w-1/4"
                >
                    <span className="text-2xl font-black text-purple-700">ALUMNI</span>
                    <span className="text-xs text-purple-400 font-bold mt-1 group-hover:text-purple-500 uppercase tracking-tighter">Passed Out Students</span>
                </Link>
            </div>
        </div>
    );
};

export default GradeSelect;
