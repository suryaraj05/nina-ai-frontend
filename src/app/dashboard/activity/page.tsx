"use client";

import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityPageContent } from "@/components/dashboard/activity-overview";
import { DashboardLogin } from "@/components/dashboard/dashboard-login";
import { useDashboard } from "@/components/dashboard/dashboard-provider";

export default function ActivityPage() {
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
      <ActivityPageContent />
    </AppShell>
  );
}
