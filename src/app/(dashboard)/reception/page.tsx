import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import ReceptionDashboardClient from "@/components/dashboard/ReceptionDashboardClient";
import { Suspense } from "react";
import InquiriesListPage from "../list/inquiries/page";

const ReceptionPage = async ({
    searchParams,
}: {
    searchParams: { [keys: string]: string | undefined };
}) => {
    return (
        <ReceptionDashboardClient
            userCardsSlot={
                <>
                    <Suspense fallback={<div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />}>
                        <UserCard type="student" />
                    </Suspense>
                    <Suspense fallback={<div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />}>
                        <UserCard type="inquiry" />
                    </Suspense>
                </>
            }
            inquiriesSlot={
                <Suspense fallback={<div className="h-48 bg-slate-50 rounded-xl animate-pulse" />}>
                    <InquiriesListPage searchParams={{ ...searchParams, limit: "5" }} />
                </Suspense>
            }
            calendarSlot={
                <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
                    <EventCalendarContainer searchParams={searchParams} />
                </Suspense>
            }
            announcementsSlot={
                <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
                    <Announcements />
                </Suspense>
            }
        />
    );
};

export default ReceptionPage;
