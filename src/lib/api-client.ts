import { getDashboardToken } from "@/lib/session";
import type { NinaEnvelope } from "@/lib/types";

const API_PREFIX = "/api/nina";

export class NinaApiError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "NinaApiError";
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Merchant dashboard token from session */
  auth?: "dashboard";
};

/** Browser client — calls Next.js BFF which proxies to FastAPI console. */
export async function ninaFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<NinaEnvelope<T>> {
  const method = options.method ?? (options.body !== undefined ? "POST" : "GET");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.auth === "dashboard") {
    const token = getDashboardToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_PREFIX}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let json: NinaEnvelope<T>;
  try {
    json = (await res.json()) as NinaEnvelope<T>;
  } catch {
    throw new NinaApiError(`Request failed (${res.status})`);
  }

  if (!res.ok) {
    if (json.ok === false) return json;
    const message =
      json.error?.message ??
      json.detail ??
      json.errors?.[0] ??
      `HTTP ${res.status}`;
    throw new NinaApiError(message, json.error?.code ?? "HTTP_ERROR");
  }

  return json;
}

export function getErrorMessage(envelope: NinaEnvelope<unknown>): string {
  if (envelope.error?.message) return envelope.error.message;
  if (envelope.detail) return envelope.detail;
  if (envelope.errors?.[0]) return envelope.errors[0];
  return "Something went wrong.";
}
