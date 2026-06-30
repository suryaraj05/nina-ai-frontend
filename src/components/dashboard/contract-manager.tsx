"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Loader2, Save, Zap } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusChip } from "@/components/ui/status-chip";
import { getErrorMessage, ninaFetch } from "@/lib/api-client";

type GenerateMeta = {
  source?: string;
  catalogSource?: string;
  productCount?: number;
  actionsFound?: number;
};

export function ContractManager() {
  const { site, refresh } = useDashboard();
  const [contractJson, setContractJson] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [busy, setBusy] = useState<"save" | "generate" | null>(null);
  const [status, setStatus] = useState<{ type: "ok" | "err" | "info"; msg: string } | null>(null);
  const [meta, setMeta] = useState<GenerateMeta | null>(null);

  const actionCount = useMemo(() => {
    if (!site?.agentContract?.actions || !Array.isArray(site.agentContract.actions)) return 0;
    return site.agentContract.actions.length;
  }, [site?.agentContract]);

  const catalogCount = site?.productCatalog?.length ?? 0;

  useEffect(() => {
    if (!site) return;
    setApiBaseUrl(site.baseUrl ?? "");
    if (site.agentContract) {
      setContractJson(JSON.stringify(site.agentContract, null, 2));
    }
  }, [site]);

  if (!site) return null;

  async function handleGenerate() {
    if (!site) return;
    const siteId = site.id;
    const url = apiBaseUrl.trim() || site.baseUrl;
    if (!url) {
      setStatus({ type: "err", msg: "Enter your store URL first." });
      return;
    }
    setBusy("generate");
    setStatus({ type: "info", msg: "Scanning store and building catalog… up to 30s." });
    try {
      const res = await ninaFetch<GenerateMeta & { siteId?: string }>(
        `/v1/auth/sites/${siteId}/generate-from-url`,
        {
          method: "POST",
          auth: "dashboard",
          body: { apiBaseUrl: url, runtime: "browser" },
        },
      );
      if (!res.ok) {
        setStatus({ type: "err", msg: getErrorMessage(res) });
        return;
      }
      setMeta(res.data ?? null);
      await refresh();
      const source = res.data?.source === "static" ? "storefront routes" : "OpenAPI";
      const products = res.data?.productCount ?? 0;
      setStatus({
        type: "ok",
        msg: `Generated from ${source}. ${res.data?.actionsFound ?? 0} actions, ${products} catalog products.`,
      });
    } catch (err) {
      setStatus({
        type: "err",
        msg: err instanceof Error ? err.message : "Generate failed",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleSave() {
    if (!site) return;
    const siteId = site.id;
    const raw = contractJson.trim();
    if (!raw) {
      setStatus({ type: "err", msg: "Paste or generate a contract first." });
      return;
    }
    let contract: unknown;
    try {
      contract = JSON.parse(raw);
    } catch {
      setStatus({ type: "err", msg: "Invalid JSON — fix syntax before saving." });
      return;
    }
    setBusy("save");
    setStatus(null);
    try {
      const res = await ninaFetch<unknown>(`/v1/auth/sites/${siteId}/contract`, {
        method: "PUT",
        auth: "dashboard",
        body: { contract },
      });
      if (!res.ok) {
        setStatus({ type: "err", msg: getErrorMessage(res) });
        return;
      }
      await refresh();
      setStatus({ type: "ok", msg: "Contract saved." });
    } catch (err) {
      setStatus({
        type: "err",
        msg: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setBusy(null);
    }
  }

  function downloadJson() {
    const blob = new Blob([contractJson || "{}"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "agent.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function copyJson() {
    void navigator.clipboard.writeText(contractJson);
    setStatus({ type: "ok", msg: "Copied to clipboard." });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Actions
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{actionCount}</p>
          <StatusChip variant={actionCount > 0 ? "healthy" : "setup"} className="mt-2">
            {actionCount > 0 ? "Configured" : "Missing"}
          </StatusChip>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Catalog products
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{catalogCount}</p>
          <StatusChip variant={catalogCount > 0 ? "healthy" : "missing"} className="mt-2">
            {catalogCount > 0 ? "Grounded" : "Not pulled"}
          </StatusChip>
        </div>
      </div>

      {meta?.catalogSource ? (
        <p className="text-xs text-muted-foreground">
          Last scan: contract via {meta.source ?? "—"}, catalog via {meta.catalogSource}
          {meta.productCount != null ? ` (${meta.productCount} products)` : ""}
        </p>
      ) : null}

      {status ? (
        <p
          className={
            status.type === "err"
              ? "text-sm text-destructive"
              : status.type === "ok"
                ? "text-sm text-success"
                : "text-sm text-muted-foreground"
          }
        >
          {status.msg}
        </p>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <p className="text-sm font-semibold">Auto-generate</p>
        <p className="text-xs text-muted-foreground">
          Scans your store API, or discovers routes + pulls the product catalog for static sites.
        </p>
        <Input
          className="h-11 rounded-xl bg-input font-mono text-sm"
          placeholder="https://your-store.com"
          value={apiBaseUrl}
          onChange={(e) => setApiBaseUrl(e.target.value)}
        />
        <Button
          className="h-11 w-full rounded-full font-semibold"
          onClick={() => void handleGenerate()}
          disabled={busy !== null}
        >
          {busy === "generate" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Auto-generate contract + catalog
        </Button>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">agent.json</p>
          <div className="flex gap-1">
            <Button type="button" size="icon-sm" variant="ghost" onClick={copyJson} aria-label="Copy">
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={downloadJson}
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Textarea
          className="min-h-[280px] rounded-xl font-mono text-xs leading-relaxed"
          value={contractJson}
          onChange={(e) => setContractJson(e.target.value)}
          spellCheck={false}
          placeholder='{ "site": { ... }, "actions": [ ... ] }'
        />
        <Button
          className="h-11 w-full rounded-full font-semibold"
          onClick={() => void handleSave()}
          disabled={busy !== null}
        >
          {busy === "save" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save contract
        </Button>
      </div>
    </div>
  );
}
