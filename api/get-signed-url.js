// api/get-signed-url.js
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: "Missing book key parameter" });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ResponseContentType: "application/pdf",
    });
    
    // ✅ 7 days (R2 maximum). The reader consumes this URL within seconds of
    // generation (blob fetch), so legitimate sessions never see an expiry.
    const url = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
    
    res.status(200).json({ url });
  } catch (err) {
    console.error("R2 Signed URL Error:", err);
    res.status(500).json({ error: "Failed to generate secure reading link" });
  }
}