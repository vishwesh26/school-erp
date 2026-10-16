import { createClient } from "@/lib/supabase/server";

const StudentAttendanceCard = async ({
  id,
  showLabel = true,
}: {
  id: string;
  showLabel?: boolean;
}) => {
  const supabase = createClient();
  const { data: attendance, error } = await supabase
    .from("Attendance")
    .select("present")
    .eq("studentId", id)
    .gte("date", new Date(new Date().getFullYear(), 0, 1).toISOString());

  if (error) {
    console.error(error);
  }

  const totalDays = attendance?.length || 0;
  const presentDays = attendance?.filter((day) => day.present).length || 0;
  const percentage = totalDays === 0 ? 0 : (presentDays / totalDays) * 100;

  return (
    <div>
      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
        {percentage ? percentage.toFixed(1) : "0"}%
      </h3>
      {showLabel && <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">Avg Attendance</span>}
    </div>
  );
};

export default StudentAttendanceCard;
