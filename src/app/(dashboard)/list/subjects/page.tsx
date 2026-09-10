import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import { Suspense } from "react";

const SubjectList = async ({
  searchParams,
  role,
}: {
  searchParams: { [key: string]: string | undefined };
  role: string | undefined;
}) => {
  const supabase = createClient();

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Assigned Teacher",
      accessor: "teachers",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: any) => {
    const assignedTeacher = item._SubjectToTeacher?.[0]?.Teacher;
    const teacherName =
      item._SubjectToTeacher && item._SubjectToTeacher.length > 1
        ? item._SubjectToTeacher
            .map((sub: any) => `${sub.Teacher?.name || ""} ${sub.Teacher?.surname || ""}`.trim())
            .filter(Boolean)
            .join(", ")
        : assignedTeacher
        ? `${assignedTeacher.name} ${assignedTeacher.surname}`
        : null;

    const teacherId = item.teacherId || assignedTeacher?.id || "";
    const itemData = {
      ...item,
      teacherId,
      teachers: teacherId ? [teacherId] : [],
    };

    return (
      <tr
        key={item.id}
        className="border-b border-gray-100 even:bg-slate-50/60 text-sm hover:bg-[#fdece7]/30 transition-colors"
      >
        <td className="p-4 font-semibold text-gray-800">{item.name}</td>
        <td className="hidden md:table-cell">
          {teacherName ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f4eaea] text-[#4e282c]">
              {teacherName}
            </span>
          ) : (
            <span className="text-gray-400 text-xs italic">Unassigned</span>
          )}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormContainer table="subject" type="update" data={itemData} />
                <FormContainer table="subject" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Use nested select to fetch Teachers through the join table _SubjectToTeacher
  let query = supabase
    .from("Subject")
    .select("*, _SubjectToTeacher(Teacher(id, name, surname))", { count: "exact" });

  if (queryParams.search) {
    query = query.ilike("name", `%${queryParams.search}%`);
  }

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) console.error(error);

  return (
    <>
      <Table columns={columns} renderRow={renderRow} data={data || []} />
      <Pagination page={p} count={count || 0} />
    </>
  );
};

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-bold text-[#4e282c]">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-[#ebd36b] transition shadow-xs">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-[#ebd36b] transition shadow-xs">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="subject" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Suspense fallback={<div className="p-4 bg-slate-50 w-full rounded-md text-gray-500">Loading subjects...</div>}>
        <SubjectList searchParams={searchParams} role={role} />
      </Suspense>
    </div>
  );
};

export default SubjectListPage;
