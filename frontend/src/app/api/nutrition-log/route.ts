import { NextRequest, NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/backend-proxy";
import { upsertNutritionLog, listNutritionLogs } from "@/lib/store";
import type { NutritionLog } from "@/lib/api";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const proxied = await forwardToBackend(req, raw);
  if (proxied) return proxied;
  const body = JSON.parse(raw) as NutritionLog;
  const saved = upsertNutritionLog(body);
  return NextResponse.json(saved);
}

export async function GET(req: NextRequest) {
  const proxied = await forwardToBackend(req);
  if (proxied) return proxied;

  const p = req.nextUrl.searchParams;
  const from = p.get("from_date");
  const to = p.get("to_date");
  if (!from || !to) {
    return NextResponse.json({ error: "from_date and to_date required" }, { status: 400 });
  }
  return NextResponse.json(listNutritionLogs(from, to));
}
