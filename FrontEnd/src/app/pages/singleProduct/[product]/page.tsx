"use client"
import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react'
import Image from 'next/image';
import { AppContext } from '@/app/Context/CartContext';

interface Product {
  title: string;
  description: string;
  price: number;
  image: string;
}

export default function SingleProduct({ params }: { params: any }) {
  const productId = params.product
  const [data, setData] = useState<Product | null>(null);
  const { cart, setCart, addToCart } = useContext(AppContext);

  const handleAddToCart = () => {
    addToCart({ productId: productId, quantity: 1 });
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
    <div>
      SingleProduct
      {data && (
        <div>
          <div><Image width={300} height={300} alt={data.title} src={data.image} /></div>
          <div>
            <p>Product Title: {data.title}</p>
            <p>Product Description: {data.description}</p>
            <p>Price: {data.price}</p>
          </div>
          <br />
        </div>
      )}
      <button onClick={handleAddToCart}>Add To Cart</button>
    </div>
  )
}

