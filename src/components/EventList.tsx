import { createClient } from "@/lib/supabase/server";
import { formatTime } from "@/lib/utils";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  let targetDate = new Date();
  if (dateParam) {
    const parsed = new Date(dateParam);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("Event")
    .select("*")
    .gte("startTime", startOfDay.toISOString())
    .lte("startTime", endOfDay.toISOString());

  if (error) {
    console.error(error);
  }

  return (data || []).map((event) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">{event.title}</h1>
        <span className="text-gray-300 text-xs">
          {formatTime(event.startTime, "en-GB")}
        </span>
      </div>
      <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
    </div>
  ));
};

export default EventList;
