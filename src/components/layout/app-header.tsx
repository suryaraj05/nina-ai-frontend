import Link from "next/link";
import { ArrowLeft, Bell, User } from "lucide-react";
import { NinaLogo } from "@/components/brand/nina-logo";
import { OrgPill } from "@/components/brand/org-pill";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  orgName?: string;
  orgPlaceholder?: string;
  backHref?: string;
  showNotifications?: boolean;
  className?: string;
};

export function AppHeader({
  orgName,
  orgPlaceholder = "Your store",
  backHref,
  showNotifications = false,
  className,
}: Props) {
  const pillLabel = orgName?.trim() || orgPlaceholder;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center">
          {backHref ? (
            <Link
              href={backHref}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          ) : (
            <OrgPill
              name={pillLabel}
              className={cn(!orgName?.trim() && "opacity-70")}
            />
          )}
        </div>

        <div className="shrink-0">
          <NinaLogo href="/" size="md" />
        </div>

        <div className="flex flex-1 items-center justify-end gap-1">
          {showNotifications ? (
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full border border-border bg-card"
            aria-label="Account"
          >
            <User className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
