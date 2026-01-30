import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const role = user?.user_metadata?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Score",
      accessor: "score",
      className: "hidden md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
      : []),
  ];

  const renderRow = (item: any) => {
    // Determine if it came from exam or assignment relation - Supabase might return them separate or as nested single objects
    // If we use Supabase to select `*, exam:Exam(*), assignment:Assignment(*)` with logic.
    // However, the display logic below expects flattened result.
    // We will assume `item` has `exam` or `assignment` populated properly.

    // In Supabase query we will select:
    // .select('*, student:Student(*), exam:Exam(*, lesson:Lesson(*, class:Class(*), teacher:Teacher(*))), assignment:Assignment(*, lesson:Lesson(*, class:Class(*), teacher:Teacher(*)))')

    const assessment = item.exam || item.assignment;
    if (!assessment) return null;
    const isExam = !!item.exam; // Simplified check

    // Safety check for lesson/teacher being present
    const lesson = assessment.lesson;
    const teacher = lesson?.teacher;
    const classItem = lesson?.class;

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">{assessment.title}</td>
        <td>{item.student?.name + " " + item.student?.surname}</td>
        <td className="hidden md:table-cell">{item.score}</td>
        <td className="hidden md:table-cell">
          {teacher ? (teacher.name + " " + teacher.surname) : "-"}
        </td>
        <td className="hidden md:table-cell">{classItem?.name || "-"}</td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US").format(new Date(isExam ? assessment.startTime : assessment.dueDate))}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <FormContainer table="result" type="update" data={item} />
                <FormContainer table="result" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  let query = supabase.from('Result')
    .select(`
        *,
        student:Student(name, surname),
        exam:Exam!examId(*, lesson:Lesson!lessonId(*, class:Class(*), teacher:Teacher(*))),
        assignment:Assignment!assignmentId(*, lesson:Lesson!lessonId(*, class:Class(*), teacher:Teacher(*)))
    `, { count: 'exact' });

  // Add filters if needed (queryParams)

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const { data: dataRes, count, error } = await query.range(from, to);

  if (error) console.error(error);

  const data = dataRes || []; // No need to map manually if `renderRow` handles structure

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
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

export default ResultListPage;
