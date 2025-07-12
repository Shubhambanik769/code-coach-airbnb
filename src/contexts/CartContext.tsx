
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  duration?: string;
  includes?: string[];
  excludes?: string[];
  customization?: any;
  finalPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalSavings: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      // Check if item already exists, if so, replace it
      const existingIndex = prev.findIndex(existing => existing.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = item;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => items.length;

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.finalPrice || item.discountedPrice), 0);
  };

  const getTotalSavings = () => {
    return items.reduce((total, item) => total + item.savings, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getTotalSavings
    }}>
      {children}
    </CartContext.Provider>
  );
};
