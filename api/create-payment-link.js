// Serverless function for creating Razorpay payment links
// Deploy this to your backend server at https://popandfun.gnritservices.com/

const RAZORPAY_KEY_ID = 'rzp_live_HJl9NwyBSY9rwV';
const RAZORPAY_KEY_SECRET = '1FlerafMmqHMw466ccsDxrhp';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
          sms: true,
          email: false,
        },
        reminder_enable: true,
        notes: {
          order_id: orderId,
          items: JSON.stringify(items),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API Error:', errorText);
      return res.status(response.status).json({ error: 'Failed to create payment link', details: errorText });
    }

    const paymentLink = await response.json();
    
    return res.status(200).json({
      success: true,
      paymentLink: paymentLink.short_url,
      orderId: orderId,
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
