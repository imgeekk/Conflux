import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { answerQuestion } from "@/lib/rag";
import { getMemberByUserIdAndWorkspaceId } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { query, workspaceId } = await req.json();

    if (!query.trim() || !workspaceId) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const member = getMemberByUserIdAndWorkspaceId(
      session.user.id,
      workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await answerQuestion(query.trim(), workspaceId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
