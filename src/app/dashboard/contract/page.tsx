"use client";

import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ContractManager } from "@/components/dashboard/contract-manager";
import { DashboardLogin } from "@/components/dashboard/dashboard-login";
import { useDashboard } from "@/components/dashboard/dashboard-provider";

export default function ContractPage() {
  const { token, site, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !site) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardLogin />
      </div>
    );
  }

  return (
    <AppShell backHref="/dashboard" showAccount showBottomHelp>
      <div className="space-y-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Agent contract</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage <span className="font-mono">agent.json</span> — the actions NINA can run on your
            store.
          </p>
        </div>
        <ContractManager />
      </div>
    </AppShell>
  );
}
