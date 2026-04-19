import { cn } from "@/lib/utils";
import { Sport, sportLabels } from "@/data/mock";

export const SportBadge = ({
  sport,
  className,
}: {
  sport: Sport;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm border border-primary/40 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest font-mono",
        className
      )}
    >
      {sportLabels[sport]}
    </span>
  );
};
