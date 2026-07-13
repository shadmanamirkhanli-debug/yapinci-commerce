import { readdir, stat } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiSuccess } from "@/lib/api-response";

const BACKUP_DIR = "/opt/backups/database";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const files = await readdir(BACKUP_DIR);
    const sqlFiles = files.filter((file) => file.endsWith(".sql.gz"));

    const details = await Promise.all(
      sqlFiles.map(async (file) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await stat(filePath);
        return {
          name: file,
          sizeBytes: stats.size,
          createdAt: stats.mtime,
        };
      })
    );

    details.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const latest = details[0] ?? null;
    const hoursSinceLastBackup = latest
      ? (Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60)
      : null;

    const isHealthy = hoursSinceLastBackup !== null && hoursSinceLastBackup < 30;

    return apiSuccess({
      isHealthy,
      totalBackups: details.length,
      latest,
      backups: details.slice(0, 10),
    });
  } catch {
    return apiSuccess({
      isHealthy: false,
      totalBackups: 0,
      latest: null,
      backups: [],
      error: "Backup qovluğu tapılmadı",
    });
  }
}
