# ⚠️ CORS Issue & Security Warning

## Current Implementation

The cart page now calls Razorpay API **directly from the frontend**. This has two critical issues:

### 1. 🔒 Security Risk
- **Your API secret is exposed in the frontend code**
- Anyone can see it by viewing page source or network requests
- They could potentially create unauthorized payment links using your credentials

### 2. 🚫 CORS Error
Razorpay API will block requests from the browser with error:
```
Access to fetch at 'https://api.razorpay.com/v1/payment_links' from origin 
'https://pavankumarswamy.github.io' has been blocked by CORS policy
```

## Solutions

### Option A: Use a CORS Proxy (Quick Fix - Not Recommended for Production)

Add this before the Razorpay API call in `Cart.tsx`:
```javascript
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const paymentLinkResponse = await fetch(CORS_PROXY + 'https://api.razorpay.com/v1/payment_links', {
```

**Problems:**
- Still exposes your API secret
- Public CORS proxies can be rate-limited or shut down
- Not secure for production

### Option B: Deploy Backend Server (Recommended)

1. **Deploy `server.js` to any hosting:**
   - Vercel (free): `vercel` command
   - Heroku (free tier): `git push heroku main`
   - Your own server: `node server.js`

2. **Update Cart.tsx:**
```javascript
// Remove direct Razorpay credentials
// Add API endpoint
const API_ENDPOINT = 'https://your-backend.vercel.app/api';
```

3. **Update the fetch call:**
```javascript
const response = await fetch(`${API_ENDPOINT}/create-payment-link`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount, customerName, orderId, items })
});
```

## Current Status

✅ Code is ready and will work IF CORS is bypassed
❌ Will fail in browser due to CORS
⚠️ API secret is exposed in frontend

## Next Steps

Choose one:
1. Accept CORS errors and deploy backend server later
2. Use temporary CORS proxy for testing
3. Deploy backend server now (recommended)
