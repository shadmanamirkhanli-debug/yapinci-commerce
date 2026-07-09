import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import Spinner from "@/components/ui/Spinner";

export const metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16">
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Spinner />
          </div>
        }
      >
        <LoginForm
          loginType="admin"
          title="Admin Girişi"
          subtitle="Yalnız admin istifadəçilər üçün"
          defaultCallbackUrl="/admin"
          showForgotPassword={false}
        />
      </Suspense>
    </div>
  );
}
