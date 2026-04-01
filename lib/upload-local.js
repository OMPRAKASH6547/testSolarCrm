import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export async function saveUploadBuffer(buffer, originalName) {
  await mkdir(UPLOAD_ROOT, { recursive: true });
  const ext = path.extname(originalName || "") || ".bin";
  const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const full = path.join(UPLOAD_ROOT, name);
  await writeFile(full, buffer);
  return `/uploads/${name}`;
}
