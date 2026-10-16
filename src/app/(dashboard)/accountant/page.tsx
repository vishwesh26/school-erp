import { getAccountantStats } from "@/lib/accountantActions";
import CountChartContainer from "@/components/CountChartContainer";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import Announcements from "@/components/Announcements";
import AccountantDashboardClient from "@/components/dashboard/AccountantDashboardClient";
import { Suspense } from "react";

const AccountantPage = async () => {
  const stats = await getAccountantStats();

  return (
    <AccountantDashboardClient
      stats={stats}
      chartsSlot={
        <div className="flex flex-col lg:flex-row gap-5">
          {/* STUDENT COUNT PIE CHART */}
          <div className="w-full lg:w-1/3 h-[300px] sm:h-[380px] lg:h-[450px]">
            <Suspense fallback={<div className="h-full w-full bg-slate-100 rounded-3xl animate-pulse" />}>
              <CountChartContainer />
            </Suspense>
          </div>
          {/* ATTENDANCE / FEE COLLECTION ACTIVITY */}
          <div className="w-full lg:w-2/3 h-[300px] sm:h-[380px] lg:h-[450px]">
            <Suspense fallback={<div className="h-full w-full bg-slate-100 rounded-3xl animate-pulse" />}>
              <AttendanceChartContainer />
            </Suspense>
          </div>
        </div>
      }
      announcementsSlot={
        <Suspense fallback={<div className="h-64 w-full bg-slate-100 rounded-3xl animate-pulse" />}>
          <Announcements />
        </Suspense>
      }
    />
  );
};

export default AccountantPage;
