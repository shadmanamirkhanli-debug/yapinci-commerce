import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("File is required", 400);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return apiError("Unsupported file type", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File exceeds 5MB limit", 400);
    }

    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return apiError("Unsupported file extension", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return apiSuccess({ url: `/uploads/${filename}` });
  } catch (uploadError) {
    logger.error("Upload failed", {
      error: uploadError instanceof Error ? uploadError.message : "Unknown error",
    });
    return apiError("Upload failed", 500);
  }
}
