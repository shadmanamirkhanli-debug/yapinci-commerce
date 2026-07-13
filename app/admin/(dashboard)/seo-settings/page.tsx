import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SeoSettingsForm from "@/components/admin/SeoSettingsForm";

export default function SeoSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="SEO"
        description="Meta teqlar, Open Graph və axtarış motoru tənzimləmələri"
      />
      <SeoSettingsForm />
    </div>
  );
}
