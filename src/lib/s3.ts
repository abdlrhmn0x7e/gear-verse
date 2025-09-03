import { env } from "~/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cuid from "cuid";

const s3 = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

async function s3GetPresignedUrl(type: string, size: number) {
  const key = cuid();
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: type,
    ContentLength: size,
  });

  return {
    key,
    url: await getSignedUrl(s3, command, {
      expiresIn: 60 * 5, // 5 minutes
    }),
    accessUrl: s3GetPublicUrl(key),
  };
}

function s3GetPublicUrl(key: string) {
  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;
}

export { s3, s3GetPresignedUrl, s3GetPublicUrl };
