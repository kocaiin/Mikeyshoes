import React from 'react';
import { AiFillInstagram, AiOutlineTwitter} from 'react-icons/ai';
import { FaWeixin, FaQq } from 'react-icons/fa';
const Footer = () => {
  return (
    <div className="footer-container">
      <p>2025 版权所有 zth gyc</p>
      <p className="icons">
          <a 
          href="https://qm.qq.com/q/fJpkcDMm0S/" 
          target="_blank" 
        >
          <FaQq />
        </a>

        <FaWeixin />
      
      </p>
    </div>
  )
}

export default Footer