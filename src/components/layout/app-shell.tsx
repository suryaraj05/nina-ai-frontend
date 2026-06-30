import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  orgName?: string;
  orgPlaceholder?: string;
  backHref?: string;
  showBottomHelp?: boolean;
  showNotifications?: boolean;
  showAccount?: boolean;
  showBottomNav?: boolean;
  className?: string;
};

export function AppShell({
  children,
  orgName,
  orgPlaceholder,
  backHref,
  showBottomHelp = true,
  showNotifications,
  showAccount = false,
  showBottomNav = true,
  className,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        orgName={orgName}
        orgPlaceholder={orgPlaceholder}
        backHref={backHref}
        showNotifications={showNotifications}
        showAccount={showAccount}
      />
      <main className={cn("mx-auto max-w-lg px-4 pb-28 pt-4", className)}>{children}</main>
      {showBottomNav ? <BottomNav showHelp={showBottomHelp} /> : null}
    </div>
  );
}
