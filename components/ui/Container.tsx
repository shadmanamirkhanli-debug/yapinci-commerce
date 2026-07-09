import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};

export default function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-7xl px-6 lg:px-10", className)}
    >
      {children}
    </Tag>
  );
}
