"use client";



import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {

  ArrowRight,

  Check,

  CheckCircle2,

  Copy,

  FileText,

  Loader2,
  Mail,
  Sparkles,
  TriangleAlert,
  Upload,
  Zap,

} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { OnboardingDeskHero } from "@/components/brand/nina-logo";

import { ContextCard } from "@/components/onboarding/context-card";

import { StepProgress, StepProgressLabel } from "@/components/onboarding/step-progress";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { Button, buttonVariants } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";

import { Textarea } from "@/components/ui/textarea";

import { getErrorMessage, ninaFetch } from "@/lib/api-client";
import {
  getOnboardingState,
  setCachedPublishableKey,
  setDashboardToken,
  setOnboardingState,
} from "@/lib/session";

import type { OnboardingState, WizardInitData } from "@/lib/types";

import { cn } from "@/lib/utils";




function loadState(): OnboardingState | null {
  return getOnboardingState();
}

function saveState(s: OnboardingState) {
  setOnboardingState(s);
}



function buildSnippet(siteId: string, apiKey: string) {

  const api = (process.env.NEXT_PUBLIC_NINA_API_URL ?? "http://127.0.0.1:8787").replace(

    /\/$/,

    "",

  );

  return [

    `<script src="${api}/sdk/nina-bootstrap.js"`,

    `        data-site-id="${siteId}"`,

    `        data-api="${api}"`,

    `        data-api-key="${apiKey}"`,

    `        data-greeting="Hi! I'm NINA. How can I help you shop today?"`,

    `        defer></script>`,

  ].join("\n");

}



const SAMPLE_JSON = `{

  "version": "1",

  "actions": [

    { "id": "search", "description": "Search products" }

  ]

}`;



export function OnboardingWizard() {

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [state, setState] = useState<OnboardingState | null>(null);

  const [status, setStatus] = useState<{ type: "ok" | "err" | "info"; msg: string } | null>(null);

  const [loading, setLoading] = useState(false);

  const [env, setEnv] = useState<"sandbox" | "live">("live");



  const [storeName, setStoreName] = useState("");

  const [storeUrl, setStoreUrl] = useState("");

  const [ownerEmail, setOwnerEmail] = useState("");

  const [apiBaseUrl, setApiBaseUrl] = useState("");

  const [contractJson, setContractJson] = useState("");



  const [copied, setCopied] = useState<string | null>(null);



  useEffect(() => {

    const saved = loadState();

    if (saved) {

      setState(saved);

      setStep(2);

      setApiBaseUrl(saved.site.baseUrl);

      setStoreName(saved.site.name);

    }

  }, []);



  const goStep3 = useCallback((s: OnboardingState) => {

    setState(s);

    saveState(s);

    setStep(3);

    setStatus(null);

  }, []);



  async function handleStep1(e: React.FormEvent) {

    e.preventDefault();

    const name = storeName.trim();

    const url = storeUrl.trim();

    if (!name || !url) {

      setStatus({ type: "err", msg: "Please enter your store name and URL." });

      return;

    }

    if (!url.startsWith("http")) {

      setStatus({ type: "err", msg: "Store URL must start with http:// or https://" });

      return;

    }



    setLoading(true);

    setStatus(null);

    try {

      const res = await ninaFetch<WizardInitData>("/v1/wizard/init", {

        method: "POST",

        body: {

          orgName: name,

          ownerEmail: ownerEmail.trim() || null,

          siteName: name,

          baseUrl: url,

          country: "IN",

          currency: "INR",

          languages: ["en", "hi"],

        },

      });

      if (!res.ok || !res.data) {

        setStatus({ type: "err", msg: getErrorMessage(res) });

        return;

      }

      const next: OnboardingState = {
        org: res.data.org,
        site: res.data.site,
        keyToken: res.data.publishableKey.token,
        keyId: res.data.publishableKey.id,
        siteId: res.data.site.id,
      };
      if (res.data.org.dashboardToken) {
        setDashboardToken(res.data.org.dashboardToken);
      }
      setCachedPublishableKey(res.data.site.id, res.data.publishableKey.token);

      setState(next);

      saveState(next);

      setStoreName(name);

      setApiBaseUrl(url);

      setStep(2);

    } catch (err) {

      setStatus({

        type: "err",

        msg: err instanceof Error ? err.message : "Network error",

      });

    } finally {

      setLoading(false);

    }

  }



  async function handleGenerate() {

    if (!state) return;

    const apiUrl = apiBaseUrl.trim() || state.site.baseUrl;

    setLoading(true);

    setStatus({ type: "info", msg: "Scanning your store… this can take up to 30 seconds." });

    try {

      const res = await ninaFetch<unknown>(`/v1/auth/sites/${state.siteId}/generate-from-url`, {
        method: "POST",
        auth: "dashboard",
        body: { apiBaseUrl: apiUrl },
      });

      if (res.ok) {

        setStatus({ type: "ok", msg: "AI configured successfully!" });

        setTimeout(() => goStep3(state), 800);

      } else {

        setStatus({

          type: "err",

          msg: `${getErrorMessage(res)} — you can still install NINA and upload a contract later.`,

        });

        setTimeout(() => goStep3(state), 2000);

      }

    } catch {

      setStatus({ type: "err", msg: "Network error — you can still install and configure later." });

      setTimeout(() => goStep3(state), 1500);

    } finally {

      setLoading(false);

    }

  }



  async function handleUploadContract() {

    if (!state) return;

    const raw = contractJson.trim();

    if (!raw) {

      setStatus({ type: "err", msg: "Paste your agent.json content first." });

      return;

    }

    let contract: unknown;

    try {

      contract = JSON.parse(raw);

    } catch {

      setStatus({ type: "err", msg: "Invalid JSON — check your agent.json." });

      return;

    }



    setLoading(true);

    setStatus(null);

    try {

      const res = await ninaFetch<unknown>(`/v1/auth/sites/${state.siteId}/contract`, {
        method: "PUT",
        auth: "dashboard",
        body: { contract },
      });

      if (res.ok) {

        setStatus({ type: "ok", msg: "Contract uploaded!" });

        setTimeout(() => goStep3(state), 600);

      } else {

        setStatus({ type: "err", msg: getErrorMessage(res) });

      }

    } catch (err) {

      setStatus({

        type: "err",

        msg: err instanceof Error ? err.message : "Upload failed",

      });

    } finally {

      setLoading(false);

    }

  }



  function copyText(text: string, label: string) {

    void navigator.clipboard.writeText(text);

    setCopied(label);

    setTimeout(() => setCopied(null), 2000);

  }



  const snippet = state ? buildSnippet(state.siteId, state.keyToken) : "";

  const dashToken = state?.org.dashboardToken ?? "";

  const orgName = storeName || state?.site.name;



  return (

    <AppShell orgName={orgName} orgPlaceholder="Acme Fashion" showBottomHelp>

      {status ? (

        <Alert className="mb-4" variant={status.type === "err" ? "destructive" : "default"}>

          <AlertDescription>{status.msg}</AlertDescription>

        </Alert>

      ) : null}



      {step === 1 ? (

        <div className="space-y-5">

          <div>

            <h1 className="font-serif text-3xl font-bold tracking-tight">Set up your store</h1>

            <StepProgressLabel current={1} />

          </div>

          <StepProgress current={1} variant="bar" />



          <form

            onSubmit={handleStep1}

            className="space-y-4 rounded-2xl bg-card p-5 shadow-soft"

          >

            <div className="space-y-2">

              <Label htmlFor="storeName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">

                Store name

              </Label>

              <Input

                id="storeName"

                className="h-11 rounded-xl border-0 bg-input"

                placeholder="e.g. Acme Fashion Boutique"

                value={storeName}

                onChange={(e) => setStoreName(e.target.value)}

                autoComplete="organization"

              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="storeUrl" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">

                Store URL

              </Label>

              <Input

                id="storeUrl"

                type="url"

                className="h-11 rounded-xl border-0 bg-input"

                placeholder="nina.shop/acme-fashion"

                value={storeUrl}

                onChange={(e) => setStoreUrl(e.target.value)}

                autoComplete="url"

              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="ownerEmail" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">

                Contact email

              </Label>

              <div className="relative">
                <Input
                  id="ownerEmail"
                  type="email"
                  className="h-11 rounded-xl border-0 bg-input pr-10"
                  placeholder="hello@acmefashion.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  autoComplete="email"
                />
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              </div>

            </div>

            <Button

              type="submit"

              className="h-12 w-full rounded-full font-serif text-base font-semibold"

              disabled={loading}

            >

              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}

              Get started

            </Button>

          </form>



          <ContextCard
            title="Pro tip"
            what={
              <>
                Completing your store profile now will automatically generate your{" "}
                <strong className="font-semibold text-foreground">API keys</strong> and merchant
                dashboard credentials for the next step.
              </>
            }
          />

          <OnboardingDeskHero />

        </div>

      ) : null}



      {step === 2 && state ? (

        <div className="space-y-5">

          <StepProgress current={2} variant="circles" />



          <div>

            <h1 className="text-2xl font-bold tracking-tight">Automate your workflow</h1>

            <p className="mt-1 text-sm text-muted-foreground">

              Configure what NINA can do on your store using your API contract.

            </p>

          </div>



          <div className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-soft">

            {["Organization", "Contract", "Validation", "Integration"].map((item) => (

              <div

                key={item}

                className={cn(

                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",

                  item === "Contract" ? "bg-accent font-medium text-primary" : "text-muted-foreground",

                )}

              >

                {item === "Contract" ? (

                  <FileText className="h-4 w-4" />

                ) : (

                  <span className="h-4 w-4 rounded-full border border-border" />

                )}

                {item}

              </div>

            ))}

          </div>



          <ContextCard

            variant="info"

            title="Agent configuration"

            what={

              <>

                The <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">agent.json</code>{" "}

                file declares what NINA can do — search, add to cart, track orders.

              </>

            }

          />



          <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">

            <div>

              <p className="mb-2 text-sm font-semibold">Quick setup via API</p>

              <Input

                className="h-11 rounded-xl bg-input"

                placeholder="https://shop.example.com/api"

                value={apiBaseUrl}

                onChange={(e) => setApiBaseUrl(e.target.value)}

              />

              <Button

                className="mt-3 h-11 w-full rounded-full font-semibold"

                onClick={handleGenerate}

                disabled={loading}

              >

                {loading ? (

                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                ) : (

                  <Zap className="mr-2 h-4 w-4" />

                )}

                Auto-generate

              </Button>

              <p className="mt-2 text-xs italic text-muted-foreground">

                Scans your store API and builds agent.json automatically.

              </p>

            </div>



            <div className="flex items-center gap-3">

              <Separator className="flex-1" />

              <span className="text-xs font-medium text-muted-foreground">OR</span>

              <Separator className="flex-1" />

            </div>



            <div>

              <button

                type="button"

                className="mb-3 flex items-center gap-2 text-sm font-medium text-primary"

                onClick={() => setContractJson(SAMPLE_JSON)}

              >

                <Upload className="h-4 w-4" />

                Upload file

              </button>

              <div className="relative rounded-xl border border-border bg-muted/50 p-3">

                <Button

                  size="icon-sm"

                  variant="ghost"

                  className="absolute right-2 top-2"

                  onClick={() => copyText(contractJson || SAMPLE_JSON, "json")}

                >

                  <Copy className="h-3.5 w-3.5" />

                </Button>

                <Textarea

                  className="min-h-[100px] border-0 bg-transparent font-mono text-xs shadow-none focus-visible:ring-0"

                  placeholder={SAMPLE_JSON}

                  value={contractJson}

                  onChange={(e) => setContractJson(e.target.value)}

                />

              </div>

              <Button

                variant="outline"

                className="mt-3 h-11 w-full rounded-full"

                onClick={handleUploadContract}

                disabled={loading}

              >

                Initialize AI setup

              </Button>

            </div>



            <button

              type="button"

              className="w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline"

              onClick={() => goStep3(state)}

              disabled={loading}

            >

              Skip for now

            </button>

          </div>



          <ContextCard

            variant="help"

            what="Check our documentation for detailed guides on agent.json structure and API integration."

            next="View documentation →"

          />

        </div>

      ) : null}



      {step === 3 && state ? (

        <div className="space-y-5">

          <div>

            <h1 className="text-2xl font-bold text-primary">Install Merchant SDK</h1>

            <p className="mt-1 text-sm text-muted-foreground">

              Step 3 of 3: Connect your storefront to start receiving live transactions

            </p>

          </div>



          <div className="flex rounded-full border border-border bg-card p-1">

            {(["sandbox", "live"] as const).map((mode) => (

              <button

                key={mode}

                type="button"

                onClick={() => setEnv(mode)}

                className={cn(

                  "flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-colors",

                  env === mode

                    ? "bg-primary text-primary-foreground"

                    : "text-muted-foreground",

                )}

              >

                {mode}

              </button>

            ))}

          </div>



          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">

            <div className="flex gap-3">

              <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />

              <div>

                <p className="font-semibold">Final step: Client-side integration</p>

                <p className="mt-1 text-sm text-muted-foreground">

                  Copy and paste this script into the{" "}

                  <code className="rounded bg-muted px-1 font-mono text-xs">&lt;head&gt;</code>{" "}

                  section of your storefront.

                </p>

              </div>

            </div>

          </div>



          <div className="overflow-hidden rounded-2xl border border-border shadow-soft">

            <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">

              <span className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">

                nina-embed-v1.js

              </span>

              <button

                type="button"

                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary"

                onClick={() => copyText(snippet, "snippet")}

              >

                <Copy className="h-3.5 w-3.5" />

                {copied === "snippet" ? "Copied" : "Copy code"}

              </button>

            </div>

            <pre className="overflow-x-auto bg-code p-4 font-mono text-xs leading-relaxed text-slate-300">

              {snippet}

            </pre>

          </div>



          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">

            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">

              Environment credentials

            </p>

            <div className="space-y-3">

              <div className="rounded-xl bg-muted p-3">

                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">

                  {env} public key

                </p>

                <div className="flex items-center justify-between gap-2">

                  <code className="truncate font-mono text-sm">

                    {state.keyToken.slice(0, 12)}••••••••••••

                    {state.keyToken.slice(-4)}

                  </code>

                  <Button

                    size="icon-sm"

                    variant="ghost"

                    onClick={() => copyText(state.keyToken, "key")}

                  >

                    <Copy className="h-4 w-4" />

                  </Button>

                </div>

              </div>

              {dashToken ? (

                <div className="rounded-xl bg-muted p-3">

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">

                    Secret key

                  </p>

                  <div className="flex items-center justify-between gap-2">

                    <code className="truncate font-mono text-sm">

                      {dashToken.slice(0, 8)}••••••••••••

                    </code>

                    <Button

                      size="icon-sm"

                      variant="ghost"

                      onClick={() => copyText(dashToken, "dash")}

                    >

                      <Copy className="h-4 w-4" />

                    </Button>

                  </div>

                </div>

              ) : null}

            </div>

            <div className="mt-3 flex gap-2 rounded-xl bg-[#f5e6d8] px-3 py-2.5 text-sm text-[#6b4a3a]">

              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <p>Store your secret key securely. It will only be shown once.</p>

            </div>

          </div>



          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">

            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">

              Onboarding progress

            </p>

            <ul className="space-y-3">

              {["Account verification", "Business KYC profile", "SDK installation"].map(

                (item, i) => (

                  <li key={item} className="flex items-center gap-3 text-sm">

                    {i < 2 ? (

                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-success">

                        <Check className="h-3.5 w-3.5" />

                      </span>

                    ) : (

                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary">

                        <span className="h-2 w-2 rounded-full bg-primary" />

                      </span>

                    )}

                    <span className={i === 2 ? "font-medium text-primary" : "text-foreground"}>

                      {item}

                    </span>

                  </li>

                ),

              )}

            </ul>

          </div>



          <div className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft">

            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">

              Estimated launch time

            </p>

            <p className="mt-1 text-3xl font-bold tabular-nums">~ 5 mins</p>

            <Sparkles className="absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2 opacity-20" />

          </div>



          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">

            <p className="font-semibold">Need help?</p>

            <p className="mt-1 text-sm text-muted-foreground">

              Our engineering team is available 24/7 for integration support.

            </p>

            <Button variant="outline" className="mt-3 w-full rounded-full border-primary text-primary">

              Chat with support

            </Button>

          </div>



          <div className="relative overflow-hidden rounded-2xl bg-code p-8 text-center shadow-soft">

            <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">

              Network stable

            </span>

          </div>



          <Link

            href="/dashboard"

            className={cn(buttonVariants(), "h-12 w-full rounded-full text-base font-semibold")}

          >

            Open dashboard

            <ArrowRight className="ml-2 h-4 w-4" />

          </Link>

        </div>

      ) : null}

    </AppShell>

  );

}


