import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatDate, formatClassName } from "@/lib/utils";
import Image from "next/image";
import AnnouncementsClientView from "@/components/announcements/AnnouncementsClientView";
import { CalendarItem } from "@/components/calendar/ModuleCalendarView";

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  
  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
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
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{formatClassName(item.class?.name) || "-"}</td>
      <td className="hidden md:table-cell">
        {formatDate(item.date, "en-US")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {["admin", "teacher"].includes(role) && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  let query = supabase.from('Announcement').select('*, class:Class(*)', { count: 'exact' });

  if (queryParams.search) {
      query = query.ilike('title', `%${queryParams.search}%`);
  }

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) console.error(error);

  const defaultAnnouncements: CalendarItem[] = [
    {
      id: "ann-exam-sched",
      title: "Mid-Term Examination Datesheet & Hall Tickets Released",
      dateStr: "2026-10-13",
      className: "All Classes",
      description: "Students must carry their official hall tickets and school identity cards to the examination hall.",
    },
    {
      id: "ann-uniform",
      title: "Transition to Winter Uniform Guidelines",
      dateStr: "2026-10-20",
      className: "All Classes",
      description: "All students are instructed to report in complete prescribed winter uniforms starting November 1st.",
    },
    {
      id: "ann-parent-meeting",
      title: "Upcoming Parent-Teacher Academic Review Meeting",
      dateStr: "2026-10-25",
      className: "All Classes",
      description: "PTM will be conducted to review mid-term student performance and remedial academic support schedules.",
    },
  ];

  const dbCalendarItems: CalendarItem[] = (data || []).map((a: any) => ({
    id: a.id,
    title: a.title || "Announcement",
    dateStr: a.date ? String(a.date).slice(0, 10) : "",
    className: formatClassName(a.class?.name) || "School-wide",
    description: a.description || undefined,
    rawItem: a,
  }));

  const combinedCalendarItems =
    dbCalendarItems.length > 0 ? [...dbCalendarItems, ...defaultAnnouncements] : defaultAnnouncements;

  const tableView = (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex-1">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
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
            {["admin", "teacher"].includes(role) && (
              <FormContainer table="announcement" type="create" />
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
      <AnnouncementsClientView
        calendarItems={combinedCalendarItems}
        tableViewSlot={tableView}
      />
    </div>
  );
};

export default AnnouncementListPage;
