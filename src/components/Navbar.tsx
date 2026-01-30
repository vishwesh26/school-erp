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
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Link rel="stylesheet" href="/list/announcements"> <Image src="/announcement.png" alt="" width={20} height={20} /> </Link>
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{name}</span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        {/* <UserButton /> */}
        <Link href="/logout" className="text-xs bg-red-100 p-2 rounded-md">Logout</Link>
      </div>
    </div>
  );
};

export default Navbar;
