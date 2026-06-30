import type { OnboardingState } from "@/lib/types";

const DASH_TOKEN_KEY = "nina_dash_token";
const ONBOARDING_KEY = "nina_onboarding";
const PUB_KEY_PREFIX = "nina_pub_key_";

export function getDashboardToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(DASH_TOKEN_KEY);
}

export function setDashboardToken(token: string) {
  sessionStorage.setItem(DASH_TOKEN_KEY, token);
}

export function clearDashboardToken() {
  sessionStorage.removeItem(DASH_TOKEN_KEY);
}

export function getOnboardingState(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ONBOARDING_KEY);
    return raw ? (JSON.parse(raw) as OnboardingState) : null;
  } catch {
    return null;
  }
}

export function setOnboardingState(state: OnboardingState) {
  sessionStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
}

export function getCachedPublishableKey(siteId: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PUB_KEY_PREFIX + siteId);
}

export function setCachedPublishableKey(siteId: string, token: string) {
  sessionStorage.setItem(PUB_KEY_PREFIX + siteId, token);
}
