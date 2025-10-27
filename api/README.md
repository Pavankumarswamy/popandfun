# Backend API for Payment Links

This folder contains the backend API endpoint for creating Razorpay payment links.

## Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel` in the root directory
3. Vercel will auto-detect the `/api` folder
4. Your API will be available at: `https://your-project.vercel.app/api/create-payment-link`

### Option 2: Netlify Functions
1. Rename `/api` to `/netlify/functions`
2. Deploy to Netlify
3. API available at: `https://your-site.netlify.app/.netlify/functions/create-payment-link`

### Option 3: Your Own Server
1. Set up a Node.js/Express server
2. Use the `create-payment-link.js` logic in your Express route
3. Deploy to your server at `https://popandfun.gnritservices.com`

## Environment Setup

For your custom domain (https://popandfun.gnritservices.com):

1. Deploy the backend API to your server
2. Update `.env.production` with your API endpoint:
   ```
   VITE_API_ENDPOINT=https://popandfun.gnritservices.com/api
   ```
3. Build with: `npm run build`
4. Deploy the built files to your custom domain

## GitHub Pages vs Custom Domain

- **GitHub Pages** (https://pavankumarswamy.github.io/): Simple WhatsApp ordering (no payment links)
- **Custom Domain** (https://popandfun.gnritservices.com/): Full payment link integration with backend API

The app automatically detects which environment it's running in and adjusts functionality accordingly.
