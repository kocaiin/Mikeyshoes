import React from 'react';
import Link from 'next/link';

const Points = ({ product: { images, name, slug, price } }) => {
  return (
    <div>
      <Link href={`/points/${slug}`}>
        <div className="product-card">
          <img 
            src={images?.[0]}
            width={250}
            height={250}
            className="product-image"
          />
          <p className="product-name">{name}</p>
          <p className="product-price">${price}</p>
        </div>
      </Link>
    </div>
  )
}

export default Points