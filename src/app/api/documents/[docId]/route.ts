import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  deleteDocument,
  getDocumentById,
  getMemberByUserIdAndWorkspaceId,
  updateDocument,
} from "@/lib/services";
import { embedDocument } from "@/lib/rag";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    const session = await requireSession();
    const { docId } = await params;

    const doc = await getDocumentById(docId);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      doc.space.workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    const session = await requireSession();
    const { docId } = await params;
    const { title, content, tagIds } = await req.json();

    const doc = await getDocumentById(docId);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      doc.space.workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await updateDocument(docId, title, content, tagIds);

    if (content !== undefined && content.trim()) {
      // no await to embed so that it happens in the background and doesn't block the response time
      embedDocument(updated.id, updated.title, content, doc.space.workspaceId);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    const session = await requireSession();
    const { docId } = await params;

    const doc = await getDocumentById(docId);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      doc.space.workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteDocument(docId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
