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
    <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 transition-all duration-300 m-4 mb-0">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2.5 text-xs rounded-full ring-1 ring-gray-200 focus-within:ring-lamaSky focus-within:ring-2 px-3.5 py-1.5 transition-all duration-200 bg-slate-50/70 shadow-2xs">
        <Image src="/search.png" alt="" width={15} height={15} className="opacity-50" />
        <input
          type="text"
          placeholder="Search portal..."
          className="w-[220px] bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium text-xs"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-4 justify-end w-full">
        <div className="bg-slate-50 hover:bg-slate-100 transition-all duration-200 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer relative border border-gray-200/80 hover-lift">
          <Link href="/list/announcements"> 
            <Image src="/announcement.png" alt="Announcements" width={18} height={18} /> 
          </Link>
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-lamaPurple text-white rounded-full text-[10px] font-black shadow-xs animate-pulse">
            1
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50/80 px-3 py-1.5 rounded-full border border-gray-200/60 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lamaSky to-lamaPurple text-white flex items-center justify-center text-xs font-black uppercase">
            {name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-800 leading-tight">{name}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">{role || "User"}</span>
          </div>
        </div>

        <Link 
          href="/logout" 
          className="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 px-3.5 py-2 rounded-xl border border-rose-200/60 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
        >
          Logout
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
