# K3B Sports Management — Website

Complete website for k3bsports.com. Built with vanilla HTML/CSS/JS + Vercel serverless functions for the AI evaluation engine.

---

## File Structure

```
k3bsports/
├── index.html                  ← Homepage
├── vercel.json                 ← Vercel config
├── css/
│   └── global.css              ← All shared styles
├── js/
│   └── k3b.js                  ← Shared utilities, auth, data
├── api/
│   └── evaluate.js             ← Serverless function (Claude AI)
├── pages/
│   ├── assessment.html         ← 26-question survey + AI evaluation
│   ├── services.html           ← Services page
│   ├── contact.html            ← Contact form
│   └── about.html              ← About page (add when ready)
├── athlete/
│   ├── login.html              ← Athlete login
│   └── portal.html             ← Athlete dashboard/portal
└── admin/
    ├── login.html              ← Admin login
    └── dashboard.html          ← Full athlete management console
```

---

## How to Deploy to Vercel

### Step 1 — Get your Anthropic API Key
1. Go to console.anthropic.com
2. Sign in or create an account
3. Go to API Keys → Create Key
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Upload to GitHub
1. Go to github.com → Sign in → New Repository
2. Name it `k3bsports` → Create Repository
3. Upload all these files (drag and drop the entire folder)
4. Click "Commit changes"

### Step 3 — Deploy on Vercel
1. Go to vercel.com → Sign in with GitHub
2. Click "New Project" → Import your `k3bsports` repo
3. Click "Deploy" (default settings work)

### Step 4 — Add Your API Key
1. In Vercel, go to your project → Settings → Environment Variables
2. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: (paste your key from Step 1)
3. Click Save → Go to Deployments → Redeploy

### Step 5 — Connect Your Domain
1. In Vercel → Settings → Domains
2. Add `k3bsports.com` and `www.k3bsports.com`
3. Vercel will show you DNS records to add
4. Log into Wix → Domains → DNS Settings
5. Add the records Vercel shows you
6. Done — your site goes live within minutes

---

## Admin Access

URL: `yoursite.com/admin/login.html`

Default credentials (CHANGE THESE after first login):
- Username: `admin`
- Password: `k3badmin`

To change admin credentials, open `admin/login.html` and find this line:
```javascript
const ADMIN_CREDENTIALS = [
  { username: 'admin', password: 'k3badmin', name: 'K3B Admin' }
];
```
Change the username and password to whatever you want.

---

## Athlete Demo Accounts

Four demo athletes are pre-loaded for testing:
- marcus.t@email.com / demo123 (Status: Under Review)
- jasmine.r@email.com / demo123 (Status: Monitoring)
- devon.w@email.com / demo123 (Status: Accepted)
- tyler.o@email.com / demo123 (Status: Not a Fit)

---

## How the AI Evaluation Works

1. Athlete completes the 26-question WHO-BREF survey
2. Scores are calculated across 4 domains (0–100 each)
3. A detailed prompt is sent to the Claude API via `/api/evaluate`
4. Claude returns a JSON evaluation with: recommendation (REVIEW/MONITOR/PASS), headline, summaries, strengths, red flags, and a personal message to the athlete
5. Results are stored locally and shown to the athlete
6. You see all results in the admin dashboard

---

## Data Storage

Currently uses browser localStorage for simplicity. This means:
- Data persists on each device until cleared
- Perfect for launch and early users
- When you're ready to scale, I can upgrade this to a real database (Supabase/PlanetScale) — just ask

---

## Pages Overview

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | / | Main landing page |
| Assessment | /pages/assessment.html | 4-domain survey + AI eval |
| Services | /pages/services.html | Service descriptions |
| Contact | /pages/contact.html | Contact form |
| Athlete Login | /athlete/login.html | Athlete sign-in |
| Athlete Portal | /athlete/portal.html | Application tracking |
| Admin Login | /admin/login.html | Admin sign-in |
| Admin Dashboard | /admin/dashboard.html | Manage all athletes |

---

Built for K3B Sports Management, LLC · k3bsports.com
