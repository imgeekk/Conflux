import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  getMemberByUserIdAndWorkspaceId,
  createSpace,
  getSpacesByWorkspaceId,
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

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const spaces = await getSpacesByWorkspaceId(workspaceId);
    return NextResponse.json(spaces);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { name, description, workspaceId } = await req.json();

    if (!name?.trim() || !workspaceId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const space = await createSpace(name, slug, workspaceId, description);

    return NextResponse.json(space);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
