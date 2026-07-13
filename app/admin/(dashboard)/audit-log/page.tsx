import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import { adminCardClass } from "@/lib/admin/styles";

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <AdminPageHeader title="Audit Log" description="Admin əməliyyatlarının qeydiyyatı" />
      <div className={`${adminCardClass} overflow-x-auto`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
              <th className="p-4">Tarix</th>
              <th className="p-4">İstifadəçi</th>
              <th className="p-4">Əməliyyat</th>
              <th className="p-4">Növ</th>
              <th className="p-4">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-neutral-900">
                <td className="p-4 text-neutral-400">
                  {new Date(log.createdAt).toLocaleString("az-AZ")}
                </td>
                <td className="p-4">{log.userEmail ?? "—"}</td>
                <td className="p-4">{log.action}</td>
                <td className="p-4 text-neutral-400">
                  {log.entityType ?? "—"} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="p-4 text-neutral-400">{log.ipAddress ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-neutral-500">
                  Hələ heç bir qeyd yoxdur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
