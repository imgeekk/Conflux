import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const hex = process.env.GEMINI_KEY_ENCRYPTION_KEY;
  if (!hex) throw new Error("GEMINI_KEY_ENCRYPTION_KEY not set");
  return Buffer.from(hex, "hex");
}

export function encryptApiKey(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  // format: iv:tag:ciphertext (all hex, colon-separated)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptApiKey(ciphertext: string): string {
  const key = getKey();
  const [ivHex, tagHex, encrypted] = ciphertext.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
