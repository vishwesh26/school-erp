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
      <div className="w-full lg:w-[16%] xl:w-[14%] p-4 border-b lg:border-r border-gray-100 flex flex-col items-center gap-4 bg-white z-[60] overflow-y-auto">
        <Link href="/" className="flex items-center justify-center py-1 w-full">
          <Image src="/logo.png" alt="logo" width={64} height={64} className="w-16 h-16 object-contain hover:scale-105 transition-transform duration-200" priority />
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
