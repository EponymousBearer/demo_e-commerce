
"use client"
import Image from "next/image";
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5003/product/AllProducts');
        setData(response.data.allProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="bg-blue-200 flex justify-center gap-x-10">
      <div>
        <div className="text-center text-2xl font-bold py-6">All Products</div>
        <div className="flex flex-col-3 gap-x-8 justify-center">
          {data.map((dataa: any, index) => (
            <Link key={index} href={`/pages/singleProduct/${dataa._id}`}>
              <div>
                <div><Image width={300} height={300} alt={dataa.title} src={dataa.image} /></div>
                <div>
                  <p>Product Title: {dataa.title}</p>
                  <p>Product Description: {dataa.description}</p>
                  <p>Price: {dataa.price}</p>
                </div>
                <br />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
