import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  getMemberByUserIdAndWorkspaceId,
  getWorkspaceMembers,
} from "@/lib/services";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const workspaceId = req.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 },
      );
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      workspaceId,
    );
    if (!member || member.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await getWorkspaceMembers(workspaceId);
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
