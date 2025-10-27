import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types/product';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('popandfun-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('popandfun-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, selectedColor?: string) => {
    setCart(prev => {
      const existingItem = prev.find(
        item => item.id === product.id && item.selectedColor === selectedColor
      );

      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && item.selectedColor === selectedColor
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, cartQuantity: 1, selectedColor }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, cartQuantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.offerPrice * item.cartQuantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cartQuantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
