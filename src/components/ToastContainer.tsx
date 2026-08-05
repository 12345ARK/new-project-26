import React from 'react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let borderLeftColor = 'var(--primary-color)';
        let iconClass = 'fas fa-check-circle';
        let iconColor = '#2ecc71';

        if (toast.type === 'rating') {
          borderLeftColor = '#f1c40f';
          iconClass = 'fas fa-star';
          iconColor = '#f1c40f';
        } else if (toast.type === 'logout') {
          borderLeftColor = '#ff6b6b';
          iconClass = 'fas fa-sign-out-alt';
          iconColor = '#ff6b6b';
        }

        return (
          <div
            key={toast.id}
            className="cart-toast show"
            style={{ borderLeftColor }}
          >
            {toast.image ? (
              <img src={toast.image} alt={toast.title} />
            ) : (
              <div style={{ fontSize: '20px', color: iconColor }}>
                <i className={iconClass}></i>
              </div>
            )}
            <div className="cart-toast-info">
              <h5>{toast.title}</h5>
              <p>{toast.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
