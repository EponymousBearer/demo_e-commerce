import Image from "next/image";
import Link from "next/link";
import axios from 'axios';

export default function home({ data }:{data:any}) {
  return (
    <main className="bg-yellow-400 m-10 flex gap-x-10">
      <div>Add Product to Cart</div>
      <div>Single Page</div>
      <div>Social</div>
      <div>
        <div>Homepage Listing All Products</div>
        <div className="flex flex-col-3 gap-x-8 justify-center">
          {data.map((product:any) => (
            <Link key={product._id} href={`/pages/singleProduct/${product._id}`}>
              <div>
                <div><Image width={300} height={300} alt={product.title} src={product.image} /></div>
                <div>
                  <p>Product Title: {product.title}</p>
                  <p>Product Description: {product.description}</p>
                  <p>Price: {product.price}</p>
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

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:5003/product/AllProducts');
    const data = response.data.allProducts;
    return {
      props: { data },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: { data: [] },
    };
  }
}
