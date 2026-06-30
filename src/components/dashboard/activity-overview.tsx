"use client";

import Link from "next/link";
import { Activity, Clock, MessageSquare, TrendingUp } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { StatusChip } from "@/components/ui/status-chip";

function formatCalls(n: number) {
  return n.toLocaleString("en-IN");
}

function timeSince(epochSecs: number | null | undefined) {
  if (!epochSecs) return "Never";
  const diff = Math.floor(Date.now() / 1000 - epochSecs);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatPeriod(period: string | undefined) {
  if (!period) return "This month";
  const [year, month] = period.split("-");
  if (!year || !month) return "This month";
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function ActivityOverview({ showLink = true }: { showLink?: boolean }) {
  const { site, usage } = useDashboard();
  const calls = usage?.calls ?? 0;
  const lastCallAt = usage?.lastCallAt;
  const period = (usage as { period?: string } | null)?.period;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Conversations</p>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatCalls(calls)}</p>
          <StatusChip variant={calls > 0 ? "live" : "waiting"} className="mt-2">
            {calls > 0 ? "Active" : "No traffic"}
          </StatusChip>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Last seen</p>
          </div>
          <p className="mt-1 text-lg font-bold">{timeSince(lastCallAt)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatPeriod(period)}</p>
        </div>
      </div>

      {calls === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No conversations yet</p>
          <p className="mt-1">
            Add the embed snippet to{" "}
            <span className="font-mono text-foreground">{site?.baseUrl ?? "your store"}</span> and
            ask NINA a product question to see activity here.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
          >
            View embed snippet
          </Link>
        </div>
      ) : null}

      {showLink ? (
        <Link
          href="/dashboard/activity"
          className="flex items-center justify-center gap-2 rounded-full border border-border bg-card py-2.5 text-sm font-semibold text-primary shadow-soft"
        >
          <TrendingUp className="h-4 w-4" />
          Full activity
        </Link>
      ) : null}
    </div>
  );
}

export function ActivityPageContent() {
  const { site, usage, keys, setup } = useDashboard();
  const calls = usage?.calls ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Activity</p>
        </div>
        <h1 className="font-serif text-2xl font-bold">Usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversation volume for <span className="font-medium text-foreground">{site?.name}</span>
        </p>
      </div>

      <ActivityOverview showLink={false} />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Health checklist
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span>Contract configured</span>
            <StatusChip variant={setup.hasContract ? "healthy" : "setup"}>
              {setup.hasContract ? "Yes" : "No"}
            </StatusChip>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>API keys active</span>
            <StatusChip variant={setup.hasKeys ? "healthy" : "missing"}>
              {keys.filter((k) => !k.revoked).length}
            </StatusChip>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>Catalog products</span>
            <StatusChip variant={(site?.productCatalog?.length ?? 0) > 0 ? "healthy" : "missing"}>
              {site?.productCatalog?.length ?? 0}
            </StatusChip>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>Widget traffic</span>
            <StatusChip variant={calls > 0 ? "live" : "waiting"}>
              {calls > 0 ? `${formatCalls(calls)} calls` : "Waiting"}
            </StatusChip>
          </li>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Per-conversation transcripts and action logs are coming in a future release. Today we track
        monthly call volume and last activity time.
      </p>
    </div>
  );
}
