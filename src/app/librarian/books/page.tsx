import { getBooks } from "@/lib/librarianActions";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/Pagination";
import FormModal from "@/components/FormModal";

const BookManagementPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { page, search, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const { data: books, count, error } = await getBooks(p, search);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Books</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    {/* SEARCH */}
                    {/* Reusing TableSearch logic but inline for now or import it */}
                    {/* <TableSearch /> */}

                    <div className="flex items-center gap-4 self-end">
                        <Link href="/librarian" className="text-gray-500 text-sm hover:underline">← Dashboard</Link>
                        {/* Add Button */}
                        <FormModal table="book" type="create" />
                    </div>
                </div>
            </div>

            {/* LIST */}
            <table className="w-full mt-4 text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Accession No</th>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Author</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Rack</th>
                        <th className="px-6 py-3">Copies (Avail/Total)</th>
                        <th className="px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {books && books.map((book: any) => (
                        <tr key={book.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{book.accession_no || "-"}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{book.title}</td>
                            <td className="px-6 py-4">{book.author}</td>
                            <td className="px-6 py-4">{book.category || "-"}</td>
                            <td className="px-6 py-4">{book.rack_no || "-"}</td>
                            <td className="px-6 py-4">
                                <span className={book.available_copies > 0 ? "text-green-600 font-bold" : "text-red-500"}>
                                    {book.available_copies}
                                </span>
                                <span className="text-gray-400"> / {book.total_copies}</span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                                <button className="text-blue-500 hover:underline">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION */}
            <Pagination page={p} count={count || 0} />
        </div>
    );
};

export default BookManagementPage;
