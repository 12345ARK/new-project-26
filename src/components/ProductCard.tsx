import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  variant?: 'standard' | 'horizontal' | 'small';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'standard' }) => {
  const { addToCart, setSelectedProductModal, ratings, rateProduct, toggleSavedItem, isItemSaved } = useApp();

  const titleKey = product.title.replace(/\s+/g, '_');
  const userRating = ratings[titleKey];
  const isSaved = isItemSaved(product.title);

  // Default seed rating if user hasn't rated yet
  const seedRating = 4.5;
  const currentRating = userRating || seedRating;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering card click if clicking on inner action buttons or stars
    const target = e.target as HTMLElement;
    if (target.closest('.small-cart-btn') || target.closest('.small-view-btn') || target.closest('.small-heart-btn') || target.closest('.star')) {
      return;
    }
    setSelectedProductModal(product);
  };

  const cardClassName = variant === 'horizontal' ? 'cardB' : variant === 'small' ? 'p6-card' : 'card';
  const imgContainerClassName = variant === 'horizontal' ? 'imageB' : variant === 'small' ? 'p6-image' : 'image';
  const detailsClassName = variant === 'small' ? 'p6-details' : 'details';

  return (
    <div className={cardClassName} onClick={handleCardClick}>
      {/* Eye Overlay Button */}
      <button
        type="button"
        className="small-view-btn"
        title="View Details"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedProductModal(product);
        }}
      >
        <i className="fas fa-eye"></i>
      </button>

      {/* Heart Save for Later Overlay Button */}
      <button
        type="button"
        className={`small-heart-btn ${isSaved ? 'is-saved' : ''}`}
        title={isSaved ? "Remove from Saved for Later" : "Save for Later"}
        onClick={(e) => {
          e.stopPropagation();
          toggleSavedItem(product);
        }}
        aria-label={isSaved ? "Remove from Saved for Later" : "Save for Later"}
      >
        <i className={isSaved ? "fas fa-heart text-danger" : "far fa-heart"}></i>
      </button>

      {/* Cart Overlay Button */}
      <button
        type="button"
        className="small-cart-btn"
        title="Add to Cart"
        onClick={(e) => {
          e.stopPropagation();
          addToCart({
            title: product.title,
            price: product.price,
            image: product.image
          });
        }}
      >
        <i className="fas fa-shopping-cart"></i>
      </button>

      {/* Product Image */}
      <div className={imgContainerClassName}>
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>

      {/* Product Details */}
      <div className={detailsClassName}>
        <h3>{product.title}</h3>

        {/* Interactive Star Rating */}
        <div className="product-rating">
          {[1, 2, 3, 4, 5].map(starIndex => (
            <span
              key={starIndex}
              className={`star ${starIndex <= Math.round(currentRating) ? 'filled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                rateProduct(product.title, starIndex);
              }}
              title={`Rate ${starIndex} stars`}
            >
              ★
            </span>
          ))}
          <span className="rating-count">({currentRating.toFixed(1)})</span>
        </div>

        <p className="price">₹{product.price}{product.unit ? product.unit : ''}</p>
      </div>
    </div>
  );
};
