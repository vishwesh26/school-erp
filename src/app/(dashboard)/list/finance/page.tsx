import { createClient } from "@/lib/supabase/server";
import GradeSelect from "@/components/drill-down/GradeSelect";
import ClassSelect from "@/components/drill-down/ClassSelect";
import FinanceMarkingView from "@/components/FinanceMarkingView";

const FinancePage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { gradeId, classId } = searchParams;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;

    // Check permissions (redundant with middleware but safe)
    if (role !== "admin" && role !== "teacher") {
        return <div className="p-4">Unauthorized access.</div>;
    }

    // 1. Grade Selection
    if (!gradeId) {
        return <GradeSelect />;
    }

    // 2. Class Selection
    if (!classId) {
        return <ClassSelect gradeId={gradeId} />;
    }

    // 3. Finance Marking View
    return (
        <div className="p-4 bg-white rounded-md m-4 mt-0 flex-1 shadow-sm">
            <FinanceMarkingView classId={parseInt(classId)} />
        </div>
    );
};

export default FinancePage;
