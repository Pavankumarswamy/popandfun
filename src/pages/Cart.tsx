import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const RZP_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;
const RZP_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET as string;

async function createRazorpayOrder(amountInPaise: number, receipt: string, notes: Record<string, any>) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`),
    },
    body: JSON.stringify({ amount: amountInPaise, currency: 'INR', receipt, notes }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to create order');
  }
  return res.json();
}

async function createPaymentLink(amountInPaise: number, description: string, referenceId: string, customerName: string) {
  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`),
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      description,
      reference_id: referenceId,
      customer: { name: customerName },
      notify: { sms: true, email: false },
      reminder_enable: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to create payment link');
  }
  return res.json();
}

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
      toast.error('Payment keys not configured');
      return;
    }

    try {
      setIsProcessing(true);
      const amountInPaise = getTotalPrice() * 100;
      const receipt = `rcpt_${Date.now()}`;
      const notes = {
        customer_name: customerName,
        items: cart.map((i) => ({ id: i.id, title: i.title, qty: i.cartQuantity, price: i.offerPrice, color: i.selectedColor })),
      };

      const order = await createRazorpayOrder(amountInPaise, receipt, notes);

      const paymentLink = await createPaymentLink(
        amountInPaise,
        `Payment for order ${order.id}`,
        order.id,
        customerName,
      );

      const orderDetails = cart
        .map((item) => 
          `${item.title}${item.selectedColor ? ` (${item.selectedColor})` : ''} x ${item.cartQuantity} = ₹${item.offerPrice * item.cartQuantity}`
        )
        .join('%0A');

      const message = `*New Order from Pop and Fun*%0A%0A*Customer Name:* ${customerName}%0A%0A*Order Details:*%0A${orderDetails}%0A%0A*Total Amount:* ₹${getTotalPrice()}%0A*Order ID:* ${order.id}%0A%0A*Pay securely:* ${paymentLink.short_url}%0A%0A*Timestamp:* ${new Date().toLocaleString()}`;

      const whatsappUrl = `https://wa.me/918639122823?text=${message}`;
      window.open(whatsappUrl, '_blank');

      toast.success('Order sent via WhatsApp!');
      clearCart();
      setCustomerName('');
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to generate payment link');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products to get started!
          </p>
          <Button asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={`${item.id}-${item.selectedColor}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-24 w-24 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.selectedColor && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Color: {item.selectedColor}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-primary">
                        ₹{item.offerPrice}
                      </span>
                      {item.originalPrice > item.offerPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 font-medium">{item.cartQuantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                          disabled={item.cartQuantity >= item.quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₹{item.offerPrice * item.cartQuantity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{getTotalPrice()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Your Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Preparing payment...' : 'Checkout via WhatsApp'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to WhatsApp to complete your order
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
