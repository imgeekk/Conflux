import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  getTags,
  createTag,
} from "@/lib/services";

export async function GET() {
  try {
    const session = await requireSession();

    const tags = await getTags();
    if (!tags) {
      return NextResponse.json({ error: "No tags found" }, { status: 404 });
    }

    return NextResponse.json(tags);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const tag = await createTag(name);
    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
