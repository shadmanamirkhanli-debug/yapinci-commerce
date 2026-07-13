import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SettingsForm from "@/components/admin/SettingsForm";
import BackupStatusCard from "@/components/admin/BackupStatusCard";
import { getStoreSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Mağaza tənzimləmələri və seçimlər"
      />
      <SettingsForm
        initialData={{
          storeName: settings.storeName,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          instagram: settings.instagram ?? "",
          facebook: settings.facebook ?? "",
          tiktok: settings.tiktok ?? "",
          whatsapp: settings.whatsapp ?? "",
          logoUrl: settings.logoUrl ?? "",
          faviconUrl: settings.faviconUrl ?? "",
        }}
      />
      <div className="mt-6 max-w-3xl">
        <BackupStatusCard />
      </div>
    </div>
  );
}
