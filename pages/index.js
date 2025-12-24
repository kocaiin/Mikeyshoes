import React from 'react';

import { Product, FooterBanner, HeroBanner } from '../components';
import { products, heroBanner, footerBanner } from '../lib/data';

const Home = () => (
  <div>
    <HeroBanner heroBanner={heroBanner}  />
    <div className="products-heading">
      <h2>畅销产品</h2>
      <p>Bestselling products</p>
    </div>

    <div className="products-container">
      {products.map((product) => <Product key={product._id} product={product} />)}
    </div>

    <FooterBanner footerBanner={footerBanner} />
  </div>
);

export default Home;
