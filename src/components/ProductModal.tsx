import React from 'react';
import { useApp } from '../context/AppContext';

export const ProductModal: React.FC = () => {
  const { selectedProductModal, setSelectedProductModal, addToCart, ratings, rateProduct, toggleSavedItem, isItemSaved } = useApp();

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const titleKey = product.title.replace(/\s+/g, '_');
  const currentRating = ratings[titleKey] || 4.5;
  const isSaved = isItemSaved(product.title);

  const getProductMeta = (title: string, category: string) => {
    const cleanTitle = title.toLowerCase();

    const getFutureDateString = (monthsAhead: number) => {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const d = new Date();
      d.setMonth(d.getMonth() + monthsAhead);
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    if (category === 'vegetables' || /potato|tomato|onion|carrot|cabbage|chilli|cauliflower|cucumber|garlic|ginger|spinach|capsicum|brinjal|lady/i.test(cleanTitle)) {
      return {
        benefits: "Handpicked directly from regional organic farms. High in essential minerals, dietary fibers, and antioxidant vitamins.",
        expiry: "Fresh Produce - Best consumed within 5 to 7 days."
      };
    } else if (category === 'fruits' || /apple|banana|mango|grapes|orange|papaya|pomegranate|kiwi|strawberry|watermelon|pineapple|avocado|blueberry|peach|cherry|pear|coconut|dragon/i.test(cleanTitle)) {
      return {
        benefits: "Sweet and crisp premium crop pickings. Packed with refreshing vitamins, natural sugars, and antioxidant defenses.",
        expiry: "Fresh Produce - Best consumed within 4 to 6 days."
      };
    } else if (category === 'spices') {
      return {
        benefits: "Rich, aromatic extraction containing natural essential seasoning oils. Elevates culinary flavor and metabolic acceleration.",
        expiry: `Packaged Food - Expiry Date: ${getFutureDateString(12)} (12 Months).`
      };
    } else if (category === 'chocolates') {
      return {
        benefits: "An exquisite premium cocoa confection. Great as an occasional dessert, boosts serotonin levels.",
        expiry: `Packaged Food - Expiry Date: ${getFutureDateString(9)} (9 Months).`
      };
    } else if (category === 'biscuits') {
      return {
        benefits: "Crispy, oven-baked golden pastries baked to perfection. A splendid daily tea-time snack.",
        expiry: `Packaged Food - Expiry Date: ${getFutureDateString(6)} (6 Months).`
      };
    } else {
      return {
        benefits: "Essential quality daily items formulation. Checked under FastMart high hygiene standards.",
        expiry: `Packaged Items - Expiry Date: ${getFutureDateString(6)} (6 Months).`
      };
    }
  };

  const meta = getProductMeta(product.title, product.category);

  return (
    <div
      className="product-modal show"
      onClick={() => setSelectedProductModal(null)}
    >
      <div
        className="product-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="close-modal-btn"
          onClick={() => setSelectedProductModal(null)}
        >
          ✕
        </span>

        <div className="modal-body-layout">
          <div className="modal-image-pane">
            <img src={product.image} alt={product.title} />
          </div>

          <div className="modal-details-pane">
            <h2>{product.title}</h2>

            <div className="product-rating">
              {[1, 2, 3, 4, 5].map(starIndex => (
                <span
                  key={starIndex}
                  className={`star ${starIndex <= Math.round(currentRating) ? 'filled' : ''}`}
                  onClick={() => rateProduct(product.title, starIndex)}
                  title={`Rate ${starIndex} stars`}
                >
                  ★
                </span>
              ))}
              <span className="rating-count">({currentRating.toFixed(1)})</span>
            </div>

            <h4>₹{product.price}{product.unit ? product.unit : ''}</h4>

            <div className="modal-meta-info">
              <p className="mb-2">
                <strong>Benefits / Details:</strong> {product.benefits || meta.benefits}
              </p>
              <p className="mb-0">
                <strong>Expiration:</strong> {product.expiry || meta.expiry}
              </p>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="modal-checkout-btn flex-fill m-0"
                onClick={() => {
                  addToCart({
                    title: product.title,
                    price: product.price,
                    image: product.image
                  });
                  setSelectedProductModal(null);
                }}
              >
                <i className="fas fa-shopping-cart me-1"></i> Add to Cart
              </button>
              <button
                type="button"
                className={`btn ${isSaved ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-3 d-flex align-items-center justify-content-center gap-1`}
                style={{ fontWeight: 600, minWidth: '130px' }}
                onClick={() => toggleSavedItem(product)}
                title={isSaved ? "Remove from Saved for Later" : "Save for Later"}
              >
                <i className={isSaved ? "fas fa-heart" : "far fa-heart"}></i>
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
