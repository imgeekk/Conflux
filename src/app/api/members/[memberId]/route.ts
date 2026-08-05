import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  getMember,
  deleteMember,
  getMemberByUserIdAndWorkspaceId,
} from "@/lib/services";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
    const session = await requireSession();
    const { memberId } = await params;

    const member = await getMember(memberId);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot delete owner" },
        { status: 403 },
      );
    }

    const actor = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      member.workspaceId,
    );
    if (!actor || actor.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteMember(member.userId, member.workspaceId);
    return NextResponse.json(
      { success: true, message: "Member deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
