import React, { useState } from 'react';
import { AiOutlineMinus, AiOutlinePlus, AiFillStar, AiOutlineStar } from 'react-icons/ai';

import { Product } from '../../components';
import { useStateContext } from '../../context/StateContext';
import { products as allProducts } from '../../lib/data';

const ProductDetails = ({ product, products }) => {
  const { _id, images, name, details, price } = product;
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();

  const handleBuyNow = () => {
    onAdd(product, qty);

    setShowCart(true);
  }

  return (
    <div>
      <div className="product-detail-container">
        <div>
          <div className="image-container">
            <img src={images?.[index]} className="product-detail-image" />
          </div>
          <div className="small-images-container">
            {images?.map((item, i) => (
              <img 
                key={i}
                src={item}
                className={i === index ? 'small-image selected-image' : 'small-image'}
                onMouseEnter={() => setIndex(i)}
              />
            ))}
          </div>
        </div>

        <div className="product-detail-desc">
          <h1>{name}</h1>
          <div className="reviews">
            <div>
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiOutlineStar />
            </div>
            <p>
              (20)
            </p>
          </div>
          <h4>详细信息: </h4>
          <p>{details}</p>
          <p className="price">${price}</p>
          <div className="quantity">
            <h3>数量:</h3>
            <p className="quantity-desc">
              <span className="minus" onClick={decQty}><AiOutlineMinus /></span>
              <span className="num">{qty}</span>
              <span className="plus" onClick={incQty}><AiOutlinePlus /></span>
            </p>
          </div>
          <div className="buttons">
            <button type="button" className="add-to-cart" onClick={() => onAdd(product, qty)}>加入购物车</button>
            <button type="button" className="buy-now" onClick={handleBuyNow}>立即购买</button>
          </div>
        </div>
      </div>

      <div className="maylike-products-wrapper">
          <h2>您可能也喜欢</h2>
          <div className="marquee">
            <div className="maylike-products-container track">
              {products.map((item) => (
                <Product key={item._id} product={item} />
              ))}
            </div>
          </div>
      </div>
    </div>
  )
}

export const getStaticPaths = async () => {
  const paths = allProducts.map((product) => ({
    params: { 
      slug: product.slug
    }
  }));

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps = async ({ params: { slug }}) => {
  const product = allProducts.find((item) => item.slug === slug);

  if (!product) {
    return { notFound: true };
  }

  return {
    props: { products: allProducts, product }
  }
}

export default ProductDetails