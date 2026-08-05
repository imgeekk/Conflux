import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getInviteByCode, joinWorkspaceWithCode } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { code } = await req.json();
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

    const result = await joinWorkspaceWithCode(code, session.user.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
