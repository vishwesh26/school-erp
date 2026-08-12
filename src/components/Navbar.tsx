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
    <div className="flex items-center justify-between p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-100 transition-all duration-300 m-4 mb-0 select-none">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2.5 text-xs rounded-full ring-1 ring-slate-200/80 focus-within:ring-indigo-500 focus-within:ring-2 px-4 py-2 transition-all duration-200 bg-slate-50/70 shadow-2xs hover:bg-slate-50">
        <Image src="/search.png" alt="" width={15} height={15} className="opacity-50" />
        <input
          type="text"
          placeholder="Search portal..."
          className="w-[220px] bg-transparent outline-none text-slate-700 placeholder-slate-400 font-semibold text-xs"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-3.5 justify-end w-full">
        <div className="bg-slate-50 hover:bg-indigo-50/80 transition-all duration-200 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer relative border border-slate-200/80 shadow-2xs hover:scale-105 active:scale-95 group">
          <Link href="/list/announcements"> 
            <Image src="/announcement.png" alt="Announcements" width={18} height={18} className="group-hover:rotate-12 transition-transform duration-200" /> 
          </Link>
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[10px] font-black shadow-xs animate-pulse">
            1
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/50 px-3.5 py-1.5 rounded-full border border-slate-200/70 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-xs">
            {name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-800 leading-tight">{name}</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mt-0.5">{role || "User"}</span>
          </div>
        </div>

        <Link 
          href="/logout" 
          className="text-xs font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl border border-rose-200/60 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
        >
          Logout
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
