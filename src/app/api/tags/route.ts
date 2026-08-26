import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  getTags,
  createTag,
} from "@/lib/services";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
    }

    const tags = await getTags(workspaceId);
    return NextResponse.json(tags);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { name, workspaceId } = await req.json();
    if (!name?.trim() || !workspaceId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const tag = await createTag(name, workspaceId);
    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Tag already exists in this workspace" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
