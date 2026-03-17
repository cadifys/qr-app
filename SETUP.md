# QRDocs SaaS – Setup Guide

## What you need
- A Google account (for Firebase — 100% free)
- A domain name (e.g. `qrdocs.in`) — only cost in this whole system
- Node.js 18+ installed

---

## Step 1 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `qrdocs` (or anything)
3. Enable **Google Analytics** (optional)

### Enable Authentication
- Firebase Console → Authentication → Get started
- Enable **Email/Password** provider

### Enable Firestore
- Firebase Console → Firestore Database → Create database
- Start in **production mode**
- Choose a region close to your users (e.g. `asia-south1` for India)

### Enable Storage
- Firebase Console → Storage → Get started
- Start in **production mode**
- Choose same region

### Get Web Config
- Firebase Console → Project Settings ⚙️ → Your apps → Add app → Web
- Copy the config values

---

## Step 2 — Install & Configure

```bash
cd app
npm install

# Copy env template
cp .env.example .env
```

Fill in `.env` with your Firebase values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=qrdocs.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qrdocs
VITE_FIREBASE_STORAGE_BUCKET=qrdocs.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_APP_DOMAIN=https://yourdomain.com
```

---

## Step 3 — Create Your Super Admin Account

1. Firebase Console → Authentication → Users → Add user
2. Enter your email & a strong password
3. Note the **UID** shown after creation
4. Firebase Console → Firestore → Start collection → ID: `superAdmins`
5. Add document with **Document ID = your UID**
6. Fields: `email` (string), `name` (string), `createdAt` (timestamp → now)

---

## Step 4 — Deploy Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase init   # select: Hosting, Firestore, Storage
                # use existing project
firebase deploy --only firestore:rules,storage
```

---

## Step 5 — Build & Deploy

```bash
npm run build
firebase deploy --only hosting
```

Your app is now live at `your-project.web.app` (free Firebase domain).

---

## Step 6 — Connect Your Custom Domain

1. Firebase Console → Hosting → Add custom domain
2. Enter `yourdomain.com`
3. Add DNS records at your domain registrar (Firebase shows you exactly what to add)
4. Wait for SSL to auto-provision (5–30 min)

### For subdomain admin panels (optional)
To support `kalash.yourdomain.com` → org admin, add wildcard DNS:
- Type: `A` or `CNAME`
- Name: `*`
- Points to: Firebase Hosting IP (Firebase shows this)

Then update `VITE_APP_DOMAIN=https://yourdomain.com` and redeploy.

---

## Step 7 — Configure Storage CORS

Run this once to allow PDF embedding in browsers:
```bash
# Install gsutil if not already installed (part of Google Cloud SDK)
gsutil cors set cors.json gs://YOUR_PROJECT.appspot.com
```

---

## Usage Flow

### Onboard a new client
1. Login to `yourdomain.com` with your super admin credentials
2. Click **Onboard Organization**
3. Fill in business name, slug, contact email
4. Create their admin account
5. They get a password reset email automatically

### Client adds products
1. Client logs in to `yourdomain.com/app/their-slug/login`
2. Goes to **Products** → Add Product
3. Uploads PDF for each product
4. Downloads QR code (PNG for print, SVG for design)
5. Prints QR on packaging

### End user scans QR
1. Scan QR → opens `yourdomain.com/scan/PRODUCT_ID`
2. Shows latest PDF in browser
3. No app download needed, no login needed

### Client updates PDF
1. Admin logs in → goes to product
2. Clicks **Update PDF** → uploads new file
3. **All previously printed QR codes automatically show the new PDF**

---

## Firebase Free Tier Limits

| Service      | Free Limit             | Notes                          |
|-------------|------------------------|--------------------------------|
| Firestore    | 50K reads/day          | Plenty for hundreds of scans   |
| Firestore    | 20K writes/day         | Plenty for PDF uploads         |
| Storage      | 5 GB storage           | ~1000 PDFs at 5MB each         |
| Storage      | 1 GB/day download      | ~200 PDF views/day             |
| Hosting      | 10 GB storage          | More than enough for the app   |
| Hosting      | 360 MB/day transfer    | Fine for a small app           |
| Auth         | Unlimited users        | Free forever                   |

**Cost = $0/month** (assuming moderate usage)

---

## Scaling

When you grow and need more:
- Upgrade to **Firebase Blaze (pay-as-you-go)** — still very cheap
- Storage: ~$0.026/GB/month
- Firestore reads: ~$0.06 per 100K reads
- For 10,000 scans/day: roughly $0.06/day = ~₹150/month
