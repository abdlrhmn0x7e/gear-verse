import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { AppError } from "~/lib/errors/app-error";
import { MAX_UPLOAD_SIZE_BYTES } from "~/lib/schemas/contracts/admin/s3";

const MAX_REDIRECTS = 3;

/**
 * Downloads an image from a link a chat client handed the MCP server. The link is untrusted, so the fetch goes
 * through better-auth's metadata fetcher: HTTPS only, every DNS answer must be a public address and the connection is
 * pinned to it, and redirects are returned rather than followed, so each hop is checked the same way.
 */
export async function downloadImage(url: string) {
  let response: Response;
  let current = url;

  for (let hop = 0; ; hop++) {
    try {
      response = await fetchClientMetadataResource(current, {
        // many image hosts (Wikimedia, CDNs) refuse requests without one
        headers: {
          accept: "image/*",
          "user-agent": "GearVerse/1.0 (+https://www.gearverse-eg.com)",
        },
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new AppError(
        `Couldn't download ${url}. Only public https links work.`,
        "BAD_REQUEST",
      );
    }

    const location = response.headers.get("location");
    if (response.status < 300 || response.status >= 400 || !location) break;
    if (hop === MAX_REDIRECTS) {
      throw new AppError(`${url} redirects too many times`, "BAD_REQUEST");
    }
    current = new URL(location, current).toString();
  }

  if (!response.ok || !response.body) {
    throw new AppError(
      `Couldn't download ${url}: the server answered ${response.status}`,
      "BAD_REQUEST",
    );
  }

  const tooBig = new AppError(`${url} is over 10 MB`, "BAD_REQUEST");
  if (Number(response.headers.get("content-length")) > MAX_UPLOAD_SIZE_BYTES) {
    await response.body.cancel();
    throw tooBig;
  }

  // the length header is optional and can lie, so the limit holds while reading
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > MAX_UPLOAD_SIZE_BYTES) throw tooBig;
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);

  const mimeType = imageType(bytes);
  if (!mimeType) {
    throw new AppError(`${url} isn't a PNG, JPEG or WebP image`, "BAD_REQUEST");
  }

  return { bytes, mimeType };
}

/** The type from the file's first bytes; the server's Content-Type is only a claim. */
function imageType(bytes: Buffer) {
  if (bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) {
    return "image/png";
  }
  if (bytes.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"))) {
    return "image/jpeg";
  }
  if (
    bytes.toString("latin1", 0, 4) === "RIFF" &&
    bytes.toString("latin1", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
}
