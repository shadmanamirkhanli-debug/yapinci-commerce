import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex justify-end px-6 py-6 lg:px-10">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}
