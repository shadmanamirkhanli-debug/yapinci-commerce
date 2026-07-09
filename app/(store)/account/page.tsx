import { auth } from "@/auth";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const session = await auth();

  return (
    <Container as="section" className="py-20 lg:py-28">
      <SectionHeader
        eyebrow="Hesab"
        title="Hesabım"
        description="Şəxsi məlumatlarınızı və sifarişlərinizi idarə edin"
        className="mb-10"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="elevated" padding="lg" className="lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
            Profil Məlumatları
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Ad</dt>
              <dd className="mt-1 text-foreground">{session?.user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">E-poçt</dt>
              <dd className="mt-1 text-foreground">{session?.user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Rol</dt>
              <dd className="mt-1 uppercase tracking-wider text-foreground">
                {session?.user?.role}
              </dd>
            </div>
          </dl>
        </Card>

        <Card variant="filled" padding="lg">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
            Sifarişlər
          </h2>
          <p className="mt-4 text-sm text-muted">
            Sifariş tarixçənizi və fakturaları görüntüləyin.
          </p>
          <div className="mt-6">
            <Link
              href="/account/orders"
              className="text-xs font-medium uppercase tracking-[0.15em] text-accent hover:underline"
            >
              Sifarişlərim →
            </Link>
          </div>
        </Card>

        <Card variant="filled" padding="lg">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
            Sessiya
          </h2>
          <p className="mt-4 text-sm text-muted">
            Hesabınızdan təhlükəsiz çıxış edin.
          </p>
          <div className="mt-6">
            <LogoutButton callbackUrl="/login" />
          </div>
        </Card>
      </div>
    </Container>
  );
}
