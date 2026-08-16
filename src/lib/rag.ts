import { generateEmbedding, generateAnswer } from "@/lib/model";
import {
  deleteDocumentChunks,
  deleteAnswerChunks,
  getTopExpertsForQuery,
} from "./services";
import { prisma } from "@/lib/prisma";
import type {
  ProseMirrorNode,
  ProseMirrorDoc,
  ApiExpertSummary,
  SearchResponse,
} from "@/lib/types";

const CHUNK_MAX_CHARS = 800;
const CHUNK_OVERLAP = 80;
const LOW_CONFIDENCE_THRESHOLD = 0.6; // similarity below this → surface an expert
const EXPERT_SUGGESTION_LIMIT = 1;

function extractText(node: ProseMirrorNode): string {
  if (node.type === "image") {
    return (node.attrs?.alt as string) ?? "";
  }
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map(extractText).join(" ").replace(/\s+/g, " ").trim();
}

function splitLongText(text: string): string[] {
  if (text.length <= CHUNK_MAX_CHARS) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > CHUNK_MAX_CHARS) {
      if (current.trim()) chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.length > 0 ? chunks : [text.slice(0, CHUNK_MAX_CHARS)];
}

function addOverlap(chunks: string[]): string[] {
  if (chunks.length <= 1) return chunks;
  return chunks.map((chunk, i) => {
    if (i === 0) return chunk;
    const prev = chunks[i - 1];
    const overlap = prev.slice(-CHUNK_OVERLAP).trim();
    return overlap ? `${overlap}\n\n${chunk}` : chunk;
  });
}

function buildChunksFromJSON(doc: ProseMirrorDoc, title: string): string[] {
  const sections: { headingPath: string[]; content: string }[] = [];
  let headingPath: string[] = [title];
  let currentContent = "";

  for (const node of doc.content) {
    if (node.type === "heading") {
      if (currentContent.trim()) {
        sections.push({
          headingPath: [...headingPath],
          content: currentContent.trim(),
        });
        currentContent = "";
      }
      const level = (node.attrs?.level as number) ?? 1;
      const text = extractText(node);
      headingPath = headingPath.slice(0, level);
      headingPath[level - 1] = text;
    } else {
      currentContent += extractText(node) + "\n\n";
    }
  }

  if (currentContent.trim()) {
    sections.push({
      headingPath: [...headingPath],
      content: currentContent.trim(),
    });
  }

  if (sections.length === 0) {
    sections.push({ headingPath: [title], content: extractText(doc) });
  }

  const chunks: string[] = [];
  for (const section of sections) {
    const context = section.headingPath.join(" > ");
    const rawChunks = splitLongText(section.content);
    for (const raw of rawChunks) {
      chunks.push(`[${context}]\n${raw}`);
    }
  }

  return addOverlap(chunks);
}

function buildChunksFromText(text: string, title: string): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  if (paragraphs.length === 0) {
    return text.length > 40
      ? [`[${title}]\n${text.slice(0, CHUNK_MAX_CHARS)}`]
      : [];
  }

  const chunks: string[] = [];
  for (const para of paragraphs) {
    const rawChunks = splitLongText(para);
    for (const raw of rawChunks) {
      chunks.push(`[${title}]\n${raw}`);
    }
  }

  return addOverlap(chunks);
}

export async function embedDocument(
  documentId: string,
  title: string,
  content: string,
) {
  await deleteDocumentChunks(documentId);

  const trimmed = content.trim();
  if (!trimmed) return;

  let chunks: string[];
  if (trimmed.startsWith("{")) {
    try {
      const doc = JSON.parse(trimmed) as ProseMirrorDoc;
      chunks = buildChunksFromJSON(doc, title);
    } catch {
      chunks = buildChunksFromText(trimmed, title);
    }
  } else {
    chunks = buildChunksFromText(trimmed, title);
  }

  for (const chunkText of chunks) {
    const embedding = await generateEmbedding(chunkText);
    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO "Chunk" (id, content, "documentId", embedding, "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${chunkText},
        ${documentId},
        ${vector}::vector,
        NOW()
      )
    `;
  }
}

export async function embedAnswer(
  answerId: string,
  content: string,
  questionTitle: string,
) {
  await deleteAnswerChunks(answerId);

  const trimmed = content.trim();
  if (!trimmed) return;

  const chunks = buildChunksFromText(trimmed, questionTitle);

  for (const chunkText of chunks) {
    const embedding = await generateEmbedding(chunkText);
    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO "Chunk" (id, content, "answerId", embedding, "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${chunkText},
        ${answerId},
        ${vector}::vector,
        NOW()
      )
    `;
  }
}

export async function searchChunks(
  query: string,
  workspaceId: string,
  limit = 5,
): Promise<
  {
    content: string;
    sourceId: string;
    sourceTitle: string;
    sourceType: "document" | "answer";
    spaceId: string;
    confidence: number;
    author: { name: string; image: string | null } | null;
  }[]
> {
  const embedding = await generateEmbedding(query);
  const vector = `[${embedding.join(",")}]`;

  const [docResults, answerResults] = await Promise.all([
    prisma.$queryRaw<
      {
        content: string;
        sourceId: string;
        sourceTitle: string;
        sourceType: string;
        spaceId: string;
        authorName: string;
        authorImage: string | null;
        distance: number;
      }[]
    >`
      SELECT
        c.content,
        c."documentId" AS "sourceId",
        d.title AS "sourceTitle",
        'document' AS "sourceType",
        s.id AS "spaceId",
        au.name AS "authorName",
        au.image AS "authorImage",
        c.embedding <=> ${vector}::vector AS distance
      FROM "Chunk" c
      JOIN "Document" d ON d.id = c."documentId"
      JOIN "Space" s ON s.id = d."spaceId"
      JOIN "User" au ON au.id = d."authorId"
      WHERE s."workspaceId" = ${workspaceId}
        AND c."documentId" IS NOT NULL
        AND c.embedding IS NOT NULL
      ORDER BY distance
      LIMIT ${limit}
    `,
    prisma.$queryRaw<
      {
        content: string;
        sourceId: string;
        sourceTitle: string;
        sourceType: string;
        spaceId: string;
        authorName: string | null;
        authorImage: string | null;
        distance: number;
      }[]
    >`
      SELECT
        c.content,
        c."answerId" AS "sourceId",
        q.text AS "sourceTitle",
        'answer' AS "sourceType",
        s.id AS "spaceId",
        au.name AS "authorName",
        au.image AS "authorImage",
        c.embedding <=> ${vector}::vector AS distance
      FROM "Chunk" c
      JOIN "Answer" a ON a.id = c."answerId"
      JOIN "Question" q ON q.id = a."questionId"
      JOIN "Space" s ON s.id = q."spaceId"
      LEFT JOIN "User" au ON au.id = a."authorId"
      WHERE s."workspaceId" = ${workspaceId}
        AND c."answerId" IS NOT NULL
        AND c.embedding IS NOT NULL
      ORDER BY distance
      LIMIT ${limit}
    `,
  ]);

  const mergedResults = [...docResults, ...answerResults]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return mergedResults.map((r) => ({
    content: r.content,
    sourceId: r.sourceId,
    sourceTitle: r.sourceTitle,
    sourceType: r.sourceType as "document" | "answer",
    spaceId: r.spaceId,
    confidence: 1 - r.distance,
    author: r.authorName ? { name: r.authorName, image: r.authorImage } : null,
  }));
}

export async function answerQuestion(
  question: string,
  workspaceId: string,
): Promise<SearchResponse> {
  const chunks = await searchChunks(question, workspaceId);

  if (chunks.length === 0) {
    return {
      answer:
        "I couldn't find any relevant information in your knowledge base to answer this question.",
      sources: [],
      confidence: 0,
      lowConfidence: true,
      expert: null,
    };
  }

  const confidence = chunks[0].confidence;
  const lowConfidence = confidence < LOW_CONFIDENCE_THRESHOLD;

  const answer = await generateAnswer(
    question,
    chunks.map((c) => c.content),
  );

  const sources = chunks
    .filter(
      (c, i, arr) => arr.findIndex((x) => x.sourceId === c.sourceId) === i,
    )
    .map((c) => ({
      sourceId: c.sourceId,
      sourceTitle: c.sourceTitle,
      sourceType: c.sourceType,
      spaceId: c.spaceId,
      author: c.author,
    }));

  let expert: ApiExpertSummary | null = null;
  if (lowConfidence) {
    const documentIds = sources
      .filter((s) => s.sourceType === "document")
      .map((s) => s.sourceId);
    const experts = await getTopExpertsForQuery(
      documentIds,
      workspaceId,
      EXPERT_SUGGESTION_LIMIT,
    );
    expert = experts[0] ?? null;
  }

  return { answer, sources, confidence, lowConfidence, expert };
}
