import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

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

  const cardConfig: Record<
    string,
    { bg: string; border: string; icon: string; link: string; badge: string }
  > = {
    admin: {
      bg: "bg-gradient-to-br from-[#4e282c] via-[#631f24] to-[#4e282c] text-white",
      border: "border-white/20",
      icon: "/setting.png",
      link: "/settings",
      badge: "bg-white/20 text-white",
    },
    teacher: {
      bg: "bg-gradient-to-br from-[#f16122] via-[#e05417] to-[#f16122] text-white",
      border: "border-white/20",
      icon: "/teacher.png",
      link: "/list/teachers",
      badge: "bg-white/20 text-white",
    },
    student: {
      bg: "bg-gradient-to-br from-rose-700 via-rose-600 to-pink-600 text-white",
      border: "border-white/20",
      icon: "/student.png",
      link: "/list/students",
      badge: "bg-white/20 text-white",
    },
    parent: {
      bg: "bg-gradient-to-br from-teal-700 via-emerald-600 to-teal-700 text-white",
      border: "border-white/20",
      icon: "/parent.png",
      link: "/list/parents",
      badge: "bg-white/20 text-white",
    },
    librarian: {
      bg: "bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-950 text-white",
      border: "border-white/20",
      icon: "/subject.png",
      link: "/list/librarians",
      badge: "bg-white/20 text-white",
    },
    inquiry: {
      bg: "bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-700 text-white",
      border: "border-white/20",
      icon: "/assignment.png",
      link: "/list/inquiries",
      badge: "bg-white/20 text-white",
    },
  };

  const config = cardConfig[type] || {
    bg: "bg-gradient-to-br from-[#4e282c] to-[#f16122] text-white",
    border: "border-white/20",
    icon: "/more.png",
    link: "#",
    badge: "bg-white/20 text-white",
  };

  return (
    <Link
      href={config.link}
      className={`rounded-3xl ${config.bg} p-4 sm:p-5 flex-1 min-w-[130px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer border ${config.border} relative overflow-hidden group block`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div className="flex justify-between items-center relative z-10">
        <span
          className={`text-[10px] font-black ${config.badge} backdrop-blur-md px-2.5 py-1 rounded-full tracking-wider uppercase border border-white/20 shadow-2xs`}
        >
          {currentYear?.name ? currentYear.name.replace("-", "/") : "2026/27"}
        </span>

        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center p-1.5 transition-transform group-hover:rotate-12">
          <Image
            src={config.icon}
            alt=""
            width={16}
            height={16}
            className="invert brightness-200 object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 mt-3.5">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{count || 0}</h1>
        <h2 className="capitalize text-xs font-extrabold opacity-90 mt-1 uppercase tracking-wider">
          Total {type}s
        </h2>
      </div>
    </Link>
  );
};

export default UserCard;
