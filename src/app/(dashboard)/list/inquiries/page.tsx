import { createClient } from "@/lib/supabase/server";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import { ITEM_PER_PAGE } from "@/lib/settings";
import moment from "moment";

const InquiriesListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { page, q, ...vars } = searchParams;
    const p = page ? parseInt(page) : 1;

    const supabase = createClient();

    // URL QUERY PARAMS CONDITION
    let query = supabase
        .from("AdmissionInquiry")
        .select("*", { count: "exact" });

    if (q) {
        query = query.or(`fullName.ilike.%${q}%,motherName.ilike.%${q}%,parentPhone.ilike.%${q}%`);
    }

    const { data, count, error } = await query
        .order("createdAt", { ascending: false })
        .range((p - 1) * ITEM_PER_PAGE, p * ITEM_PER_PAGE - 1);

    if (error) {
        console.error("Error fetching inquiries:", error);
    }

    const role = (await supabase.auth.getUser()).data.user?.user_metadata?.role;

    const columns = [
        {
            header: "Student Info",
            accessor: "fullName",
        },
        {
            header: "Parent Phone",
            accessor: "parentPhone",
            className: "hidden md:table-cell",
        },
        {
            header: "Willing Class",
            accessor: "targetClass",
            className: "hidden md:table-cell",
        },
        {
            header: "Status",
            accessor: "status",
            className: "hidden lg:table-cell",
        },
        {
            header: "Inquiry Date",
            accessor: "createdAt",
            className: "hidden lg:table-cell",
        },
        ...(role === "admin" || role === "reception"
            ? [
                {
                    header: "Actions",
                    accessor: "action",
                },
            ]
            : []),
    ];

    const renderRow = (item: any) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            <td className="flex items-center gap-4 p-4">
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.fullName}</h3>
                    <p className="text-xs text-gray-500">Mother: {item.motherName}</p>
                    <p className="text-xs text-gray-400">{item.city}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.parentPhone}</td>
            <td className="hidden md:table-cell">{item.targetClass}</td>
            <td className="hidden lg:table-cell">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    item.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {item.status}
                </span>
            </td>
            <td className="hidden lg:table-cell">
                {moment(item.createdAt).format("DD-MM-YYYY HH:mm")}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" || role === "reception" ? (
                        <>
                            <FormModal table="inquiry" type="update" data={item} />
                            {role === "admin" && (
                                <FormModal table="inquiry" type="delete" id={item.id} />
                            )}
                        </>
                    ) : null}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Admission Inquiries</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        {(role === "admin" || role === "reception") && (
                            <FormModal table="inquiry" type="create" />
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

export default InquiriesListPage;
