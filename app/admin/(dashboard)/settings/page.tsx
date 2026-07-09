import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { brand } from "@/lib/constants";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Store configuration and preferences"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={`${adminCardClass} p-6`}>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
            Store Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Store Name"
              defaultValue={brand.name}
              className={adminFieldClass}
              readOnly
            />
            <Input
              label="Email"
              defaultValue={brand.email}
              className={adminFieldClass}
              readOnly
            />
            <Input
              label="Phone"
              defaultValue={brand.phone}
              className={adminFieldClass}
              readOnly
            />
            <Textarea
              label="Description"
              defaultValue={brand.description}
              rows={4}
              className={adminFieldClass}
              readOnly
            />
          </div>
        </div>

        <div className={`${adminCardClass} p-6`}>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
            Commerce Settings
          </h2>
          <div className="space-y-4">
            <Input
              label="Default Currency"
              defaultValue="AZN"
              className={adminFieldClass}
              readOnly
            />
            <Input
              label="Low Stock Threshold"
              defaultValue="5"
              className={adminFieldClass}
              readOnly
            />
            <Input
              label="Warehouse"
              defaultValue="main"
              className={adminFieldClass}
              readOnly
            />
          </div>
          <p className="mt-6 text-xs text-neutral-500">
            Advanced settings will be configurable in a future release.
          </p>
        </div>
      </div>
    </div>
  );
}
