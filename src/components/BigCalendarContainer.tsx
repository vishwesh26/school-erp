import { createClient } from "@/lib/supabase/server";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const supabase = createClient();
  const { data: dataRes } = await supabase
    .from('Lesson')
    .select('*')
    .eq(type, id);

  const data = dataRes?.map((lesson: any) => ({
    title: lesson.name,
    start: lesson.startTime, // Pass ISO string
    end: lesson.endTime,     // Pass ISO string
    day: lesson.day,
  })) || [];

  return (
    <div className="">
      <BigCalendar data={data} />
    </div>
  );
};

export default BigCalendarContainer;
