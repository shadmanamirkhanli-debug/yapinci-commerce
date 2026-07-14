import { getTranslations } from "next-intl/server";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export async function generateMetadata() {
  const t = await getTranslations("Auth");
  return { title: t("resetPasswordMetaTitle") };
}

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const t = await getTranslations("Auth");

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-md">
        <p className="text-sm text-error">{t("invalidToken")}</p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
