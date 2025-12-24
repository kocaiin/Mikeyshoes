import React, { useRef } from 'react';
import Link from 'next/link';
import { AiOutlineMinus, AiOutlinePlus, AiOutlineLeft, AiOutlineShopping } from 'react-icons/ai';
import { TiDeleteOutline } from 'react-icons/ti';
import toast from 'react-hot-toast';

import { useStateContext } from '../context/StateContext';
import { useRouter } from 'next/router';

const API_BASE = 'http://localhost/shoesEcomerce/api';

const Cart = () => {
  const cartRef = useRef();
  const router = useRouter();
  const { totalPrice, totalQuantities, cartItems, setShowCart, toggleCartItemQuanitity, onRemove } = useStateContext();

  const handleCheckout = async () => {
    if (!cartItems.length) {
      toast.error('Add at least one item to buy.');
      return;
    }
  
    // ✅ 关键：获取登录用户
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Please login first!');
      router.push('/login');
      return;
    }
  
    const user = JSON.parse(userStr);
    if (!user.id) {
      toast.error('Invalid user info!');
      router.push('/login');
      return;
    }
  
    const response = await fetch(`${API_BASE}/purchase.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id, // ✅ 这一行是关键
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || null,
        })),
        total: totalPrice,
      }),
    });
  
    if (!response.ok) {
      const err = await response.json();
      console.error(err);
      toast.error(err.message || 'Could not save your order.'); // ✅ 使用后端 message
      return;
    }
  
    toast.success('Order saved!');
    setShowCart(false);
    router.push('/success');
  };
  
  const renderCartImage = (item) => {
    if (Array.isArray(item.images) && item.images[0]) {
      return item.images[0];
    }
    return '/assets/speaker1.webp';
  };

  return (
    <div className="cart-wrapper" ref={cartRef}>
      <div className="cart-container">
        <button
        type="button"
        className="cart-heading"
        onClick={() => setShowCart(false)}>
          <AiOutlineLeft />
          <span className="heading">您的购物车</span>
          <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>您的购物车为空</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn"
              >
                继续购物
              </button>
            </Link>
          </div>
        )}

        <div className="product-container">
          {cartItems.length >= 1 && cartItems.map((item) => (
            <div className="product" key={item._id}>
              <img src={renderCartImage(item)} className="cart-product-image" />
              <div className="item-desc">
                <div className="flex top">
                  <h5>{item.name}</h5>
                  <h4>${item.price}</h4>
                </div>
                <div className="flex bottom">
                  <div>
                  <p className="quantity-desc">
                    <span className="minus" onClick={() => toggleCartItemQuanitity(item._id, 'dec') }>
                    <AiOutlineMinus />
                    </span>
                    <span className="num">{item.quantity}</span>
                    <span className="plus" onClick={() => toggleCartItemQuanitity(item._id, 'inc') }><AiOutlinePlus /></span>
                  </p>
                  </div>
                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => onRemove(item)}
                  >
                    <TiDeleteOutline />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal:</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              <button type="button" className="btn" onClick={handleCheckout}>
                下单
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart