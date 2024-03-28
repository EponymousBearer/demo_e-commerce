"use client"
import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react'
import Image from 'next/image';
import { AppContext } from '@/app/Context/CartContext';

export interface Product {
  title: string;
  description: string;
  price: number;
  image: string;
}

export default function SingleProduct({ params }: { params: any }) {
  const productId = params.product
  const [data, setData] = useState<Product | null>(null);
  const { cart, setCart, addToCart } = useContext(AppContext);

  const handleAddToCart = (params:any) => {
    addToCart({ productId: params, quantity: 1 });
    setCart((prevTotal: number) => prevTotal + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5003/product/SingleProduct/${productId}`);
        setData(response.data.singleProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [productId]);

  return (
    <div className='px-10'>
      {data && (
        <div className='flex gap-x-10'>
          <div><Image width={500} height={500} alt={data.title} src={data.image} /></div>
          <div className='space-y-4'>
            <h2 className='text-2xl'>{data.title}</h2>
            <p>{data.description}</p>
            <p>${data.price}</p>
            <button className='bg-blue-300 px-4 py-2' onClick={()=>handleAddToCart(data.title)}>Add To Cart</button>
          </div>
        </div>
      )}

    </div>
  )
}

