import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const ClassSelect = async ({ gradeId }: { gradeId: string | number }) => {
    const supabase = createClient();
    const { data: classes, error } = await supabase
        .from('Class')
        .select('*')
        .eq('gradeId', gradeId)
        .order('name', { ascending: true });

    if (error) {
        return <div className="text-red-500">Error loading classes.</div>;
    }

    return (
        <div className="p-4 bg-white rounded-md m-4 mt-0">
            <div className="flex items-center gap-4 mb-4">
                <Link href="?" className="text-blue-500 hover:underline">← Back to Grades</Link>
                <h1 className="text-xl font-semibold">Select Class</h1>
            </div>

            {classes?.length === 0 ? (
                <div className="text-gray-500 italic">No classes found for this grade.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {classes?.map((cls) => (
                        <Link
                            key={cls.id}
                            href={`?gradeId=${gradeId}&classId=${cls.id}`}
                            className="p-6 bg-lamaYellowLight rounded-md hover:bg-lamaYellow transition-colors flex flex-col items-center justify-center cursor-pointer shadow-sm border border-gray-100"
                        >
                            <span className="text-2xl font-bold text-gray-700">{cls.name}</span>
                            <span className="text-sm text-gray-500 mt-2">Capacity: {cls.capacity}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassSelect;
