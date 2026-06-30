import { cn } from "@/lib/utils";
import { Bot, KeyRound, ShoppingBag, Sparkles } from "lucide-react";

const RAIL = [
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "contract", label: "Contract", icon: Bot },
  { id: "key", label: "API key", icon: KeyRound },
  { id: "live", label: "Live", icon: Sparkles },
] as const;

type RailId = (typeof RAIL)[number]["id"];

function indexOf(id: RailId) {
  return RAIL.findIndex((r) => r.id === id);
}

export function JourneyRail({ active }: { active: RailId }) {
  const activeIdx = indexOf(active);

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 shadow-sm"
      aria-label="Setup journey"
    >
      {RAIL.map((item, i) => {
        const Icon = item.icon;
        const done = i < activeIdx;
        const current = i === activeIdx;
        return (
          <div key={item.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                done && "bg-[#f0fdf6] text-[#1aab6d]",
                current && "bg-[#eff4ff] text-[#5b8cff] ring-2 ring-[#5b8cff]/30",
                !done && !current && "text-muted-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </div>
            {i < RAIL.length - 1 && (
              <div
                className={cn(
                  "hidden h-px w-6 sm:block",
                  i < activeIdx ? "bg-[#1aab6d]" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
