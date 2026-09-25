Good catch! The README is your project's front door on GitHub. Let's give Inkbloom a professional introduction.

### ✅ `README.md` (Full File)

```markdown
# 🌸 Inkbloom

**Where writers blossom** — a 100% free platform built to support upcoming writers and passionate readers.

Inkbloom provides a safe space for authors to publish their original work and for readers to discover fresh voices across every genre. No paywalls, no pressure—just a community helping each other grow.

## ✨ Features

### For Writers
- 📚 **Publish Original Books** — Upload PDFs with secure Cloudflare R2 storage
- 📊 **Personal Dashboard** — Track published books, total readers, and engagement
- 🔗 **Invite Links** — Share unique book links that require reader authentication
- 🗑️ **Secure Deletion** — Remove books from both storage and database in one click
- 📝 **20+ Genres** — From Fiction to Mindset Shift, Financial to Relationships

### For Readers
- 📖 **Custom In-App Reader** — Smooth scrolling PDF viewer optimized for mobile
- 💾 **Page Memory** — Automatically saves your reading position
- ✅ **Reading Stats** — Track books in progress and completed reads
- 🔒 **Secure Access** — No downloads allowed, protecting authors' work
- 📱 **PWA Ready** — Install as a native app on any device

### Platform Security
- 🔐 **Role-Based Access** — Separate experiences for writers and readers
- 🛡️ **Signed URLs** — 7-day expiry prevents unauthorized sharing
- 🚫 **Private Storage** — Cloudflare R2 with no public access
- ✅ **Email Verification** — All users must verify before publishing
- 🔥 **Server-Side Verification** — Ownership checks on all delete operations

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS with dark mode support
- **PDF Rendering:** react-pdf (pdf.js)
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **Storage:** Cloudflare R2 (private)
- **Hosting:** Vercel (with serverless functions)
- **PWA:** vite-plugin-pwa

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Authentication & Firestore enabled
- Cloudflare R2 bucket (private access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/inkbloom-app.git
   cd inkbloom-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Fill in your credentials** in `.env.local`:
   ```env
   # Cloudflare R2 (Development Only)
   VITE_R2_ACCOUNT_ID=your_account_id
   VITE_R2_ACCESS_KEY_ID=your_access_key
   VITE_R2_SECRET_ACCESS_KEY=your_secret_key
   VITE_R2_BUCKET_NAME=your_bucket_name

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:5173](http://localhost:5173)

## 📦 Deployment

### Vercel Setup

1. **Connect your GitHub repo** to Vercel
2. **Add environment variables** (see `.env.example` for required vars)
   - R2 variables use `R2_*` prefix (no `VITE_`)
   - Firebase variables use `VITE_FIREBASE_*` prefix
3. **Deploy** — Vercel auto-detects Vite and serverless functions

### Cloudflare R2 Configuration

1. Create a bucket (e.g., `inkbloom-books`)
2. **Disable public access** in bucket settings
3. Configure CORS policy:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### Firestore Security Rules

Deploy the rules from the Firebase Console to protect your data:
- Writers can only manage their own books
- Readers can only track their own reading progress
- All operations require authentication

## 📱 Usage Flow

### Publishing a Book
1. Sign up as a **Writer**
2. Verify your email
3. Go to **My Dashboard**
4. Fill in title, genre, description
5. Upload PDF (max 50MB)
6. Share the generated invite link

### Reading a Book
1. Click an invite link or browse **Discover**
2. Sign in (or sign up) if not already
3. Start reading with automatic page tracking
4. Mark as finished when done
5. View your reading stats on **My Profile**

## 🔒 Security Architecture

- **Storage:** All PDFs stored in private Cloudflare R2 bucket
- **Access:** Signed URLs generated server-side with 7-day expiry
- **Rendering:** PDFs fetched as blobs, rendered in-app (no direct downloads)
- **Authentication:** Firebase ID tokens verified on all sensitive operations
- **Authorization:** Firestore security rules enforce ownership at database level

## 📄 License

© 2026 Inkbloom. All rights reserved.

Built with ❤️ by Feyisholadesigns

---

**[Visit Inkbloom](https://your-vercel-domain.vercel.app)** • **[Report Issues](https://github.com/YOUR_USERNAME/inkbloom-app/issues)**
```

### 📝 Update These Placeholders
Before committing, replace:
- `YOUR_USERNAME` → your actual GitHub username (appears 3 times)
- `your-vercel-domain.vercel.app` → your actual Vercel URL (after deployment)

### 🎨 Bonus: Add a Logo
If you want a banner image in the README, place `logo-banner.png` in your `public/` folder and add this right after the title:

```markdown
<p align="center">
  <img src="public/logo-banner.png" alt="Inkbloom Banner" width="600"/>
</p>
```

