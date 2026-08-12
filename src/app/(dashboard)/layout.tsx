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
          className="flex items-center gap-3 w-full p-3 rounded-2xl bg-gradient-to-br from-[#4e282c]/10 via-[#fdece7]/80 to-[#f16122]/15 border border-[#4e282c]/15 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden relative"
        >
          {/* Subtle Ambient Background Light */}
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#f16122]/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

          <div className="p-1.5 bg-white rounded-xl shadow-xs border border-[#f16122]/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <Image src="/logo.png" alt="logo" width={32} height={32} className="object-contain" />
          </div>
          <div className="flex flex-col z-10">
            <span className="font-black text-sm tracking-tight text-[#4e282c] group-hover:text-[#f16122] transition-colors leading-tight">DCPEMS</span>
            <span className="text-[9px] font-black tracking-widest text-[#f16122] uppercase leading-tight mt-0.5">School ERP</span>
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
