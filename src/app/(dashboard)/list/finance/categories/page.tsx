import { createClient } from "@/lib/supabase/server";
import { getFeeCategories } from "@/lib/accountantActions";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Link from "next/link";

const FeeCategoryListPage = async () => {
    const { data, error } = await getFeeCategories();

    const supabase = createClient();
    const { data: grades } = await supabase.from('Grade').select('*').order('level', { ascending: true });

    const columns = [
        {
            header: "Category Name",
            accessor: "name",
        },
        {
            header: "Amount",
            accessor: "baseAmount",
            className: "hidden md:table-cell",
        },
        {
            header: "Grade",
            accessor: "grade",
            className: "hidden md:table-cell",
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
            <td className="flex items-center gap-4 p-4 font-semibold">{item.name}</td>
            <td className="hidden md:table-cell">₹{item.baseAmount}</td>
            <td className="hidden md:table-cell">
                {item.grade?.level ? `Grade ${item.grade.level}` : "All Grades"}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    <FormModal
                        table="feeCategory"
                        type="update"
                        data={item}
                        relatedData={{ grades }}
                    />
                    <FormModal table="feeCategory" type="delete" id={item.id} />
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/list/finance" className="text-blue-500 hover:underline text-sm mb-2 block">← Back to Finance</Link>
                    <h1 className="hidden md:block text-lg font-semibold">Fee Categories</h1>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <FormModal table="feeCategory" type="create" relatedData={{ grades }} />
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={data || []} />
        </div>
    );
};

export default FeeCategoryListPage;
