import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BsBagCheckFill } from 'react-icons/bs';

import { useStateContext } from '../context/StateContext';
import { runFireworks } from '../lib/utils';

const Success = () => {
  const { setCartItems, setTotalPrice, setTotalQuantities } = useStateContext();
  
  useEffect(() => {
    setCartItems([]);
        setTotalPrice(0);
        setTotalQuantities(0);
        
        // 可选：如果购物车状态存在localStorage，这里也清空购物车的localStorage（根据你的实际逻辑）
        // localStorage.removeItem('cartItems');
        // localStorage.removeItem('totalPrice');
        // localStorage.removeItem('totalQuantities');

        runFireworks();
  }, []);

  return (
    <div className="success-wrapper">
      <div className="success">
        <p className="icon">
          <BsBagCheckFill />
        </p>
        <h2>感谢您的订单!</h2>
        <p className="email-msg">我们已将您的购买保存到我们的数据库中.</p>
        <p className="description">
          如果您有任何问题, 请发送电子邮件至
          <a className="email" href="mailto:3036357866@qq.com">
          3036357866@qq.com
          </a>
        </p>
        <Link href="/">
          <button type="button" width="300px" className="btn">
            继续购物
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Success