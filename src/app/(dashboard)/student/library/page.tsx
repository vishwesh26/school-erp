import { getStudentLibraryData } from "@/lib/libraryActions";
import { createClient } from "@/lib/supabase/server";
import LibraryBarcode from "@/components/LibraryBarcode";
import moment from "moment";
import Image from "next/image";

const LibraryPage = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const studentId = user?.id;

    const { data: student } = await supabase.from('Student').select('username').eq('id', studentId).single();

    if (!studentId) {
        return <div className="p-4">Please log in to view library.</div>;
    }

    const { issuedBooks, history, totalFine } = await getStudentLibraryData(studentId);

    const overdueCount = issuedBooks.filter((issue: any) => issue.status === 'OVERDUE').length;

    return (
        <div className="p-4 bg-white rounded-md flex-1 m-4 mt-0 gap-4 flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">My Library</h1>
                <div className="text-sm text-gray-500">{moment().format("MMMM Do YYYY")}</div>
            </div>

            {/* TOP SECTION: ID & STATS */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* BARCODE CARD */}
                <div className="flex-1 bg-lamaSkyLight p-6 rounded-lg flex items-center justify-center">
                    <LibraryBarcode value={student?.username || "NO-ID"} />
                </div>

                {/* STATS */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="bg-lamaYellowLight p-4 rounded-lg flex flex-col justify-between">
                        <span className="text-gray-500 text-sm">Books Issued</span>
                        <span className="text-3xl font-bold text-gray-700">{issuedBooks.length}</span>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg flex flex-col justify-between">
                        <span className="text-gray-500 text-sm">Overdue</span>
                        <span className="text-3xl font-bold text-red-500">{overdueCount}</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg flex flex-col justify-between col-span-2">
                        <span className="text-gray-500 text-sm">Total Fines</span>
                        <span className="text-3xl font-bold text-gray-700">${totalFine.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <hr className="my-2 border-gray-100" />

            {/* CURRENTLY ISSUED */}
            <div>
                <h2 className="text-lg font-semibold mb-3">Currently Issued</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {issuedBooks.length > 0 ? issuedBooks.map((issue: any) => (
                        <div key={issue.id} className={`p-4 rounded-md border border-l-4 shadow-sm ${issue.status === 'OVERDUE' ? 'border-l-red-500 bg-red-50' : 'border-l-green-500 bg-white'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800">{issue.book?.title}</h3>
                                {issue.status === 'OVERDUE' && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Overdue</span>}
                            </div>
                            <p className="text-sm text-gray-500 italic mb-4">{issue.book?.author}</p>
                            <div className="text-sm flex justify-between text-gray-600">
                                <span>Due: {moment(issue.dueDate).format("MMM Do")}</span>
                                <span className={moment(issue.dueDate).isBefore(moment()) ? "text-red-500 font-semibold" : ""}>
                                    {moment(issue.dueDate).fromNow()}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-gray-400 italic">No books currently issued.</div>
                    )}
                </div>
            </div>

            <hr className="my-2 border-gray-100" />

            {/* HISTORY */}
            <div>
                <h2 className="text-lg font-semibold mb-3">Borrowing History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Book Title</th>
                                <th className="px-6 py-3">Issued</th>
                                <th className="px-6 py-3">Returned</th>
                                <th className="px-6 py-3">Fine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map((rec: any) => (
                                <tr key={rec.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{rec.book?.title}</td>
                                    <td className="px-6 py-4">{moment(rec.issueDate).format("MMM Do YYYY")}</td>
                                    <td className="px-6 py-4">{moment(rec.returnDate).format("MMM Do YYYY")}</td>
                                    <td className="px-6 py-4">${rec.fineAmount}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="px-6 py-4 text-center">No history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default LibraryPage;
