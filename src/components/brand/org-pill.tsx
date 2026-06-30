import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  className?: string;
};

export function OrgPill({ name, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex max-w-[140px] items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground",
        className,
      )}
    >
      <Store className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">{name}</span>
    </div>
  );
}
