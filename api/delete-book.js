// api/delete-book.js
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

  const { r2Key } = req.body;
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!r2Key || !token) {
    return res.status(400).json({ error: "Missing r2Key or token" });
  }

  try {
    // ✅ Verify the Firebase ID token without needing admin SDK
    const lookup = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!lookup.ok) return res.status(401).json({ error: "Unauthorized" });

    const { users } = await lookup.json();
    const uid = users?.[0]?.localId;

    // ✅ Ownership check: R2 keys always start with the owner's uid
    if (!uid || !r2Key.startsWith(`${uid}/`)) {
      return res.status(403).json({ error: "You can only delete your own books" });
    }

    await r2Client.send(
      new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: r2Key })
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("R2 Delete Error:", err);
    res.status(500).json({ error: "Failed to delete book file" });
  }
}