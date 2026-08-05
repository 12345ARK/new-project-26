import React from 'react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    changeQty,
    removeFromCart,
    handleCheckoutStart,
  } = useApp();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`cart-drawer ${isCartOpen ? 'is-open' : ''}`} id="cart-drawer">
      <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}></div>
      <div className="drawer-content">
        <div className="drawer-header">
          <h2>Shopping Cart</h2>
          <button
            type="button"
            className="close-btn"
            onClick={() => setIsCartOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <p className="empty-msg">Your cart is empty.</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.image} alt={item.title} />
                <div className="cart-item-details">
                  <h4>{item.title}</h4>
                  <p>₹{item.price}</p>
                </div>
                <div className="cart-item-actions">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => changeQty(index, -1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => changeQty(index, 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeFromCart(index)}
                    title="Remove Item"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <h3>
            <span>Total :</span>
            <span>₹{totalPrice}</span>
          </h3>
          <div className="d-flex justify-content-between gap-2">
            <button
              type="button"
              className="checkout-btn"
              onClick={handleCheckoutStart}
            >
              Proceed to Checkout
            </button>
            <button
              type="button"
              className="checkout-btn2"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
