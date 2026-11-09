import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, isSessionValid } from "../../../../lib/letter-access";

export const runtime = "nodejs";

const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!isSessionValid((await cookies()).get(ACCESS_COOKIE)?.value)) {
    return new Response(null, { status: 401, headers: privateHeaders });
  }
  const { file } = await params;
  const extension = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(webp|mp3)$/.exec(file)?.[1];
  if (!extension) {
    return new Response(null, { status: 404, headers: privateHeaders });
  }
  try {
    const bytes = await readFile(join(process.cwd(), ".private", "media", file));
    return new Response(new Uint8Array(bytes), { headers: { ...privateHeaders, "Content-Type": extension === "mp3" ? "audio/mpeg" : "image/webp" } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response(null, { status: 404, headers: privateHeaders });
    }
    throw error;
  }
}
