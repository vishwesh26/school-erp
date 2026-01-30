import { createClient } from "@/lib/supabase/server";
import GradeSelect from "@/components/drill-down/GradeSelect";
import ClassSelect from "@/components/drill-down/ClassSelect";
import FinanceMarkingView from "@/components/FinanceMarkingView";
import Link from "next/link";

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
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-end px-4 mt-4">
                    <Link
                        href="/list/finance/categories"
                        className="bg-lamaSky text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-opacity-80 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /><path d="m15 5 3 3" /></svg>
                        Manage Fee Categories
                    </Link>
                </div>
                <GradeSelect />
            </div>
        );
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
