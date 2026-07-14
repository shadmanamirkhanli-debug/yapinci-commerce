import { cn } from "@/lib/utils/cn";

type CarpetPatternProps = {
  /**
   * Unique per usage site — becomes the SVG <pattern> id. Required because
   * multiple instances of this component can be on the same page (several
   * homepage sections), and duplicate SVG ids break `url(#id)` references.
   */
  name: string;
  className?: string;
};

/**
 * Original geometric line-art ornament in the vocabulary of traditional
 * Azerbaijani carpet motifs (stepped diamonds, hooked medallions, chevron
 * borders) — drawn from scratch, not traced from any specific rug or photo.
 *
 * Purely decorative background texture: absolutely positioned, behind
 * content (-z-10), non-interactive, and hidden from assistive tech. Opacity
 * and tile geometry are both tuned here so every usage stays in sync.
 *
 * The parent element must be `relative` (and ideally `overflow-hidden`) for
 * this to lay out correctly.
 */
export default function CarpetPattern({ name, className }: CarpetPatternProps) {
  const patternId = `carpet-motif-${name}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 h-full w-full text-accent",
        "opacity-[0.03] sm:opacity-[0.05]",
        className
      )}
    >
      <defs>
        <pattern
          id={patternId}
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* chevron border, top */}
            <path d="M0,18 L15,8 L30,18 L45,8 L60,18 L75,8 L90,18 L105,8 L120,18" />
            {/* chevron border, bottom (mirrored, same phase for seamless vertical tiling) */}
            <path d="M0,102 L15,112 L30,102 L45,112 L60,102 L75,112 L90,102 L105,112 L120,102" />
            {/* stepped-diamond medallion */}
            <path d="M60,35 L70,45 L70,50 L78,58 L78,62 L70,70 L70,75 L60,85 L50,75 L50,70 L42,62 L42,58 L50,50 L50,45 Z" />
            {/* medallion core */}
            <path d="M60,52 L66,60 L60,68 L54,60 Z" />
            {/* hooked flourishes, top point */}
            <path d="M55,35 L52,35 L52,30" />
            <path d="M65,35 L68,35 L68,30" />
            {/* hooked flourishes, bottom point */}
            <path d="M55,85 L52,85 L52,90" />
            <path d="M65,85 L68,85 L68,90" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
