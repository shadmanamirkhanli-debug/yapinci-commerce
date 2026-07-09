import { adminCardClass } from "@/lib/admin/styles";

type SalesChartProps = {
  data: { label: string; value: number }[];
};

export default function SalesChart({ data }: SalesChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={`${adminCardClass} p-6`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            Sales Overview
          </h2>
          <p className="mt-1 text-xs text-neutral-500">Last 7 days</p>
        </div>
      </div>
      <div className="flex h-48 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t bg-white/90 transition-all"
              style={{ height: `${(item.value / max) * 100}%`, minHeight: "8px" }}
              title={`${item.value} AZN`}
            />
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
