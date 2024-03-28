"use client"
import React, { useContext } from 'react';
import { AppContext } from '@/app/Context/CartContext';

const CartPage = () => {
  // Consume the AppContext
  const { cartItems } = useContext(AppContext);



  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <div className='bg-blue-200 p-6'>
        <h2 className='font-bold text-2xl py-4 text-center'>Cart</h2>
        <div>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cartItems.map((item: any, index: number) => (
              <li key={index} className='py-2'>
                <p>Product Name: {item.productId}</p>
                <p className='mb-4'>Quantity: {item.quantity}</p>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
