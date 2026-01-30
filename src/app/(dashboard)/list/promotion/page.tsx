import { createClient } from "@/lib/supabase/server";
import PromotionView from "@/components/PromotionView";
import { getAcademicYears } from "@/lib/promotionActions";

const PromotionPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const supabase = createClient();

    // Fetch initial data
    const { data: academicYears } = await getAcademicYears();
    const { data: grades } = await supabase.from('Grade').select('*').order('level', { ascending: true });
    const { data: classes } = await supabase.from('Class').select('*').order('name', { ascending: true });

    return (
        <div className="bg-white p-6 rounded-xl flex-1 m-4 mt-0 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Student Promotion</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        Move students to the next academic year or mark as repeaters.
                    </p>
                </div>
            </div>

            <PromotionView
                academicYears={academicYears || []}
                grades={grades || []}
                classes={classes || []}
            />
        </div>
    );
};

export default PromotionPage;
