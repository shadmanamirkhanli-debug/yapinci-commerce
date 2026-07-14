import { auth } from "@/auth";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LogoutButton from "@/components/auth/LogoutButton";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export async function generateMetadata() {
  const t = await getTranslations("Account");
  return { title: t("metaTitle") };
}

export default async function AccountPage() {
  const session = await auth();
  const t = await getTranslations("Account");

  return (
    <Container as="section" className="py-20 lg:py-28">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="elevated" padding="lg" className="lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
            {t("profileHeading")}
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-muted">{t("nameLabel")}</dt>
              <dd className="mt-1 text-foreground">{session?.user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("emailLabel")}</dt>
              <dd className="mt-1 text-foreground">{session?.user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("roleLabel")}</dt>
              <dd className="mt-1 uppercase tracking-wider text-foreground">
                {session?.user?.role}
              </dd>
            </div>
          </dl>
        </Card>

        <Card variant="filled" padding="lg">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
            {t("ordersHeading")}
          </h2>
          <p className="mt-4 text-sm text-muted">
            {t("ordersDescription")}
          </p>
          <div className="mt-6">
            <Link
              href="/account/orders"
              className="text-xs font-medium uppercase tracking-[0.15em] text-accent hover:underline"
            >
              {t("myOrders")} →
            </Link>
          </div>
        </Card>

        <Card variant="filled" padding="lg">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
            {t("sessionHeading")}
          </h2>
          <p className="mt-4 text-sm text-muted">
            {t("sessionDescription")}
          </p>
          <div className="mt-6">
            <LogoutButton callbackUrl="/login" label={t("logoutCta")} />
          </div>
        </Card>
      </div>
    </Container>
  );
}
