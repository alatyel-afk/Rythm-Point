import { NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/backend-proxy";
import { getBodySignal } from "@/lib/store";

export async function GET(req: Request, { params }: { params: { date: string } }) {
  const proxied = await forwardToBackend(req);
  if (proxied) return proxied;

  const sig = getBodySignal(params.date);
  if (!sig) return NextResponse.json({ detail: "no entry", day_date: params.date });
  return NextResponse.json(sig);
}
