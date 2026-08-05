import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { loginUser, registerUser, navigateTo, authInitialMode } = useApp();
  const [isRightPanelActive, setIsRightPanelActive] = useState(authInitialMode === 'signup');

  useEffect(() => {
    setIsRightPanelActive(authInitialMode === 'signup');
  }, [authInitialMode]);

  // Sign in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) return;

    const result = loginUser(loginEmail.trim(), loginPass, undefined);
    if (result.success) {
      navigateTo('home');
    } else {
      setLoginError(result.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim()) return;

    const result = registerUser(regName.trim(), regEmail.trim(), regPass);
    if (result.success) {
      setRegSuccess(result.message);
      // Pre-fill login email & password so user can immediately sign in
      setLoginEmail(regEmail.trim());
      setLoginPass(regPass);
      // Switch panel to Sign In
      setTimeout(() => {
        setIsRightPanelActive(false);
      }, 1200);
    } else {
      setRegError(result.message);
    }
  };

  return (
    <div className="login-body">
      <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="auth-container">
        {/* Sign Up Panel */}
        <div className="form-container sign-up-container">
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            {/* Mobile Tab Switcher */}
            <div className="auth-mobile-tabs d-flex d-md-none mb-3 p-1 bg-light rounded-pill border w-100">
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill fw-bold py-2 ${!isRightPanelActive ? 'btn-danger text-white shadow-xs' : 'btn-light text-secondary'}`}
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill fw-bold py-2 ${isRightPanelActive ? 'btn-danger text-white shadow-xs' : 'btn-light text-secondary'}`}
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>

            <h2 className="fw-bold mb-3">Create Account</h2>
            {regError && (
              <div className="alert alert-danger py-2 px-3 small w-100 rounded-3 mb-2 text-start">
                <i className="fas fa-exclamation-circle me-1"></i> {regError}
              </div>
            )}
            {regSuccess && (
              <div className="alert alert-success py-2 px-3 small w-100 rounded-3 mb-2 text-start">
                <i className="fas fa-check-circle me-1"></i> {regSuccess}
              </div>
            )}
            <input
              type="text"
              placeholder="Full Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              required
            />
            <button type="submit" className="modal-checkout-btn mt-3 w-100">
              Sign Up
            </button>
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setIsRightPanelActive(false)}
            >
              Already have an account? Sign In
            </button>
          </form>
        </div>

        {/* Sign In Panel */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            {/* Mobile Tab Switcher */}
            <div className="auth-mobile-tabs d-flex d-md-none mb-3 p-1 bg-light rounded-pill border w-100">
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill fw-bold py-2 ${!isRightPanelActive ? 'btn-danger text-white shadow-xs' : 'btn-light text-secondary'}`}
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill fw-bold py-2 ${isRightPanelActive ? 'btn-danger text-white shadow-xs' : 'btn-light text-secondary'}`}
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>

            <h2 className="fw-bold mb-3">Sign in</h2>
            {loginError && (
              <div className="alert alert-danger py-2 px-3 small w-100 rounded-3 mb-2 text-start">
                <i className="fas fa-exclamation-circle me-1"></i> {loginError}
              </div>
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              required
            />
            <button type="submit" className="modal-checkout-btn mt-3 w-100">
              Sign In
            </button>
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setIsRightPanelActive(true)}
            >
              Don't have an account? Sign Up
            </button>

            <div className="mt-3 pt-2 text-center border-top w-100">
              <button
                type="button"
                className="btn btn-sm btn-link text-danger text-decoration-none fw-bold p-0"
                onClick={() => navigateTo('admin')}
              >
                <i className="fas fa-user-shield me-1"></i> Store Admin Portal
              </button>
            </div>
          </form>
        </div>

        {/* Desktop Sliding Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2 className="fw-bold">Welcome Back!</h2>
              <p className="mt-2 mb-4">To stay connected with us please login with your personal info</p>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2 className="fw-bold">Hello, Friend!</h2>
              <p className="mt-2 mb-4">Enter your personal details and start shopping with us</p>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
