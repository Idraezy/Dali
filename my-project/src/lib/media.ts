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

// Give up on an attempt only when no bytes have moved for this long, so a
// big video on slow data keeps going as long as it is making progress.
const STALL_MS = 45_000;
const ATTEMPTS = 3;
// Several big files at once just split a weak connection between them, so
// at most this many upload together and the rest wait their turn.
const MAX_PARALLEL = 2;

let running = 0;
const waiting: (() => void)[] = [];

async function takeTurn<T>(job: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) await new Promise<void>((resolve) => waiting.push(resolve));
  running += 1;
  try {
    return await job();
  } finally {
    running -= 1;
    waiting.shift()?.();
  }
}

function sendOnce(url: string, token: string, file: File, onProgress?: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let stall: ReturnType<typeof setTimeout>;
    const resetStall = () => {
      clearTimeout(stall);
      stall = setTimeout(() => xhr.abort(), STALL_MS);
    };

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_ANON_KEY);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      resetStall();
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      clearTimeout(stall);
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status})`;
      try {
        message = JSON.parse(xhr.responseText).message ?? message;
      } catch {
        // Not JSON; keep the status message.
      }
      // Permission and size errors won't fix themselves; don't retry them.
      reject(Object.assign(new Error(message), { final: xhr.status >= 400 && xhr.status < 500 }));
    };
    xhr.onerror = () => {
      clearTimeout(stall);
      reject(new Error("The connection dropped during upload."));
    };
    xhr.onabort = () => reject(new Error("The upload stopped making progress."));
    resetStall();
    xhr.send(file);
  });
}

// Uploads to a public bucket and returns the file's public URL. Reports
// progress (0–1), and retries up to three times if the connection drops.
export async function uploadPublic(
  supabase: SupabaseClient,
  bucket: string,
  file: File,
  prefix = "",
  onProgress?: (fraction: number) => void
): Promise<string> {
  return takeTurn(async () => {
    const ext = file.name.split(".").pop() || "bin";
    for (let attempt = 1; ; attempt++) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
      const path = `${prefix}${crypto.randomUUID()}.${ext}`;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
      try {
        onProgress?.(0);
        await sendOnce(url, token, file, onProgress);
        onProgress?.(1);
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      } catch (err) {
        const final = (err as { final?: boolean }).final;
        if (final || attempt >= ATTEMPTS) {
          throw new Error(`${file.name}: ${(err as Error).message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  });
}
