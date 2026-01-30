
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { createClient } from "@/lib/supabase/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";

const LibrarianListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;

    const columns = [
        {
            header: "Info",
            accessor: "info",
        },
        {
            header: "Username",
            accessor: "username",
            className: "hidden md:table-cell",
        },
        {
            header: "Phone",
            accessor: "phone",
            className: "hidden lg:table-cell",
        },
        {
            header: "Address",
            accessor: "address",
            className: "hidden lg:table-cell",
        },
        {
            header: "Actions",
            accessor: "action",
        },
    ];

    const renderRow = (item: any) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            <td className="flex items-center gap-4 p-4">
                <Image
                    src={item.img || "/noAvatar.png"}
                    alt=""
                    width={40}
                    height={40}
                    className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name} {item.surname}</h3>
                    <p className="text-xs text-gray-500">{item?.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.username}</td>
            <td className="hidden md:table-cell">{item.phone}</td>
            <td className="hidden md:table-cell">{item.address}</td>
            <td>
                <div className="flex items-center gap-2">
                    {/* Link to view if needed, or simple buttons */}
                    {role === "admin" && (
                        <>
                            <FormContainer table="librarian" type="update" data={item} />
                            <FormContainer table="librarian" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    const { page, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;
    const from = (p - 1) * ITEM_PER_PAGE;
    const to = from + ITEM_PER_PAGE - 1;

    let query = supabase.from('Librarian').select('*', { count: 'exact' });

    if (queryParams.search) {
        query = query.or(`name.ilike.%${queryParams.search}%,surname.ilike.%${queryParams.search}%`);
    }

    const { data, count, error } = await query.range(from, to);

    if (error) console.error(error);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Librarians</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        {role === "admin" && (
                            <FormContainer table="librarian" type="create" />
                        )}
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={data || []} />
            {/* PAGINATION */}
            <Pagination page={p} count={count || 0} />
        </div>
    );
};

export default LibrarianListPage;
