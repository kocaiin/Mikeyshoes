import { useEffect, useState } from 'react';
import { pointsProducts } from '../lib/points';
import Link from 'next/link';
import { Product } from '../components';
import { useRouter } from 'next/router';

const API_BASE = 'http://localhost/shoesEcomerce/api';

export default function PointsShop() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  // 新增：获取当前用户信息
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      // 未登录则积分0，或跳转到登录页（可选）
      router.push('/login');
      setPoints(0);
      return;
    }
    setUser(storedUser);

    async function load() {
      // 修改：请求时携带user_id（POST方式）
      const res = await fetch(`${API_BASE}/get-points.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: storedUser.id })
      });
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
            {/* 注意：你的数据里有price和points，这里保持原UI显示price（若要改points需调整） */}
            <p className="product-price">{item.price} Points</p>
          </div>
        ))}
      </div>
    </div>
  );
}