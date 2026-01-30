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
        </div>
    );
};

export default GradeSelect;
