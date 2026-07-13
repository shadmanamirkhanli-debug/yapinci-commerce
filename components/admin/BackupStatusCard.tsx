"use client";

import { useEffect, useState } from "react";
import { adminCardClass } from "@/lib/admin/styles";

type BackupInfo = {
  name: string;
  sizeBytes: number;
  createdAt: string;
};

type BackupStatus = {
  isHealthy: boolean;
  totalBackups: number;
  latest: BackupInfo | null;
  backups: BackupInfo[];
};

function formatSize(bytes: number): string {
  return (bytes / 1024).toFixed(1) + " KB";
}

export default function BackupStatusCard() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/backup-status")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setStatus(result.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`${adminCardClass} p-6`}>
      <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
        Gündəlik Backup Statusu
      </h2>

      {loading && <p className="text-sm text-neutral-500">Yüklənir...</p>}

      {!loading && status && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                status.isHealthy ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm">
              {status.isHealthy
                ? "Backup sistemi sağlamdır"
                : "Diqqət: son 30 saatda backup alınmayıb"}
            </span>
          </div>

          {status.latest ? (
            <div className="text-sm text-neutral-400">
              <p>
                Son backup:{" "}
                {new Date(status.latest.createdAt).toLocaleString("az-AZ")}
              </p>
              <p>Ölçü: {formatSize(status.latest.sizeBytes)}</p>
              <p>Ümumi saxlanılan backup sayı: {status.totalBackups}</p>
            </div>
          ) : (
            <p className="text-sm text-red-400">Heç bir backup tapılmadı</p>
          )}
        </div>
      )}

      {!loading && !status && (
        <p className="text-sm text-red-400">Status yüklənə bilmədi</p>
      )}
    </div>
  );
}
