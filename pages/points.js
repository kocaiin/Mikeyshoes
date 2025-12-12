import { useEffect, useState } from 'react';
import { pointsProducts } from '../lib/points';
import Link from 'next/link';     
import { Product } from '../components';

export default function PointsShop() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/get-points');
      const data = await res.json();
      setPoints(data.points || 0);   
    }
    load();
  }, []);



  return (
    <div>
      <div className="products-heading">
        <h2>Points Shop</h2>
        <p>Your Points: {points}</p>
      </div>

      <div className="products-container">
        {pointsProducts.map((item) => (
          <div key={item._id} className="product-card">
            <Link href={`/points/${item.slug}`}>
            <img 
              src={item.images[0]}
              width={250}
              height={250}
              className="product-image"
            />
            </Link>
            <p className="product-name">{item.name}</p>
            <p className="product-price">{item.price} Points</p>

         
          </div>
        ))}
      </div>
    </div>
  );
}
