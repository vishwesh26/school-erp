import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const Navbar = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let name = "John Doe";
  let role = user?.user_metadata?.role;

  if (role) {
    const { data } = await supabase.from(role.charAt(0).toUpperCase() + role.slice(1)).select("name, surname").eq("id", user?.id).single();
    if (data) {
      name = `${data.name} ${data.surname || ""}`;
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 transition-all duration-300">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-200 focus-within:ring-lamaSky focus-within:ring-2 px-3 py-1 transition-all duration-200 bg-gray-50/50">
        <Image src="/search.png" alt="" width={14} height={14} className="opacity-60" />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-1.5 bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-5 justify-end w-full">
        <div className="bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer relative border border-gray-200/60 hover-lift">
          <Link href="/list/announcements"> 
            <Image src="/announcement.png" alt="Announcements" width={18} height={18} /> 
          </Link>
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-lamaPurple text-white rounded-full text-[10px] font-bold shadow-xs animate-pulse">
            1
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-semibold text-gray-800">{name}</span>
        </div>
        <Link 
          href="/logout" 
          className="text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg border border-red-200/60 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
        >
          Logout
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
