import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";

export default function PaymentSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Ödəniş Sistemi"
        description="Ödəniş provayderi və API tənzimləmələri"
      />
      <PaymentSettingsForm />
    </div>
  );
}
