import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import { Suspense } from "react";
import InquiriesListPage from "../list/inquiries/page";

const ReceptionPage = async ({
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
                        <UserCard type="student" />
                    </Suspense>
                    <Suspense fallback={<div>Loading...</div>}>
                        <UserCard type="inquiry" />
                    </Suspense>
                </div>

                {/* QUICK ACCESS TO INQUIRIES */}
                <div className="bg-white p-4 rounded-md shadow-sm">
                    <h1 className="text-xl font-semibold mb-4 border-b pb-2">Recent Inquiries</h1>
                    <Suspense fallback={<div>Loading inquiries...</div>}>
                        <InquiriesListPage searchParams={{ ...searchParams, limit: "5" }} />
                    </Suspense>
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

export default ReceptionPage;
