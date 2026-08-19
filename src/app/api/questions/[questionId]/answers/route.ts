import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  createAnswer,
  getMemberByUserIdAndWorkspaceId,
  getQuestionById,
} from "@/lib/services";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const session = await requireSession();

    const { questionId } = await params;
    if (!questionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { body } = await req.json();
    if (!body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const question = await getQuestionById(questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      question.space.workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const answer = await createAnswer({
      questionId: question.id,
      body,
      isAiDraft: false,
      authorId: session.user.id,
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
