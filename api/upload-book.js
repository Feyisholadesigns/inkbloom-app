// api/upload-book.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileName, contentType } = req.body;
  
  if (!fileName || !contentType) {
    return res.status(400).json({ error: "Missing fileName or contentType" });
  }

  // Security: Only allow PDF uploads
  if (contentType !== "application/pdf") {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    // Generate pre-signed URL for direct browser upload (expires in 15 minutes)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    
    res.status(200).json({ 
      uploadUrl,
      finalKey: fileName 
    });
  } catch (err) {
    console.error("R2 Upload Error:", err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
}