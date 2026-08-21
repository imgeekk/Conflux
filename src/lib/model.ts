import { GoogleGenAI } from "@google/genai";
import { prisma } from "./prisma";
import { decryptApiKey } from "./crypto";

const defaultClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const answeringModel = "gemini-2.5-flash-lite";
export const embeddingModel = "gemini-embedding-001";

async function getClient(workspaceId?: string) {
  if (!workspaceId) return defaultClient;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { geminiApiKey: true },
  });

  if (!workspace?.geminiApiKey) return defaultClient;

  const decryptedApiKey = decryptApiKey(workspace.geminiApiKey);
  return new GoogleGenAI({ apiKey: decryptedApiKey });
}

export async function generateEmbedding(
  text: string,
  workspaceId?: string,
): Promise<number[]> {
  const client = await getClient(workspaceId);
  const result = await client.models.embedContent({
    model: embeddingModel,
    contents: [{ text }],
    config: {
      outputDimensionality: 768,
    },
  });
  return result.embeddings?.at(0)?.values ?? [];
}

export async function generateAnswer(
  question: string,
  contextChunks: string[],
  workspaceId?: string,
): Promise<string> {
  const context = contextChunks.join("\n\n---\n\n");

  const prompt = `You are a helpful team knowledge assistant for Conflux.
Answer the question using ONLY the context provided below.
Be concise and direct. If the context doesn't contain enough information to answer confidently, say so clearly.
Always answer in plain text — no markdown formatting.

Context:
${context}

Question: ${question}

Answer:`;

  const client = await getClient(workspaceId);
  const result = await client.models.generateContent({
    model: answeringModel,
    contents: [{ text: prompt }],
  });
  return result.text ?? "Sorry, I couldn't generate an answer.";
}
