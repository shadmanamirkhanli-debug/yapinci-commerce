import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/auth/LoginForm";
import Spinner from "@/components/ui/Spinner";

export async function generateMetadata() {
  const t = await getTranslations("Auth");
  return { title: t("loginMetaTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("Auth");

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
        title={t("loginTitle")}
        subtitle={t("loginSubtitle")}
        showRegisterLink
      />
    </Suspense>
  );
}
