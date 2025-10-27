# 🚀 Backend Server Deployment Instructions

Your frontend is configured to call: **https://popandfun.gnritservices.com/api/create-payment-link**

You MUST deploy `server.js` to your server to make payments work.

## Files to Deploy

1. **server.js** - The backend API server
2. **server-package.json** - Rename this to `package.json` in your server folder

## Deployment Steps for Your Server

### Step 1: Connect to Your Server

SSH into your server:
```bash
ssh your_username@popandfun.gnritservices.com
```

### Step 2: Create API Directory

```bash
cd /var/www/popandfun.gnritservices.com  # or wherever your site is hosted
mkdir api
cd api
```

### Step 3: Upload Files

Upload these files to the `api` folder:
- `server.js`
- `server-package.json` (rename to `package.json`)

Using SCP from your local machine:
```bash
scp server.js your_username@popandfun.gnritservices.com:/var/www/popandfun.gnritservices.com/api/
scp server-package.json your_username@popandfun.gnritservices.com:/var/www/popandfun.gnritservices.com/api/package.json
```

### Step 4: Install Dependencies

On your server:
```bash
cd /var/www/popandfun.gnritservices.com/api
npm install
```

### Step 5: Configure Reverse Proxy (Nginx)

Add this to your Nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name popandfun.gnritservices.com;

    # Your existing SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Serve frontend files
    location / {
        root /var/www/popandfun.gnritservices.com;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js server
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Start the Server with PM2 (Recommended)

Install PM2 (if not installed):
```bash
sudo npm install -g pm2
```

Start the server:
```bash
cd /var/www/popandfun.gnritservices.com/api
pm2 start server.js --name "popandfun-api"
pm2 save
pm2 startup
```

### Step 7: Test the API

```bash
curl -X POST https://popandfun.gnritservices.com/api/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "customerName": "Test User",
    "orderId": "TEST123",
    "items": []
  }'
```

You should get a response with a payment link!

## Alternative: Quick Test with Node

If you just want to test quickly:

```bash
cd /var/www/popandfun.gnritservices.com/api
PORT=3000 node server.js &
```

(But use PM2 for production!)

## Troubleshooting

### Check if server is running
```bash
pm2 status
pm2 logs popandfun-api
```

### Check API endpoint
```bash
curl http://localhost:3000/api/health
```

### Restart server
```bash
pm2 restart popandfun-api
```

### View logs
```bash
pm2 logs popandfun-api --lines 100
```

## After Deployment

1. ✅ Server should be running at `https://popandfun.gnritservices.com/api`
2. ✅ Frontend will automatically call this endpoint
3. ✅ Payment links will be generated and sent via WhatsApp
4. ✅ No more CORS errors!

## Security Note

Your Razorpay credentials are stored in `server.js`:
- **key_id**: rzp_live_HJl9NwyBSY9rwV
- **key_secret**: 1FlerafMmqHMw466ccsDxrhp

These are now **secure** on the server (not exposed in frontend)!
