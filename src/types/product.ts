export interface Product {
  id: string;
  title: string;
  category: string;
  description?: string;
  originalPrice: number;
  offerPrice: number;
  images: string[];
  colorVariants?: string[];
  quantity: number;
  createdAt: number;
}

export interface CartItem extends Product {
  cartQuantity: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  timestamp: number;
  status: 'pending' | 'delivered';
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
}
