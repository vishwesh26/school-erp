import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";
import GradeSelect from "@/components/drill-down/GradeSelect";
import ClassSelect from "@/components/drill-down/ClassSelect";
import StudentListDownloadButton from "@/components/StudentListDownloadButton";

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { gradeId, classId, page, ...queryParams } = searchParams;

  if (!gradeId) {
    return <GradeSelect />;
  }

  if (!classId) {
    return <ClassSelect gradeId={gradeId} />;
  }

  const supabase = createClient();
  const p = page ? parseInt(page) : 1;

  // URL Params Condition
  let query = supabase.from('Student').select('*, Class(*)', { count: 'exact' });

  // STRICT FILTER: Filter by the selected Class ID
  query = query.eq('classId', classId);

  if (queryParams.search) {
    query = query.ilike('name', `%${queryParams.search}%`);
  }

  if (queryParams.teacherId) {
    // Complex relation filter skipped for direct migration
  }

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const [userRes, { data, count, error }] = await Promise.all([
    supabase.auth.getUser(),
    query.range(from, to)
  ]);

  const role = userRes.data.user?.user_metadata?.role;

  if (error) {
    console.error(error);
  }

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
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
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.Class?.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.Class?.name ? parseInt(item.Class.name) : ""}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  // Fetch ALL students for the selected class (for Export)
  const { data: allStudentsInClass } = await supabase
    .from('Student')
    .select('id, name, surname, rollNumber')
    .eq('classId', classId)
    .order('name', { ascending: true });

  // Fetch Class Name for the heading/export
  const { data: classData } = await supabase
    .from('Class')
    .select('name')
    .eq('id', classId)
    .single();

  const classNameForDisplay = classData?.name || "Class";

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`?gradeId=${gradeId}`} className="text-blue-500 hover:underline text-sm md:text-base">
            ← Change Class
          </Link>
          <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <StudentListDownloadButton
              students={allStudentsInClass || []}
              className={classNameForDisplay}
            />
            {role === "admin" && (
              <FormContainer table="student" type="create" />
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
};

export default StudentListPage;
