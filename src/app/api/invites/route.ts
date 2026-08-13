import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  createInvite,
  getInvites,
  getMemberByUserIdAndWorkspaceId,
} from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { workspaceId, expiresAt, maxUses } = await req.json();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    let parsedMaxUses: number | null;
    if (maxUses === undefined || maxUses === null) {
      parsedMaxUses = maxUses === null ? null : 1;
    } else {
      parsedMaxUses = Number(maxUses);
      if (!Number.isInteger(parsedMaxUses) || parsedMaxUses < 1) {
        return NextResponse.json(
          { error: "maxUses must be a positive integer or null" },
          { status: 400 },
        );
      }
    }

    const invite = await createInvite(
      workspaceId,
      session.user.id,
      parsedMaxUses,
      expiresAt,
    );
    return NextResponse.json(invite);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();

    const workspaceId = req.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
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

    const invites = await getInvites(workspaceId);
    return NextResponse.json(invites);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 },
    );
  }
}
