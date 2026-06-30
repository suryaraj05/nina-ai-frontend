"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardLogin } from "@/components/dashboard/dashboard-login";
import { useDashboard } from "@/components/dashboard/dashboard-provider";

export default function SettingsPage() {
  const { token, site, loading } = useDashboard();

  if (loading) return null;

  if (!token || !site) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardLogin />
      </div>
    );
  }

  return (
    <AppShell backHref="/dashboard">
      <div className="space-y-4 py-8">
        <h1 className="font-serif text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Site: <span className="font-medium text-foreground">{site.name}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Base URL: <span className="font-mono text-foreground">{site.baseUrl}</span>
        </p>
        <p className="text-sm text-muted-foreground">Allowed origins and LLM config — coming soon.</p>
      </div>
    </AppShell>
  );
}
