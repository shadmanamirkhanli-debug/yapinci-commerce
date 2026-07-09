import { adminCardClass } from "@/lib/admin/styles";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className={`${adminCardClass} p-6`}>
      <p className="text-xs tracking-[0.15em] uppercase text-neutral-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-light">{value}</p>
      {hint && <p className="mt-2 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
