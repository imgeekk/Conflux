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
    include: { workspace: true },
  });
  return space;
}

// member services

export async function getMemberByUserIdAndWorkspaceId(
  userId: string,
  workspaceId: string,
) {
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return member;
}

// document services

export async function createDocument(
  title: string,
  content: string,
  spaceId: string,
  authorId: string,
) {
  const document = await prisma.document.create({
    data: {
      title,
      content,
      spaceId,
      authorId,
    },
  });
  return document;
}

export async function getDocumentsBySpaceId(spaceId: string) {
  const docs = await prisma.document.findMany({
    where: { spaceId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: { author: { select: { id: true, name: true, image: true } } },
  });
  return docs;
}

export async function getDocumentById(docId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      space: { select: { id: true, name: true, workspaceId: true } },
      chunks: { select: { id: true } },
    },
  });
  return doc;
}

export async function updateDocument(
  docId: string,
  title?: string,
  content?: string,
) {
  const updated = await prisma.document.update({
    where: { id: docId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content }),
    },
  });
  return updated;
}

export async function deleteDocument(docId: string) {
  await prisma.document.delete({ where: { id: docId } });
}

// chunk services

export async function deleteDocumentChunks(docId: string) {
  await prisma.chunk.deleteMany({
    where: {
      documentId: docId,
    },
  });
}

export async function deleteAnswerChunks(answerId: string) {
  await prisma.chunk.deleteMany({
    where: {
      answerId,
    },
  });
}

// question services

export async function getQuestionsBySpaceId(spaceId: string) {
  const questions = await prisma.question.findMany({
    where: { spaceId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { author: true, answers: { include: { author: true } } },
  });
  return questions;
}

export async function createQuestion(
  text: string,
  spaceId: string,
  authorId: string,
) {
  const question = await prisma.question.create({
    data: {
      text,
      spaceId,
      authorId,
    },
  });
  return question;
}

export async function getQuestionById(questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      space: { select: { workspaceId: true } },
      author: { select: { id: true, name: true, image: true } },
      answers: { include: { author: true } },
    },
  });
  return question;
}

export async function updateQuestion(questionId: string, text?: string) {
  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      ...(text !== undefined && { text: text.trim() }),
    },
  });
  return updated;
}

export async function deleteQuestion(questionId: string) {
  await prisma.question.delete({ where: { id: questionId } });
}

// answer services

export async function createAnswer(
  questionId: string,
  body: string,
  isAiDraft: boolean,
  authorId?: string,
) {
  const answer = await prisma.answer.create({
    data: {
      questionId,
      body,
      authorId,
      isAiDraft,
    },
  });
  return answer;
}

export async function getAnswerById(answerId: string) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: {
      question: {
        select: { id: true, spaceId: true, authorId: true, text: true },
        include: { space: { select: { workspaceId: true } } },
      },
      author: { select: { id: true, name: true, image: true } },
    },
  });
  return answer;
}

export async function acceptAnswer(answerId: string, questionId: string) {
  const previouslyAccepted = await prisma.answer.findFirst({
    where: {
      id: { not: answerId },
      isAccepted: true,
      questionId,
    },
    select: { id: true },
  });
  const [accepted, _] = await prisma.$transaction([
    prisma.answer.update({
      where: { id: answerId },
      data: {
        isAccepted: true,
      },
    }),
    prisma.answer.updateMany({
      where: { id: { not: answerId }, isAccepted: true },
      data: { isAccepted: false },
    }),
  ]);
  return { accepted, previouslyAcceptedId: previouslyAccepted?.id ?? null };
}

export async function updateAnswer(
  answerId: string,
  body?: string,
  isAiDraft?: boolean,
) {
  const updated = await prisma.answer.update({
    where: { id: answerId },
    data: {
      ...(body !== undefined && { body }),
      ...(isAiDraft !== undefined && { isAiDraft }),
    },
  });
  return updated;
}
