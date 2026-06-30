"use client";

import { useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import { getErrorMessage, ninaFetch } from "@/lib/api-client";

type ProviderPreset = {
  label: string;
  provider: string;
  model: string;
  endpoint: string;
};

const PRESETS: Record<string, ProviderPreset> = {
  gemini: {
    label: "Google Gemini (OpenAI-compatible)",
    provider: "openai",
    model: "gemini-2.0-flash",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai",
  },
  openrouter: {
    label: "OpenRouter",
    provider: "openai",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    endpoint: "https://openrouter.ai/api/v1",
  },
  openai: {
    label: "OpenAI",
    provider: "openai",
    model: "gpt-4o-mini",
    endpoint: "",
  },
  anthropic: {
    label: "Anthropic",
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    endpoint: "",
  },
};

function hasCustomLlm(llmConfig: unknown): boolean {
  if (!llmConfig || typeof llmConfig !== "object") return false;
  const cfg = llmConfig as Record<string, unknown>;
  return Boolean(cfg._sealed || cfg.provider || cfg.apiKey || cfg.model);
}

export function LlmConfigForm() {
  const { site, refresh } = useDashboard();
  const [presetKey, setPresetKey] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PRESETS.gemini.model);
  const [endpoint, setEndpoint] = useState(PRESETS.gemini.endpoint);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  if (!site) return null;

  const configured = hasCustomLlm(site.llmConfig);

  function onPresetChange(key: string) {
    setPresetKey(key);
    const preset = PRESETS[key];
    if (!preset) return;
    setModel(preset.model);
    setEndpoint(preset.endpoint);
  }

  async function handleSave() {
    if (!site) return;
    const preset = PRESETS[presetKey];
    const trimmedKey = apiKey.trim();
    const trimmedModel = model.trim();

    if (!trimmedKey) {
      setStatus({ type: "err", msg: "Paste your provider API key." });
      return;
    }
    if (!trimmedModel) {
      setStatus({ type: "err", msg: "Enter a model name." });
      return;
    }

    const llmConfig: Record<string, string> = {
      provider: preset.provider,
      apiKey: trimmedKey,
      model: trimmedModel,
    };
    const trimmedEndpoint = endpoint.trim();
    if (trimmedEndpoint) llmConfig.endpoint = trimmedEndpoint;

    setSaving(true);
    setStatus(null);
    try {
      const res = await ninaFetch<unknown>(`/v1/auth/sites/${site.id}/llm-config`, {
        method: "PUT",
        auth: "dashboard",
        body: { llmConfig },
      });
      if (!res.ok) {
        setStatus({ type: "err", msg: getErrorMessage(res) });
        return;
      }
      setApiKey("");
      await refresh();
      setStatus({ type: "ok", msg: "AI provider saved. NINA will use your key for this site." });
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
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">AI provider</p>
        </div>
        <StatusChip variant={configured ? "healthy" : "plan"}>
          {configured ? "Custom key" : "Platform default"}
        </StatusChip>
      </div>
      <p className="text-xs text-muted-foreground">
        {configured
          ? "A custom LLM key is configured (stored encrypted). Enter a new key below to replace it."
          : "Hosted NINA can use the platform default LLM, or your own provider key for this site."}
      </p>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Provider</span>
        <select
          className="h-11 w-full rounded-xl border border-input bg-input px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={presetKey}
          onChange={(e) => onPresetChange(e.target.value)}
        >
          {Object.entries(PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">API key</span>
        <Input
          type="password"
          className="h-11 rounded-xl bg-input font-mono text-sm"
          placeholder="sk-… or AIza…"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Model</span>
        <Input
          className="h-11 rounded-xl bg-input font-mono text-sm"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Endpoint <span className="font-normal">(optional)</span>
        </span>
        <Input
          className="h-11 rounded-xl bg-input font-mono text-sm"
          placeholder="https://…"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
      </label>

      {status ? (
        <p className={status.type === "err" ? "text-sm text-destructive" : "text-sm text-success"}>
          {status.msg}
        </p>
      ) : null}

      <Button
        className="h-11 w-full rounded-full font-semibold"
        onClick={() => void handleSave()}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save AI config
      </Button>
    </div>
  );
}
