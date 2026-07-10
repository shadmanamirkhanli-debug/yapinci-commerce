import { cn } from "@/lib/utils/cn";

type YapinciLogoMarkProps = {
  className?: string;
};

export default function YapinciLogoMark({ className }: YapinciLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M50 88V48M50 48L24 24L18 35M50 48L76 24L82 35"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
