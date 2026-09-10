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
  const role = (user?.user_metadata?.role as string) || "";

  let userName = "User";
  let userImg: string | null = null;
  let userIdentifier: string | null = null;

  if (role && user?.id) {
    const tableName = role.charAt(0).toUpperCase() + role.slice(1);
    try {
      if (role === "student") {
        const { data } = await supabase
          .from("Student")
          .select("name, surname, img, rollNumber")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          userName = `${data.name} ${data.surname || ""}`.trim();
          userImg = data.img;
          userIdentifier = data.rollNumber ? `Roll: ${data.rollNumber}` : null;
        }
      } else if (role === "teacher") {
        const { data } = await supabase
          .from("Teacher")
          .select("name, surname, img, username")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          userName = `${data.name} ${data.surname || ""}`.trim();
          userImg = data.img;
          userIdentifier = data.username ? `ID: ${data.username}` : null;
        }
      } else if (role === "admin") {
        userName = "Administrator";
        userIdentifier = "Admin Console";
      } else if (role === "parent") {
        const { data } = await supabase
          .from("Parent")
          .select("name, surname")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          userName = `${data.name} ${data.surname || ""}`.trim();
          userIdentifier = "Parent Account";
        }
      } else {
        const { data } = await supabase
          .from(tableName)
          .select("name, surname, img")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          userName = `${data.name} ${data.surname || ""}`.trim();
          userImg = data.img;
        }
      }
    } catch {
      // Ignore
    }
  }

  const userInfo = {
    name: userName,
    img: userImg,
    identifier: userIdentifier,
    role,
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-[#F7F8FA]">
      {/* SIDEBAR FOR DESKTOP / TOP DRAWER CONTAINER */}
      <div className="w-full lg:w-[17%] xl:w-[15%] p-3.5 sm:p-4 border-b lg:border-r border-slate-100 flex flex-col items-center gap-3 bg-white z-[60] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <Link href="/" className="flex items-center justify-center py-1 w-full">
          <Image
            src="/logo.png"
            alt="Dr. Cyrus Poonawalla English Medium School"
            width={60}
            height={60}
            className="w-14 h-14 object-contain hover:scale-105 transition-transform duration-200"
            priority
          />
        </Link>

        {/* MENU WITH DRAWER PROFILE (DEMO 1 & 3 STYLE) */}
        <Menu role={role} userInfo={userInfo} />
      </div>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 bg-[#F7F8FA] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-slate-300">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
