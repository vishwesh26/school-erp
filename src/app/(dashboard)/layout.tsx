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
          className="flex items-center justify-center w-full p-2.5 rounded-full bg-gradient-to-br from-[#4e282c]/10 via-[#fdece7]/80 to-[#f16122]/15 border border-[#4e282c]/15 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden relative"
        >
          {/* Subtle Ambient Background Light */}
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#f16122]/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

          <div className="w-12 h-12 rounded-full bg-white shadow-xs border-2 border-[#f16122]/40 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center p-1 overflow-hidden">
            <Image src="/logo.png" alt="logo" width={44} height={44} className="object-cover rounded-full w-full h-full" priority />
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
