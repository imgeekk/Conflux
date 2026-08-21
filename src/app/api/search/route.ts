import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { answerQuestion } from "@/lib/rag";
import {
  getMemberByUserIdAndWorkspaceId,
  getUsageCount,
  getWorkspaceById,
  incrementUsage,
} from "@/lib/services";

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

    const member = await getMemberByUserIdAndWorkspaceId(
      session.user.id,
      workspaceId,
    );
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace?.geminiApiKey) {
      const usage = await getUsageCount(workspaceId, "query");
      if (usage && usage >= 50) {
        return NextResponse.json(
          {
            error:
              "Usage limit reached. Please set your Gemini API key to continue.",
          },
          { status: 429 },
        );
      }
    }
    const result = await answerQuestion(query.trim(), workspaceId);
    await incrementUsage(workspaceId, "query");
    return NextResponse.json(result);
  } catch (e) {
    console.error("Search error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
