import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getAnswerById, getMemberByUserIdAndWorkspaceId, updateAnswer } from "@/lib/services";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ answerId: string }> },
) {
  try {
    const session = await requireSession();

    const { answerId } = await params;
    if (!answerId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const answer = await getAnswerById(answerId);
    if (!answer) {
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 },
      );
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      answer.question.space.workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (answer.question.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if(!answer.isAiDraft) {
      return NextResponse.json({ error: "Only AI drafts can be updated" }, { status: 400 });
    }

    const { body } = await req.json();
    if (!body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedAnswer = await updateAnswer(answerId, body);

    return NextResponse.json(updatedAnswer);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
