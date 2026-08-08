const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100/90 shadow-2xs mt-4 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200/70 bg-slate-50/80 text-gray-500 uppercase text-[11px] font-black tracking-wider">
            {columns.map((col) => (
              <th key={col.accessor} className={`py-3.5 px-4 ${col.className || ""}`}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/80">{data.map((item) => renderRow(item))}</tbody>
      </table>
    </div>
  );
};

export default Table;
