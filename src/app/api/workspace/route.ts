import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createWorkspace, getWorkspaceByUserId } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const existing = await prisma.workspace.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const workspace = await createWorkspace(name, session.user.id, finalSlug);

    return NextResponse.json(workspace);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET() {
  try {
    const session = await requireSession();

    const workspaces = await getWorkspaceByUserId(session.user.id);

    return NextResponse.json(workspaces);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
