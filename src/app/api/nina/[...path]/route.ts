import { NextRequest, NextResponse } from "next/server";

const NINA_API = (process.env.NINA_API_URL ?? "http://127.0.0.1:8787").replace(
  /\/$/,
  "",
);
const ADMIN_SECRET = process.env.NINA_CONSOLE_ADMIN_SECRET ?? "";

async function proxy(req: NextRequest, pathSegments: string[]) {
  const path = "/" + pathSegments.join("/");
  const url = `${NINA_API}${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
  };

  const clientAuth = req.headers.get("authorization");

  // Merchant dashboard routes use the merchant's dashboard token.
  if (path.startsWith("/v1/auth/")) {
    if (clientAuth) {
      headers.Authorization = clientAuth;
    }
  } else if (ADMIN_SECRET) {
    // Wizard, admin site ops, etc. — BFF attaches operator secret server-side.
    headers.Authorization = `Bearer ${ADMIN_SECRET}`;
  } else if (clientAuth) {
    headers.Authorization = clientAuth;
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream unreachable";
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UPSTREAM_ERROR", message: `NINA API unavailable: ${message}` },
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { ok: false, error: { code: "BAD_UPSTREAM", message: text } };
    }
  }

  return NextResponse.json(body, { status: upstream.status });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
