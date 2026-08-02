import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent" | "librarian" | "inquiry";
}) => {
  const supabase = createClient();

  // Fetch current academic year
  const { data: currentYear } = await supabase
    .from('AcademicYear')
    .select('name')
    .eq('isCurrent', true)
    .single();

  const tableName = type === "inquiry" ? "AdmissionInquiry" : type.charAt(0).toUpperCase() + type.slice(1);

  const { count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px] hover-lift transition-all duration-300 animate-slide-up shadow-sm hover:shadow-md cursor-pointer border border-black/5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-green-700 shadow-xs">
          {currentYear?.name.replace('-', '/') || "2026/27"}
        </span>
        <Image src="/more.png" alt="" width={20} height={20} className="hover:rotate-90 transition-transform duration-200" />
      </div>
      <h1 className="text-2xl font-semibold my-4">{count}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
