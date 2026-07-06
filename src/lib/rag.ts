import { generateEmbedding, generateAnswer } from "@/lib/model"
import { deleteChunks } from "./services"
import { prisma } from "@/lib/prisma"
import type { ProseMirrorNode, ProseMirrorDoc } from "@/lib/types"

const CHUNK_MAX_CHARS = 800
const CHUNK_OVERLAP = 80

function extractText(node: ProseMirrorNode): string {
  if (node.type === "image") {
    return (node.attrs?.alt as string) ?? ""
  }
  if (node.text) return node.text
  if (!node.content) return ""
  return node.content.map(extractText).join(" ").replace(/\s+/g, " ").trim()
}

function splitLongText(text: string): string[] {
  if (text.length <= CHUNK_MAX_CHARS) return [text]

  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
  const chunks: string[] = []
  let current = ""

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > CHUNK_MAX_CHARS) {
      if (current.trim()) chunks.push(current.trim())
      current = sentence
    } else {
      current += " " + sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks.length > 0 ? chunks : [text.slice(0, CHUNK_MAX_CHARS)]
}

function addOverlap(chunks: string[]): string[] {
  if (chunks.length <= 1) return chunks
  return chunks.map((chunk, i) => {
    if (i === 0) return chunk
    const prev = chunks[i - 1]
    const overlap = prev.slice(-CHUNK_OVERLAP).trim()
    return overlap ? `${overlap}\n\n${chunk}` : chunk
  })
}

function buildChunksFromJSON(
  doc: ProseMirrorDoc,
  title: string,
): string[] {
  const sections: { headingPath: string[]; content: string }[] = []
  let headingPath: string[] = [title]
  let currentContent = ""

  for (const node of doc.content) {
    if (node.type === "heading") {
      if (currentContent.trim()) {
        sections.push({ headingPath: [...headingPath], content: currentContent.trim() })
        currentContent = ""
      }
      const level = (node.attrs?.level as number) ?? 1
      const text = extractText(node)
      headingPath = headingPath.slice(0, level)
      headingPath[level - 1] = text
    } else {
      currentContent += extractText(node) + "\n\n"
    }
  }

  if (currentContent.trim()) {
    sections.push({ headingPath: [...headingPath], content: currentContent.trim() })
  }

  if (sections.length === 0) {
    sections.push({ headingPath: [title], content: extractText(doc) })
  }

  const chunks: string[] = []
  for (const section of sections) {
    const context = section.headingPath.join(" > ")
    const rawChunks = splitLongText(section.content)
    for (const raw of rawChunks) {
      chunks.push(`[${context}]\n${raw}`)
    }
  }

  return addOverlap(chunks)
}

function buildChunksFromText(text: string, title: string): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40)

  if (paragraphs.length === 0) {
    return text.length > 40 ? [`[${title}]\n${text.slice(0, CHUNK_MAX_CHARS)}`] : []
  }

  const chunks: string[] = []
  for (const para of paragraphs) {
    const rawChunks = splitLongText(para)
    for (const raw of rawChunks) {
      chunks.push(`[${title}]\n${raw}`)
    }
  }

  return addOverlap(chunks)
}

export async function embedDocument(
  documentId: string,
  title: string,
  content: string
) {
  await deleteChunks(documentId)

  const trimmed = content.trim()
  if (!trimmed) return

  let chunks: string[]
  if (trimmed.startsWith("{")) {
    try {
      const doc = JSON.parse(trimmed) as ProseMirrorDoc
      chunks = buildChunksFromJSON(doc, title)
    } catch {
      chunks = buildChunksFromText(trimmed, title)
    }
  } else {
    chunks = buildChunksFromText(trimmed, title)
  }

  for (const chunkText of chunks) {
    const embedding = await generateEmbedding(chunkText)
    const vector = `[${embedding.join(",")}]`

    await prisma.$executeRaw`
      INSERT INTO "Chunk" (id, content, "documentId", embedding, "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${chunkText},
        ${documentId},
        ${vector}::vector,
        NOW()
      )
    `
  }
}

export async function searchChunks(
  query: string,
  workspaceId: string,
  limit = 5
): Promise<{ content: string; documentId: string; documentTitle: string }[]> {
  const embedding = await generateEmbedding(query)
  const vector = `[${embedding.join(",")}]`

  const results = await prisma.$queryRaw<
    { content: string; documentId: string; title: string }[]
  >`
    SELECT
      c.content,
      c."documentId",
      d.title
    FROM "Chunk" c
    JOIN "Document" d ON d.id = c."documentId"
    JOIN "Space" s ON s.id = d."spaceId"
    WHERE s."workspaceId" = ${workspaceId}
      AND c.embedding IS NOT NULL
    ORDER BY c.embedding <=> ${vector}::vector
    LIMIT ${limit}
  `

  return results.map((r) => ({
    content: r.content,
    documentId: r.documentId,
    documentTitle: r.title,
  }))
}

export async function answerQuestion(
  question: string,
  workspaceId: string
): Promise<{
  answer: string
  sources: { documentId: string; documentTitle: string }[]
}> {
  const chunks = await searchChunks(question, workspaceId)

  if (chunks.length === 0) {
    return {
      answer:
        "I couldn't find any relevant information in your knowledge base to answer this question.",
      sources: [],
    }
  }

  const answer = await generateAnswer(
    question,
    chunks.map((c) => c.content)
  )

  const sources = chunks
    .filter(
      (c, i, arr) =>
        arr.findIndex((x) => x.documentId === c.documentId) === i
    )
    .map((c) => ({ documentId: c.documentId, documentTitle: c.documentTitle }))

  return { answer, sources }
}