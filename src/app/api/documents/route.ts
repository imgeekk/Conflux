import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
// import { embedDocument } from "@/lib/rag"
import {
  getMemberByUserIdAndWorkspaceId,
  getSpaceById,
  createDocument,
  getDocumentsBySpaceId,
} from "@/lib/services";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  try {
    const session = await requireSession();
    const { spaceId } = await params;

    if (!spaceId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const space = await getSpaceById(spaceId);
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      space.workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const docs = await getDocumentsBySpaceId(spaceId);
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { title, content, spaceId } = await req.json();

    if (!title?.trim() || !spaceId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const space = await getSpaceById(spaceId);
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      space.workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const document = await createDocument(
      title,
      content,
      spaceId,
      session.user.id,
    );

    if (content?.trim()) {
      //   await embedDocument(document.id, document.title, content)
    }

    return NextResponse.json(document);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

