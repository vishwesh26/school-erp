import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import GradeSelect from "@/components/drill-down/GradeSelect";
import ClassSelect from "@/components/drill-down/ClassSelect";
import Link from "next/link";
import IncreaseStrengthButton from "@/components/IncreaseStrengthButton";

const ClassListPage = async ({
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
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  const columns = [
    {
      header: "Class Name",
      accessor: "name",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Supervisor",
      accessor: "supervisor",
      className: "hidden md:table-cell",
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
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">{item.capacity}</td>
      <td className="hidden md:table-cell">{parseInt(item.name)}</td>
      <td className="hidden md:table-cell">
        {item.supervisor ? (item.supervisor.name + " " + item.supervisor.surname) : 'N/A'}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <IncreaseStrengthButton classId={item.id} initialCapacity={item.capacity} />
              <FormContainer table="class" type="update" data={item} />
              <FormContainer table="class" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const p = page ? parseInt(page) : 1;

  let query = supabase.from('Class').select('*, supervisor:Teacher!supervisorId(*)', { count: 'exact' });

  // STRICT FILTER
  query = query.eq('id', classId);

  if (queryParams.search) {
    query = query.ilike('name', `%${queryParams.search}%`);
  }

  if (queryParams.supervisorId) {
    query = query.eq('supervisorId', queryParams.supervisorId);
  }

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) console.error(error);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`?gradeId=${gradeId}`} className="text-blue-500 hover:underline text-sm md:text-base">
            ← Change Class
          </Link>
          <h1 className="hidden md:block text-lg font-semibold">Class Details</h1>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="class" type="create" />}
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

export default ClassListPage;
