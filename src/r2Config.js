// src/r2Config.js
import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || 'inkbloom-books';

const accountId = import.meta.env.VITE_R2_ACCOUNT_ID;
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;

// ✅ Dev-only sanity check with a human-readable error
if (import.meta.env.DEV && (!accountId || !accessKeyId || !secretAccessKey)) {
  console.error(
    "❌ R2 credentials missing! Check that .env.local (project root) contains " +
    "VITE_R2_ACCOUNT_ID, VITE_R2_ACCESS_KEY_ID, VITE_R2_SECRET_ACCESS_KEY — " +
    "and RESTART the dev server (npm run dev) after editing it."
  );
}

// ✅ DEV-ONLY client. In production this is null (uploads go through /api/upload-book)
export const r2Client =
  import.meta.env.DEV && accountId && accessKeyId && secretAccessKey
    ? new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })
    : null;