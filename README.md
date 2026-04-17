# 💍 Wedding Planner

A real-time collaborative wedding planning app built with React + Firebase.

## Features
- ✅ Real-time sync across all users (Firebase Realtime Database)
- 👤 Per-user identity with name + role
- 📋 Vendor details logged to Google Sheets on every check-off
- 📝 Notes per checklist item (vendor, cost, date, website, free notes)
- 👁 Live presence — see who else is online

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/wedding-planner.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to vercel.com → New Project
2. Import your GitHub repo
3. Framework: **Create React App** (auto-detected)
4. Click **Deploy**

That's it — Vercel auto-deploys on every `git push`.

## Local Development
```bash
npm install
npm start
```
