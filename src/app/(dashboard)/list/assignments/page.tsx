import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatDate, formatClassName } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import AssignmentsClientView from "@/components/assignments/AssignmentsClientView";
import { CalendarItem } from "@/components/calendar/ModuleCalendarView";

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const role = user?.user_metadata?.role;

  // Determine if the current user is a student and find their class
  let effectiveRole = role;
  let studentClassId: number | null = null;

  if (userId) {
    if (role === "student" || !role) {
      const { data: student } = await supabase
        .from("Student")
        .select("classId")
        .eq("id", userId)
        .maybeSingle();

      if (student) {
        effectiveRole = "student";
        studentClassId = student.classId ?? null;
      }
    }
  }

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    ...(effectiveRole === "admin" || effectiveRole === "teacher"
      ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
      : []),
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Link href={`/list/assignments/${item.id}`} className="hover:underline text-lamaPurple">
          {item.subject?.name} - {item.title || "Assignment"}
        </Link>
      </td>
      <td>{formatClassName(item.class?.name) || "-"}</td>
      <td className="hidden md:table-cell">
        {item.teacher ? `${item.teacher.name || ""} ${item.teacher.surname || ""}`.trim() : 'N/A'}
      </td>
      <td className="hidden md:table-cell">
        {formatDate(item.dueDate, "en-US")}
      </td>
      {(effectiveRole === "admin" || effectiveRole === "teacher") && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="assignment" type="update" data={item} />
            <FormContainer table="assignment" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  let query = supabase.from('Assignment').select('*, subject:Subject(*), class:Class(*), teacher:Teacher(*)', { count: 'exact' });

  // STRICT FILTERING:
  // 1. Students must only see assignments for their own assigned class.
  if (effectiveRole === "student") {
    if (studentClassId) {
      query = query.eq('classId', studentClassId);
    } else {
      // If student has no assigned class, show nothing so they don't see other classes' assignments
      query = query.eq('classId', -1);
    }
  } else if (effectiveRole === "parent" && userId) {
    // 2. Parents: filter by specific class if selected, or by their children's classes
    if (queryParams.classId) {
      query = query.eq('classId', parseInt(queryParams.classId));
    } else {
      const { data: directStudents } = await supabase
        .from("Student")
        .select("classId")
        .eq("parentId", userId);

      let childClassIds = (directStudents || []).map((c: any) => c.classId).filter(Boolean);

      if (childClassIds.length === 0) {
        const { data: parentRecord } = await supabase
          .from("Parent")
          .select("id")
          .or(`id.eq.${userId},email.eq.${user?.email || ""},phone.eq.${user?.phone || ""}`)
          .limit(1)
          .maybeSingle();

        if (parentRecord?.id) {
          const { data: matchedStudents } = await supabase
            .from("Student")
            .select("classId")
            .eq("parentId", parentRecord.id);
          childClassIds = (matchedStudents || []).map((c: any) => c.classId).filter(Boolean);
        }
      }

      if (childClassIds.length > 0) {
        query = query.in('classId', childClassIds);
      } else {
        query = query.eq('classId', -1);
      }
    }
  } else {
    // 3. Teachers & Admins: filter by queryParams if provided
    if (queryParams.classId) {
      query = query.eq('classId', parseInt(queryParams.classId));
    }
    if (queryParams.teacherId) {
      query = query.eq('teacherId', queryParams.teacherId);
    }
  }

  // Search filter
  if (queryParams.search) {
    query = query.ilike('title', `%${queryParams.search}%`);
  }

  // Order by dueDate descending
  query = query.order('dueDate', { ascending: false });

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) console.error(error);

  const calendarItems: CalendarItem[] = (data || []).map((a: any) => ({
    id: a.id,
    title: `${a.subject?.name || "Subject"}: ${a.title || "Assignment"}`,
    dateStr: a.dueDate ? String(a.dueDate).slice(0, 10) : "",
    subjectName: a.subject?.name,
    className: formatClassName(a.class?.name),
    teacherName: a.teacher ? `${a.teacher.name} ${a.teacher.surname || ""}`.trim() : undefined,
    description: a.description || undefined,
    actionHref: `/list/assignments/${a.id}`,
    actionLabel: "View Assignment",
    rawItem: a,
  }));

  const tableView = (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex-1">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          {effectiveRole === "student" ? "My Class Assignments" : "All Assignments"}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(effectiveRole === "admin" || effectiveRole === "teacher") && (
              <FormContainer table="assignment" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data || []} />
      {/* PAGINATION */}
      <Pagination page={p} count={count || 0} />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full">
      <AssignmentsClientView
        calendarItems={calendarItems}
        tableViewSlot={tableView}
      />
    </div>
  );
};

export default AssignmentListPage;
