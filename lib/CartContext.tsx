'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/data/products';

export type CartItem = {
  product: Product;
  size: string;
  color?: string;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, color: string | undefined, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    try {
      // Now the actual fetch is protected
      const savedCart = window.localStorage.getItem('divasteps_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn('Local storage access denied by browser (likely an in-app browser).', e);
      // The app will continue to run normally, the cart will just start empty.
    }
  }, []);

  // Save cart to local storage when it changes
  useEffect(() => {
    try {
      // Protect the save action as well
      window.localStorage.setItem('divasteps_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart. Local storage might be restricted.', e);
    }
  }, [items]);

  const addToCart = (product: Product, size: string, color?: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.size === size && item.color === color);
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, size, color, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color?: string) => {
    setItems((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size && item.color === color)));
  };

  const updateQuantity = (productId: string, size: string, color: string | undefined, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size && item.color === color ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}