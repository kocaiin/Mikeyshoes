import React, { useState, useEffect } from 'react';
import { pointsProducts } from '../../lib/points';
import Points from '../../components/Points';

export default function PointsProductDetails({ product }) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);

  // Load user's current points
  useEffect(() => {
    async function loadPoints() {
      const res = await fetch('/api/get-points');
      const data = await res.json();
      setPoints(data.points || 0);
    }
    loadPoints();
  }, []);

  // Redeem function (same logic as points.js)
  async function redeem() {
    const res = await fetch('/api/buy-with-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cost: product.price }), 
      // Use product.price or product.points — your data uses both but price = points cost
    });

    const data = await res.json();
    alert(data.message);

    if (data.ok) {
      setPoints(prev => prev - product.price);
    }
  }

  return (
    <div>
      <div className="product-detail-container">
        <div>
          <div className="image-container">
            <img src={product.images[index]} className="product-detail-image" />
          </div>

          <div className="small-images-container">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className={i === index ? 'small-image selected-image' : 'small-image'}
                onMouseEnter={() => setIndex(i)}
              />
            ))}
          </div>
        </div>

        <div className="product-detail-desc">
          <h1>{product.name}</h1>

          <h4>Your Points:</h4>
          <p className="price">{points}</p>

          <h4>Points Required:</h4>
          <p className="price">{product.price} Points</p>

          <div className="buttons">
            <button
              type="button"
              className="buy-now"
              onClick={redeem}
              disabled={points < product.price}
            >
              {points < product.price ? 'Not Enough Points' : 'Redeem'}
            </button>
          </div>
        </div>
      </div>
      <div className="maylike-products-wrapper">
          <h2>您可能也喜欢</h2>
          <div className="marquee">
            <div className="maylike-products-container track">
              {pointsProducts.map((item) => (
                <Points key={item._id} product={item} />
              ))}
            </div>
          </div>
      </div>
    </div>
    
  );
}

export async function getStaticPaths() {
  const paths = pointsProducts.map((item) => ({
    params: { slug: item.slug }
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params: { slug } }) {
  const product = pointsProducts.find((item) => item.slug === slug);

  if (!product) return { notFound: true };

  return {
    props: { product },
  };
}
