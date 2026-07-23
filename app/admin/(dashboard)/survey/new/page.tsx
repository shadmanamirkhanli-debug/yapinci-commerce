import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SurveyDesignForm from "@/components/admin/SurveyDesignForm";

export default function NewSurveyDesignPage() {
  return (
    <div>
      <AdminPageHeader
        title="Upload Design"
        description="Add a new design for visitor feedback"
      />
      <SurveyDesignForm />
    </div>
  );
}
