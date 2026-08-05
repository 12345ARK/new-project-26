import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { FeedbackItem } from '../types';

export const AdminPage: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    orders,
    updateOrderStatus,
    deleteOrder,
    registeredUsers,
    deleteUser,
    clearAllUserData,
    savedItems,
    feedbacks,
    addFeedback,
    updateFeedbackStatus,
    deleteFeedback,
    navigateTo,
    openTrackOrderModal,
  } = useApp();

  // Login Form state
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Clear Data Confirmation state
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  // Dashboard Tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'products' | 'analytics' | 'feedbacks'>('orders');

  // Filters & Search State
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orderViewMode, setOrderViewMode] = useState<'cards' | 'table'>('cards');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Feedback Tab Filters & View State
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('All');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState('All');
  const [feedbackViewMode, setFeedbackViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  const copyAddressToClipboard = (orderId: string, address: string) => {
    if (address && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedOrderId(orderId);
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  // Handle Admin Login submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    const success = adminLogin(adminId, adminPass);
    if (!success) {
      setLoginError(true);
    }
  };

  const fillDemoCredentials = () => {
    setAdminId('admin');
    setAdminPass('admin123');
    setLoginError(false);
  };

  // If Admin is NOT authenticated, show password protection screen
  if (!isAdminAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card-container">
          <div className="admin-login-card">
            <div className="admin-login-header">
              <div className="admin-login-icon-box">
                <i className="fas fa-user-shield fs-2"></i>
              </div>
              <h3 className="admin-login-title">FastMart Admin Portal</h3>
              <p className="admin-login-subtitle">
                Store Operations & Order Management Hub
              </p>
            </div>

            <div className="admin-login-body">

              <div className="admin-divider">
                <span>OR LOGIN WITH CREDENTIALS</span>
              </div>

              {loginError && (
                <div className="admin-error-alert mb-4">
                  <i className="fas fa-exclamation-triangle fs-5"></i>
                  <div>
                    <strong>Access Denied!</strong> Incorrect Admin ID or Password.
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label className="admin-form-label">Admin Username</label>
                  <div className="admin-input-group">
                    <span className="admin-input-icon">
                      <i className="fas fa-id-badge"></i>
                    </span>
                    <input
                      type="text"
                      className="admin-input-control"
                      placeholder="e.g. admin"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="admin-form-label">Password</label>
                  <div className="admin-input-group">
                    <span className="admin-input-icon">
                      <i className="fas fa-key"></i>
                    </span>
                    <input
                      type="password"
                      className="admin-input-control"
                      placeholder="••••••••"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="admin-submit-btn w-100">
                  <i className="fas fa-lock-open me-2"></i> Unlock Dashboard
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="admin-back-btn"
                  onClick={() => navigateTo('home')}
                >
                  ← Return to Customer Store Front
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const outForDeliveryCount = orders.filter(o => o.status === 'Out for Delivery').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      o.items.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesUser = !selectedUserFilter || o.customer.toLowerCase().includes(selectedUserFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesUser;
  });

  // Filter Registered Users
  const filteredUsers = registeredUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch)) ||
      (u.address && u.address.toLowerCase().includes(userSearch.toLowerCase()))
    );
  });

  // Filter Feedbacks
  const unreadFeedbacksCount = feedbacks.filter(f => f.status === 'Unread').length;
  const filteredFeedbacks = feedbacks.filter((f) => {
    const q = feedbackSearch.toLowerCase();
    const matchesSearch =
      f.id.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.message.toLowerCase().includes(q) ||
      (f.phone && f.phone.includes(q));

    const matchesStatus = feedbackStatusFilter === 'All' || f.status === feedbackStatusFilter;
    const matchesCategory = feedbackCategoryFilter === 'All' || f.category === feedbackCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'Delivered':
        return {
          bg: '#dcfce7',
          color: '#065f46',
          border: '#86efac',
          icon: 'fas fa-check-circle',
          label: 'Delivered',
        };
      case 'Out for Delivery':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          border: '#7dd3fc',
          icon: 'fas fa-truck-fast',
          label: 'Out for Delivery',
        };
      case 'Shipped':
        return {
          bg: '#e0e7ff',
          color: '#4338ca',
          border: '#c7d2fe',
          icon: 'fas fa-box-open',
          label: 'Shipped',
        };
      case 'Pending':
        return {
          bg: '#fef3c7',
          color: '#b45309',
          border: '#fde68a',
          icon: 'fas fa-clock',
          label: 'Pending',
        };
      case 'Cancelled':
        return {
          bg: '#ffe4e6',
          color: '#be123c',
          border: '#fca5a5',
          icon: 'fas fa-times-circle',
          label: 'Cancelled',
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#475569',
          border: '#cbd5e1',
          icon: 'fas fa-info-circle',
          label: status || 'Unknown',
        };
    }
  };

  const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config = getStatusBadgeConfig(status);
    return (
      <span
        className="badge rounded-pill px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5 fw-bold shadow-xs text-nowrap"
        style={{
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
          fontSize: '0.78rem',
          letterSpacing: '0.01em',
          transition: 'all 0.25s ease',
        }}
      >
        <i className={config.icon} style={{ fontSize: '0.75rem' }}></i>
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }} className="py-4">
      <div className="container-fluid container-lg">
        {/* Top Header Bar */}
        <div
          className="p-3 p-md-4 rounded-4 shadow-sm mb-4 text-white d-flex flex-wrap align-items-center justify-content-between gap-3"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderLeft: '5px solid #ef4444' }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '52px', height: '52px', flexShrink: 0 }}>
              <i className="fas fa-user-shield fs-3"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h4 className="fw-bold m-0 text-white" style={{ letterSpacing: '-0.5px' }}>FastMart Admin Control Hub</h4>
                <span className="badge bg-emerald-500 text-white rounded-pill px-2.5 py-1 small d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#10b981', fontSize: '0.72rem' }}>
                  <i className="fas fa-circle" style={{ fontSize: '0.45rem' }}></i> System Online
                </span>
              </div>
              <p className="text-slate-300 small mb-0 mt-1" style={{ color: '#94a3b8' }}>
                Manage store orders, customer delivery addresses & product inventory
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
              onClick={() => navigateTo('home')}
            >
              <i className="fas fa-store"></i> Store Front
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5"
              onClick={adminLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        {/* Executive Key Metrics Grid */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="bg-white p-3 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase fw-bold text-muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Total Revenue</span>
                <div className="rounded-circle d-flex align-items-center justify-content-center text-emerald-600" style={{ width: '38px', height: '38px', backgroundColor: '#d1fae5', color: '#059669' }}>
                  <i className="fas fa-rupee-sign fw-bold fs-6"></i>
                </div>
              </div>
              <div>
                <h3 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.5px' }}>₹{totalRevenue}</h3>
                <span className="text-muted small mt-1 d-block" style={{ fontSize: '0.8rem' }}>
                  From {orders.length} total orders
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="bg-white p-3 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase fw-bold text-muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Total Orders</span>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <i className="fas fa-box-open fw-bold fs-6"></i>
                </div>
              </div>
              <div>
                <h3 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.5px' }}>{orders.length}</h3>
                <span className="text-amber-600 fw-bold small mt-1 d-block" style={{ color: '#d97706', fontSize: '0.8rem' }}>
                  <i className="fas fa-clock me-1"></i>{pendingOrdersCount} Pending Action
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="bg-white p-3 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase fw-bold text-muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Registered Users</span>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <i className="fas fa-users fw-bold fs-6"></i>
                </div>
              </div>
              <div>
                <h3 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.5px' }}>{registeredUsers.length}</h3>
                <span className="text-muted small mt-1 d-block" style={{ fontSize: '0.8rem' }}>
                  Active Customer Accounts
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="bg-white p-3 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase fw-bold text-muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Products Catalog</span>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  <i className="fas fa-cubes fw-bold fs-6"></i>
                </div>
              </div>
              <div>
                <h3 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.5px' }}>{ALL_PRODUCTS.length}</h3>
                <span className="text-muted small mt-1 d-block" style={{ fontSize: '0.8rem' }}>
                  Listed Inventory Items
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="bg-white rounded-4 border shadow-sm overflow-hidden mb-4" style={{ borderColor: '#e2e8f0' }}>
          {/* Main Navigation Tabs */}
          <div className="border-bottom bg-slate-50 px-2 d-flex flex-wrap gap-1" style={{ backgroundColor: '#f8fafc' }}>
            <button
              type="button"
              className={`btn border-0 py-3 px-4 fw-bold rounded-0 d-inline-flex align-items-center gap-2 ${activeTab === 'orders' ? 'text-danger border-bottom border-danger border-3 bg-white' : 'text-secondary'}`}
              onClick={() => {
                setActiveTab('orders');
                setSelectedUserFilter(null);
              }}
              style={{ fontSize: '0.95rem' }}
            >
              <i className="fas fa-shopping-bag"></i> Orders ({orders.length})
              {pendingOrdersCount > 0 && (
                <span className="badge bg-warning text-dark ms-1 rounded-pill">{pendingOrdersCount} new</span>
              )}
            </button>

            <button
              type="button"
              className={`btn border-0 py-3 px-4 fw-bold rounded-0 d-inline-flex align-items-center gap-2 ${activeTab === 'users' ? 'text-danger border-bottom border-danger border-3 bg-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('users')}
              style={{ fontSize: '0.95rem' }}
            >
              <i className="fas fa-users-cog"></i> Users & Addresses ({registeredUsers.length})
            </button>

            <button
              type="button"
              className={`btn border-0 py-3 px-4 fw-bold rounded-0 d-inline-flex align-items-center gap-2 ${activeTab === 'products' ? 'text-danger border-bottom border-danger border-3 bg-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('products')}
              style={{ fontSize: '0.95rem' }}
            >
              <i className="fas fa-cubes"></i> Products Catalog ({ALL_PRODUCTS.length})
            </button>

            <button
              type="button"
              className={`btn border-0 py-3 px-4 fw-bold rounded-0 d-inline-flex align-items-center gap-2 ${activeTab === 'feedbacks' ? 'text-danger border-bottom border-danger border-3 bg-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('feedbacks')}
              style={{ fontSize: '0.95rem' }}
            >
              <i className="fas fa-comment-dots text-danger"></i> Customer Feedback ({feedbacks.length})
              {unreadFeedbacksCount > 0 && (
                <span className="badge bg-danger text-white ms-1 rounded-pill">{unreadFeedbacksCount} unread</span>
              )}
            </button>

            <button
              type="button"
              className={`btn border-0 py-3 px-4 fw-bold rounded-0 d-inline-flex align-items-center gap-2 ${activeTab === 'analytics' ? 'text-danger border-bottom border-danger border-3 bg-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('analytics')}
              style={{ fontSize: '0.95rem' }}
            >
              <i className="fas fa-chart-line"></i> Analytics & Insights
            </button>
          </div>

          <div className="p-3 p-md-4">
            {/* ================= TAB 1: ORDERS MANAGEMENT ================= */}
            {activeTab === 'orders' && (
              <div>
                {/* Search Bar, Filter Pills & View Switcher */}
                <div className="row g-2 mb-3 align-items-center">
                  <div className="col-12 col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 bg-white"
                        placeholder="Search orders by ID, Customer, Phone or Items..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        style={{ borderRadius: '0 50px 50px 0' }}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-7 d-flex flex-wrap align-items-center justify-content-md-end gap-2">
                    {/* Status Filters */}
                    <div className="d-flex gap-1 flex-wrap">
                      {['All', 'Pending', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold ${statusFilter === st ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
                          onClick={() => setStatusFilter(st)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* View Switcher Toggle */}
                    <div className="btn-group btn-group-sm rounded-pill bg-light p-1 border ms-auto">
                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 ${orderViewMode === 'cards' ? 'btn-danger text-white fw-bold shadow-sm' : 'btn-light text-secondary'}`}
                        onClick={() => setOrderViewMode('cards')}
                      >
                        <i className="fas fa-th-large me-1"></i> Cards
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 ${orderViewMode === 'table' ? 'btn-danger text-white fw-bold shadow-sm' : 'btn-light text-secondary'}`}
                        onClick={() => setOrderViewMode('table')}
                      >
                        <i className="fas fa-list me-1"></i> Table
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Customer Filter Banner */}
                {selectedUserFilter && (
                  <div className="alert alert-info d-flex align-items-center justify-content-between p-2.5 rounded-3 mb-3" style={{ fontSize: '0.85rem' }}>
                    <div>
                      <i className="fas fa-filter me-2 text-info"></i>
                      Filtering orders for customer: <strong>{selectedUserFilter}</strong>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info rounded-pill py-0 px-2 fw-bold"
                      onClick={() => setSelectedUserFilter(null)}
                    >
                      Clear Filter
                    </button>
                  </div>
                )}

                {/* Orders Content */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border p-4">
                    <div className="text-muted mb-2" style={{ fontSize: '3rem' }}>
                      <i className="fas fa-box-open text-danger opacity-50"></i>
                    </div>
                    <h5 className="fw-bold text-dark">No orders matched your criteria</h5>
                    <p className="text-muted small mb-0">Try clearing search text or status filters above.</p>
                  </div>
                ) : orderViewMode === 'cards' ? (
                  /* CARDS VIEW */
                  <div className="row g-3">
                    {filteredOrders.map((ord) => {
                      const itemsList = ord.items ? ord.items.split(',').map(i => i.trim()).filter(Boolean) : [];

                      return (
                        <div key={ord.id} className="col-12 col-lg-6">
                          <div className="bg-white border rounded-4 p-3 shadow-sm h-100 d-flex flex-column" style={{ borderColor: '#e2e8f0' }}>
                            {/* Card Top Banner */}
                            <div className="p-2.5 mb-3 rounded-3 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                              <div>
                                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>ORDER NUMBER</span>
                                <h6 className="fw-bold text-danger m-0">{ord.id}</h6>
                              </div>
                              <div className="text-end">
                                <span className="badge bg-white text-dark border mb-1 d-block small">
                                  <i className="far fa-clock me-1 text-danger"></i>{ord.date}
                                </span>
                                <OrderStatusBadge status={ord.status} />
                              </div>
                            </div>

                            {/* Stage Progress Stepper Bar in Admin */}
                            <div className="p-2 mb-3 bg-light rounded-3 border">
                              <div className="d-flex align-items-center justify-content-between mb-1.5">
                                <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.03em' }}>
                                  <i className="fas fa-route text-danger me-1"></i> Order Stage Progress
                                </span>
                                <span className="badge bg-danger bg-opacity-10 text-danger fw-bold" style={{ fontSize: '0.65rem' }}>
                                  Live Tracker
                                </span>
                              </div>
                              <div className="row g-1 text-center">
                                {[
                                  { label: 'Pending', icon: 'fa-clock' },
                                  { label: 'Shipped', icon: 'fa-box' },
                                  { label: 'Out for Delivery', icon: 'fa-truck-fast' },
                                  { label: 'Delivered', icon: 'fa-check-circle' }
                                ].map((step) => {
                                  const normStatus = ord.status.toLowerCase();
                                  const normStep = step.label.toLowerCase();
                                  let isDone = false;
                                  let isCurrent = false;

                                  if (normStatus === 'delivered') {
                                    isDone = true;
                                    if (normStep === 'delivered') isCurrent = true;
                                  } else if (normStatus.includes('out') || normStatus.includes('way')) {
                                    if (normStep === 'pending' || normStep === 'shipped') isDone = true;
                                    if (normStep === 'out for delivery') isCurrent = true;
                                  } else if (normStatus.includes('ship') || normStatus.includes('pack')) {
                                    if (normStep === 'pending') isDone = true;
                                    if (normStep === 'shipped') isCurrent = true;
                                  } else {
                                    if (normStep === 'pending') isCurrent = true;
                                  }

                                  return (
                                    <div key={step.label} className="col-3">
                                      <div
                                        className={`py-1 px-0.5 rounded-2 text-truncate fw-bold ${
                                          isCurrent
                                            ? 'bg-danger text-white shadow-xs'
                                            : isDone
                                            ? 'bg-success text-white shadow-xs'
                                            : 'bg-white text-muted border'
                                        }`}
                                        style={{ fontSize: '0.68rem' }}
                                        title={step.label}
                                      >
                                        <i className={`fas ${step.icon} me-1`} style={{ fontSize: '0.6rem' }}></i>
                                        {step.label === 'Out for Delivery' ? 'On Way' : step.label}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Delivery Partner Details Box */}
                            <div className="p-2.5 mb-3 rounded-3 bg-dark text-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                              <div className="d-flex align-items-center gap-2">
                                <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                                  <i className="fas fa-motorcycle"></i>
                                </div>
                                <div>
                                  <span className="text-white-50 text-uppercase fw-bold d-block" style={{ fontSize: '0.62rem' }}>Assigned Delivery Rider</span>
                                  <strong className="text-white small d-block" style={{ fontSize: '0.8rem' }}>Rahul Verma (★ 4.9 | BR-01-8821)</strong>
                                </div>
                              </div>
                              <div className="text-end">
                                <span className="text-white-50 text-uppercase fw-bold d-block" style={{ fontSize: '0.62rem' }}>Delivery OTP</span>
                                <span className="badge bg-warning text-dark font-monospace px-2 py-0.5" style={{ fontSize: '0.8rem' }}>4829</span>
                              </div>
                            </div>

                            {/* Customer Profile Box */}
                            <div className="p-2.5 mb-3 rounded-3 bg-light border">
                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '38px', height: '38px', fontSize: '0.9rem', flexShrink: 0 }}>
                                    {ord.customer ? ord.customer.charAt(0).toUpperCase() : 'C'}
                                  </div>
                                  <div>
                                    <strong className="d-block text-dark" style={{ fontSize: '0.92rem' }}>{ord.customer}</strong>
                                    {ord.phone && (
                                      <a href={`tel:${ord.phone}`} className="text-decoration-none small text-danger fw-semibold">
                                        <i className="fas fa-phone-alt me-1"></i>{ord.phone}
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <span className="badge bg-dark text-white rounded-pill px-2.5 py-1 small">
                                  <i className="fas fa-credit-card me-1 text-warning"></i>{ord.paymentMethod || 'COD'}
                                </span>
                              </div>
                            </div>

                            {/* Full Delivery Address Box */}
                            <div className="p-3 mb-3 rounded-3" style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="fw-bold text-uppercase text-amber-800 small d-flex align-items-center gap-1" style={{ color: '#92400e', fontSize: '0.75rem' }}>
                                  <i className="fas fa-map-marker-alt text-danger"></i> Customer Delivery Address
                                </span>
                                {ord.address && (
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill d-flex align-items-center gap-1"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={() => copyAddressToClipboard(ord.id, ord.address)}
                                    title="Copy delivery address"
                                  >
                                    <i className={copiedOrderId === ord.id ? 'fas fa-check text-success' : 'far fa-copy'}></i>
                                    {copiedOrderId === ord.id ? 'Copied!' : 'Copy'}
                                  </button>
                                )}
                              </div>
                              <div className="fw-semibold text-dark" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
                                {ord.address || 'No specific address recorded'}
                              </div>
                            </div>

                            {/* Ordered Items Breakdown */}
                            <div className="mb-3">
                              <span className="fw-bold text-muted text-uppercase d-block mb-2" style={{ fontSize: '0.72rem' }}>
                                Items Breakdown ({itemsList.length})
                              </span>
                              <div className="d-flex flex-wrap gap-1">
                                {itemsList.length > 0 ? (
                                  itemsList.map((item, i) => (
                                    <span key={i} className="badge bg-light text-dark border px-2.5 py-1.5 rounded-pill fw-normal" style={{ fontSize: '0.78rem' }}>
                                      <i className="fas fa-box text-danger me-1" style={{ fontSize: '0.65rem' }}></i> {item}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted small">No items list specified</span>
                                )}
                              </div>
                            </div>

                            {/* Footer Action Bar */}
                            <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                              <div>
                                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>ORDER TOTAL</span>
                                <span className="fw-bold text-success fs-5">₹{ord.total}</span>
                              </div>

                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 fw-bold d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: '0.75rem' }}
                                  onClick={() => openTrackOrderModal(ord.id)}
                                  title="View full tracking modal preview"
                                >
                                  <i className="fas fa-truck-fast text-danger"></i> Track
                                </button>

                                <select
                                  className="form-select form-select-sm rounded-pill fw-bold border-secondary shadow-sm"
                                  style={{ fontSize: '0.8rem', width: '135px' }}
                                  value={ord.status}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                                >
                                  <option value="Pending">🟡 Pending</option>
                                  <option value="Shipped">📦 Shipped</option>
                                  <option value="Out for Delivery">🚚 Out for Delivery</option>
                                  <option value="Delivered">🟢 Delivered</option>
                                  <option value="Cancelled">🔴 Cancelled</option>
                                </select>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: '32px', height: '32px' }}
                                  title="Delete Order"
                                  onClick={() => {
                                    if (window.confirm(`Delete order ${ord.id}?`)) {
                                      deleteOrder(ord.id);
                                    }
                                  }}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* TABLE VIEW */
                  <div>
                    <div className="admin-scroll-hint">
                      <i className="fas fa-arrows-left-right text-danger fs-6"></i>
                      <span>Scroll horizontally to view all table details</span>
                    </div>

                    <div className="admin-table-wrapper">
                      <table className="table table-hover align-middle mb-0 admin-table">
                        <thead className="table-light text-uppercase small text-secondary">
                          <tr>
                            <th className="py-3 px-3" style={{ width: '130px' }}>Order ID / Date</th>
                            <th className="py-3 px-3" style={{ width: '160px' }}>Customer</th>
                            <th className="py-3 px-3" style={{ minWidth: '200px' }}>Delivery Address</th>
                            <th className="py-3 px-3" style={{ minWidth: '180px' }}>Ordered Items</th>
                            <th className="py-3 px-3" style={{ width: '110px' }}>Total</th>
                            <th className="py-3 px-3" style={{ width: '120px' }}>Status</th>
                            <th className="py-3 px-3 text-end" style={{ width: '160px' }}>Update Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id}>
                              <td className="px-3">
                                <strong className="text-danger d-block">{ord.id}</strong>
                                <small className="text-muted text-nowrap">{ord.date}</small>
                              </td>

                              <td className="px-3">
                                <div className="fw-bold text-dark text-nowrap">{ord.customer}</div>
                                <small className="text-muted d-block text-nowrap">
                                  <i className="fas fa-phone-alt me-1 text-danger"></i>{ord.phone || 'N/A'}
                                </small>
                              </td>

                              <td className="px-3">
                                <div className="small text-dark" style={{ minWidth: '180px', maxWidth: '260px', wordBreak: 'break-word', lineHeight: '1.35' }} title={ord.address}>
                                  <i className="fas fa-map-marker-alt text-danger me-1"></i>
                                  {ord.address || 'No address provided'}
                                </div>
                              </td>

                              <td className="px-3">
                                <small className="d-block text-wrap" style={{ minWidth: '160px', maxWidth: '220px', wordBreak: 'break-word' }} title={ord.items}>
                                  {ord.items}
                                </small>
                              </td>

                              <td className="px-3 text-nowrap">
                                <span className="fw-bold text-success d-block">₹{ord.total}</span>
                                <small className="badge bg-light text-dark border">
                                  {ord.paymentMethod || 'COD'}
                                </small>
                              </td>

                              <td className="px-3 text-nowrap">
                                <OrderStatusBadge status={ord.status} />
                              </td>

                              <td className="px-3 text-end text-nowrap">
                                <div className="d-inline-flex align-items-center gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 fw-bold d-inline-flex align-items-center gap-1"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => openTrackOrderModal(ord.id)}
                                    title="View order tracking modal"
                                  >
                                    <i className="fas fa-truck-fast text-danger"></i> Track
                                  </button>

                                  <select
                                    className="form-select form-select-sm rounded-pill fw-bold"
                                    style={{ fontSize: '0.8rem', width: '135px', paddingRight: '2rem' }}
                                    value={ord.status}
                                    onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                                  >
                                    <option value="Pending">🟡 Pending</option>
                                    <option value="Shipped">📦 Shipped</option>
                                    <option value="Out for Delivery">🚚 Out for Delivery</option>
                                    <option value="Delivered">🟢 Delivered</option>
                                    <option value="Cancelled">🔴 Cancelled</option>
                                  </select>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger border-0 rounded-circle d-inline-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px' }}
                                    title="Delete Order"
                                    onClick={() => {
                                      if (window.confirm(`Delete order ${ord.id}?`)) {
                                        deleteOrder(ord.id);
                                      }
                                    }}
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: USERS & ADDRESSES ================= */}
            {activeTab === 'users' && (
              <div>
                <div className="row g-2 mb-3 align-items-center">
                  <div className="col-12 col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 bg-white"
                        placeholder="Search users by Name, Email, Phone or Address..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        style={{ borderRadius: '0 50px 50px 0' }}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6 text-md-end">
                    {showClearDataConfirm ? (
                      <div className="d-inline-flex align-items-center gap-2 bg-danger bg-opacity-10 p-1.5 px-3 rounded-pill border border-danger">
                        <span className="small text-danger fw-bold me-1">Confirm Wipe All Data?</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger rounded-pill fw-bold px-3 py-1 shadow-xs"
                          onClick={() => {
                            clearAllUserData();
                            setShowClearDataConfirm(false);
                          }}
                        >
                          <i className="fas fa-check me-1"></i> Yes, Wipe All Data
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border rounded-pill fw-bold px-3 py-1 text-dark"
                          onClick={() => setShowClearDataConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill fw-bold py-2 px-3"
                        onClick={() => setShowClearDataConfirm(true)}
                      >
                        <i className="fas fa-user-slash me-1"></i> Clear All User Data
                      </button>
                    )}
                  </div>
                </div>

                <div className="row g-3">
                  {filteredUsers.map((u, idx) => {
                    const userOrders = orders.filter(o => o.customer.toLowerCase().includes(u.name.toLowerCase()));
                    const userTotalSpend = userOrders.reduce((s, o) => s + o.total, 0);

                    return (
                      <div key={idx} className="col-12 col-md-6 col-lg-4">
                        <div className="bg-white border rounded-4 p-3 shadow-sm h-100 d-flex flex-column" style={{ borderColor: '#e2e8f0' }}>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <h6 className="fw-bold m-0 text-dark">{u.name}</h6>
                                <small className="text-muted d-block">{u.email}</small>
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 mb-3 rounded-3 bg-light border small">
                            <div className="mb-1 text-dark">
                              <i className="fas fa-phone-alt text-danger me-2"></i>
                              <strong>Phone:</strong> {u.phone || 'Not recorded'}
                            </div>
                            <div className="text-dark">
                              <i className="fas fa-map-marker-alt text-danger me-2"></i>
                              <strong>Saved Address:</strong> {u.address || 'No saved address'}
                            </div>
                          </div>

                          <div className="row g-2 mb-3 text-center">
                            <div className="col-6">
                              <div className="p-2 rounded-3 border bg-white">
                                <span className="text-muted d-block small" style={{ fontSize: '0.7rem' }}>ORDERS</span>
                                <strong className="fs-6 text-dark">{userOrders.length}</strong>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="p-2 rounded-3 border bg-white">
                                <span className="text-muted d-block small" style={{ fontSize: '0.7rem' }}>SPENT</span>
                                <strong className="fs-6 text-success">₹{userTotalSpend}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto d-flex align-items-center gap-2 pt-2 border-top">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill w-100 fw-bold"
                              onClick={() => {
                                setSelectedUserFilter(u.name);
                                setActiveTab('orders');
                              }}
                            >
                              <i className="fas fa-shopping-bag me-1"></i> View Orders
                            </button>
                            {registeredUsers.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-circle"
                                title="Remove User"
                                onClick={() => {
                                  if (window.confirm(`Delete user ${u.name}?`)) {
                                    deleteUser(u.email);
                                  }
                                }}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 3: PRODUCTS CATALOG ================= */}
            {activeTab === 'products' && (
              <div>
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 bg-white"
                        placeholder="Search products by title or category..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        style={{ borderRadius: '0 50px 50px 0' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-scroll-hint">
                  <i className="fas fa-arrows-left-right text-danger fs-6"></i>
                  <span>Scroll horizontally to view all product columns</span>
                </div>

                <div className="admin-table-wrapper">
                  <table className="table table-hover align-middle mb-0 admin-table">
                    <thead className="table-light text-uppercase small text-secondary">
                      <tr>
                        <th className="py-3 px-3" style={{ minWidth: '220px' }}>Product Info</th>
                        <th className="py-3 px-3" style={{ width: '130px' }}>Category</th>
                        <th className="py-3 px-3" style={{ width: '110px' }}>Price</th>
                        <th className="py-3 px-3" style={{ width: '100px' }}>Rating</th>
                        <th className="py-3 px-3" style={{ width: '150px' }}>Inventory Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_PRODUCTS.filter(p =>
                        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(productSearch.toLowerCase())
                      ).map((p) => (
                        <tr key={p.id}>
                          <td className="px-3">
                            <div className="d-flex align-items-center gap-3" style={{ minWidth: '200px' }}>
                              <img
                                src={p.image}
                                alt={p.title}
                                className="rounded-3 border object-fit-cover flex-shrink-0"
                                style={{ width: '48px', height: '48px' }}
                              />
                              <div>
                                <strong className="d-block text-dark fw-bold" style={{ fontSize: '0.9rem' }}>{p.title}</strong>
                                <small className="text-muted">ID: {p.id} {p.unit ? `| ${p.unit}` : ''}</small>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 text-nowrap">
                            <span className="badge bg-light text-dark border">
                              {p.category}
                            </span>
                          </td>

                          <td className="px-3 text-nowrap">
                            <strong className="text-dark fs-6">₹{p.price}</strong>
                          </td>

                          <td className="px-3 text-nowrap">
                            <span className="badge bg-warning text-dark fw-bold">
                              <i className="fas fa-star me-1"></i>{p.rating}
                            </span>
                          </td>

                          <td className="px-3 text-nowrap">
                            <span className="badge bg-success text-white rounded-pill px-2.5 py-1 fw-bold">
                              In Stock (Active)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 4: CUSTOMER FEEDBACK & INQUIRIES ================= */}
            {activeTab === 'feedbacks' && (
              <div>
                {/* Feedback Metrics */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-uppercase small text-muted fw-bold d-block mb-1">Total Feedbacks</span>
                      <h4 className="fw-bold text-dark m-0">{feedbacks.length}</h4>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25">
                      <span className="text-uppercase small text-warning fw-bold d-block mb-1">Unread Actions</span>
                      <h4 className="fw-bold text-dark m-0">{unreadFeedbacksCount}</h4>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded-3 border">
                      <span className="text-uppercase small text-muted fw-bold d-block mb-1">Average Satisfaction</span>
                      <h4 className="fw-bold text-amber-500 m-0" style={{ color: '#d97706' }}>
                        {feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '5.0'} ★
                      </h4>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
                      <span className="text-uppercase small fw-bold d-block mb-1" style={{ color: '#047857' }}>Resolved Concerns</span>
                      <h4 className="fw-bold text-dark m-0">{feedbacks.filter(f => f.status === 'Resolved').length}</h4>
                    </div>
                  </div>
                </div>

                {/* Search & Filters */}
                <div className="row g-2 mb-3 align-items-center">
                  <div className="col-12 col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search feedback by customer, email, message..."
                        value={feedbackSearch}
                        onChange={(e) => setFeedbackSearch(e.target.value)}
                      />
                      {feedbackSearch && (
                        <button
                          className="btn btn-outline-secondary border-start-0"
                          type="button"
                          onClick={() => setFeedbackSearch('')}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-7 d-flex flex-wrap align-items-center justify-content-md-end gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                      onClick={() => {
                        addFeedback({
                          name: 'Aarav Sharma',
                          email: 'aarav.s@gmail.com',
                          phone: '+91 98765 43210',
                          category: 'Product Quality',
                          rating: 5,
                          message: 'Extremely fresh groceries delivered in under 15 minutes! The Alphonso mangoes and organic spinach were top notch.',
                        });
                      }}
                    >
                      <i className="fas fa-plus me-1"></i> Add Sample Feedback
                    </button>

                    {/* Category Filter */}
                    <select
                      className="form-select form-select-sm rounded-pill fw-bold border-secondary shadow-sm"
                      style={{ width: '170px' }}
                      value={feedbackCategoryFilter}
                      onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Product Quality">Product Quality</option>
                      <option value="Delivery Experience">Delivery Experience</option>
                      <option value="App / Website">App / Website</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="General Suggestion">General Suggestion</option>
                    </select>

                    {/* Status Filter Pills */}
                    <div className="d-flex gap-1 flex-wrap">
                      {['All', 'Unread', 'Reviewed', 'Resolved'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold ${
                            feedbackStatusFilter === st ? 'btn-danger' : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => setFeedbackStatusFilter(st)}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* View Switcher Toggle */}
                    <div className="btn-group btn-group-sm rounded-pill bg-light p-1 border ms-auto ms-md-2">
                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-2.5 ${feedbackViewMode === 'cards' ? 'btn-danger text-white fw-bold shadow-sm' : 'btn-light text-secondary'}`}
                        onClick={() => setFeedbackViewMode('cards')}
                      >
                        <i className="fas fa-th-large me-1"></i> Cards
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-2.5 ${feedbackViewMode === 'table' ? 'btn-danger text-white fw-bold shadow-sm' : 'btn-light text-secondary'}`}
                        onClick={() => setFeedbackViewMode('table')}
                      >
                        <i className="fas fa-list me-1"></i> Table
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedbacks Display */}
                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-5 border rounded-4 bg-light p-4">
                    <i className="fas fa-inbox text-muted fs-1 mb-2"></i>
                    <h5 className="fw-bold text-dark mb-1">No Feedback Found</h5>
                    <p className="text-muted small mb-3">Try clearing your search query or status filters.</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger rounded-pill px-4 fw-bold shadow-xs"
                      onClick={() => {
                        addFeedback({
                          name: 'Priya Patel',
                          email: 'priya.patel@gmail.com',
                          phone: '+91 91234 56789',
                          category: 'Delivery Experience',
                          rating: 5,
                          message: 'Super fast delivery in Bengaluru! Delivery executive was polite and wore mask/gloves. Keep up the great service.',
                        });
                      }}
                    >
                      <i className="fas fa-plus me-1"></i> Generate Sample Feedback
                    </button>
                  </div>
                ) : feedbackViewMode === 'cards' ? (
                  /* CARDS VIEW */
                  <div className="row g-3">
                    {filteredFeedbacks.map((fb) => (
                      <div key={fb.id} className="col-12 col-md-6 col-lg-4">
                        <div className="feedback-card h-100 d-flex flex-column">
                          {/* Card Top Banner */}
                          <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
                            <div>
                              <strong className="text-danger font-monospace d-block small">{fb.id}</strong>
                              <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>{fb.date}</small>
                            </div>
                            <span
                              className={`badge rounded-pill px-2.5 py-1 fw-bold ${
                                fb.status === 'Unread' ? 'bg-warning text-dark' :
                                fb.status === 'Reviewed' ? 'bg-info text-dark' : 'bg-success text-white'
                              }`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {fb.status}
                            </span>
                          </div>

                          {/* Customer Info */}
                          <div className="d-flex align-items-center gap-2 mb-2.5">
                            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs" style={{ width: '36px', height: '36px', fontSize: '0.9rem', flexShrink: 0 }}>
                              {fb.name ? fb.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="overflow-hidden">
                              <strong className="d-block text-dark text-truncate" style={{ fontSize: '0.88rem' }}>{fb.name}</strong>
                              <small className="text-muted text-truncate d-block" style={{ fontSize: '0.78rem' }}>{fb.email}</small>
                            </div>
                          </div>

                          {/* Category & Rating */}
                          <div className="d-flex align-items-center justify-content-between mb-2.5 bg-light p-2 rounded-3 border">
                            <span className="badge bg-white text-dark border small fw-semibold text-truncate" style={{ maxWidth: '140px' }}>
                              {fb.category}
                            </span>
                            <div className="text-warning fw-bold small">
                              {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                            </div>
                          </div>

                          {/* Message Preview Box */}
                          <div className="p-2.5 bg-light rounded-3 border small text-dark mb-3" style={{ lineHeight: '1.45', minHeight: '60px' }}>
                            <p className="m-0 text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              "{fb.message}"
                            </p>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-1.5">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1 fw-bold d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => setSelectedFeedback(fb)}
                            >
                              <i className="fas fa-eye"></i> View Details
                            </button>

                            <div className="d-flex align-items-center gap-1">
                              <select
                                className="form-select form-select-sm rounded-pill fw-bold"
                                style={{ fontSize: '0.75rem', width: '110px' }}
                                value={fb.status}
                                onChange={(e) => updateFeedbackStatus(fb.id, e.target.value as FeedbackItem['status'])}
                              >
                                <option value="Unread">Unread</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Resolved">Resolved</option>
                              </select>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-circle d-inline-flex align-items-center justify-content-center p-0"
                                style={{ width: '30px', height: '30px' }}
                                onClick={() => deleteFeedback(fb.id)}
                                title="Delete Feedback"
                              >
                                <i className="fas fa-trash-alt" style={{ fontSize: '0.7rem' }}></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* TABLE VIEW */
                  <div>
                    <div className="admin-scroll-hint">
                      <i className="fas fa-arrows-left-right text-danger fs-6"></i>
                      <span>Scroll horizontally to view all feedback columns</span>
                    </div>

                    <div className="admin-table-wrapper">
                      <table className="table table-hover align-middle mb-0 admin-table">
                        <thead className="table-light text-uppercase small text-secondary">
                          <tr>
                            <th className="py-3 px-3" style={{ width: '130px' }}>Feedback ID / Date</th>
                            <th className="py-3 px-3" style={{ minWidth: '170px' }}>Customer</th>
                            <th className="py-3 px-3" style={{ width: '160px' }}>Category & Rating</th>
                            <th className="py-3 px-3" style={{ minWidth: '220px' }}>Feedback Message</th>
                            <th className="py-3 px-3" style={{ width: '120px' }}>Status</th>
                            <th className="py-3 px-3 text-end" style={{ width: '170px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFeedbacks.map((fb) => (
                            <tr key={fb.id} className={fb.status === 'Unread' ? 'table-warning bg-opacity-10' : ''}>
                              <td className="px-3 text-nowrap">
                                <strong className="d-block text-danger font-monospace" style={{ fontSize: '0.85rem' }}>{fb.id}</strong>
                                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{fb.date}</small>
                              </td>

                              <td className="px-3">
                                <strong className="d-block text-dark fw-bold" style={{ fontSize: '0.88rem' }}>{fb.name}</strong>
                                <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>{fb.email}</small>
                                {fb.phone && (
                                  <span className="badge bg-light text-dark border small mt-1">
                                    <i className="fas fa-phone me-1 text-danger"></i>{fb.phone}
                                  </span>
                                )}
                              </td>

                              <td className="px-3 text-nowrap">
                                <span className="badge bg-light text-dark border d-inline-block mb-1">
                                  {fb.category}
                                </span>
                                <div className="text-warning fw-bold small">
                                  {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)} ({fb.rating}/5)
                                </div>
                              </td>

                              <td className="px-3">
                                <div
                                  className="p-2 bg-light rounded-3 border small text-dark"
                                  style={{ lineHeight: '1.4', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  title={fb.message}
                                >
                                  "{fb.message}"
                                </div>
                              </td>

                              <td className="px-3 text-nowrap">
                                <span
                                  className={`badge rounded-pill px-2.5 py-1.5 fw-bold ${
                                    fb.status === 'Unread' ? 'bg-warning text-dark' :
                                    fb.status === 'Reviewed' ? 'bg-info text-dark' : 'bg-success text-white'
                                  }`}
                                >
                                  {fb.status === 'Unread' && <i className="fas fa-envelope-open me-1"></i>}
                                  {fb.status === 'Reviewed' && <i className="fas fa-eye me-1"></i>}
                                  {fb.status === 'Resolved' && <i className="fas fa-check-circle me-1"></i>}
                                  {fb.status}
                                </span>
                              </td>

                              <td className="px-3 text-end text-nowrap">
                                <div className="d-flex align-items-center justify-content-end gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 fw-bold d-inline-flex align-items-center gap-1"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => setSelectedFeedback(fb)}
                                  >
                                    <i className="fas fa-eye"></i> Details
                                  </button>

                                  <select
                                    className="form-select form-select-sm rounded-pill fw-bold"
                                    style={{ fontSize: '0.78rem', width: '110px' }}
                                    value={fb.status}
                                    onChange={(e) => updateFeedbackStatus(fb.id, e.target.value as FeedbackItem['status'])}
                                  >
                                    <option value="Unread">Unread</option>
                                    <option value="Reviewed">Reviewed</option>
                                    <option value="Resolved">Resolved</option>
                                  </select>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: '30px', height: '30px' }}
                                    onClick={() => deleteFeedback(fb.id)}
                                    title="Delete Feedback"
                                  >
                                    <i className="fas fa-trash-alt small"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 5: ANALYTICS & INSIGHTS ================= */}
            {activeTab === 'analytics' && (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="bg-light p-4 rounded-4 border">
                      <h6 className="fw-bold text-dark mb-3">Order Status Distribution</h6>
                      <div className="d-flex flex-column gap-2">
                        <div>
                          <div className="d-flex justify-content-between small fw-bold mb-1">
                            <span>Pending Processing ({pendingOrdersCount})</span>
                            <span>{orders.length ? Math.round((pendingOrdersCount / orders.length) * 100) : 0}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-warning" style={{ width: `${orders.length ? (pendingOrdersCount / orders.length) * 100 : 0}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="d-flex justify-content-between small fw-bold mb-1">
                            <span>Out for Delivery ({outForDeliveryCount})</span>
                            <span>{orders.length ? Math.round((outForDeliveryCount / orders.length) * 100) : 0}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-info" style={{ width: `${orders.length ? (outForDeliveryCount / orders.length) * 100 : 0}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="d-flex justify-content-between small fw-bold mb-1">
                            <span>Delivered Successfully ({deliveredOrdersCount})</span>
                            <span>{orders.length ? Math.round((deliveredOrdersCount / orders.length) * 100) : 0}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" style={{ width: `${orders.length ? (deliveredOrdersCount / orders.length) * 100 : 0}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="d-flex justify-content-between small fw-bold mb-1">
                            <span>Cancelled Orders ({cancelledOrdersCount})</span>
                            <span>{orders.length ? Math.round((cancelledOrdersCount / orders.length) * 100) : 0}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-danger" style={{ width: `${orders.length ? (cancelledOrdersCount / orders.length) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="bg-light p-4 rounded-4 border">
                      <h6 className="fw-bold text-dark mb-3">Operational Summary</h6>
                      <ul className="list-group list-group-flush bg-transparent small">
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                          <span>Average Order Value:</span>
                          <strong className="text-dark">₹{orders.length ? Math.round(totalRevenue / orders.length) : 0}</strong>
                        </li>
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                          <span>Active Registered Users:</span>
                          <strong className="text-dark">{registeredUsers.length} Users</strong>
                        </li>
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                          <span>Catalog Items Listed:</span>
                          <strong className="text-dark">{ALL_PRODUCTS.length} Products</strong>
                        </li>
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                          <span>Wishlist Items Saved:</span>
                          <strong className="text-dark">{savedItems.length} Items</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= FEEDBACK DETAILS MODAL ================= */}
        {selectedFeedback && (
          <div className="feedback-details-modal-overlay" onClick={() => setSelectedFeedback(null)}>
            <div className="feedback-details-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="p-3.5 p-md-4 border-bottom bg-slate-900 text-white d-flex align-items-center justify-content-between gap-2" style={{ backgroundColor: '#0f172a' }}>
                <div className="d-flex align-items-center gap-2.5">
                  <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-comment-dots fs-5"></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="fw-bold m-0 text-white">Feedback Details</h5>
                      <span className="badge font-monospace bg-danger text-white">{selectedFeedback.id}</span>
                    </div>
                    <small className="text-slate-300" style={{ color: '#94a3b8' }}>Submitted on {selectedFeedback.date}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedFeedback(null)}
                ></button>
              </div>

              <div className="p-3.5 p-md-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                {/* Customer Details Box */}
                <div className="feedback-card p-3 mb-3 bg-light rounded-4 border">
                  <span className="text-uppercase fw-bold text-muted small d-block mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                    CUSTOMER INFORMATION
                  </span>
                  <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.2rem', flexShrink: 0 }}>
                      {selectedFeedback.name ? selectedFeedback.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="overflow-hidden min-w-0 flex-grow-1">
                      <h6 className="fw-bold text-dark m-0 text-truncate">{selectedFeedback.name}</h6>
                      <a href={`mailto:${selectedFeedback.email}`} className="text-decoration-none small text-danger fw-semibold d-block text-truncate">
                        <i className="fas fa-envelope me-1"></i>{selectedFeedback.email}
                      </a>
                    </div>
                  </div>
                  {selectedFeedback.phone && (
                    <div className="mt-2 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <span className="small text-muted fw-bold">Phone Number:</span>
                      <a href={`tel:${selectedFeedback.phone}`} className="btn btn-xs btn-outline-danger rounded-pill px-3 py-1 fw-bold small text-decoration-none">
                        <i className="fas fa-phone-alt me-1"></i>{selectedFeedback.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Category & Rating Bar */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-sm-6">
                    <div className="feedback-card p-3 bg-white border rounded-3 h-100">
                      <span className="text-uppercase fw-bold text-muted small d-block mb-1" style={{ fontSize: '0.7rem' }}>CATEGORY</span>
                      <span className="badge bg-danger bg-opacity-10 text-danger fw-bold border border-danger border-opacity-25 py-1.5 px-2.5 rounded-pill text-truncate max-w-full" style={{ fontSize: '0.85rem' }}>
                        {selectedFeedback.category}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="feedback-card p-3 bg-white border rounded-3 h-100">
                      <span className="text-uppercase fw-bold text-muted small d-block mb-1" style={{ fontSize: '0.7rem' }}>STAR RATING</span>
                      <div className="text-warning fw-bold fs-6 d-flex align-items-center flex-wrap gap-1">
                        <span>{'★'.repeat(selectedFeedback.rating)}{'☆'.repeat(5 - selectedFeedback.rating)}</span>
                        <span className="text-dark small ms-1">({selectedFeedback.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Message Section */}
                <div className="mb-3">
                  <span className="text-uppercase fw-bold text-muted small d-block mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                    CUSTOMER FEEDBACK MESSAGE
                  </span>
                  <div className="feedback-card p-3 bg-light rounded-4 border text-dark font-monospace" style={{ lineHeight: '1.6', fontSize: '0.92rem', whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc' }}>
                    <i className="fas fa-quote-left text-danger me-2 opacity-50 fs-5"></i>
                    {selectedFeedback.message}
                  </div>
                </div>

                {/* Current Status & Action controls */}
                <div className="feedback-card p-3 border rounded-4" style={{ backgroundColor: '#fffbeb', borderColor: '#fef3c7' }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <span className="fw-bold text-dark small">
                      Status Management:
                    </span>
                    <span className={`badge rounded-pill px-3 py-1.5 fw-bold ${
                      selectedFeedback.status === 'Unread' ? 'bg-warning text-dark' :
                      selectedFeedback.status === 'Reviewed' ? 'bg-info text-dark' : 'bg-success text-white'
                    }`}>
                      Current Status: {selectedFeedback.status}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold bg-white"
                      onClick={() => {
                        updateFeedbackStatus(selectedFeedback.id, 'Unread');
                        setSelectedFeedback({ ...selectedFeedback, status: 'Unread' });
                      }}
                    >
                      Mark Unread
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-info rounded-pill px-3 fw-bold text-dark"
                      onClick={() => {
                        updateFeedbackStatus(selectedFeedback.id, 'Reviewed');
                        setSelectedFeedback({ ...selectedFeedback, status: 'Reviewed' });
                      }}
                    >
                      <i className="fas fa-eye me-1"></i> Mark Reviewed
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-success rounded-pill px-3 fw-bold text-white"
                      onClick={() => {
                        updateFeedbackStatus(selectedFeedback.id, 'Resolved');
                        setSelectedFeedback({ ...selectedFeedback, status: 'Resolved' });
                      }}
                    >
                      <i className="fas fa-check-circle me-1"></i> Mark Resolved
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 border-top bg-light d-flex align-items-center justify-content-between">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                  onClick={() => {
                    if (window.confirm(`Delete feedback ${selectedFeedback.id}?`)) {
                      deleteFeedback(selectedFeedback.id);
                      setSelectedFeedback(null);
                    }
                  }}
                >
                  <i className="fas fa-trash-alt me-1"></i> Delete Feedback
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-dark rounded-pill px-4 fw-bold"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
