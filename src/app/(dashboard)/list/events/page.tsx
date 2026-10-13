import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatDate, formatClassName } from "@/lib/utils";
import Image from "next/image";
import ClientDate from "@/components/ClientDate";
import EventsClientView from "@/components/events/EventsClientView";
import { CalendarItem } from "@/components/calendar/ModuleCalendarView";

const EventListPage = async ({
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
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
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
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{formatClassName(item.class?.name) || "-"}</td>
      <td className="hidden md:table-cell">
        {formatDate(item.startTime, "en-US")}
      </td>
      <td className="hidden md:table-cell">
        <ClientDate date={item.startTime} />
      </td>
      <td className="hidden md:table-cell">
        <ClientDate date={item.endTime} />
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  let query = supabase.from('Event').select('*, class:Class(*)', { count: 'exact' });

  if (queryParams.search) {
    query = query.ilike('title', `%${queryParams.search}%`);
  }

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) console.error(error);

  const defaultEvents: CalendarItem[] = [
    {
      id: "ev-sci-fair",
      title: "Annual Science & Innovation Exhibition 2026",
      dateStr: "2026-10-17",
      startTime: "09:30 AM",
      endTime: "03:30 PM",
      className: "All Classes",
      description: "Inter-school science exhibition featuring robotics, renewable energy models, and working chemistry demonstrations in the Main Auditorium.",
    },
    {
      id: "ev-sports-meet",
      title: "Inter-House Athletics & Sports Championship",
      dateStr: "2026-10-24",
      startTime: "08:00 AM",
      endTime: "01:00 PM",
      className: "Grades 5-10",
      description: "Track and field events, relay races, high jump, and trophy distribution at the School Sports Ground.",
    },
    {
      id: "ev-diwali-fest",
      title: "Diwali Celebration & Cultural Rangoli Competition",
      dateStr: "2026-10-29",
      startTime: "10:00 AM",
      endTime: "01:30 PM",
      className: "All Classes",
      description: "Traditional attire, diya decoration, eco-friendly rangoli contest, and festive assembly.",
    },
  ];

  const dbCalendarItems: CalendarItem[] = (data || []).map((e: any) => ({
    id: e.id,
    title: e.title || "School Event",
    dateStr: e.startTime ? String(e.startTime).slice(0, 10) : "",
    startTime: e.startTime ? String(e.startTime).slice(11, 16) : undefined,
    endTime: e.endTime ? String(e.endTime).slice(11, 16) : undefined,
    className: formatClassName(e.class?.name) || "School-wide",
    description: e.description || undefined,
    rawItem: e,
  }));

  const combinedCalendarItems =
    dbCalendarItems.length > 0 ? [...dbCalendarItems, ...defaultEvents] : defaultEvents;

  const tableView = (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex-1">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="event" type="create" />}
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
      <EventsClientView
        calendarItems={combinedCalendarItems}
        tableViewSlot={tableView}
      />
    </div>
  );
};

export default EventListPage;
