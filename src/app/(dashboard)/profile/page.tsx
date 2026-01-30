import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import Link from "next/link";
import { redirect } from "next/navigation";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import { Suspense } from "react";

const ProfilePage = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = user.user_metadata?.role;
    const userId = user.id;

    let userData;
    // Fetch user details based on role
    if (role) {
        // capitalize first letter for table name
        const table = role.charAt(0).toUpperCase() + role.slice(1);
        const { data, error } = await supabase.from(table).select('*, class:Class(*)').eq('id', userId).single();
        if (!error) userData = data;
    }

    if (!userData) {
        return <div>Profile not found.</div>
    }

    // Fetch lesson count if student
    let lessonCount = 0;
    if (role === 'student' && userData.classId) {
        const { count } = await supabase
            .from("Lesson")
            .select("*", { count: "exact", head: true })
            .eq("classId", userData.classId);
        lessonCount = count || 0;
    }

    return (
        <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-2/3">
                <div className="flex flex-col gap-4">
                    {/* TOP SECTION */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* USER INFO CARD */}
                        <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
                            <div className="w-1/3">
                                <Image
                                    src={userData.img || "/noAvatar.png"}
                                    alt=""
                                    width={144}
                                    height={144}
                                    className="w-36 h-36 rounded-full object-cover"
                                />
                            </div>
                            <div className="w-2/3 flex flex-col justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-xl font-semibold">{userData.name} {userData.surname}</h1>
                                    <span className="text-sm text-gray-400 capitalize">{role}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium text-gray-500">
                                    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                        <Image src="/blood.png" alt="" width={14} height={14} />
                                        <span>{userData.bloodType || "-"}</span>
                                    </div>
                                    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                        <Image src="/date.png" alt="" width={14} height={14} />
                                        <span>{userData.birthday ? new Date(userData.birthday).toLocaleDateString() : "-"}</span>
                                    </div>
                                    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                        <Image src="/mail.png" alt="" width={14} height={14} />
                                        <span>{userData.email || user.email}</span>
                                    </div>
                                    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                        <Image src="/phone.png" alt="" width={14} height={14} />
                                        <span>{userData.phone || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUMMARY CARDS FOR STUDENT */}
                        {role === 'student' && (
                            <div className="flex-1 flex gap-4 justify-between flex-wrap">
                                {/* ATTENDANCE CARD */}
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] lg:w-[48%]">
                                    <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <Suspense fallback="loading...">
                                        <StudentAttendanceCard id={userId} />
                                    </Suspense>
                                </div>
                                {/* GRADE CARD */}
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] lg:w-[48%]">
                                    <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div>
                                        <h1 className="text-xl font-semibold">
                                            {userData.class?.name ? parseInt(userData.class.name) : ""}th
                                        </h1>
                                        <span className="text-sm text-gray-400">Grade</span>
                                    </div>
                                </div>
                                {/* LESSONS CARD */}
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] lg:w-[48%]">
                                    <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div>
                                        <h1 className="text-xl font-semibold">{lessonCount}</h1>
                                        <span className="text-sm text-gray-400">Lessons</span>
                                    </div>
                                </div>
                                {/* CLASS CARD */}
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] lg:w-[48%]">
                                    <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
                                    <div>
                                        <h1 className="text-xl font-semibold">{userData.class?.name || "-"}</h1>
                                        <span className="text-sm text-gray-400">Class</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* SCHEDULE */}
                    <div className="bg-white p-4 rounded-md h-[800px]">
                        <h1 className="text-xl font-semibold">Schedule</h1>
                        {(role === "teacher" || role === "student") && <BigCalendarContainer type={role === "teacher" ? "teacherId" : "classId"} id={role === "teacher" ? userId : userData.classId} />}
                    </div>
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Shortcuts</h1>
                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                        <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/lessons?${role === "teacher" ? "teacherId" : "classId"}=${role === "teacher" ? userId : userData.classId}`}>My Lessons</Link>
                        {role === "student" && <Link className="p-3 rounded-md bg-lamaPurpleLight" href={`/list/results?studentId=${userId}`}>My Results</Link>}
                        <Link className="p-3 rounded-md bg-pink-50" href="/settings">Settings</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
