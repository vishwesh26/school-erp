import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AssignmentView from "./AssignmentView"; // Client component

const SingleAssignmentPage = async ({
    params: { id },
}: {
    params: { id: string };
}) => {
    const supabase = createClient();
    const { data: assignment, error } = await supabase
        .from("Assignment")
        .select("*, subject:Subject(*), class:Class(*), teacher:Teacher(*)")
        .eq("id", parseInt(id))
        .single();

    if (error || !assignment) {
        return notFound();
    }

    return (
        <div className="flex-1 p-4 flex flex-col gap-4">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Assignment Details</h1>
                <Link href="/list/assignments" className="text-sm text-gray-500 hover:underline">
                    Back to List
                </Link>
            </div>

            <AssignmentView assignment={assignment} />
        </div>
    );
};

export default SingleAssignmentPage;
