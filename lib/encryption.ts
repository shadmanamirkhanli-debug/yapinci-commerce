import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("Invalid encryption key");
  }
  return Buffer.from(key, "hex");
}

export function encryptValue(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const part1 = cipher.update(value, "utf8");
  const part2 = cipher.final();
  const encrypted = Buffer.concat([part1, part2]);
  const authTag = cipher.getAuthTag();
  const ivPart = iv.toString("hex");
  const tagPart = authTag.toString("hex");
  const dataPart = encrypted.toString("hex");
  const result = [ivPart, tagPart, dataPart].join(":");
  return result;
}

export function decryptValue(encoded: string): string {
  const parts = encoded.split(":");
  const ivHex = parts[0];
  const authTagHex = parts[1];
  const dataHex = parts[2];
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const part1 = decipher.update(data);
  const part2 = decipher.final();
  const decrypted = Buffer.concat([part1, part2]);
  return decrypted.toString("utf8");
}

export function maskSecret(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  if (value.length <= 4) {
    return "****";
  }
  const lastFour = value.slice(-4);
  return "****" + lastFour;
}
