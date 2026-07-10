import { cn } from "@/lib/utils/cn";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        className
      )}
    >
      <p className="text-eyebrow text-muted">{eyebrow}</p>
      <h2 className="text-display mt-4 text-2xl text-primary sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed text-muted sm:text-base",
            align === "center" ? "mx-auto max-w-xl" : "max-w-lg"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
