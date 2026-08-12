import { createClient } from "@/lib/supabase/server";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string || "";

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* HEADER for mobile / SIDEBAR for desktop */}
      <div className="w-full lg:w-[16%] xl:w-[14%] p-4 border-b lg:border-r border-gray-100 flex flex-col items-start gap-4 bg-white z-[60] overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-3 w-full p-2.5 rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/50 border border-slate-100 shadow-2xs hover:shadow-xs transition-all duration-300 group"
        >
          <div className="p-1 bg-white rounded-xl shadow-2xs border border-slate-200/70 group-hover:scale-105 transition-transform duration-200">
            <Image src="/logo.png" alt="logo" width={32} height={32} className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors">DCPEMS</span>
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase leading-tight">School ERP</span>
          </div>
        </Link>

        {/* Mobile menu button - visible only on mobile/tablet */}

        {/* Desktop menu - visible only on lg screens and up */}
        <Menu role={role} />
      </div>
      {/* RIGHT */}
      <div className="flex-1 bg-[#F7F8FA] overflow-y-auto flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
