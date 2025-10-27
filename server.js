const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Razorpay credentials
const RAZORPAY_KEY_ID = 'rzp_live_HJl9NwyBSY9rwV';
const RAZORPAY_KEY_SECRET = '1FlerafMmqHMw466ccsDxrhp';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Payment API server is running' });
});

// Create payment link endpoint
app.post('/api/create-payment-link', async (req, res) => {
  try {
    const { amount, customerName, orderId, items } = req.body;

    if (!amount || !customerName || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Razorpay payment link
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        description: `Payment for order ${orderId}`,
        reference_id: orderId,
        customer: {
          name: customerName,
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: false,
        notes: {
          order_id: orderId,
          items: JSON.stringify(items),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API Error:', errorText);
      return res.status(response.status).json({ 
        error: 'Failed to create payment link', 
        details: errorText 
      });
    }

    const paymentLink = await response.json();
    
    return res.status(200).json({
      success: true,
      paymentLink: paymentLink.short_url,
      orderId: orderId,
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Payment API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
