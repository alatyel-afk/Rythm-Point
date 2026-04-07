import { NextResponse } from "next/server";
import { getBodySignal } from "@/lib/store";

export function GET(_req: Request, { params }: { params: { date: string } }) {
  const sig = getBodySignal(params.date);
  if (!sig) return NextResponse.json({ detail: "no entry", day_date: params.date });
  return NextResponse.json(sig);
}
