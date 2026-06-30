import { cn } from "@/lib/utils";

type Variant = "live" | "setup" | "missing" | "healthy" | "waiting" | "delivered" | "plan";

const styles: Record<Variant, string> = {
  live: "bg-[#d1fae5] text-[#18794e]",
  setup: "bg-[#f5d9ce] text-[#a35841]",
  missing: "bg-secondary text-muted-foreground",
  healthy: "bg-[#d1fae5] text-[#18794e]",
  waiting: "bg-[#fce7e7] text-[#c0392b]",
  delivered: "bg-[#d1fae5] text-[#18794e]",
  plan: "bg-accent text-accent-foreground",
};

type Props = {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
};

export function StatusChip({ variant, children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
