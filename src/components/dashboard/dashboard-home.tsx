"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronRight,
  Code2,
  FileText,
  KeyRound,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityOverview } from "@/components/dashboard/activity-overview";
import { DashboardLogin } from "@/components/dashboard/dashboard-login";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { getCachedPublishableKey } from "@/lib/session";

function formatCalls(n: number) {
  return n.toLocaleString("en-IN");
}

function buildSnippet(siteId: string, apiKey: string) {
  const api = (process.env.NEXT_PUBLIC_NINA_API_URL ?? "http://127.0.0.1:8787").replace(
    /\/$/,
    "",
  );
  return `<script src="${api}/sdk/nina-bootstrap.js"\n        data-site-id="${siteId}"\n        data-api="${api}"\n        data-api-key="${apiKey}"\n        defer></script>`;
}

export function DashboardHome() {
  const { token, org, site, keys, usage, setup, loading, refresh } = useDashboard();
  const [snippetOpen, setSnippetOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !site || !org) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardLogin />
      </div>
    );
  }

  const orgName = site.name;
  const calls = usage?.calls ?? 0;
  const pubKey =
    getCachedPublishableKey(site.id) ??
    (() => {
      const k = keys.find((key) => !key.revoked && key.kind === "pk");
      return k ? `${k.prefix}…` : null;
    })();

  if (!setup.isLive) {
    return (
      <AppShell orgName={orgName} showNotifications showAccount showBottomHelp>
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Dashboard home
            </p>
            <h1 className="font-serif text-2xl font-bold">{org.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your merchant environment is being initialized. Complete setup to go live.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-terracotta p-4 text-terracotta-foreground shadow-soft">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Finish setup</p>
              <p className="mt-0.5 text-sm opacity-90">
                {!setup.hasContract
                  ? "Upload your contract or auto-generate from your API."
                  : "Add the embed snippet to your storefront."}
              </p>
              <Link
                href="/onboarding"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-card px-4 text-sm font-semibold text-foreground hover:bg-card/90"
              >
                Resume
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Live sessions
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums">{calls}</p>
              <StatusChip variant={calls > 0 ? "live" : "waiting"} className="mt-2">
                {calls > 0 ? "Live" : "No data"}
              </StatusChip>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contract actions
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums">{setup.actionCount}</p>
              <StatusChip variant={setup.hasContract ? "healthy" : "setup"} className="mt-2">
                {setup.hasContract ? "Configured" : "Pending"}
              </StatusChip>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                API keys
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums">
                {keys.filter((k) => !k.revoked).length}
              </p>
              <StatusChip variant={setup.hasKeys ? "healthy" : "missing"} className="mt-2">
                {setup.hasKeys ? "Active" : "Missing"}
              </StatusChip>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Plan
              </p>
              <p className="mt-1 text-xl font-bold capitalize">{site.plan ?? usage?.plan ?? "free"}</p>
              <StatusChip variant="plan" className="mt-2">
                {site.plan ?? "free"}
              </StatusChip>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border bg-muted px-4 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Initialization log
              </p>
            </div>
            <ul>
              {[
                {
                  icon: KeyRound,
                  title: "API keys",
                  desc: setup.hasKeys ? "Publishable key issued" : "Issue a publishable key",
                  href: "/dashboard/keys",
                  status: setup.hasKeys ? ("healthy" as const) : ("setup" as const),
                },
                {
                  icon: FileText,
                  title: "Contract",
                  desc: setup.hasContract
                    ? `${setup.actionCount} actions configured`
                    : "Upload agent.json",
                  href: "/dashboard/contract",
                  status: setup.hasContract ? ("healthy" as const) : ("setup" as const),
                },
                {
                  icon: AlertCircle,
                  title: "Usage",
                  desc: calls > 0 ? `${formatCalls(calls)} conversations` : "No conversations yet",
                  href: "/dashboard",
                  status: calls > 0 ? ("live" as const) : ("missing" as const),
                },
                {
                  icon: Code2,
                  title: "Embed snippet",
                  desc: "Add script to storefront",
                  href: "/dashboard",
                  status: "missing" as const,
                },
              ].map((row, i, arr) => {
                const Icon = row.icon;
                return (
                  <li key={row.title}>
                    <Link
                      href={row.href}
                      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{row.title}</p>
                        <p className="text-xs text-muted-foreground">{row.desc}</p>
                      </div>
                      <StatusChip variant={row.status}>{row.status}</StatusChip>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    {i < arr.length - 1 ? <div className="mx-4 border-b border-border" /> : null}
                  </li>
                );
              })}
            </ul>
          </div>

          <Button variant="outline" className="w-full rounded-full" onClick={() => void refresh()}>
            Refresh status
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell orgName={orgName} showNotifications showAccount showBottomHelp>
      <div className="space-y-4">
        <StatusChip variant="plan">{site.plan ?? "free"}</StatusChip>

        <ActivityOverview showLink />

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">Contract</p>
            <Link href="/dashboard/contract" className="text-sm font-semibold text-primary">
              Manage
            </Link>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums">{setup.actionCount}</p>
          <p className="text-sm text-muted-foreground">Actions available</p>
          <StatusChip variant="healthy" className="mt-2">
            Configured
          </StatusChip>
        </div>

        <button
          type="button"
          onClick={() => setSnippetOpen(!snippetOpen)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
        >
          <div className="flex items-center gap-3">
            <Code2 className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">API embed snippet</span>
          </div>
          <span className="text-sm text-primary">{snippetOpen ? "Hide" : "Show snippet"}</span>
        </button>

        {snippetOpen ? (
          <pre className="overflow-x-auto rounded-2xl bg-code p-4 font-mono text-xs text-slate-300">
            {buildSnippet(
              site.id,
              getCachedPublishableKey(site.id) ?? "(issue a key in API keys)",
            )}
          </pre>
        ) : null}

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="mb-2 text-sm text-muted-foreground">Publishable key prefix</p>
          <p className="font-mono text-sm">{pubKey ?? "—"}</p>
        </div>
      </div>
    </AppShell>
  );
}
