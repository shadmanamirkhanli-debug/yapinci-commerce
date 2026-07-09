import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-md">
        <p className="text-sm text-error">Etibarsız və ya əskik token</p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
