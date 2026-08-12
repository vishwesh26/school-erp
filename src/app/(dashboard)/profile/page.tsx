import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import { Suspense } from "react";
import Announcements from "@/components/Announcements";

const ProfilePage = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = user.user_metadata?.role;
    const userId = user.id;

    let userData: any;
    let teacherSubjects: any[] = [];

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

    if (role === 'teacher') {
        const { data: teacherSubjectsRes } = await supabase
            .from("_SubjectToTeacher")
            .select("A, subject:Subject(id, name)")
            .eq("B", userId);

        teacherSubjects = (teacherSubjectsRes || []).map((item: any) => item.subject).filter(Boolean);
        const teacherSubjectIds = (teacherSubjectsRes || []).map((item: any) => item.A);
        userData = {
            ...userData,
            subjects: teacherSubjectIds,
        };
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
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl flex-1 flex flex-col sm:flex-row gap-6 shadow-xl border border-white/10 relative overflow-hidden group animate-slide-up hover-lift">
                            {/* Decorative ambient background glow */}
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                            <div className="flex-shrink-0 flex items-center justify-center">
                                <div className="relative p-1 rounded-full bg-gradient-to-br from-white/30 to-white/5 border border-white/20 shadow-lg">
                                    <Image
                                        src={userData.img || "/noAvatar.png"}
                                        alt=""
                                        width={128}
                                        height={128}
                                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-between gap-4 min-w-0 z-10">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                                            {userData.name} {userData.surname}
                                        </h1>
                                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-0.5 inline-block">
                                            {role} Profile
                                        </span>
                                    </div>
                                    {(role === "teacher" || role === "student" || role === "parent") && (
                                        <FormContainer table={role as any} type="update" data={userData} />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
                                    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0">
                                        <Image src="/blood.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                                        <span className="truncate text-white/90">{userData.bloodType || "-"}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0">
                                        <Image src="/date.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                                        <span className="truncate text-white/90">
                                            {userData.birthday ? new Date(userData.birthday).toLocaleDateString("en-GB") : "-"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0 col-span-1 sm:col-span-2" title={userData.email || user.email || "-"}>
                                        <Image src="/mail.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                                        <span className="truncate text-white/90">{userData.email || user.email || "-"}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0 col-span-1 sm:col-span-2">
                                        <Image src="/phone.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                                        <span className="truncate text-white/90">{userData.phone || "-"}</span>
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
                {role === "teacher" && (
                    <div className="bg-white p-4 rounded-xl shadow-2xs border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h1 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                My Subjects Taught
                            </h1>
                            <span className="text-xs text-gray-400 font-bold">{teacherSubjects.length} Assigned</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {teacherSubjects.map((subject: any) => (
                                <span
                                    key={subject.id}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 shadow-2xs"
                                >
                                    📚 {subject.name}
                                </span>
                            ))}
                            {teacherSubjects.length === 0 && (
                                <span className="text-xs text-gray-400 italic">No subjects added yet.</span>
                            )}
                        </div>
                    </div>
                )}
                <Announcements />
            </div>
        </div>
    );
};

export default ProfilePage;
