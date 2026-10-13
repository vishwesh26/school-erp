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
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role;

    const { data: assignment, error } = await supabase
        .from("Assignment")
        .select("*, subject:Subject(*), class:Class(*), teacher:Teacher(*)")
        .eq("id", parseInt(id))
        .single();

    if (error || !assignment) {
        return notFound();
    }

    // Role-based access control: Students can only view assignments for their own class
    if (userId) {
        let isStudent = role === "student";
        if (isStudent || !role) {
            const { data: student } = await supabase
                .from("Student")
                .select("classId")
                .eq("id", userId)
                .maybeSingle();

            if (student) {
                isStudent = true;
                if (!student.classId || student.classId !== assignment.classId) {
                    return notFound();
                }
            }
        }
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
