import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { acceptAnswer, deleteAnswerChunks, getAnswerById, getMemberByUserIdAndWorkspaceId } from "@/lib/services";
import { embedAnswer } from "@/lib/rag";

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

    if(answer.question.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accepted, previouslyAcceptedId } = await acceptAnswer(answerId, answer.questionId);

    await Promise.allSettled([
        previouslyAcceptedId ? deleteAnswerChunks(previouslyAcceptedId) : Promise.resolve(),
        embedAnswer(answerId, answer.body, answer.question.text, answer.question.space.workspaceId),
    ]);

    return NextResponse.json(accepted);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
