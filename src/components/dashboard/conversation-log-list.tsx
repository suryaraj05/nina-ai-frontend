"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareQuote, RefreshCw } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { getErrorMessage, ninaFetch } from "@/lib/api-client";
import type { ConversationLogEntry } from "@/lib/types";

function formatWhen(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shortSession(id: string) {
  if (!id) return "—";
  return id.length > 14 ? id.slice(0, 10) + "…" : id;
}

export function ConversationLogList() {
  const { site } = useDashboard();
  const [logs, setLogs] = useState<ConversationLogEntry[]>([]);
  const [retentionDays, setRetentionDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!site) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ninaFetch<{ logs: ConversationLogEntry[]; retentionDays?: number }>(
        `/v1/auth/sites/${site.id}/conversations?limit=50`,
        { auth: "dashboard" },
      );
      if (!res.ok) {
        setError(getErrorMessage(res));
        setLogs([]);
        return;
      }
      setLogs(res.data?.logs ?? []);
      setRetentionDays(res.data?.retentionDays ?? 7);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!site) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Conversation log</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => void load()}
          disabled={loading}
          aria-label="Refresh logs"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Last {retentionDays} days · shopper messages redacted for PII · newest first
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      {!loading && logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No logged turns yet. Conversations appear here after shoppers use the widget.
        </p>
      ) : null}

      <ul className="space-y-3">
        {logs.map((log) => (
          <li
            key={log.id || `${log.turnId}-${log.createdAt}`}
            className="rounded-xl border border-border bg-muted/30 p-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{formatWhen(log.createdAt)}</span>
              <div className="flex flex-wrap gap-1">
                {log.grounded ? (
                  <StatusChip variant="healthy">Grounded</StatusChip>
                ) : (
                  <StatusChip variant="setup">Unverified</StatusChip>
                )}
                {log.productCount != null && log.productCount > 0 ? (
                  <StatusChip variant="live">{log.productCount} products</StatusChip>
                ) : null}
              </div>
            </div>
            <p className="mt-2 font-medium text-foreground">
              <span className="text-muted-foreground">Shopper:</span> {log.userMessage || "—"}
            </p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-medium text-foreground">NINA:</span> {log.reply || "—"}
            </p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              {log.actionCalled ? `action: ${log.actionCalled}` : "no action"}
              {log.sessionId ? ` · session ${shortSession(log.sessionId)}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
