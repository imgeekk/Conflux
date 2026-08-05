import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getInviteByCode } from "@/lib/services";

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 },
      );
    }

    const invite = await getInviteByCode(code);
    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite code" },
        { status: 404 },
      );
    }

    return NextResponse.json(invite);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
