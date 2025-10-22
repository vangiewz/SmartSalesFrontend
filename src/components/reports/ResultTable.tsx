type Props = {
  columns: string[];
  rows: Record<string, any>[];
  meta: { intent: string; start: string; end: string; filters: Record<string, any> };
};

export default function ResultTable({ columns, rows, meta }: Props) {
  if (!rows.length) {
    return <div className="text-center text-gray-500 py-10">No hay datos para los parámetros seleccionados.</div>;
  }
  return (
    <div className="bg-white rounded-2xl shadow border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">
        <span className="font-semibold">Intent:</span> {meta.intent}
        <span className="mx-2">•</span>
        <span className="font-semibold">Rango:</span> {meta.start} → {meta.end}
        {Object.keys(meta.filters||{}).length>0 && (
          <>
            <span className="mx-2">•</span>
            <span className="font-semibold">Filtros:</span>{" "}
            {Object.entries(meta.filters).map(([k,v])=>`${k}: ${v}`).join(", ")}
          </>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(c=>(
                <th key={c} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((r,i)=>(
              <tr key={i} className="hover:bg-gray-50">
                {columns.map(c=>(
                  <td key={c} className="px-4 py-2 text-sm text-gray-800">{fmt(r[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmt(v:any){
  if (v==null) return "—";
  if (typeof v === "number") return new Intl.NumberFormat("es-AR",{maximumFractionDigits:2}).format(v);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0,10);
  return String(v);
}
