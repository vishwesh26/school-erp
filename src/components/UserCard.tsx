import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent" | "librarian";
}) => {
  const supabase = createClient();

  // Fetch current academic year
  const { data: currentYear } = await supabase
    .from('AcademicYear')
    .select('name')
    .eq('isCurrent', true)
    .single();

  const { count } = await supabase
    .from(type.charAt(0).toUpperCase() + type.slice(1))
    .select('*', { count: 'exact', head: true });

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full text-green-600">
          {currentYear?.name.replace('-', '/') || "2026/27"}
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{count}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
