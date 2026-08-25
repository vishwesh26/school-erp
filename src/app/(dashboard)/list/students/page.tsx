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
import StudentCredentialsPDFModal from "@/components/StudentCredentialsPDFModal";
import { formatGrade, formatClassName } from "@/lib/utils";

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { gradeId, classId, view, academicYearId, page, ...queryParams } = searchParams;

  const isAlumniView = view === "alumni";
  const supabase = createClient();

  // If Alumni View and no Year selected, show Year Selection
  if (isAlumniView && !academicYearId) {
    const { data: years } = await supabase.from('AcademicYear').select('*').order('startDate', { ascending: false });
    return (
      <div className="p-4 bg-white rounded-md m-4 mt-0">
        <div className="flex items-center gap-4 mb-4">
          <Link href="?" className="text-blue-500 hover:underline">← Back to Grades</Link>
          <h1 className="text-xl font-semibold uppercase tracking-tight font-black">Select Graduation Year</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {years?.map((year) => (
            <Link
              key={year.id}
              href={`?view=alumni&academicYearId=${year.id}`}
              className="p-6 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col items-center justify-center cursor-pointer shadow-sm border border-purple-100 group"
            >
              <span className="text-2xl font-black text-purple-700">{year?.name ? year.name.replace('-', '/') : ""}</span>
              <span className="text-xs text-purple-400 font-bold mt-1 group-hover:text-purple-500">View passed out students</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!gradeId && !isAlumniView && !queryParams.search) {
    return <GradeSelect />;
  }

  if (!isAlumniView && gradeId && !classId && !queryParams.search) {
    return <ClassSelect gradeId={gradeId} />;
  }

  const p = page ? parseInt(page) : 1;

  // URL Params Condition
  // For Alumni, we fetch from StudentHistory since we need year-specific passing status
  let query: any;
  if (isAlumniView) {
    query = supabase
      .from('StudentHistory')
      .select('*, Student(*), Class(*)', { count: 'exact' })
      .eq('status', 'Passed Out')
      .eq('academicYearId', academicYearId);
  } else {
    query = supabase.from('Student').select('*, Class(*), grade:Grade!gradeId(level)', { count: 'exact' });
    if (classId) {
      query = query.eq('classId', classId);
    }
  }

  if (queryParams.search) {
    if (isAlumniView) {
      // Search in the joined Student table
      query = query.ilike('Student.name', `%${queryParams.search}%`);
    } else {
      query = query.ilike('name', `%${queryParams.search}%`);
    }
  }

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const [userRes, { data: rawData, count, error }] = await Promise.all([
    supabase.auth.getUser(),
    query.range(from, to)
  ]);

  // Normalize data shape for renderRow
  const data = isAlumniView
    ? (rawData as any[])?.map(history => ({
      ...history.Student,
      Class: history.Class,
      status: history.status
    }))
    : rawData;

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
    ...(["admin", "teacher"].includes(role)
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
          <h3 className="font-semibold">{item.name} {item.surname || ""}</h3>
          <p className="text-xs text-gray-500">{formatClassName(item.Class?.name)}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.grade?.level !== undefined ? formatGrade(item.grade.level) : formatGrade(item.Class?.name)}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white border border-sky-200/70 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95" title="View Profile">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </Link>
          {["admin", "teacher"].includes(role) && (
            <>
              <FormContainer table="student" type="update" data={item} />
              <FormContainer table="student" type="transfer" data={{ id: item.id, gradeId: item.gradeId, classId: item.classId }} />
            </>
          )}
          {role === "admin" && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  // Fetch ALL students for the selected class (for Export)
  let exportQuery: any;
  if (isAlumniView) {
    exportQuery = supabase
      .from('StudentHistory')
      .select('*, Student(id, name, surname, rollNumber, email, phone, bloodType, parent:Parent(name, surname))')
      .eq('status', 'Passed Out')
      .eq('academicYearId', academicYearId);
  } else {
    exportQuery = supabase.from('Student').select('id, name, surname, rollNumber, email, phone, bloodType, parent:Parent(name, surname)');
    if (classId) {
      exportQuery = exportQuery.eq('classId', classId);
    }
    if (queryParams.search) {
      exportQuery = exportQuery.ilike('name', `%${queryParams.search}%`);
    }
  }

  const { data: exportRaw, error: exportErr } = isAlumniView
    ? await exportQuery.order('Student(name)', { ascending: true })
    : await exportQuery.order('name', { ascending: true });

  if (exportErr) {
    console.error("Export Query Error:", exportErr);
  }

  const allStudentsInClass = isAlumniView
    ? (exportRaw as any[])?.map(h => ({
        ...h.Student,
        parentName: h.Student?.parent ? `${h.Student.parent.name || ''} ${h.Student.parent.surname || ''}`.trim() : 'N/A'
      }))
    : (exportRaw as any[])?.map(s => ({
        ...s,
        parentName: s.parent ? `${s.parent.name || ''} ${s.parent.surname || ''}`.trim() : 'N/A'
      }));

  // Fetch Session/Class Name for the heading/export
  let classNameForDisplay = "Global Search Results";
  if (!isAlumniView) {
    if (classId) {
      const { data: classData } = await supabase
        .from('Class')
        .select('name')
        .eq('id', classId)
        .single();
      classNameForDisplay = classData?.name || "Class";
    } else {
      classNameForDisplay = "All Classes";
    }
  } else {
    const { data: yearData } = await supabase
      .from('AcademicYear')
      .select('name')
      .eq('id', academicYearId)
      .single();
    classNameForDisplay = `Alumni ${yearData?.name?.replace('-', '/') || ""}`;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={isAlumniView ? (academicYearId ? "?view=alumni" : "?") : (gradeId ? `?gradeId=${gradeId}` : `?`)}
            className="text-blue-500 hover:underline text-sm md:text-base font-bold"
          >
            ← {isAlumniView ? (academicYearId ? "Change Year" : "Back to Grades") : (gradeId && classId ? "Change Class" : "Back to Grades")}
          </Link>
          <h1 className="hidden md:block text-lg font-black uppercase tracking-tight">
            {isAlumniView ? `${classNameForDisplay}` : "All Students"}
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex flex-wrap items-center gap-2.5 self-end">
            <StudentListDownloadButton
              students={allStudentsInClass || []}
              className={classNameForDisplay}
            />
            {role === "admin" && (
              <StudentCredentialsPDFModal
                initialClassId={classId}
                initialClassName={classNameForDisplay}
              />
            )}
            {["admin", "teacher"].includes(role) && (
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
