import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  }

  const subs = await db.subscriber.findMany({
    orderBy: { subscribedAt: "desc" },
    select: {
      email: true,
      confirmed: true,
      subscribedAt: true,
    },
  });

  const csv = [
    "email,confirmed,subscribed_at",
    ...subs.map(
      (s) =>
        `"${s.email.replace(/"/g, '""')}",${s.confirmed},${s.subscribedAt.toISOString()}`,
    ),
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
