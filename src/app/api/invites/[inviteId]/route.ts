import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  getInviteById,
  getMemberByUserIdAndWorkspaceId,
  revokeInvite,
} from "@/lib/services";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  try {
    const session = await requireSession();
    const { inviteId } = await params;
    if (!inviteId) {
      return NextResponse.json({ error: "Missing inviteId" }, { status: 400 });
    }

    const invite = await getInviteById(inviteId);
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      invite.workspaceId,
    );
    if (!member || member.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await revokeInvite(inviteId);
    return NextResponse.json(
      { success: true, message: "Invite revoked successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
