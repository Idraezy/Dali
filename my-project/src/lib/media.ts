import type { SupabaseClient } from "@supabase/supabase-js";

// Phone photos are often 3–10 MB. Shrinking them to a web-friendly size
// before upload makes saving many times faster on mobile data, and the
// pages that show them load faster too.
const MAX_PHOTO_SIDE = 1600;
const PHOTO_QUALITY = 0.82;

export async function shrinkPhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // JPEG has no transparency; paint it white rather than black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", PHOTO_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // Formats the browser can't decode (e.g. HEIC on some devices) go up as-is.
    return file;
  }
}

// A stalled connection otherwise leaves the button spinning forever.
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Uploads to a public bucket and returns the file's public URL. Allows
// 30 seconds plus 10 seconds per MB, enough for slow mobile data.
export async function uploadPublic(
  supabase: SupabaseClient,
  bucket: string,
  file: File,
  prefix = ""
): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${prefix}${crypto.randomUUID()}.${ext}`;
  const ms = 30_000 + (file.size / (1024 * 1024)) * 10_000;
  const { error } = await withTimeout(
    supabase.storage.from(bucket).upload(path, file, { contentType: file.type }),
    ms,
    `"${file.name}" is taking too long to upload. Check your connection and try again.`
  );
  if (error) throw new Error(`${file.name}: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
