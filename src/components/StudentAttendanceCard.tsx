import { createClient } from "@/lib/supabase/server";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
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
    <div className="">
      <h1 className="text-xl font-semibold">{percentage ? percentage.toFixed(1) : "0"}%</h1>
      <span className="text-sm text-gray-400">Avg Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
