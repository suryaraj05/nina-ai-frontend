"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getErrorMessage, ninaFetch } from "@/lib/api-client";
import { deriveSetupStatus } from "@/lib/setup-status";
import {
  clearDashboardToken,
  getDashboardToken,
  setDashboardToken,
} from "@/lib/session";
import type {
  ApiKeyRecord,
  Org,
  SetupStatus,
  Site,
  UsageData,
  WhoamiData,
} from "@/lib/types";

type DashboardContextValue = {
  token: string | null;
  org: Org | null;
  site: Site | null;
  keys: ApiKeyRecord[];
  usage: UsageData | null;
  setup: SetupStatus;
  loading: boolean;
  error: string | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async (): Promise<boolean> => {
    const dashToken = getDashboardToken();
    if (!dashToken) {
      setLoading(false);
      return false;
    }
    setToken(dashToken);
    setLoading(true);
    setError(null);
    try {
      const whoami = await ninaFetch<WhoamiData>("/v1/auth/whoami", {
        auth: "dashboard",
      });
      if (!whoami.ok || !whoami.data?.sites?.length) {
        setError(getErrorMessage(whoami) || "No sites on this account.");
        clearDashboardToken();
        setToken(null);
        return false;
      }

      const firstSite = whoami.data.sites[0];
      setOrg(whoami.data.org);
      setSite(firstSite);

      const [usageRes, keysRes] = await Promise.all([
        ninaFetch<UsageData>(`/v1/auth/sites/${firstSite.id}/usage`, {
          auth: "dashboard",
        }),
        ninaFetch<ApiKeyRecord[]>(`/v1/auth/sites/${firstSite.id}/keys`, {
          auth: "dashboard",
        }),
      ]);

      setUsage(usageRes.ok ? usageRes.data : null);
      setKeys(keysRes.ok && keysRes.data ? keysRes.data : []);
      return true;
    } catch (err) {
      setOrg(null);
      setSite(null);
      setKeys([]);
      setUsage(null);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      clearDashboardToken();
      setToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = getDashboardToken();
    if (saved) {
      void loadSession();
    } else {
      setLoading(false);
    }
  }, [loadSession]);

  const login = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return false;
      setDashboardToken(trimmed);
      return loadSession();
    },
    [loadSession],
  );

  const logout = useCallback(() => {
    clearDashboardToken();
    setToken(null);
    setOrg(null);
    setSite(null);
    setKeys([]);
    setUsage(null);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const setup = useMemo(() => deriveSetupStatus(site, keys), [site, keys]);

  const value = useMemo(
    () => ({
      token,
      org,
      site,
      keys,
      usage,
      setup,
      loading,
      error,
      login,
      logout,
      refresh,
    }),
    [token, org, site, keys, usage, setup, loading, error, login, logout, refresh],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
