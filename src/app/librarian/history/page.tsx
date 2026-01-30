
import { createClient } from "@/lib/supabase/server";
import { getLibrarianHistory } from "@/lib/librarianActions";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";

const HistoryPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { page, search } = searchParams;
    const p = page ? parseInt(page) : 1;
    const ITEM_PER_PAGE = 10;
    const from = (p - 1) * ITEM_PER_PAGE;
    const to = from + ITEM_PER_PAGE - 1;

    const supabase = createClient();

    // Query BookIssue + join Book and Student
    // let query = supabase.from('BookIssue')
    //     .select('*, book:Book(title), student:Student(name, surname)', { count: 'exact' })
    //     .order('issueDate', { ascending: false });

    // const { data: history, count } = await query.range(from, to);

    const { data: history, count } = await getLibrarianHistory(p);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Library History</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    {/* <TableSearch /> */}
                </div>
            </div>

            <table className="w-full mt-4 text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Book</th>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Issued</th>
                        <th className="px-6 py-3">Returned</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Fine</th>
                    </tr>
                </thead>
                <tbody>
                    {history && history.map((rec: any) => (
                        <tr key={rec.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{rec.book?.title}</td>
                            <td className="px-6 py-4">{rec.student?.name} {rec.student?.surname}</td>
                            <td className="px-6 py-4">{new Date(rec.issueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{rec.returnDate ? new Date(rec.returnDate).toLocaleDateString() : "-"}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs text-white 
                                    ${rec.status === 'ISSUED' ? 'bg-yellow-400' :
                                        rec.status === 'RETURNED' ? 'bg-green-400' : 'bg-red-400'}`}>
                                    {rec.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">${rec.fineAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination page={p} count={count || 0} />
        </div>
    );
};

export default HistoryPage;
