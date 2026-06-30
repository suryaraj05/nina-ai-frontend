"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Activity, FileText, KeyRound, LogOut, Settings, User } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccountMenu() {
  const { org, site, logout } = useDashboard();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-full border border-border bg-card"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-4 w-4 text-muted-foreground" />
      </Button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-float",
          )}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{org?.name ?? "Your organization"}</p>
            <p className="truncate text-xs text-muted-foreground">{site?.name ?? "Site"}</p>
          </div>
          <nav className="p-1">
            {[
              { href: "/dashboard/activity", icon: Activity, label: "Activity" },
              { href: "/dashboard/settings", icon: Settings, label: "Settings" },
              { href: "/dashboard/contract", icon: FileText, label: "Agent contract" },
              { href: "/dashboard/keys", icon: KeyRound, label: "API keys" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-muted"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
