"use client";

import { useRouter, useSearchParams } from "next/navigation";

const AttendanceDateFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentDate = searchParams.get("date") || "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set("date", value);
        } else {
            params.delete("date");
        }
        router.push(`${window.location.pathname}?${params}`);
    };

    return (
        <div className="flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 h-8">
            <label htmlFor="attendance-date" className="text-gray-500 font-medium whitespace-nowrap">Filter Date:</label>
            <input
                id="attendance-date"
                type="date"
                value={currentDate}
                onChange={handleChange}
                className="bg-transparent outline-none cursor-pointer"
            />
        </div>
    );
};

export default AttendanceDateFilter;
