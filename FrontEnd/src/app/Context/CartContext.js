'use client'
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(0)
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    const existingItemIndex = cartItems.findIndex(item => item.productId === product.productId);
    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += product.quantity;
      setCartItems(updatedCartItems);
    } else {
      setCartItems(prevItems => [...prevItems, product]);
    }
  };

  return (
    <AppContext.Provider value={{ cart, setCart, addToCart, cartItems }}>
      {children}
    </AppContext.Provider>
  );
};