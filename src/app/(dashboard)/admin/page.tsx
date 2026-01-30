import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import { Suspense } from "react";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <Suspense fallback={<div>Loading...</div>}>
            <UserCard type="admin" />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <UserCard type="teacher" />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <UserCard type="student" />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <UserCard type="librarian" />
          </Suspense>
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <Suspense fallback={<div>Loading...</div>}>
              <CountChartContainer />
            </Suspense>
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <Suspense fallback={<div>Loading...</div>}>
              <AttendanceChartContainer />
            </Suspense>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <Suspense fallback={<div>Loading...</div>}>
          <EventCalendarContainer searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <Announcements />
        </Suspense>
      </div>
    </div>
  );
};

export default AdminPage;
