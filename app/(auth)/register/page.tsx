import { getTranslations } from "next-intl/server";
import RegisterForm from "@/components/auth/RegisterForm";

export async function generateMetadata() {
  const t = await getTranslations("Auth");
  return { title: t("registerMetaTitle") };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
