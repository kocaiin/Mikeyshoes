import React from 'react';
import Link from 'next/link';
import { AiOutlineShopping, AiOutlineUser, AiOutlineStar, AiOutlineSetting, AiOutlineInbox} from 'react-icons/ai'
import { useRouter } from 'next/router'; // 引入路由
import { Cart } from './';
import { useStateContext } from '../context/StateContext';
import Profile from './Profile';
const Navbar = () => {
  const { showCart, setShowCart, totalQuantities, showProfile, setShowProfile } = useStateContext();
  const router = useRouter(); // 初始化路由

  
  const handleProfileClick = () => {
    // 检查是否登录：localStorage 中是否有 user
    const user = localStorage.getItem('user');
    if (!user) {
      // 未登录，跳转到登录页
      router.push('/login');
      return;
    }
    // 已登录，显示 Profile 窗口
    setShowProfile(true);
  };
  const handleCartClick = () => {
    // 检查是否登录：localStorage 中是否有 user
    const user = localStorage.getItem('user');
    if (!user) {
      // 未登录，跳转到登录页
      router.push('/login');
      return;
    }
    // 已登录，显示 Profile 窗口
    setShowCart(true);
  };
  return (

    <div className="navbar-container">
      <p className="logo">
        <Link href="/">MikeyShoes</Link>
      </p>
      <div className="right-nav">
      
        <Link href="/admin" className="cart-icon">
        <AiOutlineSetting /> 
        </Link>
        <Link href="/order" className="cart-icon">
        <AiOutlineInbox /> 
        </Link>
        
        <Link href="/points" className="cart-icon">
      <AiOutlineStar /> 
        </Link>
        
        <button type="button" className="cart-icon" onClick={handleCartClick}>
          <AiOutlineShopping />
          <span className="cart-item-qty">{totalQuantities}</span>
        </button>

        <button type="button" className="cart-icon"  onClick={handleProfileClick}>
          <AiOutlineUser /> 
        </button>
      </div>
      {showCart && <Cart />}
      {showProfile && <Profile />}
    </div>
    

  )
}

export default Navbar