import { getAccountantStats } from "@/lib/accountantActions";
import CountChartContainer from "@/components/CountChartContainer";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import UserCard from "@/components/UserCard";
import Announcements from "@/components/Announcements";
import { Suspense } from "react";

const AccountantPage = async () => {
    const stats = await getAccountantStats();

    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">
            {/* LEFT */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
                {/* USER CARDS */}
                <div className="flex gap-4 justify-between flex-wrap">
                    <Suspense fallback={<div>Loading...</div>}>
                        <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full text-green-600">
                                    Today
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold my-4">₹{stats.totalToday}</h1>
                            <h2 className="capitalize text-sm font-medium text-gray-500">Collected Today</h2>
                        </div>
                        <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full text-green-600">
                                    Month
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold my-4">₹{stats.totalMonth}</h1>
                            <h2 className="capitalize text-sm font-medium text-gray-500">Fees (Month)</h2>
                        </div>
                        <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full text-red-600">
                                    Pending
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold my-4">₹{stats.totalPending}</h1>
                            <h2 className="capitalize text-sm font-medium text-gray-500">Total Pending</h2>
                        </div>
                        <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full text-orange-600">
                                    Expenses
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold my-4">₹{stats.totalExpenses}</h1>
                            <h2 className="capitalize text-sm font-medium text-gray-500">Expenses (Month)</h2>
                        </div>
                    </Suspense>
                </div>
                {/* MIDDLE CHARTS */}
                <div className="flex gap-4 flex-col lg:flex-row">
                    {/* COUNT CHART */}
                    <div className="w-full lg:w-1/3 h-[450px]">
                        <CountChartContainer />
                    </div>
                    {/* ATTENDANCE CHART */}
                    <div className="w-full lg:w-2/3 h-[450px]">
                        <AttendanceChartContainer />
                    </div>
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <Announcements />
            </div>
        </div>
    );
};

export default AccountantPage;
