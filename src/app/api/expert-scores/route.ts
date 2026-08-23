import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getExpertScoresByTag } from "@/lib/services";

export async function GET(req: NextRequest) {
  try {
    await requireSession();

    const tagId = req.nextUrl.searchParams.get("tagId");

    if (tagId) {
      const expertScore = await getExpertScoresByTag(tagId);
      return NextResponse.json(expertScore);
    }

    return NextResponse.json(
      { error: "Missing tagId or userId" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
