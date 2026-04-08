import { NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/backend-proxy";
import { getNutritionLog } from "@/lib/store";

export async function GET(req: Request, { params }: { params: { date: string } }) {
  const proxied = await forwardToBackend(req);
  if (proxied) return proxied;

  const log = getNutritionLog(params.date);
  if (!log) return NextResponse.json({ detail: "no entry", day_date: params.date });
  return NextResponse.json(log);
}
