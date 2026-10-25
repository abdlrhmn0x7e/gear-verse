import { env } from "~/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

async function s3GetPresignedUrl({
  fileId,
  name,
  mimeType,
  size,
}: {
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
}) {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: fileId,
    ContentType: mimeType,
    ContentLength: size,
  });

  return {
    fileId,
    // content-length is signed by default, so S3 refuses a body of any other
    // size. signing content-type too holds the upload to the checked type
    url: await getSignedUrl(s3, command, {
      expiresIn: 60 * 5, // 5 minutes
      signableHeaders: new Set(["content-type"]),
    }),
    name,
    mimeType,
    accessUrl: s3GetPublicUrl(fileId),
  };
}

/** Uploads a file the server already holds, for media that doesn't come from an admin's browser. */
async function s3PutObject({
  key,
  body,
  mimeType,
}: {
  key: string;
  body: Uint8Array;
  mimeType: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: mimeType,
    }),
  );
  return s3GetPublicUrl(key);
}

function s3GetPublicUrl(key: string) {
  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;
}

/** Whether a URL points at an object in the project's bucket. */
function s3IsPublicUrl(url: string) {
  const bucket = new URL(s3GetPublicUrl(""));

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  return (
    parsed.protocol === bucket.protocol &&
    parsed.host === bucket.host &&
    !parsed.username &&
    !parsed.password &&
    parsed.pathname.length > 1
  );
}

export { s3, s3GetPresignedUrl, s3GetPublicUrl, s3IsPublicUrl, s3PutObject };
