import React, { useState, useEffect } from 'react';
import { pointsProducts } from '../../lib/points';
import Points from '../../components/Points';

const API_BASE = 'http://localhost/shoesEcomerce/api';

export default function PointsProductDetails({ product }) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  // 新增：获取当前用户信息
  const [user, setUser] = useState(null);

  // Load user's current points
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      setPoints(0);
      return;
    }
    setUser(storedUser);

    async function loadPoints() {
      // 修改：携带user_id请求积分
      const res = await fetch(`${API_BASE}/get-points.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: storedUser.id })
      });
      const data = await res.json();
      setPoints(data.points || 0);
    }
    loadPoints();
  }, []);

  // Redeem function (修改：携带user_id和产品信息)
  async function redeem() {
    if (!user) {
      alert('请先登录！');
      return;
    }
    // 注意：你的数据里product.price是金额，product.points是积分成本，这里按原逻辑用price（若要改points需调整）
    const cost = product.price; // 或 product.points
    const res = await fetch(`${API_BASE}/buy-with-points.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: user.id, 
        cost: cost,
        product: { // 传递产品信息，用于生成purchase_items
          name: product.name,
          price: cost, // 积分成本作为价格
          quantity: 1,
          image: product.images[0]
        }
      }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.ok) {
      setPoints(prev => prev - cost);
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