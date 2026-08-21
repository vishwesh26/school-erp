import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const Navbar = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = "John Doe";
  let role = user?.user_metadata?.role;
  let img: string | null = null;

  if (role && user?.id) {
    const tableName = role.charAt(0).toUpperCase() + role.slice(1);

    try {
      if (role === "parent") {
        const { data: parentData } = await supabase
          .from("Parent")
          .select("id, name, surname")
          .or(`id.eq.${user.id},email.eq.${user.email || ""}`)
          .maybeSingle();

        if (parentData) {
          name = `${parentData.name} ${parentData.surname || ""}`.trim();
        }

        // Fetch child photo if available
        const { data: childData } = await supabase
          .from("Student")
          .select("img")
          .or(`parentId.eq.${user.id},parentId.eq.${parentData?.id || ""}`)
          .not("img", "is", null)
          .limit(1)
          .maybeSingle();

        if (childData?.img) {
          img = childData.img;
        }
      } else {
        const { data } = await supabase
          .from(tableName)
          .select("name, surname, img")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          name = `${data.name} ${data.surname || ""}`.trim();
          img = data.img || null;
        }
      }
    } catch (err) {
      console.error("Error fetching navbar user details:", err);
    }
  }

  return (
    <div className="flex items-center justify-between p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xs border border-slate-100 transition-all duration-300 m-4 mb-0 select-none">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2.5 text-xs rounded-full ring-1 ring-slate-200/80 focus-within:ring-[#f16122] focus-within:ring-2 px-4 py-2 transition-all duration-200 bg-slate-50/70 shadow-2xs hover:bg-slate-50">
        <Image src="/search.png" alt="" width={15} height={15} className="opacity-50" />
        <input
          type="text"
          placeholder="Search portal..."
          className="w-[220px] bg-transparent outline-none text-slate-700 placeholder-slate-400 font-semibold text-xs"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-3.5 justify-end w-full">
        <div className="bg-slate-50 hover:bg-[#fdece7] transition-all duration-200 rounded-full w-9.5 h-9.5 flex items-center justify-center cursor-pointer relative border border-slate-200/80 shadow-2xs hover:scale-105 active:scale-95 group">
          <Link href="/list/announcements"> 
            <Image src="/announcement.png" alt="Announcements" width={18} height={18} className="group-hover:rotate-12 transition-transform duration-200" /> 
          </Link>
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-gradient-to-r from-[#4e282c] to-[#f16122] text-white rounded-full text-[10px] font-black shadow-xs animate-pulse">
            1
          </div>
        </div>

        <Link
          href="/profile"
          className="flex items-center gap-3 bg-gradient-to-r from-[#f4eaea]/70 via-slate-50 to-[#fdece7]/70 px-3.5 py-1.5 rounded-full border border-[#4e282c]/15 shadow-2xs hover:border-[#f16122]/40 transition-all hover:scale-102 cursor-pointer"
        >
          {img ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs flex-shrink-0 bg-slate-100">
              <Image
                src={img}
                alt={name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4e282c] via-[#802a2c] to-[#f16122] text-white flex items-center justify-center text-xs font-black uppercase shadow-xs flex-shrink-0">
              {name.charAt(0)}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold text-[#4e282c] leading-tight truncate max-w-[140px] sm:max-w-[200px]">{name}</span>
            <span className="text-[10px] font-black text-[#f16122] uppercase tracking-widest leading-none mt-0.5">{role || "User"}</span>
          </div>
        </Link>

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
