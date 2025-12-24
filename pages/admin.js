import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { requireAdmin } from '../utils/requireAdmin';
import { useRouter } from 'next/router';
const API_BASE = 'http://localhost/shoesEcomerce/api';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [userInfos, setUserInfos] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // ⚠️ 必须加上


  useEffect(() => {
    async function fetchOrdersAndUsers() {
      try {
        if (!requireAdmin(router)) return;
        setLoading(true);
        const res = await fetch(`${API_BASE}/get-purchases.php`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || '获取订单失败');

        const { orders, userIds } = data;
        setOrders(orders);

        if (userIds.length > 0) {
          const userRes = await fetch(
            `${API_BASE}/getUserInfos.php?user_ids=${userIds.join(',')}`
          );
          const userData = await userRes.json();
          if (userRes.ok) setUserInfos(userData);
        }

      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrdersAndUsers();
  }, []);

  const handleDeleteOrder = async (purchaseId) => {
    if (!window.confirm('确定要删除这个订单吗？')) return;

    try {
      const res = await fetch(`${API_BASE}/get-purchases.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchase_id: purchaseId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '删除失败');

      toast.success('订单已删除');
      setOrders((prev) =>
        prev.filter((o) => o.purchaseId !== purchaseId)
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="nike-page-loading">ADMIN LOADING...</div>;
  }

  return (
    <div className="nike-admin-page">
      <h1>ADMIN · ORDERS</h1>

      {orders.length === 0 ? (
        <p>No orders.</p>
      ) : (
        <div className="nike-admin-orders">
          {orders.map((order) => {
            const user =
              userInfos[order.userId] || {};

            return (
              <div
                className="nike-admin-order-card"
                key={order.purchaseId}
              >
                {/* Header */}
                <div className="nike-admin-order-header">
                  <div>
                    <h3>ORDER #{order.purchaseId}</h3>
                    <span>
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="admin-total">
                    ${order.total.toFixed(2)}
                  </div>
                </div>

                {/* User */}
                <div className="nike-admin-user">
                  <p><strong>{user.name || 'Unknown User'}</strong></p>
                  <p>{user.email || 'No Email'}</p>
                  <p className="address">
                    {user.address || 'No Address'}
                  </p>
                </div>

                {/* Items */}
                <div className="nike-admin-items">
                  {order.items.map((item, i) => (
                    <div className="nike-admin-item" key={i}>
                      <img src={item.image} alt={item.name} />
                      <div className="info">
                        <h4>{item.name}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <div className="price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="nike-admin-actions">
                  <button
                    className="danger"
                    onClick={() =>
                      handleDeleteOrder(order.purchaseId)
                    }
                  >
                    DELETE ORDER
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
