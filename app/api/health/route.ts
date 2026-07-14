import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    commit: process.env.GIT_COMMIT ?? null,
    pid: process.pid,
    uptimeSeconds: Math.round(process.uptime()),
  });
}
