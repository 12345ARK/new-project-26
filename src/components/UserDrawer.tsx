import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const UserDrawer: React.FC = () => {
  const {
    isUserDrawerOpen,
    setIsUserDrawerOpen,
    isLoggedIn,
    username,
    userEmail,
    userPhone,
    userStreet,
    userCity,
    userPincode,
    userAddress,
    logoutUser,
    saveAddressDetails,
    clearSavedAddress,
    orders,
    cart,
    savedItems,
    removeFromSaved,
    clearSavedItems,
    addToCart,
    setIsCartOpen,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'orders' | 'cart' | 'profile'>('saved');

  // Local form state for address edit
  const [formName, setFormName] = useState(username);
  const [formPhone, setFormPhone] = useState(userPhone);
  const [formStreet, setFormStreet] = useState(userStreet);
  const [formCity, setFormCity] = useState(userCity);
  const [formPincode, setFormPincode] = useState(userPincode);
  const [formAddress, setFormAddress] = useState(userAddress);

  // Sync state when drawer opens
  React.useEffect(() => {
    setFormName(username);
    setFormPhone(userPhone);
    setFormStreet(userStreet);
    setFormCity(userCity);
    setFormPincode(userPincode);
    setFormAddress(userAddress || `${userStreet ? userStreet + ', ' : ''}${userCity} ${userPincode}`);
  }, [username, userPhone, userStreet, userCity, userPincode, userAddress, isUserDrawerOpen]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveAddressDetails({
      phone: formPhone,
      street: formStreet,
      city: formCity,
      pincode: formPincode,
      fullAddress: formAddress,
    });
    alert('Profile & Delivery details saved successfully!');
  };

  const userOrders = orders.filter(
    o => o.customer.toLowerCase() === username.toLowerCase() || username === 'Admin' || username === 'Guest Customer'
  );

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`user-drawer ${isUserDrawerOpen ? 'is-open' : ''}`} id="user-drawer">
      <div className="drawer-overlay" onClick={() => setIsUserDrawerOpen(false)}></div>
      <div className="user-drawer-content">
        <div className="user-drawer-header">
          <div className="d-flex align-items-center gap-3">
            <div className="user-avatar-badge">
              <i className="fas fa-user"></i>
            </div>
            <div>
              <h4 className="m-0 fw-bold">{isLoggedIn ? username : 'User Account'}</h4>
              <small style={{ opacity: 0.9 }}>{isLoggedIn ? userEmail : 'FastMart Member'}</small>
            </div>
          </div>
          <button
            type="button"
            className="close-btn text-white"
            onClick={() => setIsUserDrawerOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="user-drawer-body">
          {/* Tab navigation */}
          <div className="user-drawer-tabs">
            <button
              type="button"
              className={`user-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <i className="fas fa-heart text-danger me-1"></i> Saved ({savedItems.length})
            </button>
            <button
              type="button"
              className={`user-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-box me-1"></i> Orders
            </button>
            <button
              type="button"
              className={`user-tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              <i className="fas fa-shopping-cart me-1"></i> Cart
            </button>
            <button
              type="button"
              className={`user-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-address-card me-1"></i> Profile
            </button>
          </div>

          {/* Tab 1: Saved for Later */}
          {activeTab === 'saved' && (
            <div className="user-drawer-panel active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold m-0">Saved for Later ({savedItems.length})</h6>
                {savedItems.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link text-danger text-decoration-none p-0 small fw-bold"
                    onClick={clearSavedItems}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {savedItems.length === 0 ? (
                <div className="text-center my-4 py-3">
                  <div className="mb-2" style={{ fontSize: '2.5rem', color: '#e63946' }}>
                    <i className="far fa-heart"></i>
                  </div>
                  <p className="text-muted small mb-3">
                    Your Saved for Later list is empty. Click the heart icon on any product to save it!
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => {
                      setIsUserDrawerOpen(false);
                      navigateTo('all-items');
                    }}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div>
                  <div className="saved-items-list mb-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {savedItems.map((item) => (
                      <div key={item.id} className="saved-item-card d-flex align-items-center justify-content-between p-2 mb-2 border rounded bg-white shadow-sm">
                        <div className="d-flex align-items-center gap-2 overflow-hidden" style={{ flex: 1 }}>
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div className="text-truncate">
                            <span className="fw-bold d-block small text-truncate" title={item.title}>
                              {item.title}
                            </span>
                            <span className="text-danger fw-bold small">
                              ₹{item.price}{item.unit ? item.unit : ''}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-1 ms-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-pill px-2 py-1 small"
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                            title="Move to Cart"
                            onClick={() => {
                              addToCart({
                                title: item.title,
                                price: item.price,
                                image: item.image,
                              });
                            }}
                          >
                            <i className="fas fa-shopping-cart me-1"></i> Add
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light text-muted border rounded-circle"
                            style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove"
                            onClick={() => removeFromSaved(item.title)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-100 rounded-pill fw-bold"
                    onClick={() => {
                      savedItems.forEach(item => {
                        addToCart({
                          title: item.title,
                          price: item.price,
                          image: item.image,
                        });
                      });
                      setIsUserDrawerOpen(false);
                      setIsCartOpen(true);
                    }}
                  >
                    <i className="fas fa-cart-plus me-1"></i> Add All to Cart
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Orders */}
          {activeTab === 'orders' && (
            <div className="user-drawer-panel active">
              <h6 className="fw-bold mb-3">Order History</h6>
              {!isLoggedIn ? (
                <div className="text-center my-4 py-2">
                  <p className="text-muted small mb-3">Sign in to view your order history and track past orders.</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger rounded-pill px-4"
                    onClick={() => {
                      setIsUserDrawerOpen(false);
                      navigateTo('login');
                    }}
                  >
                    Sign In
                  </button>
                </div>
              ) : userOrders.length === 0 ? (
                <p className="text-muted small text-center my-4">
                  No past orders found. Start shopping to place your first order!
                </p>
              ) : (
                userOrders.map((o) => (
                  <div key={o.id} className="user-order-card p-3 border rounded mb-2 bg-light">
                    <div className="user-order-header d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="small text-danger">{o.id}</strong>
                        <span className="text-muted small d-block">{o.date}</span>
                      </div>
                      <span
                        className="badge rounded-pill px-2.5 py-1 fw-bold d-inline-flex align-items-center gap-1"
                        style={{
                          backgroundColor:
                            o.status === 'Delivered' ? '#dcfce7' :
                            o.status === 'Out for Delivery' ? '#e0f2fe' :
                            o.status === 'Shipped' ? '#e0e7ff' :
                            o.status === 'Cancelled' ? '#ffe4e6' : '#fef3c7',
                          color:
                            o.status === 'Delivered' ? '#15803d' :
                            o.status === 'Out for Delivery' ? '#0369a1' :
                            o.status === 'Shipped' ? '#4338ca' :
                            o.status === 'Cancelled' ? '#be123c' : '#b45309',
                          border: `1px solid ${
                            o.status === 'Delivered' ? '#86efac' :
                            o.status === 'Out for Delivery' ? '#7dd3fc' :
                            o.status === 'Shipped' ? '#c7d2fe' :
                            o.status === 'Cancelled' ? '#fca5a5' : '#fde68a'
                          }`,
                          fontSize: '0.75rem',
                        }}
                      >
                        <i className={
                          o.status === 'Delivered' ? 'fas fa-check-circle' :
                          o.status === 'Out for Delivery' ? 'fas fa-truck-fast' :
                          o.status === 'Shipped' ? 'fas fa-box-open' :
                          o.status === 'Cancelled' ? 'fas fa-times-circle' : 'fas fa-clock'
                        } style={{ fontSize: '0.7rem' }}></i>
                        {o.status}
                      </span>
                    </div>
                    <p className="small m-0 text-truncate mt-1">
                      <strong>Items:</strong> {o.items}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2 pt-1 border-top">
                      <small className="text-muted">Payment: {o.paymentMethod}</small>
                      <strong className="text-danger">₹{o.total}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Cart Summary */}
          {activeTab === 'cart' && (
            <div className="user-drawer-panel active">
              <h6 className="fw-bold mb-3">Current Cart Items</h6>
              {cart.length === 0 ? (
                <p className="text-muted small text-center my-3">
                  Your shopping cart is currently empty.
                </p>
              ) : (
                <div className="p-2 border rounded bg-light">
                  {cart.map((item, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom small">
                      <span>{item.title} x {item.quantity}</span>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between align-items-center mt-2 pt-2 fw-bold">
                    <span>Total Amount:</span>
                    <span className="text-danger fs-6">₹{totalCartPrice}</span>
                  </div>
                </div>
              )}
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-danger btn-sm w-100 rounded-pill"
                  onClick={() => {
                    setIsUserDrawerOpen(false);
                    setIsCartOpen(true);
                  }}
                >
                  Go to Shopping Cart
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Profile Address */}
          {activeTab === 'profile' && (
            <div className="user-drawer-panel active">
              {!isLoggedIn ? (
                <div className="guest-prompt-box text-center py-4">
                  <div className="guest-prompt-icon mb-2">
                    <i className="fas fa-user-lock fs-2 text-muted"></i>
                  </div>
                  <h6 className="fw-bold">Guest Account</h6>
                  <p className="text-muted small mb-3">
                    Sign in to save delivery addresses and manage your account details.
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                      onClick={() => {
                        setIsUserDrawerOpen(false);
                        navigateTo('login', 'signin');
                      }}
                    >
                      <i className="fas fa-sign-in-alt me-1"></i> Sign In
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger rounded-pill px-3 fw-bold"
                      onClick={() => {
                        setIsUserDrawerOpen(false);
                        navigateTo('login', 'signup');
                      }}
                    >
                      <i className="fas fa-user-plus me-1"></i> Register
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h6 className="fw-bold mb-3">Saved Delivery Address</h6>
                  <form onSubmit={handleSaveProfile}>
                    <div className="mb-2">
                      <label className="form-label small fw-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        placeholder="+91 9876543210"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold mb-1">City</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Patna"
                          value={formCity}
                          onChange={(e) => setFormCity(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold mb-1">Pincode</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="201301"
                          value={formPincode}
                          onChange={(e) => setFormPincode(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold mb-1">Full Address</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="House No, Street Name, Sector, City"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button type="submit" className="btn btn-sm btn-primary flex-fill rounded-pill">
                        Save Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary flex-fill rounded-pill"
                        onClick={clearSavedAddress}
                      >
                        Remove Address
                      </button>
                    </div>
                  </form>

                  {/* Logout Button */}
                  <div className="mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm w-100 rounded-pill"
                      onClick={() => {
                        logoutUser();
                        setIsUserDrawerOpen(false);
                      }}
                    >
                      <i className="fas fa-sign-out-alt me-1"></i> Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
