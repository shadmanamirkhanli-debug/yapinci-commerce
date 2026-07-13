import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ShippingSettingsForm from "@/components/admin/ShippingSettingsForm";

export default function ShippingSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Çatdırılma"
        description="Çatdırılma tarifləri və pulsuz limit"
      />
      <ShippingSettingsForm />
    </div>
  );
}
