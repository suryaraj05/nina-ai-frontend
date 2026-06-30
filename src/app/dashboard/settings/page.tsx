"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, FileText, Loader2, Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardLogin } from "@/components/dashboard/dashboard-login";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage, ninaFetch } from "@/lib/api-client";

export default function SettingsPage() {
  const { token, site, loading, refresh } = useDashboard();
  const [originsText, setOriginsText] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    if (!site) return;
    setBaseUrl(site.baseUrl ?? "");
    setOriginsText((site.allowedOrigins ?? []).join("\n"));
  }, [site]);

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

  const hasLlm = Boolean(site.llmConfig);
  const catalogCount = site.productCatalog?.length ?? 0;

  async function saveOrigins() {
    if (!site) return;
    const allowedOrigins = originsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    setSaving(true);
    setStatus(null);
    try {
      const res = await ninaFetch<unknown>(`/v1/auth/sites/${site.id}/settings`, {
        method: "PUT",
        auth: "dashboard",
        body: { allowedOrigins },
      });
      if (!res.ok) {
        setStatus({ type: "err", msg: getErrorMessage(res) });
        return;
      }
      await refresh();
      setStatus({ type: "ok", msg: "Allowed origins saved." });
    } catch (err) {
      setStatus({
        type: "err",
        msg: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell backHref="/dashboard" showAccount showBottomHelp>
      <div className="space-y-5 py-2">
        <div>
          <h1 className="font-serif text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Site configuration for <span className="font-medium text-foreground">{site.name}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site</p>
          <p className="mt-2 font-semibold">{site.name}</p>
          <Input
            className="mt-3 h-11 rounded-xl bg-input font-mono text-sm"
            value={baseUrl}
            readOnly
            aria-label="Base URL"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Base URL is set at onboarding. Re-run onboarding to change it.
          </p>
        </div>

        <Link
          href="/dashboard/contract"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:bg-muted/40"
        >
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Agent contract</p>
            <p className="text-xs text-muted-foreground">
              {site.agentContract?.actions
                ? `${(site.agentContract.actions as unknown[]).length} actions`
                : "Not configured"}
              {catalogCount > 0 ? ` · ${catalogCount} catalog products` : ""}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Allowed origins</p>
            <StatusChip variant={(site.allowedOrigins?.length ?? 0) > 0 ? "healthy" : "setup"}>
              {(site.allowedOrigins?.length ?? 0) > 0 ? "Restricted" : "Open"}
            </StatusChip>
          </div>
          <p className="text-xs text-muted-foreground">
            One origin per line (e.g. <span className="font-mono">https://your-store.com</span>).
            Leave empty to allow any origin during development.
          </p>
          <Textarea
            className="min-h-[120px] rounded-xl font-mono text-xs"
            value={originsText}
            onChange={(e) => setOriginsText(e.target.value)}
            placeholder={"https://your-store.com\nhttps://www.your-store.com"}
            spellCheck={false}
          />
          {status ? (
            <p className={status.type === "err" ? "text-sm text-destructive" : "text-sm text-success"}>
              {status.msg}
            </p>
          ) : null}
          <Button
            className="h-11 w-full rounded-full font-semibold"
            onClick={() => void saveOrigins()}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save origins
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">LLM configuration</p>
            <StatusChip variant={hasLlm ? "healthy" : "plan"}>
              {hasLlm ? "Custom" : "Platform default"}
            </StatusChip>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {hasLlm
              ? "This site uses a merchant-specific LLM key. Contact support to rotate credentials."
              : "Hosted NINA uses the platform LLM. Custom keys can be attached via the API when needed."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
