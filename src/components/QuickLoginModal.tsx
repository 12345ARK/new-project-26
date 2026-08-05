import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const QuickLoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginUser,
    setIsCheckoutModalOpen,
    navigateTo,
  } = useApp();

  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!userInput.trim()) return;

    const result = loginUser(userInput.trim(), password, undefined);
    if (result.success) {
      setIsLoginModalOpen(false);
      setTimeout(() => {
        setIsCheckoutModalOpen(true);
      }, 200);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="checkout-modal quick-login-modal is-open">
      <div className="checkout-modal-content quick-login-content text-center p-4" style={{ maxWidth: '400px', borderRadius: '18px' }}>
        <button
          type="button"
          className="close-btn position-absolute top-0 end-0 m-3"
          onClick={() => setIsLoginModalOpen(false)}
        >
          ✕
        </button>
        <div className="my-2" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}>
          <i className="fas fa-user-lock"></i>
        </div>
        <h4 className="fw-bold mb-1">Sign In Required</h4>
        <p className="text-muted small mb-3">Please sign in to proceed with your order checkout.</p>

        {errorMsg && (
          <div className="alert alert-danger py-2 px-3 small w-100 rounded-3 mb-3 text-start">
            <i className="fas fa-exclamation-circle me-1"></i> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-2 text-start">
            <label className="form-label small fw-bold mb-1">Full Name / Email</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Aarav Sharma"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label className="form-label small fw-bold mb-1">Password</label>
            <input
              type="password"
              className="form-control form-control-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-danger rounded-pill w-100 fw-bold py-2 shadow-sm mb-2">
            Log In & Proceed To Checkout
          </button>
        </form>

        <div className="pt-2 border-top mt-3 d-flex justify-content-between align-items-center small">
          <span className="text-muted">Or visit full page:</span>
          <button
            type="button"
            className="btn btn-link p-0 text-danger fw-bold text-decoration-none"
            onClick={() => {
              setIsLoginModalOpen(false);
              navigateTo('login');
            }}
          >
            Login / Register Page →
          </button>
        </div>
      </div>
    </div>
  );
};
