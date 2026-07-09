type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-light tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-neutral-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
