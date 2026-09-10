import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import AdminDashboardClient from "@/components/dashboard/AdminDashboardClient";
import { Suspense } from "react";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <AdminDashboardClient
      userCardsSlot={
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Suspense fallback={<div className="h-28 bg-white rounded-2xl animate-pulse" />}>
            <UserCard type="admin" />
          </Suspense>
          <Suspense fallback={<div className="h-28 bg-white rounded-2xl animate-pulse" />}>
            <UserCard type="teacher" />
          </Suspense>
          <Suspense fallback={<div className="h-28 bg-white rounded-2xl animate-pulse" />}>
            <UserCard type="student" />
          </Suspense>
          <Suspense fallback={<div className="h-28 bg-white rounded-2xl animate-pulse" />}>
            <UserCard type="librarian" />
          </Suspense>
        </div>
      }
      countChartSlot={
        <Suspense fallback={<div className="h-full bg-white rounded-2xl animate-pulse" />}>
          <CountChartContainer />
        </Suspense>
      }
      attendanceChartSlot={
        <Suspense fallback={<div className="h-full bg-white rounded-2xl animate-pulse" />}>
          <AttendanceChartContainer />
        </Suspense>
      }
      eventCalendarSlot={
        <Suspense fallback={<div className="h-64 bg-white rounded-2xl animate-pulse" />}>
          <EventCalendarContainer searchParams={searchParams} />
        </Suspense>
      }
      announcementsSlot={
        <Suspense fallback={<div className="h-64 bg-white rounded-2xl animate-pulse" />}>
          <Announcements />
        </Suspense>
      }
    />
  );
};

export default AdminPage;
