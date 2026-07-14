import { getTranslations } from "next-intl/server";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export async function generateMetadata() {
  const t = await getTranslations("Auth");
  return { title: t("forgotPasswordMetaTitle") };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
