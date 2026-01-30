import { getLibrarianStats } from "@/lib/librarianActions";
import Link from "next/link";

const LibrarianDashboard = async () => {
    const { totalBooks, availableBooks, issuedToday, overdue } = await getLibrarianStats();

    const statCards = [
        { title: "Total Books", value: totalBooks, color: "bg-lamaPurpleLight" },
        { title: "Available", value: availableBooks, color: "bg-lamaYellowLight" },
        { title: "Issued Today", value: issuedToday, color: "bg-lamaSkyLight" },
        { title: "Overdue", value: overdue, color: "bg-red-100" },
    ];

    const modules = [
        { title: "Manage Books", href: "/librarian/books", icon: "📚", desc: "Add or edit books" },
        { title: "Issue Book", href: "/librarian/issue", icon: "📤", desc: "Scan and issue" },
        { title: "Return Book", href: "/librarian/return", icon: "📥", desc: "Process returns" },
        { title: "History", href: "/librarian/history", icon: "📜", desc: "View records" },
    ];

    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">
            {/* LEFT */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
                {/* STATS */}
                <div className="flex gap-4 justify-between flex-wrap">
                    {statCards.map((card) => (
                        <div key={card.title} className={`rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px] ${card.color} shadow-sm`}>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">2025</span>
                                <span className="text-[10px] text-gray-500">More</span>
                            </div>
                            <h1 className="text-2xl font-semibold my-4">{card.value}</h1>
                            <h2 className="capitalize text-sm font-medium text-gray-500">{card.title}</h2>
                        </div>
                    ))}
                </div>

                {/* MODULES NAVIGATION */}
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((mod) => (
                        <Link href={mod.href} key={mod.title} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border md:border-none flex items-center gap-4">
                            <div className="text-4xl">{mod.icon}</div>
                            <div>
                                <h3 className="font-bold text-gray-700">{mod.title}</h3>
                                <p className="text-sm text-gray-400">{mod.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* RIGHT */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <div className="bg-white p-4 rounded-md shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">Librarian Profile</h2>
                    <p className="text-gray-500 text-sm mb-6">Welcome back to the library management system.</p>
                    <Link
                        href="/logout"
                        className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors inline-block"
                    >
                        Sign Out
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LibrarianDashboard;
