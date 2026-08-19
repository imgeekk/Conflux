import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { answerQuestion } from "@/lib/rag";
import {
  createAnswer,
  getMemberByUserIdAndWorkspaceId,
  getQuestionById,
} from "@/lib/services";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const session = await requireSession();
  const { questionId } = await params;
  if (!questionId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const question = await getQuestionById(questionId);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const member = await getMemberByUserIdAndWorkspaceId(
    session.user.id,
    question.space.workspaceId,
  );
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await answerQuestion(
      question.text,
      question.space.workspaceId,
    );
    await createAnswer({
      questionId: question.id,
      body: result.answer,
      isAiDraft: true,
      confidence: result.confidence,
      lowConfidence: result.lowConfidence,
      expert: result.expert,
    });
    const updated = await getQuestionById(questionId);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
