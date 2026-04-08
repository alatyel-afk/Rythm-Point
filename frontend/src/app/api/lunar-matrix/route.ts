import { NextRequest, NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/backend-proxy";
import { getMealMatrices } from "@/lib/mock-engine";

export async function GET(req: NextRequest) {
  const proxied = await forwardToBackend(req);
  if (proxied) return proxied;
  return NextResponse.json(getMealMatrices());
}
