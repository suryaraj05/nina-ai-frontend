"use client";

import { useState } from "react";
import { BookOpen, Copy, EyeOff, Loader2, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardLogin } from "@/components/dashboard/dashboard-login";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { getErrorMessage, ninaFetch } from "@/lib/api-client";
import { setCachedPublishableKey } from "@/lib/session";
import { cn } from "@/lib/utils";

function formatCreated(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApiKeysPage() {
  const { token, site, keys, loading, refresh } = useDashboard();
  const [copied, setCopied] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

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

  const activeKeys = keys.filter((k) => !k.revoked);
  const publishable = activeKeys.filter((k) => k.kind === "pk");

  async function issueKey() {
    if (!site) return;
    setIssuing(true);
    setStatus(null);
    try {
      const res = await ninaFetch<{ token?: string }>("/v1/auth/keys/issue", {
        method: "POST",
        auth: "dashboard",
        body: { siteId: site.id, environment: "test", kind: "pk" },
      });
      if (!res.ok) {
        setStatus(getErrorMessage(res));
        return;
      }
      if (res.data?.token) {
        setCachedPublishableKey(site.id, res.data.token);
        setStatus("Key issued — copy it now; full token is only shown once.");
      }
      await refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Issue failed");
    } finally {
      setIssuing(false);
    }
  }

  async function revokeKey(keyId: string) {
    setStatus(null);
    const res = await ninaFetch<unknown>(`/v1/auth/keys/${keyId}/revoke`, {
      method: "POST",
      auth: "dashboard",
    });
    if (!res.ok) {
      setStatus(getErrorMessage(res));
      return;
    }
    await refresh();
  }

  function copyPrefix(id: string, prefix: string) {
    void navigator.clipboard.writeText(prefix);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AppShell backHref="/dashboard" showAccount showBottomHelp>
      <div className="space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-bold">API keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your authentication keys for secure integration.
          </p>
        </div>

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Standard keys
            </p>
            <button
              type="button"
              className="text-sm font-semibold text-primary"
              onClick={() => void issueKey()}
              disabled={issuing}
            >
              {issuing ? "Issuing…" : "+ Issue new key"}
            </button>
          </div>
          <div className="space-y-3">
            {publishable.length === 0 ? (
              <p className="text-sm text-muted-foreground">No publishable keys yet.</p>
            ) : (
              publishable.map((key) => (
                <div
                  key={key.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {key.environment} · {key.kind.toUpperCase()}
                    </p>
                    <StatusChip variant="live">Live</StatusChip>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Created {formatCreated(key.createdAt)}
                  </p>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
                    <code className="flex-1 font-mono text-sm">{key.prefix}…</code>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => copyPrefix(key.id, key.prefix)}
                      aria-label="Copy prefix"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied === key.id ? (
                    <p className="mt-1 text-xs text-success">Copied prefix</p>
                  ) : null}
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-sm font-medium text-destructive"
                      onClick={() => void revokeKey(key.id)}
                    >
                      Revoke key
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Restricted keys
          </p>
          <div className="rounded-2xl border border-dashed border-border bg-muted/60 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-semibold">No restricted keys yet</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              Restricted keys limit access to specific resources for added security.
            </p>
            <Button
              className="mt-4 h-11 rounded-full px-8 font-semibold"
              onClick={() => void issueKey()}
              disabled={issuing}
            >
              Issue publishable key
            </Button>
          </div>
        </section>

        <div className="grid gap-3">
          <a
            href="https://docs.nina.ai"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 rounded-2xl bg-[#80d1c1] p-4 font-semibold text-primary shadow-soft",
            )}
          >
            <BookOpen className="h-5 w-5" />
            API documentation
          </a>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted p-4 font-semibold text-foreground">
            <Shield className="h-5 w-5 text-muted-foreground" />
            Security best practices
          </div>
        </div>
      </div>
    </AppShell>
  );
}
