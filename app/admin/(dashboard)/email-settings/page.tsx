import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EmailSettingsForm from "@/components/admin/EmailSettingsForm";

export default function EmailSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="E-mail Bildirişləri"
        description="SMTP tənzimləmələri və bildiriş seçimləri"
      />
      <EmailSettingsForm />
    </div>
  );
}
