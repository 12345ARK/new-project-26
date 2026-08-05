import React from 'react';
import { useApp } from '../context/AppContext';

export const EmptyCartWarningModal: React.FC = () => {
  const { isEmptyCartModalOpen, setIsEmptyCartModalOpen, setIsCartOpen } = useApp();

  if (!isEmptyCartModalOpen) return null;

  return (
    <div className="checkout-modal is-open" style={{ zIndex: 10015 }}>
      <div className="checkout-modal-content text-center p-4" style={{ maxWidth: '380px', borderRadius: '20px' }}>
        <div className="my-2" style={{ fontSize: '3.5rem', color: 'var(--primary-color)' }}>
          <i className="fas fa-shopping-cart"></i>
        </div>
        <h4 className="fw-bold mb-2">Your Cart is Empty!</h4>
        <p className="text-muted small mb-4">Please add at least one item to your cart before proceeding to checkout.</p>
        <button
          type="button"
          className="btn btn-danger rounded-pill px-4 py-2 w-100 fw-bold shadow-sm"
          onClick={() => {
            setIsEmptyCartModalOpen(false);
            setIsCartOpen(false);
          }}
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
};
