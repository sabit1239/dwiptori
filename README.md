# 🏝️ Dwiptori — দ্বীপ তরী
**Monthly Fund Collection Management System**

---

## ✅ Tech Stack (100% Free)

| Layer | Technology | Free Tier |
|-------|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS | ✅ Free forever |
| Auth | Firebase Authentication | ✅ 10,000 users/month |
| Database | Firebase Firestore | ✅ 1GB storage, 50K reads/day |
| Hosting | Vercel | ✅ Free subdomain (yourname.vercel.app) |
| Version Control | GitHub | ✅ Free private repos |
| PDF Receipts | jsPDF (client-side) | ✅ No backend needed |

---

## 📁 Project File Structure

```
dwiptori/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── shared/
│   │       └── Navbar.jsx
│   ├── hooks/
│   │   └── useAuth.jsx          ← Auth context + role management
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── member/
│   │   │   ├── MemberLayout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PayPage.jsx      ← bKash/Nagad form + TrxID submit
│   │   │   ├── ReceiptsPage.jsx ← PDF download
│   │   │   └── ProfilePage.jsx
│   │   └── admin/
│   │       ├── AdminLayout.jsx  ← Sidebar navigation
│   │       ├── AdminDash.jsx    ← Overview stats
│   │       ├── AdminPayments.jsx← Approve / Reject
│   │       ├── AdminMembers.jsx ← Role management
│   │       └── AdminNumbers.jsx ← bKash/Nagad number CRUD
│   ├── styles/
│   │   └── index.css
│   ├── firebase.js              ← ⚠️ Put YOUR config here
│   ├── App.jsx
│   └── main.jsx
├── firestore.rules              ← Copy to Firebase Console
├── vercel.json
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Step-by-Step Deployment Guide

### STEP 1 — Create Firebase Project (5 minutes)

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it `dwiptori` → click through the steps
3. **Enable Authentication:**
   - Left sidebar → Authentication → Get started
   - Sign-in method tab → Enable **Email/Password**
4. **Enable Firestore:**
   - Left sidebar → Firestore Database → Create database
   - Choose **"Start in production mode"** → select a region near you (e.g. `asia-south1` for Bangladesh)
5. **Get your config:**
   - Project Settings (⚙️ gear icon) → Your apps → Click `</>` (Web)
   - Register app → Copy the `firebaseConfig` object

### STEP 2 — Configure the App

Open `src/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",        // ← paste yours
  authDomain:        "dwiptori.firebaseapp.com",
  projectId:         "dwiptori",
  storageBucket:     "dwiptori.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

Open `src/hooks/useAuth.jsx` and add YOUR email to the admin list:

```js
const ADMIN_EMAILS = [
  'your-email@gmail.com',       // ← your email
  'finance@yourorg.com',        // ← finance secretary email
];
```

### STEP 3 — Set Firestore Security Rules

1. Firebase Console → Firestore → **Rules** tab
2. Delete the existing rules
3. Copy the entire content of `firestore.rules` and paste it
4. Click **"Publish"**

### STEP 4 — Push to GitHub

```bash
# In your project folder:
git init
git add .
git commit -m "Initial Dwiptori commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/dwiptori.git
git push -u origin main
```

### STEP 5 — Deploy to Vercel (3 minutes)

1. Go to **https://vercel.com** → Sign up with GitHub (free)
2. Click **"New Project"** → Import your `dwiptori` GitHub repo
3. Vercel auto-detects Vite → click **"Deploy"**
4. Your site is live at: **`https://dwiptori.vercel.app`** (or similar)
5. Every `git push` to `main` = automatic redeploy ✅

### STEP 6 — First Admin Setup

1. Visit your live site → Register with the admin email you added
2. You now have Admin access automatically
3. Go to **Admin Panel → Pay Numbers** → Add your bKash/Nagad numbers
4. Share the site URL with your members!

---

## 🔐 How Admin Privileges Work

- Admins are determined by email address in `useAuth.jsx`
- When a user registers with an admin email → role = `"admin"` in Firestore
- Any other email → role = `"member"`
- Admins can also promote/demote members from the Admin Members page
- Route guards (`AdminRoute`) prevent non-admins from accessing `/admin/*`

---

## 💳 Payment Flow

```
Member → Sends money via bKash/Nagad app
       → Fills form (Name, Phone, TrxID, Amount)
       → System checks: duplicate TrxID? → blocked ❌
       → Creates payment doc with status: "pending"
Admin  → Reviews: checks TrxID + Name + Phone
       → Clicks Approve ✅ → status: "approved" + totalPaid updated
                 OR Reject ❌ → status: "rejected"
Member → Sees approved status → downloads PDF receipt
```

---

## 🛠️ Local Development

```bash
npm install          # Install dependencies
npm run dev          # Start local server at localhost:5173
npm run build        # Build for production
```

---

## 📊 Firestore Collections Reference

### `users/{uid}`
```json
{
  "uid": "firebase-uid",
  "name": "Md. Rahim Uddin",
  "email": "rahim@gmail.com",
  "phone": "01712345678",
  "role": "member",          // or "admin"
  "totalPaid": 1500,
  "createdAt": "timestamp"
}
```

### `payments/{id}`
```json
{
  "uid": "member-firebase-uid",
  "memberName": "Md. Rahim Uddin",
  "memberEmail": "rahim@gmail.com",
  "senderName": "Rahim",
  "senderPhone": "01712345678",
  "trxId": "8J9K3MNP2Q",
  "amount": 500,
  "method": "bKash",
  "status": "pending",       // or "approved" / "rejected"
  "createdAt": "timestamp"
}
```

### `paymentNumbers/{id}`
```json
{
  "method": "bKash",         // or "Nagad"
  "number": "01812345678",
  "createdAt": "timestamp"
}
```

---

## 🎨 Customization

- **Colors:** Edit `tailwind.config.js` → change the `tide` and `island` color palettes
- **Logo:** Replace the `DwiptoriLogo` component in `Navbar.jsx` with an `<img>` tag
- **Monthly fee amount:** You can add a fixed-fee config to show members what they owe
- **Bengali text:** The `font-bengali` class uses Hind Siliguri — add Bengali strings as needed

---

## ⚠️ Firestore Free Tier Limits

| Resource | Free Limit | Est. for 100 members |
|----------|-----------|---------------------|
| Reads | 50,000/day | ~500/month ✅ |
| Writes | 20,000/day | ~200/month ✅ |
| Storage | 1 GB | <10 MB ✅ |
| Auth users | 10,000 | Way more than needed ✅ |

For a small organization, you will **never hit the free limits**.
