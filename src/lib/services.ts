import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

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
    orderBy: { createdAt: "desc" }, // this would be the most recent workspace the user joined
    include: { workspace: true },
  });
  const workspace = membership?.workspace ?? null;
  return workspace;
}

export async function joinWorkspaceWithCode(code: string, userId: string) {
  const invite = await getInviteByCode(code);
  if (!invite)
    return { ok: false as const, error: "Invalid or expired invite" };

  const existing = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId: invite.workspaceId },
    },
  });
  if (existing)
    return {
      ok: false as const,
      alreadyMember: true,
      workspace: invite.workspace,
    };

  try {
    await prisma.$transaction(async (tx) => {
      const res = await tx.invite.update({
        where: {
          id: invite.id,
          uses: { lt: invite.maxUses ?? Number.MAX_SAFE_INTEGER },
        },
        data: {
          uses: { increment: 1 },
        },
      });
      if (!res) throw new Error("INVITE_EXHAUSTED");
      await tx.member.create({
        data: {
          userId,
          workspaceId: invite.workspaceId,
          role: "MEMBER",
        },
      });
    });
  } catch (error) {
    if ((error as Error).message === "INVITE_EXHAUSTED") {
      return { ok: false as const, error: "Invalid or expired invite" };
    }
    throw error;
  }

  return {
    ok: true as const,
    alreadyMember: false,
    workspace: invite.workspace,
  };
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

export async function getWorkspaceMembers(workspaceId: string) {
  const members = await prisma.member.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
  return members;
}

export async function deleteMember(userId: string, workspaceId: string) {
  await prisma.member.delete({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function getMember(memberId: string) {
  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
  });
  return member;
}

// document services

export async function createDocument(
  title: string,
  content: string,
  spaceId: string,
  authorId: string,
  tagIds?: string[],
) {
  const document = await prisma.document.create({
    data: {
      title,
      content,
      spaceId,
      authorId,
      ...(tagIds?.length && {
        tags: {
          createMany: {
            data: tagIds.map((tagId) => ({ tagId })),
          },
        },
      }),
    },
    include: { tags: { include: { tag: true } } },
  });

  if (tagIds?.length) {
    await Promise.all(
      tagIds.map((tagId) => addExpertScore(authorId, tagId, 5)),
    );
  }

  return document;
}

export async function getDocumentsBySpaceId(spaceId: string) {
  const docs = await prisma.document.findMany({
    where: { spaceId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
    },
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
      tags: { include: { tag: true } },
    },
  });
  return doc;
}

export async function updateDocument(
  docId: string,
  title?: string,
  content?: string,
  tagIds?: string[],
) {
  if (tagIds !== undefined) {
    const oldDoc = await prisma.document.findUnique({
      where: { id: docId },
      select: { authorId: true, tags: { select: { tagId: true } } },
    });
    const oldTagIds = oldDoc?.tags.map((t) => t.tagId) ?? [];
    const removedTagIds = oldTagIds.filter((id) => !tagIds.includes(id));
    const addedTagIds = tagIds.filter((id) => !oldTagIds.includes(id));
    await Promise.all([
      removedTagIds.map((tagId) => addExpertScore(oldDoc!.authorId, tagId, -5)),
      addedTagIds.map((tagId) => addExpertScore(oldDoc!.authorId, tagId, 5)),
    ]);
  }

  const updated = await prisma.document.update({
    where: { id: docId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content }),
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          createMany: {
            data: tagIds.map((tagId) => ({ tagId })),
          },
        },
      }),
    },
    include: { tags: { include: { tag: true } } },
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
        select: {
          id: true,
          spaceId: true,
          authorId: true,
          text: true,
          space: { select: { workspaceId: true } },
        },
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
      include: {
        question: {
          select: {
            space: {
              select: {
                documents: { select: { tags: { select: { tag: true } } } },
              },
            },
          },
        },
      },
    }),
    prisma.answer.updateMany({
      where: { id: { not: answerId }, isAccepted: true },
      data: { isAccepted: false },
    }),
  ]);

  const authorId = accepted.authorId;
  const tagIds = accepted.question.space.documents.flatMap((doc) =>
    doc.tags.map((t) => t.tag.id),
  );
  await Promise.all([
    tagIds.map((tagId) => addExpertScore(authorId!, tagId, 10)),
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

// tag services

export async function getTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
  return tags;
}

export async function createTag(name: string) {
  const tag = await prisma.tag.create({
    data: { name: name.trim() },
  });
  return tag;
}

// expert score services

export async function addExpertScore(
  userId: string,
  tagId: string,
  points: number,
) {
  const expertScore = await prisma.expertScore.upsert({
    where: {
      userId_tagId: { userId, tagId },
    },
    update: {
      score: { increment: points },
    },
    create: {
      userId,
      tagId,
      score: points,
    },
  });
}

export async function getExpertScoresByTag(tagId: string) {
  const expertScores = await prisma.expertScore.findMany({
    where: { tagId, score: { gt: 0 } },
    orderBy: { score: "desc" },
    include: { user: { select: { id: true, name: true, image: true } } },
  });
  return expertScores;
}

export async function getExpertScoresByUser(userId: string) {
  const expertScores = await prisma.expertScore.findMany({
    where: { userId, score: { gt: 0 } },
    orderBy: { score: "desc" },
    include: { tag: true },
  });
  return expertScores;
}

export async function getTopExpertsByTagIds(
  memberIds: string[],
  tagIds: string[],
  take: number,
) {
  const users = await prisma.user.findMany({
    where: {
      id: { in: memberIds },
      expertScores: {
        some: {
          tagId: { in: tagIds },
          score: { gt: 0 },
        },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      expertScores: {
        where: {
          tagId: { in: tagIds },
          score: { gt: 0 },
        },
        orderBy: { score: "desc" },
        select: {
          tag: { select: { id: true, name: true } },
          score: true,
        },
      },
    },
  });

  return users
    .map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      totalScore: u.expertScores.reduce((sum, es) => sum + es.score, 0),
      topTag: u.expertScores[0]?.tag ?? null,
    }))
    .filter((u) => u.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, take);
}

export async function getTopExpertsInWorkspace(
  workspaceId: string,
  take: number,
) {
  if (!workspaceId) return [];
  const members = await prisma.member.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);
  if (!memberIds.length) return [];

  const docTags = await prisma.documentTag.findMany({
    where: {
      document: {
        space: {
          workspaceId,
        },
      },
    },
    select: { tagId: true },
    distinct: ["tagId"],
  });

  const tagIds = docTags.map((t) => t.tagId);
  if (tagIds.length === 0) return [];

  return getTopExpertsByTagIds(memberIds, tagIds, take);
}

export async function getTopExpertsInSpace(spaceId: string, take: number) {
  if (!spaceId) return [];
  const members = await prisma.member.findMany({
    where: {
      workspace: {
        spaces: {
          some: { id: spaceId },
        },
      },
    },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);
  if (!memberIds.length) return [];

  const docTags = await prisma.documentTag.findMany({
    where: {
      document: {
        spaceId,
      },
    },
    select: { tagId: true },
    distinct: ["tagId"],
  });

  const tagIds = docTags.map((t) => t.tagId);
  if (tagIds.length === 0) return [];

  return getTopExpertsByTagIds(memberIds, tagIds, take);
}

export async function getTopExpertsForQuery(
  documentIds: string[],
  workspaceId: string,
  take: number,
) {
  if (documentIds.length === 0) return [];

  const docTags = await prisma.documentTag.findMany({
    where: {
      documentId: { in: documentIds },
    },
    select: { tagId: true },
  });
  const tagIds = docTags.map((t) => t.tagId);
  if (tagIds.length === 0) return [];

  const members = await prisma.member.findMany({
    where: {
      workspaceId,
    },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);
  if (memberIds.length === 0) return [];

  return getTopExpertsByTagIds(memberIds, tagIds, take);
}

// invite services

export async function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 10; i++) {
    const bytes = randomBytes(8);
    let code = "";
    for (let j = 0; j < 8; j++) code += chars[bytes[j] % chars.length];
    const existing = await prisma.invite.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Could not generate unique invite code");
}

export async function createInvite(
  workspaceId: string,
  createdBy: string,
  maxUses: number | null,
  expiresAt?: Date,
) {
  const code = await generateInviteCode();
  return prisma.invite.create({
    data: {
      code,
      workspaceId,
      createdBy,
      ...(expiresAt ? { expiresAt } : {}),
      maxUses: maxUses ?? null,
    },
  });
}

export async function getInvites(workspaceId: string) {
  const invites = await prisma.invite.findMany({
    where: {
      workspaceId,
    },
    orderBy: { createdAt: "desc" },
  });
  return invites;
}

export async function revokeInvite(inviteId: string) {
  const revoked = await prisma.invite.update({
    where: {
      id: inviteId,
    },
    data: {
      revoked: true,
    },
  });
}

export async function getInviteByCode(code: string) {
  const invite = await prisma.invite.findUnique({
    where: {
      code,
    },
    include: {
      workspace: { select: { id: true, name: true } },
    },
  });
  if (!invite || invite.revoked) return null;
  if (invite.expiresAt && invite.expiresAt < new Date()) return null;
  if (invite.maxUses !== null && invite.uses >= invite.maxUses) return null;
  return invite;
}

export async function getInviteById(inviteId: string) {
  const invite = await prisma.invite.findUnique({
    where: {
      id: inviteId,
    },
  });
  return invite;
}
