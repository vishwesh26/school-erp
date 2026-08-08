import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatGrade } from "@/lib/utils";
import TableSearch from "@/components/TableSearch";

const GradeSelect = async () => {
    const supabase = createClient();
    const { data: grades, error } = await supabase.from('Grade').select('*').order('level', { ascending: true });

    if (error) {
        return <div className="text-red-500">Error loading grades.</div>;
    }

    return (
        <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl m-4 mt-0 shadow-sm border border-gray-100/80 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Select Grade</h1>
                    <p className="text-xs text-gray-400 font-medium">Choose a grade to view students & classes</p>
                </div>
                <TableSearch />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {grades?.map((grade) => (
                    <Link
                        key={grade.id}
                        href={`?gradeId=${grade.id}`}
                        className="p-6 bg-gradient-to-br from-lamaSkyLight to-white rounded-2xl hover:from-lamaSky hover:to-lamaSky/90 hover:text-white transition-all duration-300 flex flex-col items-center justify-center cursor-pointer shadow-xs hover:shadow-lg border border-gray-100 hover-lift group"
                    >
                        <span className="text-2xl font-black text-gray-800 group-hover:text-white transition-colors">
                           {grade.level <= 0 ? formatGrade(grade.level) : `Grade ${grade.level}`}
                        </span>
                        <span className="text-xs text-gray-400 group-hover:text-white/80 font-bold mt-1 tracking-wider uppercase">
                            View Classes →
                        </span>
                    </Link>
                ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Special Records</h2>
                <Link
                    href={`?view=alumni`}
                    className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl hover:brightness-110 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer shadow-md border border-purple-400/30 group w-full md:w-1/3 hover-lift"
                >
                    <span className="text-2xl font-black text-white tracking-wider">ALUMNI</span>
                    <span className="text-xs text-purple-100 font-bold mt-1 group-hover:text-white uppercase tracking-tight">Passed Out Students Archive</span>
                </Link>
            </div>
        </div>
    );
};

export default GradeSelect;
