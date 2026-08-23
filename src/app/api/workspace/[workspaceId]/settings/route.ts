import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getMemberByUserIdAndWorkspaceId, getWorkspaceById } from "@/lib/services";
import { encryptApiKey } from "@/lib/crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const session = await requireSession();
    const { workspaceId } = await params;

    const member = await getMemberByUserIdAndWorkspaceId(session.user.id, workspaceId);
    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 },
      );
    }

    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      hasApiKey: !!workspace.geminiApiKey,
      isOwner: member.role === "OWNER",
    });
  } catch (error) {
    console.error("Error fetching workspace settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const session = await requireSession();
    const { workspaceId } = await params;
    const { apiKey } = await req.json();

    const member = await getMemberByUserIdAndWorkspaceId(session.user.id, workspaceId);
    if (!member || member.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    if (apiKey === null || apiKey === "") {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { geminiApiKey: null },
      });
      return NextResponse.json({ hasApiKey: false });
    }

    if (!apiKey.trim() || typeof apiKey !== "string") {
      return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const testClient = new GoogleGenAI({ apiKey });
      await testClient.models.embedContent({
        model: "gemini-embedding-001",
        contents: [{ text: "test" }],
      });
    } catch {
      return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    }

    const encryptedApiKey = encryptApiKey(apiKey);
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { geminiApiKey: encryptedApiKey },
    });

    return NextResponse.json({ hasApiKey: true });
  } catch (error) {
    console.error("Error updating workspace settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
