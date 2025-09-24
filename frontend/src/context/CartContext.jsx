import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import storage from '../utils/storage.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const savedCart = storage.getCart();
    setItems(savedCart);
  }, []);

  useEffect(() => {
    storage.setCart(items);
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.error('Stok yetersiz!');
          return prevItems;
        }

        toast.success('Ürün miktarı güncellendi');
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          toast.error('Stok yetersiz!');
          return prevItems;
        }

        toast.success('Ürün sepete eklendi');
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast.success('Ürün sepetten kaldırıldı');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          if (quantity > item.stock) {
            toast.error('Stok yetersiz!');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    storage.clearCart();
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItems = () => {
    return items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};