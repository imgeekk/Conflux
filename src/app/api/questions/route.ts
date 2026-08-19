import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  createAnswer,
  createQuestion,
  getMemberByUserIdAndWorkspaceId,
  getQuestionById,
  getQuestionsBySpaceId,
  getSpaceById,
} from "@/lib/services";
import { answerQuestion } from "@/lib/rag";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const spaceId = req.nextUrl.searchParams.get("spaceId");
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

    const questions = await getQuestionsBySpaceId(spaceId);
    return NextResponse.json(questions);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { text, spaceId } = await req.json();

    if (!text?.trim() || !spaceId) {
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

    const question = await createQuestion(text, spaceId, session.user.id);

    try {
      const result = await answerQuestion(text, space.workspaceId);
      await createAnswer({
        questionId: question.id,
        body: result.answer,
        isAiDraft: true,
        confidence: result.confidence,
        lowConfidence: result.lowConfidence,
        expert: result.expert,
      });
    } catch (error) {
      console.error("AI answering failed:", error);
    }

    const questionWithAnswers = await getQuestionById(question.id);
    return NextResponse.json(questionWithAnswers, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
