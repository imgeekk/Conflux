import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const answeringModel = "gemma-4-31b";
export const embeddingModel = "gemini-embedding-001";

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await genAI.models.embedContent({
    model: embeddingModel,
    contents: [{ text }],
    config: {
      outputDimensionality: 768,
    }
  });
  return result.embeddings?.at(0)?.values ?? [];
}

export async function generateAnswer(
  question: string,
  contextChunks: string[],
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

  const result = await genAI.models.generateContent({
    model: answeringModel,
    contents: [{ text: prompt }],
  });
  return result.text ?? "Sorry, I couldn't generate an answer.";
}
