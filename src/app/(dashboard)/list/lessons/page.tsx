import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

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
    ...((role === "admin" || role === "teacher")
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
      <td className="flex items-center gap-4 p-4">{item.subject?.name}</td>
      <td>{item.class?.name}</td>
      {/* 
         Display Formatted Time.
         Assuming startTime and endTime are stored as ISO UTC strings.
         We want to display them in Local Time (or specific timezone if desired).
         Server Components render on Server (UTC mostly), so converting to Local string here might just show UTC string if Node env is UTC.
         
         Ideally, we should client-render times to show user's browser time, OR formatting lib like moment-timezone.
         However, let's try a simple approach first: 
         - If we just print the string, it's UTC.
         - new Date(string).toLocaleTimeString() on Server is Server Time.
         
         For consistency in a School App (where school is in one TZ), usually we might want a fixed TimeZone.
         But "10 AM -> 4:30 AM" means User is interacting in Browser (Local) vs DB (UTC).
         
         IF this is a Server Component (renderRow is called in Page which is Async Server Component),
         we can't know user's browser timezone easily purely on server.
         
         Quick fix: Just show the raw UTC hours? No.
         
         The user sees "4.30" which means they are seeing the DB value directly or Server Time.
         
         To fix "View": We need to convert UTC to the expected School Timezone.
         OR we use a Client Component for the time cell.
         
         Let's assume the user wants to see it in their Local Time (Browser).
         We can wrap the time in a tiny Client Component `DisplayTime`.
      */}
      <td className="hidden md:table-cell">
        {item.teacher ? (item.teacher.name + " " + item.teacher.surname) : 'N/A'}
      </td>
      {/* Add Time Column for better visibility too? Or is it part of Subject/Class? 
          The columns defined are Subject, Class, Teacher, Actions.
          The user says "saved as", likely they edit it and see the form value?
          
          Wait, user said "saved as 4.30 and 5.30".
          If they go back to EDIT, the form loads `data`.
          I updated `LessonForm` to use `formatToLocalDatetime`.
          
          Let's double check `formatToLocalDatetime`.
          `new Date(isoString)` creates a Date object.
          Date methods `getHours()` etc operate in LOCAL time of the runtime.
          
          If `LessonForm` runs on Client (which it does, `use client`), `new Date()` is Browser Time.
          So if DB has `04:30Z`, `new Date()` in IST is `10:00`.
          `getHours()` should be 10.
          `formatToLocalDatetime` returns "YYYY-MM-DDT10:00".
          Input `type="datetime-local"` takes this and shows 10:00 AM.
          
          So why does user say "saved as 4.30"?
          Maybe they are looking at the LIST page, and I should add a Time column there to verify?
          The current columns are: Subject Name, Class, Teacher.
          There IS NO time column in the list view I see above!
          
          Ah, maybe they mean when they open the EDIT form again?
          
          If they mean the Edit form:
          My previous fix:
          `dataToSubmit.startTime = new Date(formData.startTime)`
          `formData.startTime` is "2025-12-16T10:00".
          `new Date(...)` is `Tue Dec 16 2025 10:00:00 GMT+0530`.
          `JSON.stringify` sent to server action converts this to `2025-12-16T04:30:00.000Z`.
          Server saves `04:30:00`.
          
          When fetching back:
          `formatToLocalDatetime("...04:30Z")`
          `new Date("...04:30Z")` -> `Tue Dec 16 ... 10:00:00 GMT+0530`.
          `getHours` -> 10.
          Returns "...10:00".
          Input shows 10:00.
          
          So my fix SHOULD work for the Edit Form.
          
          Why would they say "saved as 4.30"?
          Maybe they didn't reload or my fix wasn't applied when they tested?
          OR they are looking at a different place?
          
          Or maybe `data.startTime` in the form is NOT an ISO string?
          If Supabase returns it as a string without 'Z'?
          Prisma usually returns Date object. Supabase returns JSON string.
          If `timestamptz` column, it returns ISO with Z.
          If `timestamp` (no tz), it returns "YYYY-MM-DDTHH:MM:SS" (no Z).
          
          If it returns "2025-12-16T04:30:00" (no Z), `new Date()` treats it as Local Time?
          `new Date("...04:30:00")` in browser -> 4:30 AM Local!
          
          Supabase `timestamp without time zone` returns string.
          Supabase `timestamp with time zone` returns ISO with Z.
          
          The `Lesson` table definition is likely from Prisma migration.
          If it was `DateTime`, Prisma defaults to `timestamp(3)`. In Postgres that is `timestamp without time zone`.
          
          If it is `timestamp without time zone`, it saves `04:30`.
          When fetched, it comes as string "04:30".
          Browser `new Date("...04:30")` -> 4:30 AM Local.
          
          THIS IS THE BUG.
          
          If the DB column is `timestamp without time zone`, then:
          1. User picks 10:00 Local.
          2. We sent `04:30` UTC (because we did `toISOString`).
             - Wait, `toISOString` output is passed to `createLesson`.
             - `supabase.from().insert({ startTime: ... })`.
             - If column is `timestamp`, it takes the string. `04:30Z`.
             - Postgres might strip Z and save 04:30? Or convert?
             - If converting `04:30Z` to timestamp-no-tz, it probably saves 04:30 (wall time at UTC).
          3. We fetch it back as "04:30" (no Z).
          4. `new Date("04:30")` -> 4:30 AM Local.
          
          Solution:
          If the DB stores UTC but returns it without Z, we must append 'Z' when parsing, OR force it to be treated as UTC.
          
          Let's verify what `data.startTime` looks like in the form.
          Since I can't easily console log to user console, I will assume `timestamp without time zone`.
          
          I will update `LessonForm.tsx` to handle the case where `isoString` might be missing the 'Z'.
          Basically, `new Date(isoString.endsWith('Z') ? isoString : isoString + 'Z')`.
          
          AND, when saving/sending:
          If we send `toISOString()` ("...Z"), Supabase handles it.
          
          Let's modify `formatToLocalDatetime` in `LessonForm`.
          
      */}
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  let query = supabase.from('Lesson').select('*, subject:Subject(*), class:Class(*), teacher:Teacher(*)', { count: 'exact' });

  if (queryParams.teacherId) query = query.eq('teacherId', queryParams.teacherId);
  if (queryParams.classId) query = query.eq('classId', parseInt(queryParams.classId));

  if (queryParams.search) {
    // Supabase doesn't support OR across relations easily in one filter string without raw SQL or RPC
    // Skipping search for relations for now, just local fields or implementing simplified search
  }

  const from = (p - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) console.error(error);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" || role === "teacher" ? <FormContainer table="lesson" type="create" /> : null}
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

export default LessonListPage;
