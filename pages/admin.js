import { useEffect, useState } from 'react';

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch('/api/get-purchases');
      const data = await res.json();
      setOrders(data.orders || []);
    }
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>

      {orders.length === 0 && <p>没有订单.</p>}

      {orders.map((order, idx) => (
        <div key={idx} style={{
          marginBottom: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3>订单 #{idx + 1}</h3>
          <p><strong>总价格:</strong> ${order.total}</p>
          <p><strong>日期:</strong> {new Date(order.createdAt).toLocaleString()}</p>

          <h4>物品:</h4>
          {order.items.map((item, i) => (
            <p key={i}>
              {item.name} × {item.quantity} — ${item.price}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
