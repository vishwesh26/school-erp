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

  const gradients: Record<string, string> = {
    admin: "from-slate-900 via-slate-800 to-slate-900 text-white",
    teacher: "from-amber-600 via-orange-500 to-amber-600 text-white",
    student: "from-rose-600 via-pink-500 to-rose-600 text-white",
    parent: "from-teal-600 via-emerald-500 to-teal-600 text-white",
    librarian: "from-purple-600 via-indigo-600 to-purple-600 text-white",
    inquiry: "from-blue-600 via-cyan-600 to-blue-600 text-white",
  };

  const bgStyle = gradients[type] || "from-lamaSky to-lamaSky/90 text-white";

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bgStyle} p-5 flex-1 min-w-[140px] hover-lift transition-all duration-300 animate-slide-up shadow-md hover:shadow-xl cursor-pointer border border-white/15 relative overflow-hidden group`}>
      {/* Decorative ambient glow circle */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex justify-between items-center relative z-10">
        <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white tracking-wider uppercase border border-white/20 shadow-xs">
          {currentYear?.name ? currentYear.name.replace('-', '/') : "2026/27"}
        </span>
        <Image src="/more.png" alt="" width={18} height={18} className="invert brightness-200 hover:rotate-90 transition-transform duration-200 opacity-80" />
      </div>
      
      <div className="relative z-10 mt-4">
        <h1 className="text-3xl font-black tracking-tight">{count || 0}</h1>
        <h2 className="capitalize text-xs font-bold opacity-90 mt-1 uppercase tracking-wider">{type}s</h2>
      </div>
    </div>
  );
};

export default UserCard;
