import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import StudentCredentialsPDFModal from "@/components/StudentCredentialsPDFModal";
import { formatClassName } from "@/lib/utils";

const ClassSelect = async ({ gradeId }: { gradeId: string | number }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    const canManageClass = role === "admin" || role === "teacher";

    const { data: classes, error } = await supabase
        .from('Class')
        .select('*, _count:Student(count)')
        .eq('gradeId', gradeId)
        .order('name', { ascending: true });

    if (error) {
        return <div className="text-red-500">Error loading classes.</div>;
    }

    return (
        <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl m-4 mt-0 shadow-sm border border-gray-100/80 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-2 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="?" className="text-xs font-bold text-lamaSky hover:underline flex items-center gap-1 bg-lamaSkyLight px-3 py-1.5 rounded-lg transition-colors">
                        ← Back to Grades
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Select Class</h1>
                </div>
                <div className="flex items-center gap-3">
                    <TableSearch />
                    {role === "admin" && <StudentCredentialsPDFModal />}
                    {canManageClass && (
                        <FormContainer table="class" type="create" />
                    )}
                </div>
            </div>

            {classes?.length === 0 ? (
                <div className="text-gray-400 italic p-6 text-center bg-gray-50 rounded-xl">No classes found for this grade.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {classes?.map((cls) => (
                        <div
                            key={cls.id}
                            className="relative group p-6 bg-gradient-to-br from-amber-50/80 to-white rounded-2xl hover:from-amber-100/90 hover:to-amber-50 transition-all duration-300 flex flex-col items-center justify-center shadow-xs hover:shadow-lg border border-amber-100/80 hover-lift"
                        >
                            {/* Manage Action Buttons */}
                            {canManageClass && (
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-20">
                                    <FormContainer table="class" type="update" data={cls} />
                                    {role === "admin" && (
                                        <FormContainer table="class" type="delete" id={cls.id} />
                                    )}
                                </div>
                            )}

                            <Link
                                href={`?gradeId=${gradeId}&classId=${cls.id}`}
                                className="w-full flex flex-col items-center justify-center"
                            >
                                <span className="text-3xl font-black text-gray-800 group-hover:scale-105 transition-transform text-center">{formatClassName(cls.name)}</span>
                                <div className="mt-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-amber-200/60 shadow-2xs text-xs font-bold text-amber-900">
                                    Students: {(cls as any)._count?.[0]?.count || 0} / {cls.capacity}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassSelect;

