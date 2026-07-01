import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  createQuestion,
  getMemberByUserIdAndWorkspaceId,
  getQuestionsBySpaceId,
  getSpaceById,
} from "@/lib/services";

export async function GET(
  req: NextRequest
) {
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
    const { title, body, spaceId } = await req.json();

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

    const question = await createQuestion(
      title,
      body,
      spaceId,
      session.user.id,
    );
    return NextResponse.json(question, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
