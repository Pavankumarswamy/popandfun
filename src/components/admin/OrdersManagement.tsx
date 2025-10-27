import { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Order, Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Package } from 'lucide-react';

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersSnapshot, productsSnapshot] = await Promise.all([
        get(ref(database, 'orders')),
        get(ref(database, 'products'))
      ]);

      if (ordersSnapshot.exists()) {
        const ordersData = JSON.parse(ordersSnapshot.val());
        const ordersArray = Object.entries(ordersData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setOrders(ordersArray);
      }

      if (productsSnapshot.exists()) {
        const productsData = JSON.parse(productsSnapshot.val());
        const productsArray = Object.entries(productsData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setProducts(productsArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (order: Order) => {
    if (!confirm('Mark this order as delivered?')) return;

    try {
      // Update product quantities
      const updatedProducts = [...products];
      order.items.forEach((item) => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
          updatedProducts[productIndex].quantity -= item.cartQuantity;
        }
      });

      // Remove order from pending orders
      const updatedOrders = orders.filter(o => o.id !== order.id);

      // Save to Firebase
      const ordersData = updatedOrders.reduce((acc, o) => {
        acc[o.id] = { ...o };
        delete acc[o.id].id;
        return acc;
      }, {} as any);

      const productsData = updatedProducts.reduce((acc, p) => {
        acc[p.id] = { ...p };
        delete acc[p.id].id;
        return acc;
      }, {} as any);

      await Promise.all([
        set(ref(database, 'orders'), JSON.stringify(ordersData)),
        set(ref(database, 'products'), JSON.stringify(productsData))
      ]);

      setOrders(updatedOrders);
      setProducts(updatedProducts);
      toast.success('Order marked as delivered!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pending orders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Orders</h2>
      
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="mb-2">{order.customerName}</CardTitle>
                <Badge variant="outline">
                  {new Date(order.timestamp).toLocaleString()}
                </Badge>
              </div>
              <Badge className="bg-secondary">
                ₹{order.totalAmount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                  <div className="flex gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.selectedColor && (
                        <p className="text-sm text-muted-foreground">Color: {item.selectedColor}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.cartQuantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{item.offerPrice * item.cartQuantity}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={() => markAsDelivered(order)}
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark as Delivered
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersManagement;
