import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  deleteQuestion,
  getMemberByUserIdAndWorkspaceId,
  getQuestionById,
  updateQuestion,
} from "@/lib/services";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const session = await requireSession();

    const { questionId } = await params;
    if (!questionId) {
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

    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const session = await requireSession();

    const { questionId } = await params;
    if (!questionId) {
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

    const { text } = await req.json();

    const updated = await updateQuestion(questionId, text);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const session = await requireSession();

    const { questionId } = await params;
    if (!questionId) {
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

    await deleteQuestion(questionId);
    return NextResponse.json({ message: "Question deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
