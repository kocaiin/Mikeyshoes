import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost/shoesEcomerce/api';

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser =
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('user') || 'null')
        : null;

    if (!storedUser) {
      router.push('/login');
      return;
    }

    fetchUserOrders(storedUser.id);
  }, [router]);

  const fetchUserOrders = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/get-user-purchases.php?user_id=${userId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '获取订单失败');
      setOrders(data.orders || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="nike-page-loading">LOADING...</div>;
  }

  return (
    <div className="nike-orders-page">
      <h1>MY ORDERS</h1>

      {orders.length === 0 ? (
        <div className="nike-empty">
          <p>No orders yet.</p>
          <button onClick={() => router.push('/')}>START SHOPPING</button>
        </div>
      ) : (
        <div className="nike-orders">
          {orders.map((order) => (
            <div className="nike-order-card" key={order.purchaseId}>
              <div className="nike-order-header">
                <div>
                  <h3>ORDER #{order.purchaseId}</h3>
                  <span>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : 'UNKNOWN DATE'}
                  </span>
                </div>

                <div className="nike-order-total">
                  ${Number(order.total || 0).toFixed(2)}
                </div>
              </div>

              <div className="nike-order-items">
                {(order.items || []).map((item, idx) => (
                  <div className="nike-order-item" key={idx}>
                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="info">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>

                    <div className="price">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
