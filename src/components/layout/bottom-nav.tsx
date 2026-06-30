"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Home, KeyRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type NavId = "home" | "keys" | "settings";

const ITEMS: { id: NavId; href: string; icon: typeof Home; label: string }[] = [
  { id: "home", href: "/dashboard", icon: Home, label: "Home" },
  { id: "keys", href: "/dashboard/keys", icon: KeyRound, label: "API keys" },
  { id: "settings", href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

function activeId(pathname: string): NavId {
  if (pathname.startsWith("/dashboard/keys")) return "keys";
  if (pathname.startsWith("/dashboard/settings")) return "settings";
  if (pathname.startsWith("/dashboard/contract")) return "home";
  return "home";
}

type Props = {
  showHelp?: boolean;
  className?: string;
};

export function BottomNav({ showHelp = true, className }: Props) {
  const pathname = usePathname();
  const active = activeId(pathname);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-3 px-4 pb-5",
        className,
      )}
    >
      {showHelp ? (
        <Link
          href="https://docs.nina.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-soft"
          aria-label="Help"
        >
          <CircleHelp className="h-5 w-5 text-muted-foreground" />
        </Link>
      ) : null}

      <nav
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 shadow-float"
        aria-label="Main navigation"
      >
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
