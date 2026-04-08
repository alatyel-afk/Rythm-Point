import { NextResponse } from "next/server";

/**
 * Пробуем отдать ответ с Python (NEXT_PROXY_API). При ошибке / не-2xx — null,
 * чтобы вызвать mock-engine или локальный store.
 *
 * Для POST передайте тело заранее: `const raw = await req.text(); forwardToBackend(req, raw)`.
 */
export async function forwardToBackend(
  req: Request,
  bodyText?: string
): Promise<NextResponse | null> {
  const raw = process.env.NEXT_PROXY_API?.trim();
  if (!raw) return null;
  const base = raw.replace(/\/$/, "");
  const u = new URL(req.url);
  const target = `${base}${u.pathname}${u.search}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const init: RequestInit = {
      method: req.method,
      cache: "no-store",
      signal: controller.signal,
    };
    if (hasBody) {
      const ct = req.headers.get("content-type");
      if (ct) init.headers = { "content-type": ct };
      init.body = bodyText ?? "";
    }
    const res = await fetch(target, init);
    if (!res.ok) return null;
    const body = await res.text();
    const ct = res.headers.get("content-type") ?? "application/json";
    return new NextResponse(body, { status: res.status, headers: { "content-type": ct } });
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
