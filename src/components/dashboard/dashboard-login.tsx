"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { NinaLogo } from "@/components/brand/nina-logo";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DashboardLogin() {
  const { login, loading, error } = useDashboard();
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    const ok = await login(token);
    if (!ok) {
      setLocalError("Invalid dashboard token. Check the key from onboarding step 3.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <NinaLogo href="/" size="lg" />
        <h1 className="mt-6 font-serif text-2xl font-bold">Merchant dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the dashboard login key shown once during onboarding.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-card p-6 shadow-soft"
      >
        <div className="space-y-2">
          <Label htmlFor="dashToken" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Dashboard login key
          </Label>
          <Input
            id="dashToken"
            type="password"
            className="h-11 rounded-xl border-0 bg-input font-mono"
            placeholder="nk_…"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
        </div>

        {(localError || error) && (
          <p className="text-sm text-destructive">{localError || error}</p>
        )}

        <Button
          type="submit"
          className="h-11 w-full rounded-full font-semibold"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in
        </Button>

        <div className="space-y-1 pt-1 text-center">
          <p className="text-xs text-muted-foreground">Don&apos;t have a dashboard key yet?</p>
          <a href="/onboarding" className="text-sm font-semibold text-primary hover:underline">
            Start onboarding
          </a>
        </div>
      </form>
    </div>
  );
}
