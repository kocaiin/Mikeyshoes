import React from 'react';
import Link from 'next/link';
import { AiOutlineShopping } from 'react-icons/ai'

import { Cart } from './';
import { useStateContext } from '../context/StateContext';

const Navbar = () => {
  const { showCart, setShowCart, totalQuantities } = useStateContext();

  return (

    <div className="navbar-container">
      <p className="logo">
        <Link href="/">MikeyShoes</Link>
      </p>
      <div className="right-nav">
      <Link href="/points" className="admin-btn">
          points
        </Link>
        <Link href="/admin" className="admin-btn">
          Admin
        </Link>
        <button type="button" className="cart-icon" onClick={() => setShowCart(true)}>
          <AiOutlineShopping />
          <span className="cart-item-qty">{totalQuantities}</span>
        </button>

      </div>
      {showCart && <Cart />}
    </div>

  )
}

export default Navbar