import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import AttendanceTeacherView from "@/components/AttendanceTeacherView";
import { getTeacherClasses } from "@/lib/actions";
import GradeSelect from "@/components/drill-down/GradeSelect";
import ClassSelect from "@/components/drill-down/ClassSelect";
import Link from "next/link";
import AttendanceDateFilter from "@/components/AttendanceDateFilter";

const AttendanceListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { gradeId, classId, page, date, ...queryParams } = searchParams;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const role = user?.user_metadata?.role;

    // TEACHER & ADMIN VIEW (Mark Attendance)
    if (role === "teacher" || role === "admin") {
        if (!gradeId) return <GradeSelect />;
        if (!classId) return <ClassSelect gradeId={gradeId} />;

        // Pass classId (converted to number) to the view
        return <AttendanceTeacherView classId={parseInt(classId)} teacherId={userId!} initialDate={date} />;
    }

    // LIST VIEW (Student, Parent)

    // ADMIN DRILL DOWN
    if (role === "admin") {
        if (!gradeId) {
            return <GradeSelect />;
        }

        if (!classId) {
            return <ClassSelect gradeId={gradeId} />;
        }
    }

    // COLUMNS
    const columns = [
        {
            header: "Date",
            accessor: "date",
        },
        {
            header: "Student",
            accessor: "student",
        },
        {
            header: "Status",
            accessor: "present",
        },
        {
            header: "Lesson",
            accessor: "lesson",
            className: "hidden md:table-cell",
        },
    ];

    const renderRow = (item: any) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            <td className="flex items-center gap-4 p-4">
                {new Intl.DateTimeFormat("en-US").format(new Date(item.date))}
            </td>
            <td>{item.student?.name + " " + item.student?.surname}</td>
            <td>
                {item.present ? (
                    <span className="text-green-500">Present</span>
                ) : (
                    <span className="text-red-500">Absent</span>
                )}
            </td>
            <td className="hidden md:table-cell">{item.lesson?.name || "-"}</td>
        </tr>
    );

    const p = page ? parseInt(page) : 1;

    let query = supabase.from('Attendance')
        .select(`
        *,
        student:Student(name, surname),
        lesson:Lesson(name)
    `, { count: 'exact' });

    // DATE FILTER
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query.gte('date', startOfDay.toISOString()).lte('date', endOfDay.toISOString());
    }

    // ROLE FILTER LOGIC
    if (role === "admin") {
        // Apply Drill Down Filter
        // Use !inner to ensure we filter by the joined Student's classId
        // We re-initialize the select to use !inner for filtering by class
        query = supabase.from('Attendance')
            .select(`
                *,
                student:Student!inner(name, surname, classId),
                lesson:Lesson(name)
            `, { count: 'exact' })
            .eq('student.classId', classId);

        // Re-apply date filter if needed (since we re-initialized query)
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query = query.gte('date', startOfDay.toISOString()).lte('date', endOfDay.toISOString());
        }
    } else if (role === "student") {
        query = query.eq('studentId', userId!);
    } else if (role === "parent") {
        // Fetch children logic (skipped for now as per original)
    }

    const from = (p - 1) * ITEM_PER_PAGE;
    const to = from + ITEM_PER_PAGE - 1;

    const { data: dataRes, count, error } = await query.range(from, to);

    if (error) console.error(error);

    const data = dataRes || [];

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 shadow-sm">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {role === 'admin' && (
                        <Link href={`?gradeId=${gradeId}`} className="text-blue-500 hover:underline text-sm md:text-base">
                            ← Change Class
                        </Link>
                    )}
                    <h1 className="hidden md:block text-lg font-semibold">Attendance</h1>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <AttendanceDateFilter />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={data} />
            {/* PAGINATION */}
            <Pagination page={p} count={count || 0} />
        </div>
    );
};

export default AttendanceListPage;
