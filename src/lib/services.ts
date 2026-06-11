import { prisma } from "@/lib/prisma";

// workspace services

export async function createWorkspace(
  name: string,
  userId: string,
  slug: string,
) {
  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      slug: slug,
      members: {
        create: {
          userId: userId,
          role: "OWNER",
        },
      },
    },
  });
  return workspace;
}

export async function getWorkspaceByUserId(userId: string) {
  const membership = await prisma.member.findFirst({
    where: { userId },
    include: { workspace: true },
  });
  const workspace = membership?.workspace ?? null;
  return workspace;
}

// space services

export async function createSpace(
  name: string,
  slug: string,
  workspaceId: string,
  description?: string,
) {
  const space = await prisma.space.create({
    data: {
      name,
      slug,
      description,
      workspaceId,
    },
  });
  return space;
}

export async function getSpacesByWorkspaceId(workspaceId: string) {
  const spaces = await prisma.space.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
  });
  return spaces;
}

export async function getSpaceById(spaceId: string) {
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include : { workspace: true },
  });
  return space;
}


// member services

export async function getMemberByUserIdAndWorkspaceId(userId: string, workspaceId: string) {
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return member;
}

// document services

export async function getDocumentsBySpaceId(spaceId: string) {
  const docs = await prisma.document.findMany({
    where: { spaceId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: { author: true },
  });
  return docs;
}

// question services

export async function getQuestionsBySpaceId(spaceId: string) {
  const questions = await prisma.question.findMany({
    where: { spaceId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { author: true, answers: true },
  });
  return questions;
}