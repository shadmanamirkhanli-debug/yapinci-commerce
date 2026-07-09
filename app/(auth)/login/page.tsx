import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import Spinner from "@/components/ui/Spinner";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <Spinner />
        </div>
      }
    >
      <LoginForm
        loginType="customer"
        title="Daxil Ol"
        subtitle="Hesabınıza daxil olun"
        showRegisterLink
      />
    </Suspense>
  );
}
