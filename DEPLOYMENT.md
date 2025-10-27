# Deployment Guide

This project supports two deployment modes:

## 1. GitHub Pages (Simple - No Payment Links)
**URL**: https://pavankumarswamy.github.io/

**Features**:
- ✅ Simple WhatsApp ordering
- ✅ Manual payment confirmation
- ❌ No automatic payment links

**Deploy Command**:
```bash
npm run deploy:ghpages
```

**Setup**:
1. Go to GitHub repo > Settings > Pages
2. Set Source to "Deploy from a branch: gh-pages / root"
3. Site will be live at: https://pavankumarswamy.github.io/

---

## 2. Custom Domain with Payment Links
**URL**: https://popandfun.gnritservices.com/

**Features**:
- ✅ WhatsApp ordering with Razorpay payment links
- ✅ Automatic payment link generation
- ✅ Full e-commerce functionality

### Step 1: Deploy Backend API

Choose one option:

#### Option A: Vercel (Recommended - Easiest)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (run from project root)
vercel

# Follow prompts, Vercel will auto-detect /api folder
```

Your API will be at: `https://your-project.vercel.app/api/create-payment-link`

#### Option B: Your Existing Server
1. Copy the `/api` folder to your server
2. Set up Node.js endpoint at `https://popandfun.gnritservices.com/api/create-payment-link`
3. Make sure it handles POST requests

### Step 2: Configure Environment

Update `.env.production`:
```env
VITE_API_ENDPOINT=https://popandfun.gnritservices.com/api
```

Or if using Vercel:
```env
VITE_API_ENDPOINT=https://your-project.vercel.app/api
```

### Step 3: Build & Deploy Frontend

```bash
# Build with production config
npm run build:production

# Deploy dist/ folder to your custom domain server
# Upload contents of dist/ to https://popandfun.gnritservices.com
```

---

## Environment Variables Summary

### GitHub Pages (No .env needed)
No configuration needed - automatically uses simple mode

### Custom Domain (.env.production)
```env
VITE_API_ENDPOINT=https://popandfun.gnritservices.com/api
```

### Backend API (api/create-payment-link.js)
Razorpay credentials are hardcoded in the backend file (already set):
- RAZORPAY_KEY_ID: `rzp_live_HJl9NwyBSY9rwV`
- RAZORPAY_KEY_SECRET: `1FlerafMmqHMw466ccsDxrhp`

---

## Quick Deploy Commands

```bash
# Deploy to GitHub Pages (simple mode)
npm run deploy:ghpages

# Build for custom domain (with payment links)
npm run build:production

# Local development
npm run dev
```

---

## Testing

1. **GitHub Pages**: Visit https://pavankumarswamy.github.io/ - should use simple WhatsApp checkout
2. **Custom Domain**: Visit https://popandfun.gnritservices.com/ - should generate payment links

The app automatically detects which environment it's in and adjusts accordingly!
